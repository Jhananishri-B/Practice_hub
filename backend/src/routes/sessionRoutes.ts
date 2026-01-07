import { Router } from 'express';
import {
  startSessionController,
  submitSolutionController,
  completeSessionController,
  runCodeController,
  getAllSessionsController,
} from '../controllers/sessionController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', getAllSessionsController);
router.post('/start', authenticate, startSessionController);
router.post('/:sessionId/submit', authenticate, submitSolutionController);
router.post('/:sessionId/run', authenticate, runCodeController);
router.post('/:sessionId/complete', authenticate, completeSessionController);

export default router;

