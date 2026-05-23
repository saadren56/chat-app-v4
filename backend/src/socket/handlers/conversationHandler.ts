import { Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../types';
import {
  ConversationMemberRepository,
  TypingRepository,
  UserRepository,
} from '../../db/repositories';
import { SocketEventNames } from '../types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const conversationMemberRepo = new ConversationMemberRepository();
const typingRepo = new TypingRepository();
const userRepo = new UserRepository();

export async function handleJoinConversation(
  socket: TypedSocket,
  data: { conversationId: string }
): Promise<void> {
  const { userId, user } = socket.data;
  if (!userId || !user) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { conversationId } = data;

  try {
    const isMember = conversationMemberRepo.isMember(conversationId, userId);
    if (!isMember) {
      emitSocketError(socket, 'Not a member of this conversation');
      return;
    }

    socket.join(`conversation:${conversationId}`);
    console.log(`👥 ${user.username} joined conversation ${conversationId}`);

  } catch (error) {
    console.error('❌ Join conversation error:', error);
    emitSocketError(socket, 'Failed to join conversation');
  }
}

export async function handleLeaveConversation(
  socket: TypedSocket,
  data: { conversationId: string }
): Promise<void> {
  const { user } = socket.data;

  const { conversationId } = data;

  socket.leave(`conversation:${conversationId}`);
  if (user) {
    console.log(`👥 ${user.username} left conversation ${conversationId}`);
  }
}

export async function handleTypingStart(
  socket: TypedSocket,
  data: { conversationId: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId, user } = socket.data;
  if (!userId || !user) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { conversationId } = data;

  try {
    const isMember = conversationMemberRepo.isMember(conversationId, userId);
    if (!isMember) {
      return;
    }

    typingRepo.setTyping(conversationId, userId, true);

    broadcastToConversation(
      conversationId,
      SocketEventNames.SERVER.TYPING_START,
      {
        conversationId,
        user: {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
        },
      }
    );

  } catch (error) {
    console.error('❌ Typing start error:', error);
  }
}

export async function handleTypingStop(
  socket: TypedSocket,
  data: { conversationId: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId } = socket.data;
  if (!userId) {
    return;
  }

  const { conversationId } = data;

  try {
    const isMember = conversationMemberRepo.isMember(conversationId, userId);
    if (!isMember) {
      return;
    }

    typingRepo.setTyping(conversationId, userId, false);

    broadcastToConversation(
      conversationId,
      SocketEventNames.SERVER.TYPING_STOP,
      {
        conversationId,
        userId,
      }
    );

  } catch (error) {
    console.error('❌ Typing stop error:', error);
  }
}

export async function handlePresenceStatus(
  socket: TypedSocket,
  data: { status: 'online' | 'offline' | 'away' | 'busy' },
  broadcastUserStatus: (userId: string, status: any) => void
): Promise<void> {
  const { userId } = socket.data;
  if (!userId) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { status } = data;

  try {
    userRepo.updateStatus(userId, status);
    broadcastUserStatus(userId, status);

  } catch (error) {
    console.error('❌ Presence status error:', error);
    emitSocketError(socket, 'Failed to update status');
  }
}

function emitSocketError(socket: TypedSocket, message: string, code?: string): void {
  socket.emit(SocketEventNames.SERVER.ERROR, { message, code });
}
