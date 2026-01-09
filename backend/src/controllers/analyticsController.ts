import { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';

// ============================================================================
// User Analytics Endpoints
// ============================================================================

/**
 * GET /api/analytics/me/overview
 * Get current user's analytics overview
 */
export const getUserOverview = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const overview = await analyticsService.getUserOverview(userId);
        res.json(overview);
    } catch (error) {
        console.error('Error getting user overview:', error);
        res.status(500).json({ error: 'Failed to get analytics overview' });
    }
};

/**
 * GET /api/analytics/me/skills
 * Get user's skill strengths and weaknesses
 */
export const getUserSkills = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const skills = await analyticsService.getSkillStrengthsWeaknesses(userId);
        res.json(skills);
    } catch (error) {
        console.error('Error getting skill analytics:', error);
        res.status(500).json({ error: 'Failed to get skill analytics' });
    }
};

/**
 * GET /api/analytics/me/trends
 * Get user's mastery trends over time
 */
export const getUserTrends = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const days = parseInt(req.query.days as string) || 30;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const trends = await analyticsService.getUserMasteryTrends(userId, days);
        res.json(trends);
    } catch (error) {
        console.error('Error getting trends:', error);
        res.status(500).json({ error: 'Failed to get mastery trends' });
    }
};

/**
 * GET /api/analytics/me/accuracy
 * Get user's accuracy trends
 */
export const getUserAccuracy = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const period = (req.query.period as 'daily' | 'weekly') || 'daily';
        const days = parseInt(req.query.days as string) || 30;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const accuracy = await analyticsService.getAccuracyTrends(userId, period, days);
        res.json(accuracy);
    } catch (error) {
        console.error('Error getting accuracy:', error);
        res.status(500).json({ error: 'Failed to get accuracy trends' });
    }
};

// ============================================================================
// Faculty Analytics Endpoints
// ============================================================================

/**
 * GET /api/analytics/course/:courseId
 * Get analytics for a course (admin only)
 */
export const getCourseAnalytics = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        const analytics = await analyticsService.getCourseAnalytics(courseId);
        res.json(analytics);
    } catch (error: any) {
        console.error('Error getting course analytics:', error);
        if (error.message?.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to get course analytics' });
    }
};

/**
 * GET /api/analytics/course/:courseId/students
 * Get all students for a course (admin only)
 */
export const getCourseStudents = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        const students = await analyticsService.getCourseStudents(courseId);
        res.json({ students, total: students.length });
    } catch (error) {
        console.error('Error getting course students:', error);
        res.status(500).json({ error: 'Failed to get course students' });
    }
};

/**
 * GET /api/analytics/at-risk
 * Get at-risk students (admin only)
 */
export const getAtRiskStudents = async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        const minWeakSkills = parseInt(req.query.minWeakSkills as string) || 2;
        const maxMastery = parseInt(req.query.maxMastery as string) || 40;

        const result = await analyticsService.getAtRiskStudents(minWeakSkills, maxMastery);
        res.json(result);
    } catch (error) {
        console.error('Error getting at-risk students:', error);
        res.status(500).json({ error: 'Failed to get at-risk students' });
    }
};
