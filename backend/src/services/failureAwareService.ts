import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';
import * as skillMasteryService from './skillMasteryService';
import * as skillService from './skillService';
import {
    FailureAnalysis,
    FailureAction,
    HintResponse,
    CommonMistake,
    ProgressionCheck,
    MasteryAdjustmentContext,
} from '../types/failureTypes';

// ============================================================================
// Constants
// ============================================================================

const ANALYSIS_WINDOW = 10;           // Number of recent attempts to analyze
const STRUGGLING_THRESHOLD = 3;       // Consecutive failures to trigger struggling
const INTERVENTION_THRESHOLD = 5;     // Failures to trigger intervention
const MIN_ACCURACY_THRESHOLD = 30;    // Below this = intervention
const PROGRESSION_MIN_MASTERY = 40;   // Minimum mastery to progress

// ============================================================================
// Failure Analysis
// ============================================================================

/**
 * Analyze recent failures for a user on a skill
 */
export const getFailureAnalysis = async (
    userId: string,
    skillId: string
): Promise<FailureAnalysis> => {
    // Get recent attempts
    const result = await pool.query(
        `SELECT is_correct, created_at
     FROM skill_practice_attempts
     WHERE user_id = ? AND skill_id = ? AND completed_at IS NOT NULL
     ORDER BY created_at DESC
     LIMIT ?`,
        [userId, skillId, ANALYSIS_WINDOW]
    );
    const attempts = getRows(result);

    if (attempts.length === 0) {
        return {
            consecutiveFailures: 0,
            recentAttempts: 0,
            recentCorrect: 0,
            recentAccuracy: 100,
            isStruggling: false,
            needsIntervention: false,
            suggestedAction: 'continue',
        };
    }

    // Count consecutive failures from most recent
    let consecutiveFailures = 0;
    for (const attempt of attempts) {
        if (!attempt.is_correct) {
            consecutiveFailures++;
        } else {
            break;
        }
    }

    // Count total correct in window
    const recentCorrect = attempts.filter((a: any) => a.is_correct).length;
    const recentAccuracy = Math.round((recentCorrect / attempts.length) * 100);

    // Determine status
    const isStruggling = consecutiveFailures >= STRUGGLING_THRESHOLD;
    const needsIntervention =
        consecutiveFailures >= INTERVENTION_THRESHOLD ||
        recentAccuracy < MIN_ACCURACY_THRESHOLD;

    // Determine suggested action
    let suggestedAction: FailureAction = 'continue';
    if (consecutiveFailures >= 7) {
        suggestedAction = 'take_break';
    } else if (consecutiveFailures >= 5) {
        suggestedAction = 'review_basics';
    } else if (consecutiveFailures >= 3) {
        suggestedAction = 'simplify';
    } else if (consecutiveFailures >= 2) {
        suggestedAction = 'show_hint';
    }

    return {
        consecutiveFailures,
        recentAttempts: attempts.length,
        recentCorrect,
        recentAccuracy,
        isStruggling,
        needsIntervention,
        suggestedAction,
    };
};

// ============================================================================
// Hints System
// ============================================================================

/**
 * Get appropriate hint based on failure analysis
 */
export const getHintForAttempt = async (
    userId: string,
    skillId: string,
    questionId: string
): Promise<HintResponse> => {
    const analysis = await getFailureAnalysis(userId, skillId);

    // Determine hint level
    let level: HintResponse['level'] = 'none';
    if (analysis.consecutiveFailures >= 5) {
        level = 'review_needed';
    } else if (analysis.consecutiveFailures >= 3) {
        level = 'detailed';
    } else if (analysis.consecutiveFailures >= 2) {
        level = 'subtle';
    }

    // Get question explanation for hints
    const questionResult = await pool.query(
        `SELECT explanation, description FROM questions WHERE id = ?`,
        [questionId]
    );
    const question = getFirstRow(questionResult);

    // Generate hint based on level
    let hint: string | null = null;
    let simplifiedExplanation: string | null = null;

    if (level === 'subtle') {
        hint = 'Take your time and read the question carefully. Focus on the key concepts.';
    } else if (level === 'detailed') {
        hint = question?.explanation
            ? `Hint: ${question.explanation.substring(0, 100)}...`
            : 'Review the fundamental concepts before attempting again.';
        simplifiedExplanation = 'Try breaking down the problem into smaller parts.';
    } else if (level === 'review_needed') {
        hint = 'It seems like you\'re struggling. Consider reviewing the basics first.';
        simplifiedExplanation = question?.explanation || null;
    }

    // Get suggested review skills (prerequisites)
    let suggestedReviewSkills: Array<{ id: string; name: string }> = [];
    if (level === 'review_needed') {
        const prereqResult = await pool.query(
            `SELECT s.id, s.name
       FROM skills s
       INNER JOIN skill_prerequisites sp ON s.id = sp.prerequisite_skill_id
       WHERE sp.skill_id = ?
       ORDER BY s.name`,
            [skillId]
        );
        suggestedReviewSkills = getRows(prereqResult).map((r: any) => ({
            id: r.id,
            name: r.name,
        }));
    }

    return {
        level,
        hint,
        simplifiedExplanation,
        suggestedReviewSkills,
    };
};

// ============================================================================
// Dynamic Mastery Adjustments
// ============================================================================

/**
 * Calculate adjusted mastery delta based on failure context
 */
export const getAdjustedMasteryDelta = (context: MasteryAdjustmentContext): {
    delta: number;
    wasRecoveryBonus: boolean;
} => {
    const { basePoints, isCorrect, consecutiveFailures, currentMastery, attemptType } = context;
    const typeMultiplier = attemptType === 'coding' ? 1.5 : 1.0;

    if (isCorrect) {
        // Recovery bonus after struggling
        const isRecovery = consecutiveFailures >= STRUGGLING_THRESHOLD;
        const recoveryMultiplier = isRecovery ? 1.5 : 1.0;

        // Diminishing returns as mastery increases
        const diminishingFactor = (100 - currentMastery) / 100;

        const delta = Math.round(
            basePoints * typeMultiplier * recoveryMultiplier * diminishingFactor * 100
        ) / 100;

        return { delta, wasRecoveryBonus: isRecovery };
    } else {
        // Progressive penalty (capped at 1.0x)
        const penaltyMultiplier = Math.min(1.0, 0.5 + (consecutiveFailures * 0.15));
        const delta = -Math.round((basePoints / 3) * penaltyMultiplier * 100) / 100;

        return { delta, wasRecoveryBonus: false };
    }
};

// ============================================================================
// Common Mistakes Tracking
// ============================================================================

/**
 * Get common wrong answers for a user on a skill
 */
export const getCommonMistakes = async (
    userId: string,
    skillId: string,
    limit: number = 5
): Promise<CommonMistake[]> => {
    const result = await pool.query(
        `SELECT answer_submitted, COUNT(*) as count
     FROM skill_practice_attempts
     WHERE user_id = ? AND skill_id = ? 
       AND is_correct = false 
       AND completed_at IS NOT NULL
       AND answer_submitted IS NOT NULL
     GROUP BY answer_submitted
     ORDER BY count DESC
     LIMIT ?`,
        [userId, skillId, limit]
    );
    const rows = getRows(result);

    // Get total wrong answers for percentage
    const totalResult = await pool.query(
        `SELECT COUNT(*) as total
     FROM skill_practice_attempts
     WHERE user_id = ? AND skill_id = ? AND is_correct = false AND completed_at IS NOT NULL`,
        [userId, skillId]
    );
    const total = getFirstRow(totalResult)?.total || 1;

    return rows.map((row: any) => ({
        answer: row.answer_submitted,
        count: parseInt(row.count),
        percentage: Math.round((parseInt(row.count) / total) * 100),
    }));
};

// ============================================================================
// Progression Gating
// ============================================================================

/**
 * Check if user can progress to next level
 */
export const canProgressToNextLevel = async (
    userId: string,
    currentLevelId: string
): Promise<ProgressionCheck> => {
    // Get skills for current level
    const skills = await skillService.getSkillsForLevel(currentLevelId);
    const blockerSkills: ProgressionCheck['blockerSkills'] = [];

    for (const skill of skills) {
        const mastery = await skillMasteryService.getUserSkillMastery(userId, skill.id);
        const currentMastery = mastery?.masteryScore || 0;

        if (currentMastery < PROGRESSION_MIN_MASTERY) {
            blockerSkills.push({
                skillId: skill.id,
                skillName: skill.name,
                currentMastery,
                requiredMastery: PROGRESSION_MIN_MASTERY,
            });
        }
    }

    const canProgress = blockerSkills.length === 0;
    let message = canProgress
        ? 'You\'re ready to move on!'
        : `Improve your skills before progressing: ${blockerSkills.map(s => s.skillName).join(', ')}`;

    return {
        canProgress,
        currentLevelId,
        blockerSkills,
        message,
    };
};

// ============================================================================
// Helper: Get base points for difficulty
// ============================================================================

export const getBasePoints = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    const points: Record<string, number> = { easy: 3, medium: 5, hard: 8 };
    return points[difficulty] || 5;
};
