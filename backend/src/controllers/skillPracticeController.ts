import { Request, Response } from 'express';
import * as skillPracticeService from '../services/skillPracticeService';

/**
 * GET /api/practice/skill/:skillId/questions
 * Get practice questions for a skill
 */
export const getQuestionsForSkill = async (req: Request, res: Response) => {
    try {
        const { skillId } = req.params;
        const type = req.query.type as 'mcq' | 'coding' | undefined;
        const limit = parseInt(req.query.limit as string) || 10;

        const questions = await skillPracticeService.getQuestionsForSkill(skillId, type, limit);
        res.json({ questions });
    } catch (error) {
        console.error('Error getting questions for skill:', error);
        res.status(500).json({ error: 'Failed to get questions' });
    }
};

/**
 * POST /api/practice/skill/:skillId/start
 * Start a practice attempt
 */
export const startPractice = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { skillId } = req.params;
        const { questionId, attemptType } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!questionId || !attemptType) {
            return res.status(400).json({ error: 'questionId and attemptType are required' });
        }

        const result = await skillPracticeService.startPracticeAttempt(
            userId, skillId, questionId, attemptType
        );
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error starting practice:', error);
        res.status(500).json({ error: error.message || 'Failed to start practice' });
    }
};

/**
 * POST /api/practice/attempt/:attemptId/submit-mcq
 * Submit an MCQ answer
 */
export const submitMCQ = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { attemptId } = req.params;
        const { selectedOptionId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!selectedOptionId) {
            return res.status(400).json({ error: 'selectedOptionId is required' });
        }

        const result = await skillPracticeService.submitMCQAnswer(attemptId, userId, selectedOptionId);
        res.json(result);
    } catch (error: any) {
        console.error('Error submitting MCQ:', error);
        if (error.message === 'Attempt not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Attempt already completed') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to submit answer' });
    }
};

/**
 * POST /api/practice/attempt/:attemptId/submit-code
 * Submit coding solution
 */
export const submitCode = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { attemptId } = req.params;
        const { code, language } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!code || !language) {
            return res.status(400).json({ error: 'code and language are required' });
        }

        const result = await skillPracticeService.submitCodingAnswer(attemptId, userId, code, language);
        res.json(result);
    } catch (error: any) {
        console.error('Error submitting code:', error);
        if (error.message === 'Attempt not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Attempt already completed') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to submit code' });
    }
};

/**
 * GET /api/practice/history
 * Get user's practice history
 */
export const getHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const skillId = req.query.skillId as string | undefined;
        const limit = parseInt(req.query.limit as string) || 50;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const history = await skillPracticeService.getPracticeHistory(userId, skillId, limit);
        res.json({ history });
    } catch (error) {
        console.error('Error getting practice history:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
};

/**
 * GET /api/practice/skill/:skillId/stats
 * Get practice statistics for a skill
 */
export const getSkillStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { skillId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const stats = await skillPracticeService.getSkillPracticeStats(userId, skillId);
        res.json(stats);
    } catch (error) {
        console.error('Error getting skill stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
};

// ============================================================================
// Failure-Aware Endpoints (Evolution 4)
// ============================================================================

import * as failureAwareService from '../services/failureAwareService';

/**
 * GET /api/practice/skill/:skillId/analysis
 * Get failure analysis for a skill
 */
export const getFailureAnalysis = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { skillId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const analysis = await failureAwareService.getFailureAnalysis(userId, skillId);
        res.json(analysis);
    } catch (error) {
        console.error('Error getting failure analysis:', error);
        res.status(500).json({ error: 'Failed to get failure analysis' });
    }
};

/**
 * GET /api/practice/skill/:skillId/hint
 * Get hint for current attempt based on failure history
 */
export const getHint = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { skillId } = req.params;
        const questionId = req.query.questionId as string;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!questionId) {
            return res.status(400).json({ error: 'questionId query parameter is required' });
        }

        const hint = await failureAwareService.getHintForAttempt(userId, skillId, questionId);
        res.json(hint);
    } catch (error) {
        console.error('Error getting hint:', error);
        res.status(500).json({ error: 'Failed to get hint' });
    }
};

/**
 * GET /api/practice/skill/:skillId/mistakes
 * Get common mistakes for a skill
 */
export const getCommonMistakes = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { skillId } = req.params;
        const limit = parseInt(req.query.limit as string) || 5;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const mistakes = await failureAwareService.getCommonMistakes(userId, skillId, limit);
        res.json({ mistakes });
    } catch (error) {
        console.error('Error getting common mistakes:', error);
        res.status(500).json({ error: 'Failed to get mistakes' });
    }
};

/**
 * GET /api/practice/level/:levelId/can-progress
 * Check if user can progress to next level
 */
export const checkProgression = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { levelId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await failureAwareService.canProgressToNextLevel(userId, levelId);
        res.json(result);
    } catch (error) {
        console.error('Error checking progression:', error);
        res.status(500).json({ error: 'Failed to check progression' });
    }
};
