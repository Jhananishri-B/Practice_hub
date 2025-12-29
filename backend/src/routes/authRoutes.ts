import { Router } from 'express';
import { loginController, googleLoginController } from '../controllers/authController';

const router = Router();

router.post('/login', loginController);
router.post('/google', googleLoginController);

export default router;

