import { Router } from 'express';
import { loginController, googleLoginController, registerController, forgotPasswordController } from '../controllers/authController';

const router = Router();

router.post('/login', loginController);
router.post('/google', googleLoginController);
router.post('/register', registerController);
router.post('/forgot-password', forgotPasswordController);

export default router;

