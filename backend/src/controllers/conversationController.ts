import { Response } from 'express';
import crypto from 'crypto';
import {
  ConversationRepository,
  ConversationMemberRepository,
  MessageRepository,
} from '../db/repositories';
import { validate, sendSuccessResponse, sendPaginatedResponse, NotFoundError, ForbiddenError } from '../utils';
import { AuthRequest } from '../middleware';

const conversationRepo = new ConversationRepository();
const conversationMemberRepo = new ConversationMemberRepository();
const messageRepo = new MessageRepository();

export const conversationController = {
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const conversations = conversationRepo.findByUser(req.user.id);
    sendSuccessResponse(res, conversations);
  },

  async getConversationById(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const conversation = conversationRepo.findById(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    sendSuccessResponse(res, conversation);
  },

  async createConversation(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { type, participantIds, name, avatar, description } = req.body;

    validate()
      .required(type, 'type')
      .oneOf(type, ['direct', 'group'], 'type')
      .required(participantIds, 'participantIds')
      .array(participantIds, 'participantIds', 1, 100)
      .string(name, 'name', 0, 100)
      .string(avatar, 'avatar', 0, 500)
      .string(description, 'description', 0, 500)
      .throwIfErrors();

    if (type === 'direct' && participantIds.length !== 2) {
      throw new Error('Direct conversations require exactly 2 participants');
    }

    if (type === 'direct') {
      const existing = conversationRepo.findDirectConversation(
        participantIds[0],
        participantIds[1]
      );
      if (existing) {
        sendSuccessResponse(res, existing, 'Conversation already exists');
        return;
      }
    }

    const conversationId = crypto.randomUUID();
    const conversation = conversationRepo.create({
      id: conversationId,
      type,
      name,
      avatar,
      description,
      created_by: req.user.id,
    });

    for (const userId of participantIds) {
      const memberId = crypto.randomUUID();
      const role: any = userId === req.user.id && type === 'group' ? 'owner' : 'member';
      conversationMemberRepo.create({
        id: memberId,
        conversation_id: conversationId,
        user_id: userId,
        role,
      });
    }

    sendSuccessResponse(res, conversation, 'Conversation created', 201);
  },

  async updateConversation(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;
    const { name, avatar, description } = req.body;

    validate()
      .required(id, 'id')
      .string(name, 'name', 0, 100)
      .string(avatar, 'avatar', 0, 500)
      .string(description, 'description', 0, 500)
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const conversation = conversationRepo.update(id, { name, avatar, description });
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    sendSuccessResponse(res, conversation, 'Conversation updated');
  },

  async deleteConversation(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const deleted = conversationRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Conversation not found');
    }

    sendSuccessResponse(res, null, 'Conversation deleted');
  },

  async pinConversation(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const conversation = conversationRepo.pin(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    sendSuccessResponse(res, conversation, 'Conversation pinned');
  },

  async unpinConversation(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;

    validate()
      .required(id, 'id')
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const conversation = conversationRepo.unpin(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    sendSuccessResponse(res, conversation, 'Conversation unpinned');
  },

  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;
    const { page = 1, limit = 50, before, after } = req.query;

    validate()
      .required(id, 'id')
      .number(page as string, 'page', 1, 1000)
      .number(limit as string, 'limit', 1, 200)
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    const result = messageRepo.findByConversation(id, {
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      before: before as string,
      after: after as string,
    });

    sendSuccessResponse(res, result);
  },

  async addMember(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;
    const { userId } = req.body;

    validate()
      .required(id, 'id')
      .required(userId, 'userId')
      .throwIfErrors();

    const hasRole = conversationMemberRepo.hasRole(id, req.user.id, ['admin', 'owner']);
    if (!hasRole) {
      throw new ForbiddenError('Not authorized to add members');
    }

    const memberId = crypto.randomUUID();
    const member = conversationMemberRepo.create({
      id: memberId,
      conversation_id: id,
      user_id: userId,
      role: 'member',
    });

    sendSuccessResponse(res, member, 'Member added', 201);
  },

  async removeMember(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id, userId } = req.params;

    validate()
      .required(id, 'id')
      .required(userId, 'userId')
      .throwIfErrors();

    const hasRole = conversationMemberRepo.hasRole(id, req.user.id, ['admin', 'owner']);
    const isSelf = req.user.id === userId;
    
    if (!hasRole && !isSelf) {
      throw new ForbiddenError('Not authorized to remove members');
    }

    const member = conversationMemberRepo.findByConversationAndUser(id, userId);
    if (!member) {
      throw new NotFoundError('Member not found');
    }

    conversationMemberRepo.delete(member.id);

    sendSuccessResponse(res, null, 'Member removed');
  },

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new NotFoundError('User not found');
    }

    const { id } = req.params;
    const { messageId } = req.body;

    validate()
      .required(id, 'id')
      .required(messageId, 'messageId')
      .throwIfErrors();

    const isMember = conversationMemberRepo.isMember(id, req.user.id);
    if (!isMember) {
      throw new ForbiddenError('Not a member of this conversation');
    }

    conversationMemberRepo.updateReadState(id, req.user.id, messageId, new Date());
    conversationRepo.markAsRead(id);

    sendSuccessResponse(res, null, 'Marked as read');
  },
};
