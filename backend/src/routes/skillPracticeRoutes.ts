import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as skillPracticeController from '../controllers/skillPracticeController';

const router = express.Router();

// ============================================================================
// Practice Routes - All require authentication
// ============================================================================

// Get practice questions for a skill
router.get('/skill/:skillId/questions', authenticate, skillPracticeController.getQuestionsForSkill);

// Start a practice attempt
router.post('/skill/:skillId/start', authenticate, skillPracticeController.startPractice);

// Submit MCQ answer
router.post('/attempt/:attemptId/submit-mcq', authenticate, skillPracticeController.submitMCQ);

// Submit coding solution
router.post('/attempt/:attemptId/submit-code', authenticate, skillPracticeController.submitCode);

// Get practice history
router.get('/history', authenticate, skillPracticeController.getHistory);

// Get skill practice stats
router.get('/skill/:skillId/stats', authenticate, skillPracticeController.getSkillStats);

// ============================================================================
// Failure-Aware Routes (Evolution 4)
// ============================================================================

// Get failure analysis for a skill
router.get('/skill/:skillId/analysis', authenticate, skillPracticeController.getFailureAnalysis);

// Get hint based on failure history
router.get('/skill/:skillId/hint', authenticate, skillPracticeController.getHint);

// Get common mistakes for a skill
router.get('/skill/:skillId/mistakes', authenticate, skillPracticeController.getCommonMistakes);

// Check if user can progress to next level
router.get('/level/:levelId/can-progress', authenticate, skillPracticeController.checkProgression);

export default router;
