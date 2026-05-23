import { Server, Socket } from 'socket.io';
import http from 'http';
import { env } from '../config';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  SocketUser,
} from './types';
import { SocketEventNames } from './types';
import {
  handleAuthentication,
  handleDisconnect,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleMessageRead,
  handleAddReaction,
  handleRemoveReaction,
  handleJoinConversation,
  handleLeaveConversation,
  handleTypingStart,
  handleTypingStop,
  handlePresenceStatus,
} from './handlers';
import { TypingRepository } from '../db/repositories';

const typingRepo = new TypingRepository();

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export interface SocketServer {
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  userSockets: Map<string, Set<string>>;
  addUserSocket: (userId: string, socketId: string) => void;
  removeUserSocket: (userId: string, socketId: string) => void;
  getUserSockets: (userId: string) => string[];
  isUserOnline: (userId: string) => boolean;
  broadcastToConversation: (conversationId: string, event: string, data: any) => void;
  broadcastToUser: (userId: string, event: string, data: any) => void;
  broadcastUserOnline: (userId: string, user: SocketUser) => void;
  broadcastUserOffline: (userId: string) => void;
  broadcastUserStatus: (userId: string, status: SocketUser['status']) => void;
}

export function setupSocketIO(server: http.Server): SocketServer {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
      origin: env.SOCKET_CORS_ORIGIN,
      credentials: env.CORS_CREDENTIALS,
      methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  const userSockets = new Map<string, Set<string>>();

  const addUserSocket = (userId: string, socketId: string): void => {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socketId);
  };

  const removeUserSocket = (userId: string, socketId: string): void => {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        userSockets.delete(userId);
      }
    }
  };

  const getUserSockets = (userId: string): string[] => {
    return Array.from(userSockets.get(userId) || []);
  };

  const isUserOnline = (userId: string): boolean => {
    return userSockets.has(userId);
  };

  const broadcastToConversation = (conversationId: string, event: string, data: any): void => {
    io.to(`conversation:${conversationId}`).emit(event as any, data);
  };

  const broadcastToUser = (userId: string, event: string, data: any): void => {
    const sockets = getUserSockets(userId);
    sockets.forEach(socketId => {
      io.to(socketId).emit(event as any, data);
    });
  };

  const broadcastUserOnline = (userId: string, user: SocketUser): void => {
    io.emit(SocketEventNames.SERVER.USER_ONLINE, { userId, user });
  };

  const broadcastUserOffline = (userId: string): void => {
    io.emit(SocketEventNames.SERVER.USER_OFFLINE, { userId });
  };

  const broadcastUserStatus = (userId: string, status: SocketUser['status']): void => {
    io.emit(SocketEventNames.SERVER.USER_STATUS, { userId, status });
  };

  io.on(SocketEventNames.SYSTEM.CONNECT, (socket: TypedSocket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    socket.on(SocketEventNames.CLIENT.AUTH_AUTHENTICATE, async (data) => {
      await handleAuthentication(
        socket,
        data,
        userSockets,
        addUserSocket,
        broadcastUserOnline
      );
    });

    socket.on(SocketEventNames.CLIENT.CONVERSATION_JOIN, async (data) => {
      await handleJoinConversation(socket, data);
    });

    socket.on(SocketEventNames.CLIENT.CONVERSATION_LEAVE, async (data) => {
      await handleLeaveConversation(socket, data);
    });

    socket.on(SocketEventNames.CLIENT.TYPING_START, async (data) => {
      await handleTypingStart(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.TYPING_STOP, async (data) => {
      await handleTypingStop(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.MESSAGE_SEND, async (data) => {
      await handleSendMessage(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.MESSAGE_EDIT, async (data) => {
      await handleEditMessage(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.MESSAGE_DELETE, async (data) => {
      await handleDeleteMessage(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.MESSAGE_READ, async (data) => {
      await handleMessageRead(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.REACTION_ADD, async (data) => {
      await handleAddReaction(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.REACTION_REMOVE, async (data) => {
      await handleRemoveReaction(socket, data, broadcastToConversation);
    });

    socket.on(SocketEventNames.CLIENT.PRESENCE_STATUS, async (data) => {
      await handlePresenceStatus(socket, data, broadcastUserStatus);
    });

    socket.on(SocketEventNames.SYSTEM.DISCONNECT, (reason) => {
      handleDisconnect(
        socket,
        userSockets,
        removeUserSocket,
        broadcastUserOffline
      );
    });
  });

  setInterval(() => {
    try {
      typingRepo.cleanupOldIndicators();
    } catch (error) {
      console.error('❌ Failed to cleanup typing indicators:', error);
    }
  }, 30000);

  console.log('✅ Socket.IO server initialized');

  return {
    io,
    userSockets,
    addUserSocket,
    removeUserSocket,
    getUserSockets,
    isUserOnline,
    broadcastToConversation,
    broadcastToUser,
    broadcastUserOnline,
    broadcastUserOffline,
    broadcastUserStatus,
  };
}

export default setupSocketIO;
export * from './types';
