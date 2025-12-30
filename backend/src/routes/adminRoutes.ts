import { Router } from 'express';
import {
  getDashboardStatsController,
  getAllUsersController,
  getRecentActivityController,
  createCourseController,
  createLevelController,
  getCoursesWithLevelsController,
  createCodingQuestionController,
  createMCQQuestionController,
  getLevelQuestionsController,
  getQuestionByIdController,
  updateCodingQuestionController,
  updateMCQQuestionController,
  deleteQuestionController,
  updateLevelTimeLimitController,
  uploadCSVQuestionsController,
  uploadCSVMiddleware,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard/stats', getDashboardStatsController);
router.get('/users', getAllUsersController);
router.get('/activity', getRecentActivityController);
router.post('/courses', createCourseController);
router.post('/levels', createLevelController);
router.get('/courses/with-levels', getCoursesWithLevelsController);
router.post('/questions/coding', createCodingQuestionController);
router.post('/questions/mcq', createMCQQuestionController);
router.get('/levels/:levelId/questions', getLevelQuestionsController);
router.get('/questions/:questionId', getQuestionByIdController);
router.put('/questions/coding/:questionId', updateCodingQuestionController);
router.put('/questions/mcq/:questionId', updateMCQQuestionController);
router.delete('/questions/:questionId', deleteQuestionController);
router.put('/levels/:levelId/time-limit', updateLevelTimeLimitController);
router.post('/questions/upload-csv', uploadCSVMiddleware, uploadCSVQuestionsController);

export default router;

