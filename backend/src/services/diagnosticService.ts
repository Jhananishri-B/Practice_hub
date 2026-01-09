import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';
import * as skillMasteryService from './skillMasteryService';
import {
    DiagnosticSession,
    DiagnosticResponse,
    DiagnosticSkillScore,
    DiagnosticQuestion,
    StartDiagnosticResponse,
    SubmitDiagnosticResponse,
    CompleteDiagnosticResponse,
    DiagnosticStatusCheck,
    RecommendedPath,
} from '../types/diagnosticTypes';

// ============================================================================
// Constants
// ============================================================================

const QUESTIONS_PER_SKILL = 3;
const MIN_QUESTIONS_FOR_SCORE = 2;

// ============================================================================
// Diagnostic Status Check
// ============================================================================

/**
 * Check if user needs to take diagnostic test
 */
export const checkDiagnosticStatus = async (userId: string): Promise<DiagnosticStatusCheck> => {
    // Check for completed diagnostic
    const diagnosticResult = await pool.query(
        `SELECT id, completed_at FROM diagnostic_sessions 
     WHERE user_id = ? AND status = 'completed' 
     ORDER BY completed_at DESC LIMIT 1`,
        [userId]
    );
    const lastDiagnostic = getFirstRow(diagnosticResult);

    // Check existing mastery records
    const masteryResult = await pool.query(
        `SELECT COUNT(*) as count FROM user_skill_mastery 
     WHERE user_id = ? AND total_practice_count > 0`,
        [userId]
    );
    const existingMasteryCount = getFirstRow(masteryResult)?.count || 0;

    const hasCompletedDiagnostic = !!lastDiagnostic;
    const needsDiagnostic = !hasCompletedDiagnostic && existingMasteryCount === 0;

    let message: string;
    if (needsDiagnostic) {
        message = 'Take a quick diagnostic test to personalize your learning path!';
    } else if (hasCompletedDiagnostic) {
        message = 'You have already completed the diagnostic test.';
    } else {
        message = 'You have existing progress. Diagnostic test is optional.';
    }

    return {
        needsDiagnostic,
        hasCompletedDiagnostic,
        lastDiagnosticDate: lastDiagnostic?.completed_at || null,
        existingMasteryCount: parseInt(existingMasteryCount),
        message,
    };
};

// ============================================================================
// Start Diagnostic
// ============================================================================

/**
 * Start a new diagnostic session
 */
export const startDiagnostic = async (userId: string): Promise<StartDiagnosticResponse> => {
    // Check for existing in-progress session
    const existingResult = await pool.query(
        `SELECT id FROM diagnostic_sessions WHERE user_id = ? AND status = 'in_progress'`,
        [userId]
    );
    const existing = getFirstRow(existingResult);

    if (existing) {
        // Abandon old session
        await pool.query(
            `UPDATE diagnostic_sessions SET status = 'abandoned' WHERE id = ?`,
            [existing.id]
        );
    }

    // Get skills to test
    const skillsResult = await pool.query(
        `SELECT id, name FROM skills ORDER BY category, name`
    );
    const skills = getRows(skillsResult);

    // Collect questions for each skill
    const questions: DiagnosticQuestion[] = [];
    for (const skill of skills) {
        const questionsResult = await pool.query(
            `SELECT q.id, q.question_type, q.title, q.description
       FROM questions q
       INNER JOIN levels l ON q.level_id = l.id
       INNER JOIN level_skills ls ON l.id = ls.level_id
       WHERE ls.skill_id = ?
       ORDER BY RAND()
       LIMIT ?`,
            [skill.id, QUESTIONS_PER_SKILL]
        );
        const skillQuestions = getRows(questionsResult);

        for (const q of skillQuestions) {
            const question: DiagnosticQuestion = {
                id: q.id,
                skillId: skill.id,
                skillName: skill.name,
                type: q.question_type,
                title: q.title,
                description: q.description,
            };

            // Load options for MCQ
            if (q.question_type === 'mcq') {
                const optionsResult = await pool.query(
                    `SELECT id, option_text, option_letter FROM mcq_options 
           WHERE question_id = ? ORDER BY option_letter`,
                    [q.id]
                );
                question.options = getRows(optionsResult).map((o: any) => ({
                    id: o.id,
                    text: o.option_text,
                    letter: o.option_letter,
                }));
            }

            questions.push(question);
        }
    }

    // Create session
    const sessionId = uuidv4();
    await pool.query(
        `INSERT INTO diagnostic_sessions 
     (id, user_id, status, total_questions, skills_tested)
     VALUES (?, ?, 'in_progress', ?, ?)`,
        [sessionId, userId, questions.length, skills.length]
    );

    return {
        sessionId,
        questions,
        totalQuestions: questions.length,
        estimatedTime: Math.ceil(questions.length * 1.5), // 1.5 min per question
    };
};

// ============================================================================
// Submit Answer
// ============================================================================

/**
 * Submit an answer during diagnostic
 */
export const submitDiagnosticAnswer = async (
    sessionId: string,
    userId: string,
    questionId: string,
    answer: string,
    timeTaken?: number
): Promise<SubmitDiagnosticResponse> => {
    // Verify session
    const sessionResult = await pool.query(
        `SELECT * FROM diagnostic_sessions WHERE id = ? AND user_id = ? AND status = 'in_progress'`,
        [sessionId, userId]
    );
    const session = getFirstRow(sessionResult);

    if (!session) {
        throw new Error('Diagnostic session not found or already completed');
    }

    // Get question details
    const questionResult = await pool.query(
        `SELECT q.id, q.question_type, ls.skill_id
     FROM questions q
     INNER JOIN levels l ON q.level_id = l.id
     INNER JOIN level_skills ls ON l.id = ls.level_id
     WHERE q.id = ?
     LIMIT 1`,
        [questionId]
    );
    const question = getFirstRow(questionResult);

    if (!question) {
        throw new Error('Question not found');
    }

    // Check correctness
    let isCorrect = false;
    if (question.question_type === 'mcq') {
        const correctResult = await pool.query(
            `SELECT id FROM mcq_options WHERE question_id = ? AND is_correct = true`,
            [questionId]
        );
        const correctOption = getFirstRow(correctResult);
        isCorrect = correctOption?.id === answer;
    }

    // Save response
    const responseId = uuidv4();
    await pool.query(
        `INSERT INTO diagnostic_responses 
     (id, session_id, question_id, skill_id, question_type, answer_submitted, is_correct, time_taken_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [responseId, sessionId, questionId, question.skill_id, question.question_type, answer, isCorrect, timeTaken || null]
    );

    // Update session correct count
    if (isCorrect) {
        await pool.query(
            `UPDATE diagnostic_sessions SET correct_answers = correct_answers + 1 WHERE id = ?`,
            [sessionId]
        );
    }

    // Calculate progress
    const progressResult = await pool.query(
        `SELECT COUNT(*) as answered FROM diagnostic_responses WHERE session_id = ?`,
        [sessionId]
    );
    const answered = getFirstRow(progressResult)?.answered || 0;
    const remaining = session.total_questions - answered;

    return {
        responseId,
        isCorrect,
        questionsRemaining: remaining,
        currentProgress: Math.round((answered / session.total_questions) * 100),
    };
};

// ============================================================================
// Complete Diagnostic
// ============================================================================

/**
 * Complete diagnostic and calculate scores
 */
export const completeDiagnostic = async (
    sessionId: string,
    userId: string
): Promise<CompleteDiagnosticResponse> => {
    // Verify session
    const sessionResult = await pool.query(
        `SELECT * FROM diagnostic_sessions WHERE id = ? AND user_id = ?`,
        [sessionId, userId]
    );
    const session = getFirstRow(sessionResult);

    if (!session) {
        throw new Error('Diagnostic session not found');
    }

    // Calculate per-skill scores
    const skillScoresResult = await pool.query(
        `SELECT skill_id, 
            COUNT(*) as questions_asked,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers
     FROM diagnostic_responses
     WHERE session_id = ?
     GROUP BY skill_id`,
        [sessionId]
    );
    const rawScores = getRows(skillScoresResult);

    const skillScores: DiagnosticSkillScore[] = [];
    let totalScore = 0;

    for (const raw of rawScores) {
        const score = raw.questions_asked > 0
            ? Math.round((raw.correct_answers / raw.questions_asked) * 100)
            : 0;

        // Get skill name
        const skillResult = await pool.query(`SELECT name FROM skills WHERE id = ?`, [raw.skill_id]);
        const skillName = getFirstRow(skillResult)?.name || 'Unknown';

        // Determine recommended path for this skill
        let recommendedPath: RecommendedPath = 'standard';
        if (score < 60) recommendedPath = 'remedial';
        else if (score > 80) recommendedPath = 'accelerated';

        // Check if user has existing mastery
        const existingMastery = await skillMasteryService.getUserSkillMastery(userId, raw.skill_id);
        const hasExistingProgress = existingMastery && existingMastery.totalPracticeCount > 0;

        // Save skill score
        const scoreId = uuidv4();
        await pool.query(
            `INSERT INTO diagnostic_skill_scores 
       (id, session_id, user_id, skill_id, questions_asked, correct_answers, score, recommended_path, applied_to_mastery)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [scoreId, sessionId, userId, raw.skill_id, raw.questions_asked, raw.correct_answers, score, recommendedPath, !hasExistingProgress]
        );

        // Apply to mastery if no existing progress
        if (!hasExistingProgress && raw.questions_asked >= MIN_QUESTIONS_FOR_SCORE) {
            await skillMasteryService.updateMastery({
                userId,
                skillId: raw.skill_id,
                delta: score, // Set initial mastery to diagnostic score
                isSuccessful: true,
                activityType: 'diagnostic',
            });
        }

        skillScores.push({
            id: scoreId,
            sessionId,
            userId,
            skillId: raw.skill_id,
            skillName,
            questionsAsked: raw.questions_asked,
            correctAnswers: raw.correct_answers,
            score,
            recommendedPath,
            appliedToMastery: !hasExistingProgress,
        });

        totalScore += score;
    }

    // Calculate overall recommended path
    const avgScore = skillScores.length > 0 ? totalScore / skillScores.length : 0;
    let overallPath: RecommendedPath = 'standard';
    if (avgScore < 60) overallPath = 'remedial';
    else if (avgScore > 80) overallPath = 'accelerated';

    // Update session
    await pool.query(
        `UPDATE diagnostic_sessions 
     SET status = 'completed', completed_at = NOW(), average_score = ?, recommended_path = ?
     WHERE id = ?`,
        [avgScore, overallPath, sessionId]
    );

    // Generate explanation and next steps
    const explanation = getPathExplanation(overallPath, avgScore);
    const nextSteps = getNextSteps(overallPath, skillScores);

    return {
        sessionId,
        overallScore: Math.round(avgScore),
        skillScores,
        recommendedPath: overallPath,
        explanation,
        nextSteps,
    };
};

// ============================================================================
// Helpers
// ============================================================================

const getPathExplanation = (path: RecommendedPath, score: number): string => {
    switch (path) {
        case 'remedial':
            return `Your diagnostic score of ${score.toFixed(0)}% suggests you would benefit from foundational content. We'll start with basics to build a strong foundation.`;
        case 'accelerated':
            return `Excellent! Your score of ${score.toFixed(0)}% shows strong understanding. We'll fast-track you through introductory content.`;
        default:
            return `Your score of ${score.toFixed(0)}% places you on the standard learning path. You'll progress through content at a balanced pace.`;
    }
};

const getNextSteps = (path: RecommendedPath, scores: DiagnosticSkillScore[]): string[] => {
    const weakSkills = scores.filter(s => s.score < 60).map(s => s.skillName);
    const strongSkills = scores.filter(s => s.score > 80).map(s => s.skillName);

    const steps: string[] = [];

    if (path === 'remedial') {
        steps.push('Start with foundation lessons to build core knowledge');
        if (weakSkills.length > 0) {
            steps.push(`Focus on: ${weakSkills.slice(0, 3).join(', ')}`);
        }
    } else if (path === 'accelerated') {
        steps.push('Skip introductory content and dive into advanced topics');
        if (strongSkills.length > 0) {
            steps.push(`Your strengths: ${strongSkills.slice(0, 3).join(', ')}`);
        }
    } else {
        steps.push('Follow the standard curriculum in order');
        if (weakSkills.length > 0) {
            steps.push(`Give extra attention to: ${weakSkills.slice(0, 2).join(', ')}`);
        }
    }

    steps.push('Complete practice exercises to reinforce learning');
    return steps;
};
