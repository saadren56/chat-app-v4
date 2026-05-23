import { Router } from 'express';
import { messageController } from '../controllers';
import { authenticateToken } from '../middleware';
import { asyncHandler } from '../utils';

const router = Router();

router.post('/', authenticateToken, asyncHandler(messageController.sendMessage));
router.patch('/:id', authenticateToken, asyncHandler(messageController.editMessage));
router.delete('/:id', authenticateToken, asyncHandler(messageController.deleteMessage));
router.get('/:id/reactions', authenticateToken, asyncHandler(messageController.getReactions));
router.post('/:id/reactions', authenticateToken, asyncHandler(messageController.addReaction));
router.delete('/:id/reactions', authenticateToken, asyncHandler(messageController.removeReaction));

export default router;
