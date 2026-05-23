import { Response } from 'express';
import crypto from 'crypto';
import {
  MessageRepository,
  ConversationMemberRepository,
} from '../db/repositories';
import { validate, sendSuccessResponse, NotFoundError, ForbiddenError } from '../utils';
import { AuthRequest } from '../middleware';

const messageRepo = new MessageRepository();
const conversationMemberRepo = new ConversationMemberRepository();

export const messageController = {
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { conversationId, content, type = 'text', replyToId } = req.body;

    validate()
      .required(conversationId, 'conversationId')
      .required(content, 'content')
      .string(content, 'content', 1, 10000)
      .oneOf(type, ['text', 'image', 'file', 'audio', 'video', 'system'], 'type')
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(conversationId, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const messageId = crypto.randomUUID();
    const message = messageRepo.create({
      id: messageId,
      conversation_id: conversationId,
      sender_id: req.user.id,
      type,
      content,
      reply_to_id: replyToId,
    });

    sendSuccessResponse(res, message, 'Message sent', 201);
  },

  async editMessage(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;
    const { content } = req.body;

    validate()
      .required(id, 'id')
      .required(content, 'content')
      .string(content, 'content', 1, 10000)
      .throwIfErrors();

    const message = messageRepo.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.sender_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to edit this message');
    }

    const updatedMessage = messageRepo.editMessage(id, content);
    if (!updatedMessage) {
      throw new NotFoundError('Message not found');
    }

    sendSuccessResponse(res, updatedMessage, 'Message edited');
  },

  async deleteMessage(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const message = messageRepo.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.sender_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to delete this message');
    }

    const deleted = messageRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Message not found');
    }

    sendSuccessResponse(res, null, 'Message deleted');
  },

  async addReaction(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;
    const { emoji } = req.body;

    validate()
      .required(id, 'id')
      .required(emoji, 'emoji')
      .string(emoji, 'emoji', 1, 10)
      .throwIfErrors();

    const message = messageRepo.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    const isMember = conversationMemberRepo.isMember(message.conversation_id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const reactionId = crypto.randomUUID();
    const reaction = messageRepo.addReaction({
      id: reactionId,
      message_id: id,
      user_id: req.user.id,
      emoji,
    });

    sendSuccessResponse(res, reaction, 'Reaction added', 201);
  },

  async removeReaction(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;
    const { emoji } = req.body;

    validate()
      .required(id, 'id')
      .required(emoji, 'emoji')
      .throwIfErrors();

    const removed = messageRepo.removeReaction(id, req.user.id, emoji);
    if (!removed) {
      throw new NotFoundError('Reaction not found');
    }

    sendSuccessResponse(res, null, 'Reaction removed');
  },

  async getReactions(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const message = messageRepo.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    const isMember = conversationMemberRepo.isMember(message.conversation_id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const reactions = messageRepo.getReactions(id);
    sendSuccessResponse(res, reactions);
  },
};
