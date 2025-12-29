import { Response } from 'express';
import { getAllCourses, getCourseLevels } from '../services/courseService';
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';

export const getAllCoursesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await getAllCourses(req.user?.userId);
    res.json(courses);
  } catch (error: any) {
    logger.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getCourseLevelsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const levels = await getCourseLevels(courseId, userId);
    res.json(levels);
  } catch (error: any) {
    logger.error('Get course levels error:', error);
    res.status(500).json({ error: 'Failed to fetch course levels' });
  }
};

