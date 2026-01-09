import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as analyticsController from '../controllers/analyticsController';

const router = express.Router();

// ============================================================================
// User Analytics Routes
// ============================================================================

// Get user's analytics overview
router.get('/me/overview', authenticate, analyticsController.getUserOverview);

// Get user's skill strengths/weaknesses
router.get('/me/skills', authenticate, analyticsController.getUserSkills);

// Get user's mastery trends
router.get('/me/trends', authenticate, analyticsController.getUserTrends);

// Get user's accuracy trends
router.get('/me/accuracy', authenticate, analyticsController.getUserAccuracy);

// ============================================================================
// Faculty Analytics Routes (Admin Only)
// ============================================================================

// Get course analytics
router.get('/course/:courseId', authenticate, analyticsController.getCourseAnalytics);

// Get all students for a course
router.get('/course/:courseId/students', authenticate, analyticsController.getCourseStudents);

// Get at-risk students
router.get('/at-risk', authenticate, analyticsController.getAtRiskStudents);

export default router;
