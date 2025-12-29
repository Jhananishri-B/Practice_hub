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
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';

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
    const question = await getQuestionById(questionId);
    res.json(question);
  } catch (error: any) {
    logger.error('Get question by id error:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
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
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const deleteQuestionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    await deleteQuestion(questionId);
    res.json({ message: 'Question deleted successfully' });
  } catch (error: any) {
    logger.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
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

