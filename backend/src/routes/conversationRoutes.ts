import { Router } from 'express';
import { conversationController } from '../controllers';
import { authenticateToken } from '../middleware';
import { asyncHandler } from '../utils';

const router = Router();

router.get('/', authenticateToken, asyncHandler(conversationController.getConversations));
router.post('/', authenticateToken, asyncHandler(conversationController.createConversation));
router.get('/:id', authenticateToken, asyncHandler(conversationController.getConversationById));
router.patch('/:id', authenticateToken, asyncHandler(conversationController.updateConversation));
router.delete('/:id', authenticateToken, asyncHandler(conversationController.deleteConversation));
router.post('/:id/pin', authenticateToken, asyncHandler(conversationController.pinConversation));
router.post('/:id/unpin', authenticateToken, asyncHandler(conversationController.unpinConversation));
router.get('/:id/messages', authenticateToken, asyncHandler(conversationController.getMessages));
router.post('/:id/mark-read', authenticateToken, asyncHandler(conversationController.markAsRead));
router.post('/:id/members', authenticateToken, asyncHandler(conversationController.addMember));
router.delete('/:id/members/:userId', authenticateToken, asyncHandler(conversationController.removeMember));

export default router;
