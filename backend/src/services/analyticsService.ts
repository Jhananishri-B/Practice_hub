import pool from '../config/database';
import { getRows, getFirstRow } from '../utils/mysqlHelper';
import {
    SkillAnalytics,
    UserAnalyticsOverview,
    SkillStrengthsWeaknesses,
    SkillMasteryTrend,
    UserMasteryTrends,
    AccuracyTrend,
    CourseAnalytics,
    StudentSummary,
    AtRiskStudent,
    AtRiskResponse,
    TrendDataPoint,
} from '../types/analyticsTypes';

// ============================================================================
// User Analytics
// ============================================================================

/**
 * Get user analytics overview
 */
export const getUserOverview = async (userId: string): Promise<UserAnalyticsOverview> => {
    // Get user info
    const userResult = await pool.query(
        `SELECT id, name, username, email FROM users WHERE id = ?`,
        [userId]
    );
    const user = getFirstRow(userResult);
    const userName = user?.name || user?.username || 'Unknown';

    // Get skill mastery stats
    const masteryResult = await pool.query(
        `SELECT 
       COUNT(*) as total_skills,
       AVG(mastery_score) as avg_mastery,
       SUM(CASE WHEN mastery_score >= 80 THEN 1 ELSE 0 END) as strong,
       SUM(CASE WHEN mastery_score >= 40 AND mastery_score < 80 THEN 1 ELSE 0 END) as moderate,
       SUM(CASE WHEN mastery_score < 40 THEN 1 ELSE 0 END) as weak,
       MAX(last_practiced_at) as last_activity
     FROM user_skill_mastery WHERE user_id = ?`,
        [userId]
    );
    const masteryStats = getFirstRow(masteryResult) || {};

    // Get attempt stats
    const attemptResult = await pool.query(
        `SELECT 
       COUNT(*) as total_attempts,
       SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
     FROM skill_practice_attempts 
     WHERE user_id = ? AND completed_at IS NOT NULL`,
        [userId]
    );
    const attemptStats = getFirstRow(attemptResult) || {};

    const totalAttempts = parseInt(attemptStats.total_attempts) || 0;
    const correctAttempts = parseInt(attemptStats.correct) || 0;

    return {
        userId,
        userName,
        totalSkills: parseInt(masteryStats.total_skills) || 0,
        averageMastery: Math.round((masteryStats.avg_mastery || 0) * 100) / 100,
        strongSkillsCount: parseInt(masteryStats.strong) || 0,
        moderateSkillsCount: parseInt(masteryStats.moderate) || 0,
        weakSkillsCount: parseInt(masteryStats.weak) || 0,
        totalAttempts,
        overallAccuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        currentStreak: 0, // Would need separate streak tracking
        lastActivity: masteryStats.last_activity || null,
    };
};

/**
 * Get skill strengths and weaknesses for a user
 */
export const getSkillStrengthsWeaknesses = async (userId: string): Promise<SkillStrengthsWeaknesses> => {
    const result = await pool.query(
        `SELECT s.id, s.name, s.category, usm.mastery_score,
            usm.total_practice_count, usm.successful_practice_count,
            usm.last_practiced_at
     FROM user_skill_mastery usm
     JOIN skills s ON usm.skill_id = s.id
     WHERE usm.user_id = ?
     ORDER BY usm.mastery_score DESC`,
        [userId]
    );
    const rows = getRows(result);

    const skills: SkillAnalytics[] = rows.map((row: any) => {
        const totalAttempts = row.total_practice_count || 0;
        const correctAttempts = row.successful_practice_count || 0;
        return {
            skillId: row.id,
            skillName: row.name,
            category: row.category,
            masteryScore: row.mastery_score,
            totalAttempts,
            correctAttempts,
            accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
            lastPracticed: row.last_practiced_at,
            trend: 'stable' as const,
        };
    });

    const strengths = skills.filter(s => s.masteryScore >= 70).slice(0, 5);
    const weaknesses = skills.filter(s => s.masteryScore < 50).slice(-5).reverse();
    const avgMastery = skills.length > 0
        ? skills.reduce((sum, s) => sum + s.masteryScore, 0) / skills.length
        : 0;

    return {
        strengths,
        weaknesses,
        averageMastery: Math.round(avgMastery * 100) / 100,
        totalSkills: skills.length,
    };
};

/**
 * Get mastery trends over time for a user
 */
export const getUserMasteryTrends = async (
    userId: string,
    days: number = 30
): Promise<UserMasteryTrends> => {
    // Get overall trend
    const overallResult = await pool.query(
        `SELECT DATE(created_at) as date, AVG(new_score) as avg_mastery
     FROM skill_mastery_history
     WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(created_at)
     ORDER BY date`,
        [userId, days]
    );
    const overallTrend: TrendDataPoint[] = getRows(overallResult).map((r: any) => ({
        date: r.date.toISOString().split('T')[0],
        value: Math.round(r.avg_mastery * 100) / 100,
    }));

    // Get per-skill trends
    const skillsResult = await pool.query(
        `SELECT DISTINCT skill_id FROM skill_mastery_history WHERE user_id = ?`,
        [userId]
    );
    const skillIds = getRows(skillsResult).map((r: any) => r.skill_id);

    const skillTrends: SkillMasteryTrend[] = [];
    for (const skillId of skillIds.slice(0, 10)) { // Limit to 10 skills
        const trendResult = await pool.query(
            `SELECT smh.skill_id, s.name, DATE(smh.created_at) as date, smh.new_score
       FROM skill_mastery_history smh
       JOIN skills s ON smh.skill_id = s.id
       WHERE smh.user_id = ? AND smh.skill_id = ? 
         AND smh.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY smh.created_at`,
            [userId, skillId, days]
        );
        const trendRows = getRows(trendResult);
        if (trendRows.length === 0) continue;

        const dataPoints = trendRows.map((r: any) => ({
            date: r.date.toISOString().split('T')[0],
            value: r.new_score,
        }));

        // Calculate changes
        const currentMastery = dataPoints[dataPoints.length - 1]?.value || 0;
        const weekAgo = dataPoints.find((d: any) => {
            const diff = (Date.now() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24);
            return diff >= 7;
        });
        const monthAgo = dataPoints[0];

        skillTrends.push({
            skillId,
            skillName: trendRows[0].name,
            currentMastery,
            dataPoints,
            changeLastWeek: weekAgo ? currentMastery - weekAgo.value : 0,
            changeLastMonth: monthAgo ? currentMastery - monthAgo.value : 0,
        });
    }

    return { userId, overallTrend, skillTrends };
};

/**
 * Get accuracy trends
 */
export const getAccuracyTrends = async (
    userId: string,
    period: 'daily' | 'weekly' = 'daily',
    days: number = 30
): Promise<AccuracyTrend> => {
    const groupBy = period === 'weekly' ? 'YEARWEEK(created_at)' : 'DATE(created_at)';

    const result = await pool.query(
        `SELECT ${groupBy} as period_key, DATE(MIN(created_at)) as date,
            COUNT(*) as attempts,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
     FROM skill_practice_attempts
     WHERE user_id = ? AND completed_at IS NOT NULL
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY ${groupBy}
     ORDER BY date`,
        [userId, days]
    );
    const rows = getRows(result);

    const dataPoints = rows.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        attempts: parseInt(row.attempts),
        correct: parseInt(row.correct),
        accuracy: Math.round((parseInt(row.correct) / parseInt(row.attempts)) * 100),
    }));

    const totalAttempts = dataPoints.reduce((sum: number, d: { attempts: number }) => sum + d.attempts, 0);
    const totalCorrect = dataPoints.reduce((sum: number, d: { correct: number }) => sum + d.correct, 0);

    return {
        period,
        dataPoints,
        overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    };
};

// ============================================================================
// Faculty Analytics
// ============================================================================

/**
 * Get course analytics
 */
export const getCourseAnalytics = async (courseId: string): Promise<CourseAnalytics> => {
    // Get course info
    const courseResult = await pool.query(
        `SELECT id, title FROM courses WHERE id = ?`,
        [courseId]
    );
    const course = getFirstRow(courseResult);
    if (!course) throw new Error('Course not found');

    // Get student count and average mastery
    const statsResult = await pool.query(
        `SELECT 
       COUNT(DISTINCT usm.user_id) as total_students,
       AVG(usm.mastery_score) as avg_mastery
     FROM user_skill_mastery usm
     JOIN level_skills ls ON usm.skill_id = ls.skill_id
     JOIN levels l ON ls.level_id = l.id
     WHERE l.course_id = ?`,
        [courseId]
    );
    const stats = getFirstRow(statsResult) || {};

    // Get skill breakdown
    const skillResult = await pool.query(
        `SELECT s.id, s.name,
            AVG(usm.mastery_score) as avg_mastery,
            SUM(CASE WHEN usm.mastery_score < 40 THEN 1 ELSE 0 END) as at_risk
     FROM skills s
     JOIN level_skills ls ON s.id = ls.skill_id
     JOIN levels l ON ls.level_id = l.id
     LEFT JOIN user_skill_mastery usm ON s.id = usm.skill_id
     WHERE l.course_id = ?
     GROUP BY s.id, s.name`,
        [courseId]
    );
    const skillBreakdown = getRows(skillResult).map((row: any) => ({
        skillId: row.id,
        skillName: row.name,
        averageMastery: Math.round((row.avg_mastery || 0) * 100) / 100,
        studentsAtRisk: parseInt(row.at_risk) || 0,
    }));

    return {
        courseId: course.id,
        courseTitle: course.title,
        totalStudents: parseInt(stats.total_students) || 0,
        averageMastery: Math.round((stats.avg_mastery || 0) * 100) / 100,
        completionRate: 0, // Would need progress tracking
        skillBreakdown,
    };
};

/**
 * Get all students for a course
 */
export const getCourseStudents = async (courseId: string): Promise<StudentSummary[]> => {
    const result = await pool.query(
        `SELECT DISTINCT u.id, u.name, u.username, u.email,
            AVG(usm.mastery_score) as avg_mastery,
            SUM(usm.total_practice_count) as total_attempts,
            SUM(usm.successful_practice_count) as correct_attempts,
            SUM(CASE WHEN usm.mastery_score < 40 THEN 1 ELSE 0 END) as weak_skills,
            MAX(usm.last_practiced_at) as last_activity
     FROM users u
     JOIN user_skill_mastery usm ON u.id = usm.user_id
     JOIN level_skills ls ON usm.skill_id = ls.skill_id
     JOIN levels l ON ls.level_id = l.id
     WHERE l.course_id = ? AND u.role = 'student'
     GROUP BY u.id, u.name, u.username, u.email
     ORDER BY avg_mastery ASC`,
        [courseId]
    );

    return getRows(result).map((row: any) => {
        const totalAttempts = parseInt(row.total_attempts) || 0;
        const correctAttempts = parseInt(row.correct_attempts) || 0;
        const weakSkills = parseInt(row.weak_skills) || 0;
        return {
            userId: row.id,
            userName: row.name || row.username,
            email: row.email,
            averageMastery: Math.round((row.avg_mastery || 0) * 100) / 100,
            totalAttempts,
            accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
            weakSkillsCount: weakSkills,
            lastActivity: row.last_activity,
            isAtRisk: weakSkills >= 2,
        };
    });
};

/**
 * Get at-risk students
 */
export const getAtRiskStudents = async (
    minWeakSkills: number = 2,
    maxMastery: number = 40
): Promise<AtRiskResponse> => {
    const result = await pool.query(
        `SELECT u.id, u.name, u.username, u.email,
            COUNT(*) as weak_skills_count,
            AVG(usm.mastery_score) as avg_mastery,
            MAX(usm.last_practiced_at) as last_activity
     FROM users u
     JOIN user_skill_mastery usm ON u.id = usm.user_id
     WHERE usm.mastery_score < ? AND u.role = 'student'
     GROUP BY u.id, u.name, u.username, u.email
     HAVING weak_skills_count >= ?
     ORDER BY weak_skills_count DESC, avg_mastery ASC`,
        [maxMastery, minWeakSkills]
    );

    const students: AtRiskStudent[] = [];
    for (const row of getRows(result)) {
        // Get weak skills for this student
        const weakSkillsResult = await pool.query(
            `SELECT s.id, s.name, usm.mastery_score
       FROM user_skill_mastery usm
       JOIN skills s ON usm.skill_id = s.id
       WHERE usm.user_id = ? AND usm.mastery_score < ?
       ORDER BY usm.mastery_score ASC`,
            [row.id, maxMastery]
        );

        const daysInactive = row.last_activity
            ? Math.floor((Date.now() - new Date(row.last_activity).getTime()) / (1000 * 60 * 60 * 24))
            : 999;

        students.push({
            userId: row.id,
            userName: row.name || row.username,
            email: row.email,
            weakSkillsCount: parseInt(row.weak_skills_count),
            weakSkills: getRows(weakSkillsResult).map((s: any) => ({
                skillId: s.id,
                skillName: s.name,
                mastery: s.mastery_score,
            })),
            averageMastery: Math.round((row.avg_mastery || 0) * 100) / 100,
            recentTrend: 'stable',
            daysInactive,
        });
    }

    return {
        totalAtRisk: students.length,
        threshold: { minWeakSkills, maxMastery },
        students,
    };
};
