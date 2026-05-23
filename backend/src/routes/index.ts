import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import conversationRoutes from './conversationRoutes';
import messageRoutes from './messageRoutes';
import friendRoutes from './friendRoutes';
import { env } from '../config';

const router = Router();

router.use(`${env.API_PREFIX}/auth`, authRoutes);
router.use(`${env.API_PREFIX}/users`, userRoutes);
router.use(`${env.API_PREFIX}/conversations`, conversationRoutes);
router.use(`${env.API_PREFIX}/messages`, messageRoutes);
router.use(`${env.API_PREFIX}/friends`, friendRoutes);

router.get(`${env.API_PREFIX}/health`, (req, res) => {
  res.json({ success: true, message: 'Server is healthy', timestamp: Date.now() });
});

export default router;
