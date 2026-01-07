import { Router } from 'express';
import { getAllQuestionsController } from '../controllers/questionController';

const router = Router();

router.get('/', getAllQuestionsController);

export default router;




