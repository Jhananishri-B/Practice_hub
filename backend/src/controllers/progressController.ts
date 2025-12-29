import { Request, Response } from 'express';
import { getUserProgress, getLeaderboard } from '../services/progressService';
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';

export const getUserProgressController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const progress = await getUserProgress(userId);
    res.json(progress);
  } catch (error: any) {
    logger.error('Get user progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

export const getLeaderboardController = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error: any) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

