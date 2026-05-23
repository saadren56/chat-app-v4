import { Router } from 'express';
import { userController } from '../controllers';
import { authenticateToken } from '../middleware';
import { asyncHandler } from '../utils';

const router = Router();

router.get('/me', authenticateToken, asyncHandler(userController.getCurrentUser));
router.patch('/me', authenticateToken, asyncHandler(userController.updateCurrentUser));
router.get('/search', authenticateToken, asyncHandler(userController.searchUsers));
router.get('/online', authenticateToken, asyncHandler(userController.getOnlineUsers));
router.get('/:id', authenticateToken, asyncHandler(userController.getUserById));

export default router;
