import crypto from 'crypto';
import { Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  SocketMessage,
  SocketUser,
  SocketReaction,
} from '../types';
import {
  MessageRepository,
  ConversationMemberRepository,
  ConversationRepository,
} from '../../db/repositories';
import { SocketEventNames } from '../types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const messageRepo = new MessageRepository();
const conversationMemberRepo = new ConversationMemberRepository();
const conversationRepo = new ConversationRepository();

export async function handleSendMessage(
  socket: TypedSocket,
  data: { conversationId: string; content: string; type?: SocketMessage['type']; replyToId?: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId, user } = socket.data;
  if (!userId || !user) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { conversationId, content, type = 'text', replyToId } = data;

  try {
    const isMember = conversationMemberRepo.isMember(conversationId, userId);
    if (!isMember) {
      emitSocketError(socket, 'Not a member of this conversation');
      return;
    }

    const messageId = crypto.randomUUID();
    const dbMessage = messageRepo.create({
      id: messageId,
      conversation_id: conversationId,
      sender_id: userId,
      type,
      content,
      reply_to_id: replyToId,
    });

    const socketMessage: SocketMessage = {
      id: dbMessage.id,
      conversationId: dbMessage.conversation_id,
      senderId: dbMessage.sender_id,
      content: dbMessage.content,
      type: dbMessage.type as SocketMessage['type'],
      replyToId: dbMessage.reply_to_id,
      isEdited: dbMessage.is_edited,
      isDeleted: dbMessage.is_deleted,
      createdAt: dbMessage.created_at,
      updatedAt: dbMessage.updated_at,
      sender: user,
    };

    conversationRepo.updateLastMessage(conversationId, messageId, dbMessage.created_at);

    broadcastToConversation(
      conversationId,
      SocketEventNames.SERVER.MESSAGE_NEW,
      { message: socketMessage, conversationId }
    );

  } catch (error) {
    console.error('❌ Send message error:', error);
    emitSocketError(socket, 'Failed to send message');
  }
}

export async function handleEditMessage(
  socket: TypedSocket,
  data: { messageId: string; content: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId } = socket.data;
  if (!userId) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { messageId, content } = data;

  try {
    const message = messageRepo.findById(messageId);
    if (!message) {
      emitSocketError(socket, 'Message not found');
      return;
    }

    if (message.sender_id !== userId) {
      emitSocketError(socket, 'Not authorized to edit this message');
      return;
    }

    const updatedMessage = messageRepo.editMessage(messageId, content);
    if (!updatedMessage) {
      emitSocketError(socket, 'Failed to edit message');
      return;
    }

    broadcastToConversation(
      message.conversation_id,
      SocketEventNames.SERVER.MESSAGE_EDITED,
      {
        messageId,
        content,
        conversationId: message.conversation_id,
        editedAt: updatedMessage.updated_at,
      }
    );

  } catch (error) {
    console.error('❌ Edit message error:', error);
    emitSocketError(socket, 'Failed to edit message');
  }
}

export async function handleDeleteMessage(
  socket: TypedSocket,
  data: { messageId: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId } = socket.data;
  if (!userId) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { messageId } = data;

  try {
    const message = messageRepo.findById(messageId);
    if (!message) {
      emitSocketError(socket, 'Message not found');
      return;
    }

    if (message.sender_id !== userId) {
      emitSocketError(socket, 'Not authorized to delete this message');
      return;
    }

    const deleted = messageRepo.delete(messageId);
    if (!deleted) {
      emitSocketError(socket, 'Failed to delete message');
      return;
    }

    broadcastToConversation(
      message.conversation_id,
      SocketEventNames.SERVER.MESSAGE_DELETED,
      {
        messageId,
        conversationId: message.conversation_id,
        deletedAt: new Date(),
      }
    );

  } catch (error) {
    console.error('❌ Delete message error:', error);
    emitSocketError(socket, 'Failed to delete message');
  }
}

export async function handleMessageRead(
  socket: TypedSocket,
  data: { conversationId: string; messageId: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId, user } = socket.data;
  if (!userId || !user) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { conversationId, messageId } = data;

  try {
    const isMember = conversationMemberRepo.isMember(conversationId, userId);
    if (!isMember) {
      emitSocketError(socket, 'Not a member of this conversation');
      return;
    }

    const now = new Date();
    conversationMemberRepo.updateReadState(conversationId, userId, messageId, now);
    conversationRepo.markAsRead(conversationId);

    broadcastToConversation(
      conversationId,
      SocketEventNames.SERVER.MESSAGE_READ,
      {
        conversationId,
        messageId,
        readBy: userId,
        readAt: now,
      }
    );

  } catch (error) {
    console.error('❌ Mark message read error:', error);
    emitSocketError(socket, 'Failed to mark message as read');
  }
}

export async function handleAddReaction(
  socket: TypedSocket,
  data: { messageId: string; emoji: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId, user } = socket.data;
  if (!userId || !user) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { messageId, emoji } = data;

  try {
    const message = messageRepo.findById(messageId);
    if (!message) {
      emitSocketError(socket, 'Message not found');
      return;
    }

    const isMember = conversationMemberRepo.isMember(message.conversation_id, userId);
    if (!isMember) {
      emitSocketError(socket, 'Not a member of this conversation');
      return;
    }

    const reactionId = crypto.randomUUID();
    const dbReaction = messageRepo.addReaction({
      id: reactionId,
      message_id: messageId,
      user_id: userId,
      emoji,
    });

    const socketReaction: SocketReaction = {
      id: dbReaction.id,
      messageId: dbReaction.message_id,
      userId: dbReaction.user_id,
      emoji: dbReaction.emoji,
      createdAt: dbReaction.created_at,
      user,
    };

    broadcastToConversation(
      message.conversation_id,
      SocketEventNames.SERVER.REACTION_ADDED,
      {
        reaction: socketReaction,
        messageId,
        conversationId: message.conversation_id,
      }
    );

  } catch (error) {
    console.error('❌ Add reaction error:', error);
    emitSocketError(socket, 'Failed to add reaction');
  }
}

export async function handleRemoveReaction(
  socket: TypedSocket,
  data: { messageId: string; emoji: string },
  broadcastToConversation: (conversationId: string, event: string, data: any) => void
): Promise<void> {
  const { userId } = socket.data;
  if (!userId) {
    emitSocketError(socket, 'Not authenticated');
    return;
  }

  const { messageId, emoji } = data;

  try {
    const message = messageRepo.findById(messageId);
    if (!message) {
      emitSocketError(socket, 'Message not found');
      return;
    }

    const removed = messageRepo.removeReaction(messageId, userId, emoji);
    if (!removed) {
      emitSocketError(socket, 'Reaction not found');
      return;
    }

    broadcastToConversation(
      message.conversation_id,
      SocketEventNames.SERVER.REACTION_REMOVED,
      {
        messageId,
        userId,
        emoji,
        conversationId: message.conversation_id,
      }
    );

  } catch (error) {
    console.error('❌ Remove reaction error:', error);
    emitSocketError(socket, 'Failed to remove reaction');
  }
}

function emitSocketError(socket: TypedSocket, message: string, code?: string): void {
  socket.emit(SocketEventNames.SERVER.ERROR, { message, code });
}
