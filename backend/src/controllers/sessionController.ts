import { Response } from 'express';
import { startSession, submitSolution, completeSession } from '../services/sessionService';
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';

export const startSessionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, levelId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!courseId || !levelId) {
      res.status(400).json({ error: 'Course ID and Level ID are required' });
      return;
    }

    const session = await startSession(userId, courseId, levelId);
    res.json(session);
  } catch (error: any) {
    logger.error('Start session error:', error);
    res.status(500).json({ error: error.message || 'Failed to start session' });
  }
};

export const submitSolutionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { questionId, code, language, selected_option_id } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await submitSolution(sessionId, questionId, userId, {
      code,
      language,
      selected_option_id,
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Submit solution error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit solution' });
  }
};

export const completeSessionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await completeSession(sessionId, userId);
    res.json({ message: 'Session completed successfully' });
  } catch (error: any) {
    logger.error('Complete session error:', error);
    res.status(500).json({ error: error.message || 'Failed to complete session' });
  }
};

