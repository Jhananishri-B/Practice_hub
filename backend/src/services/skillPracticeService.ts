import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';
import * as skillMasteryService from './skillMasteryService';
import {
    PracticeAttempt,
    PracticeAttemptRow,
    PracticeQuestion,
    PracticeOption,
    StartPracticeResponse,
    SubmitMCQResult,
    SubmitCodeResult,
    PracticeHistoryItem,
    SkillPracticeStats,
    TestCaseResult,
    mapAttemptRowToAttempt,
} from '../types/practiceTypes';

// ============================================================================
// Get Questions for a Skill
// ============================================================================

/**
 * Get practice questions for a skill
 */
export const getQuestionsForSkill = async (
    skillId: string,
    type?: 'mcq' | 'coding',
    limit: number = 10
): Promise<PracticeQuestion[]> => {
    let query = `
    SELECT DISTINCT q.id, q.question_type, q.title, q.description, q.difficulty,
           q.input_format, q.output_format, q.constraints, q.explanation
    FROM questions q
    INNER JOIN levels l ON q.level_id = l.id
    INNER JOIN level_skills ls ON l.id = ls.level_id
    WHERE ls.skill_id = ?
  `;
    const params: any[] = [skillId];

    if (type) {
        query += ` AND q.question_type = ?`;
        params.push(type);
    }

    query += ` ORDER BY RAND() LIMIT ?`;
    params.push(limit);

    const result = await pool.query(query, params);
    const rows = getRows(result);

    const questions: PracticeQuestion[] = [];
    for (const row of rows) {
        const question: PracticeQuestion = {
            id: row.id,
            type: row.question_type as 'mcq' | 'coding',
            title: row.title,
            description: row.description,
            difficulty: row.difficulty,
            inputFormat: row.input_format,
            outputFormat: row.output_format,
            constraints: row.constraints,
        };

        // Load options for MCQ
        if (row.question_type === 'mcq') {
            const optionsResult = await pool.query(
                `SELECT id, option_text, option_letter FROM mcq_options WHERE question_id = ? ORDER BY option_letter`,
                [row.id]
            );
            question.options = getRows(optionsResult).map((o: any) => ({
                id: o.id,
                text: o.option_text,
                letter: o.option_letter,
            }));
        }

        // Load test cases for coding (non-hidden only for display)
        if (row.question_type === 'coding') {
            const testCasesResult = await pool.query(
                `SELECT input_data, expected_output, is_hidden FROM test_cases 
         WHERE question_id = ? ORDER BY test_case_number`,
                [row.id]
            );
            question.testCases = getRows(testCasesResult).map((tc: any) => ({
                input: tc.input_data,
                expectedOutput: tc.expected_output,
                isHidden: tc.is_hidden,
            }));
        }

        questions.push(question);
    }

    return questions;
};

// ============================================================================
// Start Practice Attempt
// ============================================================================

/**
 * Start a new practice attempt
 */
export const startPracticeAttempt = async (
    userId: string,
    skillId: string,
    questionId: string,
    attemptType: 'mcq' | 'coding'
): Promise<StartPracticeResponse> => {
    const attemptId = uuidv4();

    // Create attempt record
    await pool.query(
        `INSERT INTO skill_practice_attempts 
     (id, user_id, skill_id, question_id, attempt_type, started_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
        [attemptId, userId, skillId, questionId, attemptType]
    );

    // Get question details
    const questions = await getQuestionsForSkill(skillId, attemptType, 100);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        throw new Error('Question not found');
    }

    // Get skill name
    const skillResult = await pool.query(`SELECT name FROM skills WHERE id = ?`, [skillId]);
    const skillName = getFirstRow(skillResult)?.name || 'Unknown Skill';

    return {
        attemptId,
        question,
        skillName,
        timeLimit: attemptType === 'mcq' ? 60 : 300, // 1 min for MCQ, 5 min for coding
    };
};

// ============================================================================
// Submit MCQ Answer
// ============================================================================

/**
 * Submit an MCQ answer and update mastery
 */
export const submitMCQAnswer = async (
    attemptId: string,
    userId: string,
    selectedOptionId: string
): Promise<SubmitMCQResult> => {
    // Get attempt details
    const attemptResult = await pool.query(
        `SELECT * FROM skill_practice_attempts WHERE id = ? AND user_id = ?`,
        [attemptId, userId]
    );
    const attempt = getFirstRow(attemptResult) as PracticeAttemptRow | null;

    if (!attempt) {
        throw new Error('Attempt not found');
    }

    if (attempt.completed_at) {
        throw new Error('Attempt already completed');
    }

    // Get correct answer
    const correctResult = await pool.query(
        `SELECT id FROM mcq_options WHERE question_id = ? AND is_correct = true`,
        [attempt.question_id]
    );
    const correctOption = getFirstRow(correctResult);
    const isCorrect = correctOption?.id === selectedOptionId;

    // Get explanation
    const explanationResult = await pool.query(
        `SELECT explanation FROM questions WHERE id = ?`,
        [attempt.question_id]
    );
    const explanation = getFirstRow(explanationResult)?.explanation || null;

    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);

    // Get current mastery and calculate delta
    const currentMastery = await skillMasteryService.getUserSkillMastery(userId, attempt.skill_id);
    const masteryBefore = currentMastery?.masteryScore || 0;
    const delta = calculateMasteryDelta(isCorrect, masteryBefore, 'medium', 'mcq');

    // Update mastery
    const updatedMastery = await skillMasteryService.updateMastery({
        userId,
        skillId: attempt.skill_id,
        delta,
        isSuccessful: isCorrect,
        activityType: 'practice',
    });

    const masteryAfter = updatedMastery.masteryScore;

    // Update attempt record
    await pool.query(
        `UPDATE skill_practice_attempts SET
       answer_submitted = ?,
       is_correct = ?,
       score = ?,
       time_taken_seconds = ?,
       completed_at = NOW(),
       explanation = ?,
       mastery_delta = ?,
       mastery_before = ?,
       mastery_after = ?
     WHERE id = ?`,
        [
            selectedOptionId,
            isCorrect,
            isCorrect ? 100 : 0,
            timeTaken,
            explanation,
            delta,
            masteryBefore,
            masteryAfter,
            attemptId,
        ]
    );

    return {
        attemptId,
        isCorrect,
        correctOptionId: correctOption?.id || '',
        selectedOptionId,
        explanation,
        masteryUpdate: { before: masteryBefore, after: masteryAfter, delta },
        timeTaken,
    };
};

// ============================================================================
// Submit Coding Answer
// ============================================================================

/**
 * Submit coding solution and update mastery
 */
export const submitCodingAnswer = async (
    attemptId: string,
    userId: string,
    code: string,
    language: string
): Promise<SubmitCodeResult> => {
    // Get attempt details
    const attemptResult = await pool.query(
        `SELECT * FROM skill_practice_attempts WHERE id = ? AND user_id = ?`,
        [attemptId, userId]
    );
    const attempt = getFirstRow(attemptResult) as PracticeAttemptRow | null;

    if (!attempt) {
        throw new Error('Attempt not found');
    }

    if (attempt.completed_at) {
        throw new Error('Attempt already completed');
    }

    // Get test cases
    const testCasesResult = await pool.query(
        `SELECT id, input_data, expected_output, is_hidden, test_case_number 
     FROM test_cases WHERE question_id = ? ORDER BY test_case_number`,
        [attempt.question_id]
    );
    const testCases = getRows(testCasesResult);

    // For now, simulate code execution (in production, use actual code executor)
    // This is a placeholder - integrate with your existing code execution service
    const testResults: TestCaseResult[] = [];
    let passed = 0;

    for (const tc of testCases) {
        // Placeholder: In production, actually execute code
        const actualOutput = 'Execution not implemented';
        const isPassed = false; // Will be true after real execution

        testResults.push({
            testCaseNumber: tc.test_case_number,
            passed: isPassed,
            input: tc.input_data,
            expectedOutput: tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : actualOutput,
            isHidden: tc.is_hidden,
        });

        if (isPassed) passed++;
    }

    const totalTestCases = testCases.length;
    const score = totalTestCases > 0 ? (passed / totalTestCases) * 100 : 0;
    const isCorrect = passed === totalTestCases && totalTestCases > 0;

    // Get explanation
    const explanationResult = await pool.query(
        `SELECT explanation FROM questions WHERE id = ?`,
        [attempt.question_id]
    );
    const explanation = getFirstRow(explanationResult)?.explanation || null;

    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);

    // Get current mastery and calculate delta
    const currentMastery = await skillMasteryService.getUserSkillMastery(userId, attempt.skill_id);
    const masteryBefore = currentMastery?.masteryScore || 0;
    const delta = calculateMasteryDelta(isCorrect, masteryBefore, 'medium', 'coding');

    // Update mastery
    const updatedMastery = await skillMasteryService.updateMastery({
        userId,
        skillId: attempt.skill_id,
        delta,
        isSuccessful: isCorrect,
        activityType: 'practice',
    });

    const masteryAfter = updatedMastery.masteryScore;

    // Update attempt record
    await pool.query(
        `UPDATE skill_practice_attempts SET
       answer_submitted = ?,
       is_correct = ?,
       score = ?,
       language = ?,
       test_cases_passed = ?,
       total_test_cases = ?,
       execution_time_ms = ?,
       time_taken_seconds = ?,
       completed_at = NOW(),
       explanation = ?,
       mastery_delta = ?,
       mastery_before = ?,
       mastery_after = ?
     WHERE id = ?`,
        [
            code,
            isCorrect,
            score,
            language,
            passed,
            totalTestCases,
            0, // execution time placeholder
            timeTaken,
            explanation,
            delta,
            masteryBefore,
            masteryAfter,
            attemptId,
        ]
    );

    return {
        attemptId,
        isCorrect,
        score,
        testCasesPassed: passed,
        totalTestCases,
        testResults,
        explanation,
        masteryUpdate: { before: masteryBefore, after: masteryAfter, delta },
        timeTaken,
        executionTime: 0,
    };
};

// ============================================================================
// Mastery Delta Calculation
// ============================================================================

/**
 * Calculate mastery delta based on attempt result
 */
const calculateMasteryDelta = (
    isCorrect: boolean,
    currentMastery: number,
    difficulty: 'easy' | 'medium' | 'hard',
    attemptType: 'mcq' | 'coding'
): number => {
    const basePoints: Record<string, number> = { easy: 3, medium: 5, hard: 8 };
    const typeMultiplier = attemptType === 'coding' ? 1.5 : 1.0;

    if (isCorrect) {
        // Diminishing returns as mastery increases
        const factor = (100 - currentMastery) / 100;
        return Math.round(basePoints[difficulty] * typeMultiplier * factor * 100) / 100;
    } else {
        // Small penalty for wrong answers
        return -Math.round((basePoints[difficulty] / 3) * 100) / 100;
    }
};

// ============================================================================
// Practice History
// ============================================================================

/**
 * Get user's practice history
 */
export const getPracticeHistory = async (
    userId: string,
    skillId?: string,
    limit: number = 50
): Promise<PracticeHistoryItem[]> => {
    let query = `
    SELECT spa.id, spa.skill_id, s.name as skill_name, 
           q.title as question_title, spa.attempt_type,
           spa.is_correct, spa.score, spa.time_taken_seconds,
           spa.mastery_delta, spa.created_at
    FROM skill_practice_attempts spa
    INNER JOIN skills s ON spa.skill_id = s.id
    LEFT JOIN questions q ON spa.question_id = q.id
    WHERE spa.user_id = ? AND spa.completed_at IS NOT NULL
  `;
    const params: any[] = [userId];

    if (skillId) {
        query += ` AND spa.skill_id = ?`;
        params.push(skillId);
    }

    query += ` ORDER BY spa.created_at DESC LIMIT ?`;
    params.push(limit);

    const result = await pool.query(query, params);
    const rows = getRows(result);

    return rows.map((row: any) => ({
        attemptId: row.id,
        skillId: row.skill_id,
        skillName: row.skill_name,
        questionTitle: row.question_title || 'Unknown',
        attemptType: row.attempt_type,
        isCorrect: row.is_correct,
        score: row.score,
        timeTaken: row.time_taken_seconds,
        masteryDelta: row.mastery_delta,
        createdAt: row.created_at,
    }));
};

// ============================================================================
// Practice Stats
// ============================================================================

/**
 * Get practice statistics for a skill
 */
export const getSkillPracticeStats = async (
    userId: string,
    skillId: string
): Promise<SkillPracticeStats> => {
    // Get skill info
    const skillResult = await pool.query(`SELECT name FROM skills WHERE id = ?`, [skillId]);
    const skillName = getFirstRow(skillResult)?.name || 'Unknown Skill';

    // Get aggregate stats
    const statsResult = await pool.query(
        `SELECT 
       COUNT(*) as total_attempts,
       SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_attempts,
       AVG(time_taken_seconds) as avg_time,
       MAX(created_at) as last_practiced,
       SUM(CASE WHEN attempt_type = 'mcq' THEN 1 ELSE 0 END) as mcq_attempts,
       SUM(CASE WHEN attempt_type = 'mcq' AND is_correct THEN 1 ELSE 0 END) as mcq_correct,
       SUM(CASE WHEN attempt_type = 'coding' THEN 1 ELSE 0 END) as coding_attempts,
       SUM(CASE WHEN attempt_type = 'coding' AND is_correct THEN 1 ELSE 0 END) as coding_correct
     FROM skill_practice_attempts
     WHERE user_id = ? AND skill_id = ? AND completed_at IS NOT NULL`,
        [userId, skillId]
    );
    const stats = getFirstRow(statsResult) || {};

    // Get current mastery
    const mastery = await skillMasteryService.getUserSkillMastery(userId, skillId);
    const currentMastery = mastery?.masteryScore || 0;

    // Calculate trend from recent attempts
    const recentResult = await pool.query(
        `SELECT mastery_delta FROM skill_practice_attempts
     WHERE user_id = ? AND skill_id = ? AND completed_at IS NOT NULL
     ORDER BY created_at DESC LIMIT 5`,
        [userId, skillId]
    );
    const recentDeltas = getRows(recentResult).map((r: any) => r.mastery_delta || 0);
    const avgDelta = recentDeltas.length > 0
        ? recentDeltas.reduce((a: number, b: number) => a + b, 0) / recentDeltas.length
        : 0;

    let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (avgDelta > 1) recentTrend = 'improving';
    else if (avgDelta < -0.5) recentTrend = 'declining';

    const totalAttempts = parseInt(stats.total_attempts) || 0;
    const correctAttempts = parseInt(stats.correct_attempts) || 0;

    return {
        skillId,
        skillName,
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        averageTimeSeconds: Math.round(stats.avg_time || 0),
        currentMastery,
        recentTrend,
        lastPracticed: stats.last_practiced || null,
        mcqStats: {
            attempts: parseInt(stats.mcq_attempts) || 0,
            correct: parseInt(stats.mcq_correct) || 0,
        },
        codingStats: {
            attempts: parseInt(stats.coding_attempts) || 0,
            correct: parseInt(stats.coding_correct) || 0,
        },
    };
};
