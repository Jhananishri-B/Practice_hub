import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';
import {
    UserSkillMastery,
    UserSkillMasteryRow,
    SkillMasteryHistory,
    UserSkillSummary,
    SkillWithMastery,
    UpdateMasteryInput,
    CourseSkillMastery,
    mapMasteryRowToMastery,
    mapSkillRowToSkill,
    SkillRow,
} from '../types/skillTypes';

// ============================================================================
// Mastery Read Operations
// ============================================================================

/**
 * Get a user's mastery for a specific skill
 */
export const getUserSkillMastery = async (
    userId: string,
    skillId: string
): Promise<UserSkillMastery | null> => {
    const result = await pool.query(
        `SELECT * FROM user_skill_mastery WHERE user_id = ? AND skill_id = ?`,
        [userId, skillId]
    );
    const row = getFirstRow(result) as UserSkillMasteryRow | null;
    return row ? mapMasteryRowToMastery(row) : null;
};

/**
 * Get all skill masteries for a user
 */
export const getUserAllMasteries = async (userId: string): Promise<SkillWithMastery[]> => {
    const result = await pool.query(
        `SELECT s.*, COALESCE(usm.mastery_score, 0) as mastery_score,
            COALESCE(usm.total_practice_count, 0) as practice_count,
            usm.last_practiced_at
     FROM skills s
     LEFT JOIN user_skill_mastery usm ON s.id = usm.skill_id AND usm.user_id = ?
     ORDER BY s.category, s.name`,
        [userId]
    );
    const rows = getRows(result);
    return rows.map((row: any) => ({
        ...mapSkillRowToSkill(row),
        masteryScore: parseFloat(row.mastery_score) || 0,
        practiceCount: row.practice_count || 0,
        lastPracticedAt: row.last_practiced_at || null,
    }));
};

/**
 * Get user's skill mastery for a specific course
 */
export const getUserCourseSkillMastery = async (
    userId: string,
    courseId: string
): Promise<CourseSkillMastery> => {
    // Get course info
    const courseResult = await pool.query(
        `SELECT id, title FROM courses WHERE id = ?`,
        [courseId]
    );
    const courseRow = getFirstRow(courseResult) as { id: string; title: string } | null;

    if (!courseRow) {
        throw new Error(`Course not found: ${courseId}`);
    }

    // Get all skills for the course with user's mastery
    const result = await pool.query(
        `SELECT DISTINCT s.*, 
            COALESCE(usm.mastery_score, 0) as mastery_score,
            COALESCE(usm.total_practice_count, 0) as practice_count,
            usm.last_practiced_at
     FROM skills s
     INNER JOIN level_skills ls ON s.id = ls.skill_id
     INNER JOIN levels l ON ls.level_id = l.id
     LEFT JOIN user_skill_mastery usm ON s.id = usm.skill_id AND usm.user_id = ?
     WHERE l.course_id = ?
     ORDER BY s.category, s.name`,
        [userId, courseId]
    );
    const rows = getRows(result);

    const skills: SkillWithMastery[] = rows.map((row: any) => ({
        ...mapSkillRowToSkill(row),
        masteryScore: parseFloat(row.mastery_score) || 0,
        practiceCount: row.practice_count || 0,
        lastPracticedAt: row.last_practiced_at || null,
    }));

    const overallMastery = skills.length > 0
        ? skills.reduce((sum, s) => sum + s.masteryScore, 0) / skills.length
        : 0;

    return {
        courseId: courseRow.id,
        courseTitle: courseRow.title,
        skills,
        overallMastery: Math.round(overallMastery * 100) / 100,
    };
};

/**
 * Get user skill summary statistics
 */
export const getUserSkillSummary = async (userId: string): Promise<UserSkillSummary> => {
    const masteries = await getUserAllMasteries(userId);

    const totalSkills = masteries.length;
    const masteredSkills = masteries.filter(s => s.masteryScore >= 80).length;
    const inProgressSkills = masteries.filter(s => s.masteryScore >= 20 && s.masteryScore < 80).length;
    const notStartedSkills = masteries.filter(s => s.masteryScore < 20).length;

    const averageMastery = totalSkills > 0
        ? masteries.reduce((sum, s) => sum + s.masteryScore, 0) / totalSkills
        : 0;

    // Sort by mastery for strongest/weakest
    const sorted = [...masteries].sort((a, b) => b.masteryScore - a.masteryScore);
    const strongestSkills = sorted.slice(0, 5);
    const weakestSkills = sorted.slice(-5).reverse();

    return {
        totalSkills,
        masteredSkills,
        inProgressSkills,
        notStartedSkills,
        averageMastery: Math.round(averageMastery * 100) / 100,
        strongestSkills,
        weakestSkills,
    };
};

// ============================================================================
// Mastery Update Operations
// ============================================================================

/**
 * Update a user's mastery for a skill
 */
export const updateMastery = async (input: UpdateMasteryInput): Promise<UserSkillMastery> => {
    const { userId, skillId, delta, isSuccessful, sessionId, activityType } = input;

    // Get current mastery
    const currentMastery = await getUserSkillMastery(userId, skillId);
    const currentScore = currentMastery?.masteryScore || 0;

    // Calculate new score (clamped to 0-100)
    const newScore = Math.max(0, Math.min(100, currentScore + delta));

    // Upsert mastery record
    if (currentMastery) {
        await pool.query(
            `UPDATE user_skill_mastery 
       SET mastery_score = ?,
           total_practice_count = total_practice_count + 1,
           successful_practice_count = successful_practice_count + ?,
           last_practiced_at = NOW()
       WHERE user_id = ? AND skill_id = ?`,
            [newScore, isSuccessful ? 1 : 0, userId, skillId]
        );
    } else {
        const id = uuidv4();
        await pool.query(
            `INSERT INTO user_skill_mastery 
       (id, user_id, skill_id, mastery_score, total_practice_count, successful_practice_count, last_practiced_at)
       VALUES (?, ?, ?, ?, 1, ?, NOW())`,
            [id, userId, skillId, newScore, isSuccessful ? 1 : 0]
        );
    }

    // Record history
    const historyId = uuidv4();
    await pool.query(
        `INSERT INTO skill_mastery_history 
     (id, user_id, skill_id, previous_score, new_score, delta, source_session_id, activity_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [historyId, userId, skillId, currentScore, newScore, delta, sessionId || null, activityType]
    );

    // Return updated mastery
    return (await getUserSkillMastery(userId, skillId))!;
};

/**
 * Update mastery for all skills associated with a level after a practice session
 */
export const updateMasteryForLevelActivity = async (
    userId: string,
    levelId: string,
    sessionId: string,
    isSuccessful: boolean,
    successRate: number // 0-1 representing percentage of correct answers
): Promise<void> => {
    // Get all skills for this level
    const result = await pool.query(
        `SELECT skill_id, contribution_type, weight 
     FROM level_skills 
     WHERE level_id = ?`,
        [levelId]
    );
    const levelSkills = getRows(result);

    for (const ls of levelSkills) {
        // Calculate delta based on contribution type and weight
        let baseDelta: number;
        switch (ls.contribution_type) {
            case 'teaches':
                baseDelta = isSuccessful ? 10 : 2; // More generous for teaching content
                break;
            case 'practices':
                baseDelta = isSuccessful ? 5 : 0; // Moderate for practice
                break;
            case 'assesses':
                baseDelta = (successRate - 0.5) * 20; // Can be negative for poor performance
                break;
            default:
                baseDelta = isSuccessful ? 5 : 1;
        }

        // Apply weight multiplier (1-10)
        const weightedDelta = baseDelta * (ls.weight / 5); // Normalize weight around 1

        await updateMastery({
            userId,
            skillId: ls.skill_id,
            delta: Math.round(weightedDelta * 100) / 100,
            isSuccessful,
            sessionId,
            activityType: 'practice',
        });
    }
};

// ============================================================================
// Mastery History
// ============================================================================

/**
 * Get mastery history for a user's skill
 */
export const getMasteryHistory = async (
    userId: string,
    skillId: string,
    limit: number = 50
): Promise<SkillMasteryHistory[]> => {
    const result = await pool.query(
        `SELECT * FROM skill_mastery_history 
     WHERE user_id = ? AND skill_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
        [userId, skillId, limit]
    );
    const rows = getRows(result);
    return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        skillId: row.skill_id,
        previousScore: parseFloat(row.previous_score),
        newScore: parseFloat(row.new_score),
        delta: parseFloat(row.delta),
        sourceSessionId: row.source_session_id,
        activityType: row.activity_type,
        createdAt: row.created_at,
    }));
};

/**
 * Get recent mastery changes across all skills for a user
 */
export const getRecentMasteryChanges = async (
    userId: string,
    limit: number = 20
): Promise<Array<SkillMasteryHistory & { skillName: string }>> => {
    const result = await pool.query(
        `SELECT smh.*, s.name as skill_name
     FROM skill_mastery_history smh
     INNER JOIN skills s ON smh.skill_id = s.id
     WHERE smh.user_id = ?
     ORDER BY smh.created_at DESC
     LIMIT ?`,
        [userId, limit]
    );
    const rows = getRows(result);
    return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        skillId: row.skill_id,
        previousScore: parseFloat(row.previous_score),
        newScore: parseFloat(row.new_score),
        delta: parseFloat(row.delta),
        sourceSessionId: row.source_session_id,
        activityType: row.activity_type,
        createdAt: row.created_at,
        skillName: row.skill_name,
    }));
};

// ============================================================================
// Analytics Helpers
// ============================================================================

/**
 * Get skill mastery leaderboard
 */
export const getSkillLeaderboard = async (
    skillId: string,
    limit: number = 10
): Promise<Array<{ userId: string; userName: string; masteryScore: number; rank: number }>> => {
    const result = await pool.query(
        `SELECT usm.user_id, u.name as user_name, usm.mastery_score
     FROM user_skill_mastery usm
     INNER JOIN users u ON usm.user_id = u.id
     WHERE usm.skill_id = ? AND u.role = 'student'
     ORDER BY usm.mastery_score DESC
     LIMIT ?`,
        [skillId, limit]
    );
    const rows = getRows(result);
    return rows.map((row: any, index: number) => ({
        userId: row.user_id,
        userName: row.user_name || 'Anonymous',
        masteryScore: parseFloat(row.mastery_score),
        rank: index + 1,
    }));
};

/**
 * Get weak skills that need attention (low mastery, not practiced recently)
 */
export const getWeakSkillsForUser = async (
    userId: string,
    maxMastery: number = 50,
    limit: number = 5
): Promise<SkillWithMastery[]> => {
    const result = await pool.query(
        `SELECT s.*, COALESCE(usm.mastery_score, 0) as mastery_score,
            COALESCE(usm.total_practice_count, 0) as practice_count,
            usm.last_practiced_at
     FROM skills s
     LEFT JOIN user_skill_mastery usm ON s.id = usm.skill_id AND usm.user_id = ?
     WHERE COALESCE(usm.mastery_score, 0) < ?
     ORDER BY COALESCE(usm.mastery_score, 0) ASC, usm.last_practiced_at ASC
     LIMIT ?`,
        [userId, maxMastery, limit]
    );
    const rows = getRows(result);
    return rows.map((row: any) => ({
        ...mapSkillRowToSkill(row),
        masteryScore: parseFloat(row.mastery_score) || 0,
        practiceCount: row.practice_count || 0,
        lastPracticedAt: row.last_practiced_at || null,
    }));
};
