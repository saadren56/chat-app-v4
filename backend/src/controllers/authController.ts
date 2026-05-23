import { Request, Response } from 'express';
import { getAuthService } from '../services/authService';
import { validate } from '../utils';
import { sendSuccessResponse } from '../utils';
import { AuthRequest } from '../middleware';

function getAuthServiceInstance() {
  return getAuthService();
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatar } = req.body;

    validate()
      .required(username, 'username')
      .string(username, 'username', 3, 32)
      .required(password, 'password')
      .string(password, 'password', 6, 128)
      .email(email, 'email')
      .string(avatar, 'avatar', 0, 500)
      .throwIfErrors();

    const authService = getAuthServiceInstance();
    const result = await authService.register(username, password, email, avatar);

    sendSuccessResponse(res, result, 'Registration successful', 201);
  },

  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    validate()
      .required(username, 'username')
      .required(password, 'password')
      .throwIfErrors();

    const authService = getAuthServiceInstance();
    const result = await authService.login(username, password);

    sendSuccessResponse(res, result, 'Login successful');
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    validate()
      .required(refreshToken, 'refreshToken')
      .throwIfErrors();

    const authService = getAuthServiceInstance();
    const tokens = await authService.refreshToken(refreshToken);

    sendSuccessResponse(res, tokens, 'Token refreshed');
  },

  async logout(req: AuthRequest, res: Response): Promise<void> {
    const { sessionId } = req.body;
    
    if (sessionId) {
      const authService = getAuthServiceInstance();
      await authService.logout(sessionId);
    }

    sendSuccessResponse(res, null, 'Logged out');
  },

  async logoutAll(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const authService = getAuthServiceInstance();
    await authService.logoutAll(req.user.id);

    sendSuccessResponse(res, null, 'All sessions logged out');
  },

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    sendSuccessResponse(res, req.user);
  },
};
