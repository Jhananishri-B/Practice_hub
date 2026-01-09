import { Request, Response } from 'express';
import * as diagnosticService from '../services/diagnosticService';

/**
 * GET /api/diagnostic/status
 * Check if user needs diagnostic test
 */
export const checkStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const status = await diagnosticService.checkDiagnosticStatus(userId);
        res.json(status);
    } catch (error) {
        console.error('Error checking diagnostic status:', error);
        res.status(500).json({ error: 'Failed to check diagnostic status' });
    }
};

/**
 * POST /api/diagnostic/start
 * Start a new diagnostic test
 */
export const startDiagnostic = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await diagnosticService.startDiagnostic(userId);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error starting diagnostic:', error);
        res.status(500).json({ error: 'Failed to start diagnostic' });
    }
};

/**
 * POST /api/diagnostic/:sessionId/submit
 * Submit an answer during diagnostic
 */
export const submitAnswer = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { sessionId } = req.params;
        const { questionId, answer, timeTaken } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!questionId || !answer) {
            return res.status(400).json({ error: 'questionId and answer are required' });
        }

        const result = await diagnosticService.submitDiagnosticAnswer(
            sessionId, userId, questionId, answer, timeTaken
        );
        res.json(result);
    } catch (error: any) {
        console.error('Error submitting diagnostic answer:', error);
        if (error.message?.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to submit answer' });
    }
};

/**
 * POST /api/diagnostic/:sessionId/complete
 * Complete diagnostic and get results
 */
export const completeDiagnostic = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { sessionId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await diagnosticService.completeDiagnostic(sessionId, userId);
        res.json(result);
    } catch (error: any) {
        console.error('Error completing diagnostic:', error);
        if (error.message?.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to complete diagnostic' });
    }
};
