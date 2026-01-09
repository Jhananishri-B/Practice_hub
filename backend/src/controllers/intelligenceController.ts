import { Request, Response } from 'express';
import * as intelligenceService from '../services/learningIntelligenceService';

// ============================================================================
// User Intelligence Endpoints
// ============================================================================

/**
 * GET /api/intelligence/me/recommendations
 * Get personalized recommendations
 */
export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const recommendations = await intelligenceService.getPersonalizedRecommendations(userId);
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
};

/**
 * GET /api/intelligence/me/forecast
 * Get mastery forecasts
 */
export const getForecast = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const forecast = await intelligenceService.getUserForecast(userId);
        res.json(forecast);
    } catch (error) {
        console.error('Error getting forecast:', error);
        res.status(500).json({ error: 'Failed to get forecast' });
    }
};

/**
 * GET /api/intelligence/me/insights
 * Get learning insights
 */
export const getInsights = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const insights = await intelligenceService.getUserInsights(userId);
        res.json(insights);
    } catch (error) {
        console.error('Error getting insights:', error);
        res.status(500).json({ error: 'Failed to get insights' });
    }
};

/**
 * POST /api/intelligence/me/compute/:skillId
 * Compute/refresh metrics for a skill
 */
export const computeSkillMetrics = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const { skillId } = req.params;
        if (!userId) return res.status(401).json({ error: 'User not authenticated' });

        const metrics = await intelligenceService.computeUserSkillMetrics(userId, skillId);
        res.json(metrics);
    } catch (error) {
        console.error('Error computing metrics:', error);
        res.status(500).json({ error: 'Failed to compute metrics' });
    }
};

// ============================================================================
// Faculty Intelligence Endpoints
// ============================================================================

/**
 * GET /api/intelligence/alerts
 * Get faculty alerts (admin only)
 */
export const getAlerts = async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        const alerts = await intelligenceService.getFacultyAlerts();
        res.json(alerts);
    } catch (error) {
        console.error('Error getting alerts:', error);
        res.status(500).json({ error: 'Failed to get alerts' });
    }
};

/**
 * GET /api/intelligence/interventions
 * Get intervention recommendations (admin only)
 */
export const getInterventions = async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        const interventions = await intelligenceService.getInterventionRecommendations();
        res.json({ interventions, total: interventions.length });
    } catch (error) {
        console.error('Error getting interventions:', error);
        res.status(500).json({ error: 'Failed to get interventions' });
    }
};
