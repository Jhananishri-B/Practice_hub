import { Router } from 'express';
import { getAllCoursesController, getCourseLevelsController } from '../controllers/courseController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getAllCoursesController);
router.get('/:courseId/levels', authenticate, getCourseLevelsController);

export default router;

