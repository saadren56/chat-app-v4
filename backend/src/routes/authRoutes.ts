import { Router } from 'express';
import { authController } from '../controllers';
import { authenticateToken, optionalAuth } from '../middleware';
import { asyncHandler } from '../utils';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', optionalAuth, asyncHandler(authController.logout));
router.post('/logout-all', authenticateToken, asyncHandler(authController.logoutAll));
router.get('/me', authenticateToken, asyncHandler(authController.getMe));

export default router;
