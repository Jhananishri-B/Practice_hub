import { Request, Response } from 'express';
import * as adaptivePathService from '../services/adaptivePathService';

/**
 * GET /api/learning-path
 * Get user's full adaptive learning path
 */
export const getUserLearningPath = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const path = await adaptivePathService.getUserLearningPath(userId);
        res.json(path);
    } catch (error) {
        console.error('Error getting learning path:', error);
        res.status(500).json({ error: 'Failed to get learning path' });
    }
};

/**
 * GET /api/learning-path/next
 * Get next recommended lessons
 */
export const getNextSteps = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const nextSteps = await adaptivePathService.getNextSteps(userId);
        res.json(nextSteps);
    } catch (error) {
        console.error('Error getting next steps:', error);
        res.status(500).json({ error: 'Failed to get next steps' });
    }
};

/**
 * GET /api/learning-path/skill/:skillId
 * Get adaptive path for a specific skill
 */
export const getSkillPath = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { skillId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const path = await adaptivePathService.getSkillPath(userId, skillId);
        res.json(path);
    } catch (error: any) {
        console.error('Error getting skill path:', error);
        if (error.message?.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to get skill path' });
    }
};

/**
 * GET /api/learning-path/course/:courseId
 * Get adaptive path for a course
 */
export const getCoursePath = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { courseId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const path = await adaptivePathService.getCourseLearningPath(userId, courseId);
        res.json(path);
    } catch (error: any) {
        console.error('Error getting course path:', error);
        if (error.message?.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to get course path' });
    }
};
