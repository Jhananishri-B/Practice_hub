import { Response } from 'express';
import {
  getAllUsers,
  getRecentActivity,
  getDashboardStats,
  createCourse,
  createLevel,
  getCoursesWithLevels,
} from '../services/adminService';
import {
  createCodingQuestion,
  createMCQQuestion,
  getLevelQuestions,
  updateCodingQuestion,
  updateMCQQuestion,
  deleteQuestion,
  getQuestionById,
} from '../services/questionService';
import { updateLevelTimeLimit } from '../services/adminService';
import { parseAndCreateQuestionsFromCSV, CSVRow } from '../services/csvUploadService';
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { Request } from 'express';

export const getDashboardStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getAllUsersController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const searchTerm = req.query.search as string;
    const users = await getAllUsers(searchTerm);
    res.json(users);
  } catch (error: any) {
    logger.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getRecentActivityController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const searchTerm = req.query.search as string;
    const activity = await getRecentActivity(searchTerm);
    res.json(activity);
  } catch (error: any) {
    logger.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

export const createCourseController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, total_levels } = req.body;
    const courseId = await createCourse({ title, description, total_levels });
    res.json({ id: courseId, message: 'Course created successfully' });
  } catch (error: any) {
    logger.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

export const createLevelController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { course_id, level_number, title, description } = req.body;
    const levelId = await createLevel({ course_id, level_number, title, description });
    res.json({ id: levelId, message: 'Level created successfully' });
  } catch (error: any) {
    logger.error('Create level error:', error);
    res.status(500).json({ error: 'Failed to create level' });
  }
};

export const getCoursesWithLevelsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await getCoursesWithLevels();
    res.json(courses);
  } catch (error: any) {
    logger.error('Get courses with levels error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const createCodingQuestionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionId = await createCodingQuestion(req.body);
    res.json({ id: questionId, message: 'Question created successfully' });
  } catch (error: any) {
    logger.error('Create coding question error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const createMCQQuestionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionId = await createMCQQuestion(req.body);
    res.json({ id: questionId, message: 'Question created successfully' });
  } catch (error: any) {
    logger.error('Create MCQ question error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const getLevelQuestionsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const questions = await getLevelQuestions(levelId);
    res.json(questions);
  } catch (error: any) {
    logger.error('Get level questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getQuestionByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    logger.info(`Fetching question with ID: ${questionId}`);
    const question = await getQuestionById(questionId);
    if (!question) {
      logger.warn(`Question not found: ${questionId}`);
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    logger.info(`Successfully fetched question: ${questionId}, type: ${question.question_type}`);
    res.json(question);
  } catch (error: any) {
    logger.error('Get question by id error:', error);
    logger.error('Error stack:', error.stack);
    res.status(error.message === 'Question not found' ? 404 : 500).json({
      error: error.message || 'Failed to fetch question',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateCodingQuestionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    await updateCodingQuestion(questionId, req.body);
    res.json({ message: 'Question updated successfully' });
  } catch (error: any) {
    logger.error('Update coding question error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const updateMCQQuestionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    await updateMCQQuestion(questionId, req.body);
    res.json({ message: 'Question updated successfully' });
  } catch (error: any) {
    logger.error('Update MCQ question error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update question',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const deleteQuestionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    await deleteQuestion(questionId);
    res.json({ message: 'Question deleted successfully' });
  } catch (error: any) {
    logger.error('Delete question error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete question',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateLevelTimeLimitController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const { time_limit } = req.body;
    await updateLevelTimeLimit(levelId, time_limit);
    res.json({ message: 'Time limit updated successfully' });
  } catch (error: any) {
    logger.error('Update level time limit error:', error);
    res.status(500).json({ error: 'Failed to update time limit' });
  }
};

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends AuthRequest {
  file?: Express.Multer.File;
}

export const uploadCSVQuestionsController = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { level_id } = req.body;
    if (!level_id) {
      res.status(400).json({ error: 'level_id is required' });
      return;
    }

    // Parse CSV file
    const csvContent = req.file.buffer.toString('utf-8');
    const parseResult = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value: any, context: any) => {
        // Transform header names to lowercase with underscores
        if (context.header) {
          return value.trim().toLowerCase().replace(/\s+/g, '_');
        }
        return value;
      },
    }) as CSVRow[];

    // Process and create questions
    const result = await parseAndCreateQuestionsFromCSV(parseResult, level_id);

    res.json({
      message: `Successfully created ${result.success} questions`,
      count: result.success,
      errors: result.errors,
    });
  } catch (error: any) {
    logger.error('CSV upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload CSV file' });
  }
};

// Export multer middleware for use in routes
export const uploadCSVMiddleware = upload.single('file');

import { generateQuestionsWithAI } from '../services/aiTutorService';

export const generateQuestionsWithAIController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, count, difficulty, type } = req.body;

    if (!topic || !count || !difficulty || !type) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const questions = await generateQuestionsWithAI(topic, count, difficulty, type);
    res.json({ questions });
  } catch (error: any) {
    logger.error('AI generate questions error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};



export const updateLevelDetailsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const { description, learning_materials, code_snippet } = req.body;

    // Import dynamically or move to top if no cycle
    const { updateLevelDetails } = await import('../services/adminService');

    await updateLevelDetails(levelId, {
      description,
      learning_materials,
      code_snippet
    });

    res.json({ message: 'Level details updated successfully' });
  } catch (error: any) {
    logger.error('Update level details error:', error);
    res.status(500).json({ error: 'Failed to update level details' });
  }
};
