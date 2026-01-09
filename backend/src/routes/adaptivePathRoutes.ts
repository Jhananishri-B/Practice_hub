import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as adaptivePathController from '../controllers/adaptivePathController';

const router = express.Router();

// ============================================================================
// Adaptive Learning Path Routes - All require authentication
// ============================================================================

// Get full learning path for user
router.get('/', authenticate, adaptivePathController.getUserLearningPath);

// Get next recommended steps
router.get('/next', authenticate, adaptivePathController.getNextSteps);

// Get path for specific skill
router.get('/skill/:skillId', authenticate, adaptivePathController.getSkillPath);

// Get path for specific course
router.get('/course/:courseId', authenticate, adaptivePathController.getCoursePath);

export default router;
