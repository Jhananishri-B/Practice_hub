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

