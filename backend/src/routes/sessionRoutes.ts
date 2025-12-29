import { Router } from 'express';
import {
  startSessionController,
  submitSolutionController,
  completeSessionController,
} from '../controllers/sessionController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/start', authenticate, startSessionController);
router.post('/:sessionId/submit', authenticate, submitSolutionController);
router.post('/:sessionId/complete', authenticate, completeSessionController);

export default router;

