import { Router } from 'express';
import { getAllCoursesController, getCourseLevelsController, getLevelDetailsController } from '../controllers/courseController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getAllCoursesController);
router.get('/:courseId/levels', authenticate, getCourseLevelsController);
router.get('/:courseId/levels/:levelId', authenticate, getLevelDetailsController);

export default router;

