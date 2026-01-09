import { Request, Response } from 'express';
import * as onboardingService from '../services/onboardingService';

/**
 * GET /api/onboarding/status
 * Returns user's onboarding status
 */
export const getStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const status = await onboardingService.getOnboardingStatus(userId);
        res.json(status);
    } catch (error) {
        console.error('Error getting onboarding status:', error);
        res.status(500).json({ error: 'Failed to get onboarding status' });
    }
};

/**
 * GET /api/onboarding/is-beginner
 * Simple check if user is a beginner
 */
export const checkBeginner = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const isBeginner = await onboardingService.isBeginner(userId);
        res.json({ isBeginner });
    } catch (error) {
        console.error('Error checking beginner status:', error);
        res.status(500).json({ error: 'Failed to check beginner status' });
    }
};

/**
 * GET /api/onboarding/foundation-lessons
 * Returns recommended foundation lessons for beginners
 */
export const getFoundationLessons = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const lessons = await onboardingService.getFoundationLessons(userId);
        res.json({ lessons });
    } catch (error) {
        console.error('Error getting foundation lessons:', error);
        res.status(500).json({ error: 'Failed to get foundation lessons' });
    }
};

/**
 * GET /api/onboarding/start-path
 * Returns personalized "start here" learning path
 */
export const getStartPath = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const path = await onboardingService.getStartHerePath(userId);
        res.json(path);
    } catch (error) {
        console.error('Error getting start path:', error);
        res.status(500).json({ error: 'Failed to get start path' });
    }
};

/**
 * GET /api/onboarding/untouched-skills
 * Returns skills the user hasn't started yet
 */
export const getUntouchedSkills = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const skills = await onboardingService.getUntouchedSkills(userId);
        res.json({ skills });
    } catch (error) {
        console.error('Error getting untouched skills:', error);
        res.status(500).json({ error: 'Failed to get untouched skills' });
    }
};

/**
 * POST /api/onboarding/complete
 * Marks onboarding as complete (optional tracking)
 */
export const completeOnboarding = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await onboardingService.completeOnboarding(userId);
        res.json({ success: true, message: 'Onboarding marked as complete' });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        res.status(500).json({ error: 'Failed to complete onboarding' });
    }
};
