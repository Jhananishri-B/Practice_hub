import { Router } from 'express';
import { chatWithTutor, getInitialHintController, generateLessonController } from '../controllers/aiTutorController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/chat', authenticate, chatWithTutor);
router.get('/hint/:sessionId', authenticate, getInitialHintController);
router.post('/generate-lesson', authenticate, generateLessonController);

export default router;

