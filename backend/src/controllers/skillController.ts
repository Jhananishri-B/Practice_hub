import { Request, Response } from 'express';
import * as skillService from '../services/skillService';
import * as skillMasteryService from '../services/skillMasteryService';

// ============================================================================
// Skill CRUD
// ============================================================================

export const createSkill = async (req: Request, res: Response) => {
    try {
        const { name, description, category, difficultyTier } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Skill name is required' });
        }

        const skill = await skillService.createSkill({
            name,
            description,
            category,
            difficultyTier,
        });

        res.status(201).json(skill);
    } catch (error: any) {
        console.error('Error creating skill:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A skill with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create skill' });
    }
};

export const getAllSkills = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let skills;
        if (category && typeof category === 'string') {
            skills = await skillService.getSkillsByCategory(category);
        } else {
            skills = await skillService.getAllSkills();
        }

        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
};

export const getSkillById = async (req: Request, res: Response) => {
    try {
        const { skillId } = req.params;
        const skill = await skillService.getSkillById(skillId);

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.json(skill);
    } catch (error) {
        console.error('Error fetching skill:', error);
        res.status(500).json({ error: 'Failed to fetch skill' });
    }
};

export const updateSkill = async (req: Request, res: Response) => {
    try {
        const { skillId } = req.params;
        const updates = req.body;

        const skill = await skillService.updateSkill(skillId, updates);

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.json(skill);
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ error: 'Failed to update skill' });
    }
};

export const deleteSkill = async (req: Request, res: Response) => {
    try {
        const { skillId } = req.params;
        const deleted = await skillService.deleteSkill(skillId);

        if (!deleted) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
};

// ============================================================================
// Level-Skill Mapping
// ============================================================================

export const mapSkillToLevel = async (req: Request, res: Response) => {
    try {
        const { levelId, skillId, contributionType, weight } = req.body;

        if (!levelId || !skillId) {
            return res.status(400).json({ error: 'levelId and skillId are required' });
        }

        await skillService.mapSkillToLevel({ levelId, skillId, contributionType, weight });
        res.status(201).json({ message: 'Skill mapped to level successfully' });
    } catch (error: any) {
        console.error('Error mapping skill to level:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ error: 'Level or skill not found' });
        }
        res.status(500).json({ error: 'Failed to map skill to level' });
    }
};

export const unmapSkillFromLevel = async (req: Request, res: Response) => {
    try {
        const { levelId, skillId } = req.params;
        const deleted = await skillService.unmapSkillFromLevel(levelId, skillId);

        if (!deleted) {
            return res.status(404).json({ error: 'Mapping not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error unmapping skill from level:', error);
        res.status(500).json({ error: 'Failed to unmap skill from level' });
    }
};

export const getSkillsForLevel = async (req: Request, res: Response) => {
    try {
        const { levelId } = req.params;
        const skills = await skillService.getSkillsForLevel(levelId);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills for level:', error);
        res.status(500).json({ error: 'Failed to fetch skills for level' });
    }
};

export const getSkillsForCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const skills = await skillService.getSkillsForCourse(courseId);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills for course:', error);
        res.status(500).json({ error: 'Failed to fetch skills for course' });
    }
};

// ============================================================================
// Skill Prerequisites
// ============================================================================

export const addPrerequisite = async (req: Request, res: Response) => {
    try {
        const { skillId, prerequisiteSkillId, relationshipType } = req.body;

        if (!skillId || !prerequisiteSkillId) {
            return res.status(400).json({ error: 'skillId and prerequisiteSkillId are required' });
        }

        await skillService.addPrerequisite({ skillId, prerequisiteSkillId, relationshipType });
        res.status(201).json({ message: 'Prerequisite added successfully' });
    } catch (error: any) {
        console.error('Error adding prerequisite:', error);
        if (error.message?.includes('prerequisite of itself')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to add prerequisite' });
    }
};

export const getPrerequisites = async (req: Request, res: Response) => {
    try {
        const { skillId } = req.params;
        const result = await skillService.getPrerequisites(skillId);

        if (!result) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching prerequisites:', error);
        res.status(500).json({ error: 'Failed to fetch prerequisites' });
    }
};

// ============================================================================
// User Skill Mastery
// ============================================================================

export const getUserSkillMastery = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { skillId } = req.params;

        const mastery = await skillMasteryService.getUserSkillMastery(userId, skillId);
        res.json(mastery || { masteryScore: 0, practiceCount: 0 });
    } catch (error) {
        console.error('Error fetching user skill mastery:', error);
        res.status(500).json({ error: 'Failed to fetch skill mastery' });
    }
};

export const getUserAllMasteries = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const masteries = await skillMasteryService.getUserAllMasteries(userId);
        res.json(masteries);
    } catch (error) {
        console.error('Error fetching user masteries:', error);
        res.status(500).json({ error: 'Failed to fetch skill masteries' });
    }
};

export const getUserCourseSkillMastery = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { courseId } = req.params;

        const mastery = await skillMasteryService.getUserCourseSkillMastery(userId, courseId);
        res.json(mastery);
    } catch (error: any) {
        console.error('Error fetching course skill mastery:', error);
        if (error.message?.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch course skill mastery' });
    }
};

export const getUserSkillSummary = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const summary = await skillMasteryService.getUserSkillSummary(userId);
        res.json(summary);
    } catch (error) {
        console.error('Error fetching skill summary:', error);
        res.status(500).json({ error: 'Failed to fetch skill summary' });
    }
};

export const getMasteryHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { skillId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const history = await skillMasteryService.getMasteryHistory(userId, skillId, limit);
        res.json(history);
    } catch (error) {
        console.error('Error fetching mastery history:', error);
        res.status(500).json({ error: 'Failed to fetch mastery history' });
    }
};

export const getRecentMasteryChanges = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const limit = parseInt(req.query.limit as string) || 20;

        const changes = await skillMasteryService.getRecentMasteryChanges(userId, limit);
        res.json(changes);
    } catch (error) {
        console.error('Error fetching recent changes:', error);
        res.status(500).json({ error: 'Failed to fetch recent mastery changes' });
    }
};

export const getWeakSkills = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const maxMastery = parseInt(req.query.maxMastery as string) || 50;
        const limit = parseInt(req.query.limit as string) || 5;

        const skills = await skillMasteryService.getWeakSkillsForUser(userId, maxMastery, limit);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching weak skills:', error);
        res.status(500).json({ error: 'Failed to fetch weak skills' });
    }
};

export const getSkillLeaderboard = async (req: Request, res: Response) => {
    try {
        const { skillId } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;

        const leaderboard = await skillMasteryService.getSkillLeaderboard(skillId, limit);
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching skill leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch skill leaderboard' });
    }
};
