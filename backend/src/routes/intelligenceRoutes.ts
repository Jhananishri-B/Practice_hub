import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as intelligenceController from '../controllers/intelligenceController';

const router = express.Router();

// ============================================================================
// User Intelligence Routes
// ============================================================================

// Get personalized recommendations
router.get('/me/recommendations', authenticate, intelligenceController.getRecommendations);

// Get mastery forecasts
router.get('/me/forecast', authenticate, intelligenceController.getForecast);

// Get learning insights
router.get('/me/insights', authenticate, intelligenceController.getInsights);

// Compute/refresh metrics for a skill
router.post('/me/compute/:skillId', authenticate, intelligenceController.computeSkillMetrics);

// ============================================================================
// Faculty Intelligence Routes (Admin Only)
// ============================================================================

// Get faculty alerts
router.get('/alerts', authenticate, intelligenceController.getAlerts);

// Get intervention recommendations
router.get('/interventions', authenticate, intelligenceController.getInterventions);

export default router;
