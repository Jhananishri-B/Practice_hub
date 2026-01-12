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

    // Transform to match frontend expectations
    // The service already parses coreTopics and materials, but we also need to support
    // the lessonPlan structure for LevelOverview component
    const lessonPlan = level.learning_materials || {};
    let parsedLessonPlan: any = {};
    
    if (typeof level.learning_materials === 'string') {
      try {
        parsedLessonPlan = JSON.parse(level.learning_materials);
      } catch (e) {
        // keep as empty object
      }
    } else if (level.learning_materials && typeof level.learning_materials === 'object') {
      parsedLessonPlan = level.learning_materials;
    }

    // Transform coreTopics from topic_description into concepts format for frontend
    // coreTopics format: [{ title: "..." }] 
    // concepts format: [{ title: "...", explanation: "..." }]
    let conceptsFromCoreTopics = [];
    if (level.coreTopics && Array.isArray(level.coreTopics) && level.coreTopics.length > 0) {
      conceptsFromCoreTopics = level.coreTopics.map((topic: any) => {
        // Handle different formats
        if (typeof topic === 'string') {
          return { title: topic, explanation: '' };
        } else if (topic && typeof topic === 'object') {
          return {
            title: topic.title || topic.name || '',
            explanation: topic.explanation || topic.description || ''
          };
        }
        return { title: '', explanation: '' };
      }).filter((c: any) => c.title); // Filter out empty titles
    }

    // Return both formats to support different frontend components
    // Use coreTopics (from topic_description) as primary source for concepts
    // Fallback to parsedLessonPlan.concepts if coreTopics is empty
    const response = {
      id: level.id,
      title: level.title,
      levelNumber: level.level_number,
      level_number: level.level_number,
      description: level.description,
      coreTopics: level.coreTopics || [],
      materials: level.materials || [],
      // Also include lessonPlan structure for LevelOverview component
      introduction: parsedLessonPlan.introduction || level.description || '',
      // Use coreTopics (from topic_description) as primary source, fallback to learning_materials.concepts
      concepts: conceptsFromCoreTopics.length > 0 ? conceptsFromCoreTopics : (parsedLessonPlan.concepts || []),
      resources: parsedLessonPlan.resources || level.materials || [],
      key_terms: parsedLessonPlan.key_terms || [],
      example_code: parsedLessonPlan.example_code || ''
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Get level details error:', error);
    res.status(500).json({ error: 'Failed to fetch level details' });
  }
};

