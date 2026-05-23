import { Response } from 'express';
import { UserRepository } from '../db/repositories';
import { validate } from '../utils';
import { sendSuccessResponse, sendPaginatedResponse, NotFoundError } from '../utils';
import { AuthRequest } from '../middleware';

const userRepo = new UserRepository();

export const userController = {
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const user = userRepo.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    sendSuccessResponse(res, userWithoutPassword);
  },

  async updateCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { username, email, avatar, bio } = req.body;

    validate()
      .string(username, 'username', 3, 32)
      .email(email, 'email')
      .string(avatar, 'avatar', 0, 500)
      .string(bio, 'bio', 0, 500)
      .throwIfErrors();

    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio;

    const user = userRepo.update(req.user.id, updates);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    sendSuccessResponse(res, userWithoutPassword, 'User updated');
  },

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const user = userRepo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    sendSuccessResponse(res, userWithoutPassword);
  },

  async searchUsers(req: AuthRequest, res: Response): Promise<void> {
    const { q, limit = 20 } = req.query;

    validate()
      .required(q, 'q')
      .string(q as string, 'q', 1, 100)
      .number(limit as string, 'limit', 1, 100)
      .throwIfErrors();

    const users = userRepo.searchUsers(q as string, Number(limit));
    const usersWithoutPasswords = users.map(({ password_hash, ...u }) => u);

    sendSuccessResponse(res, usersWithoutPasswords);
  },

  async getOnlineUsers(req: AuthRequest, res: Response): Promise<void> {
    const users = userRepo.findOnlineUsers();
    const usersWithoutPasswords = users.map(({ password_hash, ...u }) => u);

    sendSuccessResponse(res, usersWithoutPasswords);
  },
};
