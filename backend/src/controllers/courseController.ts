import { Response } from 'express';
import { getAllCourses, getCourseLevels } from '../services/courseService';
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';

export const getAllCoursesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    logger.info(`[getAllCoursesController] Fetching courses for user ${req.user?.userId}`);
    const courses = await getAllCourses(req.user?.userId);
    logger.info(`[getAllCoursesController] Returning ${courses.length} courses to user ${req.user?.userId}`);
    if (courses.length === 0) {
      logger.warn(`[getAllCoursesController] No courses found in database`);
    }
    res.json(courses);
  } catch (error: any) {
    logger.error('[getAllCoursesController] Get courses error:', error);
    logger.error('[getAllCoursesController] Error stack:', error.stack);
    // On database timeout, return empty array so frontend doesn't break
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
      logger.warn('[getAllCoursesController] Database timeout/connection error, returning empty courses array');
      res.json([]);
    } else {
      logger.error('[getAllCoursesController] Unexpected error, returning 500:', error.message);
      res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }
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

    logger.info(`Fetching levels for course ${courseId} for user ${userId}`);
    const levels = await getCourseLevels(courseId, userId);
    logger.info(`Returning ${levels.length} levels for course ${courseId}`);
    res.json(levels);
  } catch (error: any) {
    logger.error('Get course levels error:', error);
    logger.error('Error stack:', error.stack);
    // On database timeout, return empty array so frontend doesn't break
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
      logger.warn('Database timeout/connection error, returning empty levels array');
      res.json([]);
    } else {
      res.status(500).json({ error: 'Failed to fetch course levels', details: error.message });
    }
  }
};

export const getLevelDetailsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const { getLevelDetails } = await import('../services/courseService');
    const level = await getLevelDetails(levelId);

    if (!level) {
      res.status(404).json({ error: 'Level not found' });
      return;
    }

    // Parse learning_materials if stored as JSON string
    if (typeof level.learning_materials === 'string') {
      try {
        level.learning_materials = JSON.parse(level.learning_materials);
      } catch (e) {
        // keep as string or set default
      }
    }

    // Transform to match frontend lessonPlan structure
    const lessonPlan = level.learning_materials || {};
    // Ensure structure
    const response = {
      id: level.id,
      title: level.title,
      level_number: level.level_number,
      introduction: lessonPlan.introduction || level.description || '',
      concepts: lessonPlan.concepts || [],
      resources: lessonPlan.resources || [],
      key_terms: lessonPlan.key_terms || [],
      example_code: level.code_snippet || lessonPlan.example_code || ''
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Get level details error:', error);
    res.status(500).json({ error: 'Failed to fetch level details' });
  }
};

