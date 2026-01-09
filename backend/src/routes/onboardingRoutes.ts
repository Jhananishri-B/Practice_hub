import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as onboardingController from '../controllers/onboardingController';

const router = express.Router();

// ============================================================================
// All onboarding routes require authentication
// ============================================================================

// Get comprehensive onboarding status
router.get('/status', authenticate, onboardingController.getStatus);

// Simple beginner check
router.get('/is-beginner', authenticate, onboardingController.checkBeginner);

// Get recommended foundation lessons
router.get('/foundation-lessons', authenticate, onboardingController.getFoundationLessons);

// Get personalized "start here" learning path
router.get('/start-path', authenticate, onboardingController.getStartPath);

// Get skills user hasn't touched yet
router.get('/untouched-skills', authenticate, onboardingController.getUntouchedSkills);

// Mark onboarding as complete (optional)
router.post('/complete', authenticate, onboardingController.completeOnboarding);

export default router;
