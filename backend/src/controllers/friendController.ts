import { Response } from 'express';
import crypto from 'crypto';
import {
  UserRepository,
  FriendshipRepository,
} from '../db/repositories';
import {
  validate,
  sendSuccessResponse,
  sendPaginatedResponse,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../utils';
import { AuthRequest } from '../middleware';

const userRepo = new UserRepository();
const friendshipRepo = new FriendshipRepository();

export const friendController = {
  async getFriends(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const friendships = friendshipRepo.findFriends(req.user.id);
    sendSuccessResponse(res, friendships);
  },

  async getPendingRequests(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const requests = friendshipRepo.findPendingReceived(req.user.id);
    sendSuccessResponse(res, requests);
  },

  async getSentRequests(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const requests = friendshipRepo.findPendingSent(req.user.id);
    sendSuccessResponse(res, requests);
  },

  async sendRequest(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { userId } = req.body;

    validate()
      .required(userId, 'userId')
      .throwIfErrors();

    if (userId === req.user.id) {
      throw new ForbiddenError('Cannot send friend request to yourself');
    }

    const recipient = userRepo.findById(userId);
    if (!recipient) {
      throw new NotFoundError('User not found');
    }

    const existing = friendshipRepo.findBetween(req.user.id, userId);
    if (existing) {
      if (existing.status === 'blocked') {
        throw new ForbiddenError('Cannot send request to blocked user');
      }
      throw new ConflictError('Friend request already exists');
    }

    const requestId = crypto.randomUUID();
    const friendship = friendshipRepo.create({
      id: requestId,
      user_id: req.user.id,
      friend_id: userId,
      status: 'pending',
    });

    sendSuccessResponse(res, friendship, 'Friend request sent', 201);
  },

  async acceptRequest(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const friendship = friendshipRepo.findById(id);
    if (!friendship) {
      throw new NotFoundError('Friend request not found');
    }

    if (friendship.friend_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to accept this request');
    }

    if (friendship.status !== 'pending') {
      throw new ConflictError('Request is not pending');
    }

    const accepted = friendshipRepo.accept(id);
    if (!accepted) {
      throw new NotFoundError('Friend request not found');
    }

    sendSuccessResponse(res, accepted, 'Friend request accepted');
  },

  async declineRequest(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const friendship = friendshipRepo.findById(id);
    if (!friendship) {
      throw new NotFoundError('Friend request not found');
    }

    if (friendship.friend_id !== req.user.id && friendship.user_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to decline this request');
    }

    const declined = friendshipRepo.decline(id);
    if (!declined) {
      throw new NotFoundError('Friend request not found');
    }

    sendSuccessResponse(res, declined, 'Friend request declined');
  },

  async removeFriend(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { userId } = req.params;

    validate()
      .required(userId, 'userId')
      .throwIfErrors();

    const friendship = friendshipRepo.findBetween(req.user.id, userId);
    if (!friendship) {
      throw new NotFoundError('Friend not found');
    }

    friendshipRepo.delete(friendship.id);

    sendSuccessResponse(res, null, 'Friend removed');
  },

  async blockUser(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { userId } = req.body;

    validate()
      .required(userId, 'userId')
      .throwIfErrors();

    if (userId === req.user.id) {
      throw new ForbiddenError('Cannot block yourself');
    }

    const friendship = friendshipRepo.block(req.user.id, userId);

    sendSuccessResponse(res, friendship, 'User blocked');
  },

  async checkFriendship(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { userId } = req.params;

    validate()
      .required(userId, 'userId')
      .throwIfErrors();

    const friendship = friendshipRepo.findBetween(req.user.id, userId);
    const areFriends = friendshipRepo.areFriends(req.user.id, userId);
    const isBlocked = friendshipRepo.isBlocked(req.user.id, userId);

    sendSuccessResponse(res, {
      friendship,
      areFriends,
      isBlocked,
    });
  },
};
