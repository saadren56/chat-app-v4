import { Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  SocketUser,
} from '../types';
import { UserRepository, SessionRepository } from '../../db/repositories';
import { SocketEventNames } from '../types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();

export async function handleAuthentication(
  socket: TypedSocket,
  data: { token: string },
  userSockets: Map<string, Set<string>>,
  addUserSocket: (userId: string, socketId: string) => void,
  broadcastUserOnline: (userId: string, user: SocketUser) => void
): Promise<void> {
  try {
    const session = sessionRepo.findByToken(data.token);
    if (!session || session.is_revoked || new Date() > session.expires_at) {
      socket.emit(SocketEventNames.SERVER.AUTH_ERROR, { error: 'Invalid or expired token' });
      return;
    }

    const dbUser = userRepo.findById(session.user_id);
    if (!dbUser) {
      socket.emit(SocketEventNames.SERVER.AUTH_ERROR, { error: 'User not found' });
      return;
    }

    const socketUser: SocketUser = {
      id: dbUser.id,
      username: dbUser.username,
      avatar: dbUser.avatar,
      status: dbUser.status as SocketUser['status'],
    };

    socket.data.userId = dbUser.id;
    socket.data.username = dbUser.username;
    socket.data.user = socketUser;

    addUserSocket(dbUser.id, socket.id);
    broadcastUserOnline(dbUser.id, socketUser);

    socket.emit(SocketEventNames.SERVER.AUTH_AUTHENTICATED, { user: socketUser });

    console.log(`✅ Socket authenticated: ${dbUser.username} (${socket.id})`);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    socket.emit(SocketEventNames.SERVER.AUTH_ERROR, { error: 'Authentication failed' });
  }
}

export function handleDisconnect(
  socket: TypedSocket,
  userSockets: Map<string, Set<string>>,
  removeUserSocket: (userId: string, socketId: string) => void,
  broadcastUserOffline: (userId: string) => void
): void {
  const { userId } = socket.data;
  
  console.log(`🔌 Socket disconnected: ${socket.id}`);
  
  if (userId) {
    removeUserSocket(userId, socket.id);
    const sockets = userSockets.get(userId);
    if (!sockets || sockets.size === 0) {
      broadcastUserOffline(userId);
    }
  }
}
