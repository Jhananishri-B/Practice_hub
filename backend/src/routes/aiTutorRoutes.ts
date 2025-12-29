import { Router } from 'express';
import { chatWithTutor, getInitialHintController } from '../controllers/aiTutorController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/chat', authenticate, chatWithTutor);
router.get('/hint/:sessionId', authenticate, getInitialHintController);

export default router;

