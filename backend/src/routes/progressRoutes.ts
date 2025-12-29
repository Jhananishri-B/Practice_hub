import { Router } from 'express';
import { getUserProgressController, getLeaderboardController } from '../controllers/progressController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/me', authenticate, getUserProgressController);
router.get('/leaderboard', getLeaderboardController);

export default router;

