import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';
import {
    OnboardingStatus,
    FoundationLesson,
    LearningPath,
    LearningPathStep,
} from '../types/onboardingTypes';

// ============================================================================
// Beginner Detection
// ============================================================================

/**
 * Check if user is a beginner (zero mastery on any skill)
 */
export const isBeginner = async (userId: string): Promise<boolean> => {
    const result = await pool.query(
        `SELECT COUNT(*) AS mastered_skills
     FROM user_skill_mastery
     WHERE user_id = ? AND mastery_score > 0`,
        [userId]
    );
    const rows = getRows(result);
    return (rows[0]?.mastered_skills || 0) === 0;
};

/**
 * Get comprehensive onboarding status for a user
 */
export const getOnboardingStatus = async (userId: string): Promise<OnboardingStatus> => {
    // Check mastered skills count
    const masteryResult = await pool.query(
        `SELECT COUNT(*) AS mastered_skills
     FROM user_skill_mastery
     WHERE user_id = ? AND mastery_score > 0`,
        [userId]
    );
    const masteredSkillsCount = getRows(masteryResult)[0]?.mastered_skills || 0;

    // Check total sessions
    const sessionResult = await pool.query(
        `SELECT COUNT(*) AS session_count
     FROM practice_sessions
     WHERE user_id = ?`,
        [userId]
    );
    const totalSessionsCount = getRows(sessionResult)[0]?.session_count || 0;

    // Get average mastery
    const avgResult = await pool.query(
        `SELECT AVG(mastery_score) AS avg_mastery
     FROM user_skill_mastery
     WHERE user_id = ?`,
        [userId]
    );
    const avgMastery = parseFloat(getRows(avgResult)[0]?.avg_mastery) || 0;

    // Get user registration date
    const userResult = await pool.query(
        `SELECT created_at FROM users WHERE id = ?`,
        [userId]
    );
    const userRow = getFirstRow(userResult) as { created_at: Date } | null;
    const createdAt = userRow?.created_at || new Date();
    const daysActive = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

    // Determine engagement level
    let engagementLevel: OnboardingStatus['engagementLevel'];
    if (masteredSkillsCount === 0 && totalSessionsCount === 0) {
        engagementLevel = 'new';
    } else if (avgMastery < 30 || totalSessionsCount < 5) {
        engagementLevel = 'exploring';
    } else if (avgMastery < 70) {
        engagementLevel = 'active';
    } else {
        engagementLevel = 'proficient';
    }

    // Determine if beginner
    const beginnerStatus = masteredSkillsCount === 0;
    const needsGuidance = avgMastery < 20 || totalSessionsCount < 3;

    // Determine suggested action
    let suggestedAction: OnboardingStatus['suggestedAction'] = null;
    let message = '';

    if (beginnerStatus) {
        suggestedAction = 'start_fundamentals';
        message = "Welcome! Let's get you started with the basics.";
    } else if (needsGuidance) {
        suggestedAction = 'continue_course';
        message = "You're making progress! Keep going with your current course.";
    } else if (avgMastery > 70) {
        suggestedAction = 'try_new_skill';
        message = "Great job! Ready to explore new skills?";
    } else {
        message = "You're on track! Keep practicing.";
    }

    return {
        isBeginner: beginnerStatus,
        needsGuidance,
        engagementLevel,
        daysActive,
        masteredSkillsCount,
        totalSessionsCount,
        suggestedAction,
        message,
    };
};

// ============================================================================
// Foundation Lessons
// ============================================================================

/**
 * Get recommended foundation lessons for beginners
 */
export const getFoundationLessons = async (userId: string): Promise<FoundationLesson[]> => {
    // Get all Level 1 lessons with their skills, excluding completed ones
    const result = await pool.query(
        `SELECT DISTINCT 
       l.id AS level_id,
       l.title AS level_title,
       l.level_number,
       c.id AS course_id,
       c.title AS course_title,
       GROUP_CONCAT(DISTINCT s.name) AS skills_taught
     FROM levels l
     INNER JOIN courses c ON l.course_id = c.id
     LEFT JOIN level_skills ls ON l.id = ls.level_id
     LEFT JOIN skills s ON ls.skill_id = s.id
     LEFT JOIN user_progress up ON l.id = up.level_id AND up.user_id = ?
     WHERE l.level_number = 1
       AND (up.status IS NULL OR up.status != 'completed')
     GROUP BY l.id, l.title, l.level_number, c.id, c.title
     ORDER BY c.title`,
        [userId]
    );

    const rows = getRows(result);

    return rows.map((row: any, index: number) => ({
        levelId: row.level_id,
        levelTitle: row.level_title,
        levelNumber: row.level_number,
        courseId: row.course_id,
        courseTitle: row.course_title,
        skillsTaught: row.skills_taught ? row.skills_taught.split(',') : [],
        priority: index + 1,
        reason: index === 0
            ? 'Perfect starting point - no prerequisites'
            : 'Alternative starting point',
    }));
};

/**
 * Get skills the user hasn't touched yet
 */
export const getUntouchedSkills = async (userId: string): Promise<string[]> => {
    const result = await pool.query(
        `SELECT s.name
     FROM skills s
     LEFT JOIN user_skill_mastery usm ON s.id = usm.skill_id AND usm.user_id = ?
     WHERE usm.skill_id IS NULL OR usm.mastery_score = 0
     ORDER BY s.difficulty_tier, s.name`,
        [userId]
    );
    const rows = getRows(result);
    return rows.map((row: any) => row.name);
};

// ============================================================================
// Learning Path
// ============================================================================

/**
 * Generate a personalized "start here" learning path
 */
export const getStartHerePath = async (userId: string): Promise<LearningPath> => {
    // Get first 5 foundation lessons as steps
    const foundationLessons = await getFoundationLessons(userId);

    // Get completed levels for this user
    const progressResult = await pool.query(
        `SELECT level_id FROM user_progress WHERE user_id = ? AND status = 'completed'`,
        [userId]
    );
    const completedLevelIds = new Set(getRows(progressResult).map((r: any) => r.level_id));

    const steps: LearningPathStep[] = foundationLessons.slice(0, 5).map((lesson, index) => ({
        stepNumber: index + 1,
        action: 'complete_level' as const,
        targetId: lesson.levelId,
        targetTitle: lesson.levelTitle,
        courseTitle: lesson.courseTitle,
        completed: completedLevelIds.has(lesson.levelId),
        skillsToGain: lesson.skillsTaught,
    }));

    const completedCount = steps.filter(s => s.completed).length;

    return {
        title: 'Your First Steps',
        description: 'Complete these foundation lessons to build your core skills.',
        steps,
        estimatedDuration: `~${steps.length * 30} minutes`,
        progress: {
            completed: completedCount,
            total: steps.length,
            percentage: steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0,
        },
    };
};

// ============================================================================
// Onboarding Completion
// ============================================================================

/**
 * Mark onboarding as complete (optional - for tracking)
 * This could update a flag in the users table if needed
 */
export const completeOnboarding = async (userId: string): Promise<void> => {
    // For now, this is a no-op since we use dynamic detection
    // Could add: UPDATE users SET onboarding_completed = true WHERE id = ?
    console.log(`Onboarding completed for user: ${userId}`);
};
