import express from 'express';
import { authenticate } from '../middlewares/auth';
import * as skillController from '../controllers/skillController';

const router = express.Router();

// ============================================================================
// Public Routes (no auth required for reading skills catalog)
// ============================================================================

// Get all skills (optionally filter by category)
router.get('/', skillController.getAllSkills);

// Get single skill by ID
router.get('/:skillId', skillController.getSkillById);

// Get prerequisites for a skill
router.get('/:skillId/prerequisites', skillController.getPrerequisites);

// Get leaderboard for a skill
router.get('/:skillId/leaderboard', skillController.getSkillLeaderboard);

// ============================================================================
// Protected Routes (auth required)
// ============================================================================

// User's skill mastery
router.get('/user/summary', authenticate, skillController.getUserSkillSummary);
router.get('/user/masteries', authenticate, skillController.getUserAllMasteries);
router.get('/user/weak-skills', authenticate, skillController.getWeakSkills);
router.get('/user/recent-changes', authenticate, skillController.getRecentMasteryChanges);
router.get('/user/mastery/:skillId', authenticate, skillController.getUserSkillMastery);
router.get('/user/mastery/:skillId/history', authenticate, skillController.getMasteryHistory);

// Course skill mastery
router.get('/course/:courseId/mastery', authenticate, skillController.getUserCourseSkillMastery);
router.get('/course/:courseId', skillController.getSkillsForCourse);

// Level skills
router.get('/level/:levelId', skillController.getSkillsForLevel);

// ============================================================================
// Admin Routes (admin auth required)
// ============================================================================

// Skill CRUD (admin only)
router.post('/', authenticate, skillController.createSkill);
router.put('/:skillId', authenticate, skillController.updateSkill);
router.delete('/:skillId', authenticate, skillController.deleteSkill);

// Level-skill mapping (admin only)
router.post('/level-mapping', authenticate, skillController.mapSkillToLevel);
router.delete('/level/:levelId/skill/:skillId', authenticate, skillController.unmapSkillFromLevel);

// Skill prerequisites (admin only)
router.post('/prerequisites', authenticate, skillController.addPrerequisite);

export default router;
