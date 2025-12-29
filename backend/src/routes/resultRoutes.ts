import { Router } from 'express';
import { getSessionResultsController } from '../controllers/resultController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/:sessionId', authenticate, getSessionResultsController);

export default router;

