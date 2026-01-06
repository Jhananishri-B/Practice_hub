import { Request, Response } from 'express';
import { getAllQuestions } from '../services/questionService';
import logger from '../config/logger';

/**
 * Get all questions
 * GET /api/questions
 */
export const getAllQuestionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await getAllQuestions();
    res.json({
      success: true,
      data: questions,
    });
  } catch (error: any) {
    logger.error('Get all questions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch questions',
    });
  }
};




