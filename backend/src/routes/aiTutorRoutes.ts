import { Router } from 'express';
import {
  chatWithTutor,
  getInitialHintController,
  freeChatWithTutor,
} from '../controllers/aiTutorController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Session-aware tutor used from the Results page
router.post('/chat', authenticate, chatWithTutor);
router.get('/hint/:sessionId', authenticate, getInitialHintController);

// General AI Coach chat (no session required)
router.post('/free-chat', authenticate, freeChatWithTutor);

export default router;

