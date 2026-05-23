import { Router } from 'express';
import { friendController } from '../controllers';
import { authenticateToken } from '../middleware';
import { asyncHandler } from '../utils';

const router = Router();

router.get('/', authenticateToken, asyncHandler(friendController.getFriends));
router.get('/requests/pending', authenticateToken, asyncHandler(friendController.getPendingRequests));
router.get('/requests/sent', authenticateToken, asyncHandler(friendController.getSentRequests));
router.post('/requests', authenticateToken, asyncHandler(friendController.sendRequest));
router.post('/requests/:id/accept', authenticateToken, asyncHandler(friendController.acceptRequest));
router.post('/requests/:id/decline', authenticateToken, asyncHandler(friendController.declineRequest));
router.delete('/:userId', authenticateToken, asyncHandler(friendController.removeFriend));
router.post('/block', authenticateToken, asyncHandler(friendController.blockUser));
router.get('/check/:userId', authenticateToken, asyncHandler(friendController.checkFriendship));

export default router;
