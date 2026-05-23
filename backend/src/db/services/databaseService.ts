import {
  UserRepository,
  FriendshipRepository,
  ConversationRepository,
  ConversationMemberRepository,
  MessageRepository,
  TypingRepository,
  SessionRepository,
} from '../repositories';
import {
  CreateUserInput,
  CreateConversationInput,
  CreateConversationMemberInput,
  CreateMessageInput,
  CreateMessageReactionInput,
  CreateMessageAttachmentInput,
  CreateSessionInput,
  MemberRole,
  MessageType,
  PaginationParams,
} from '../types';

export class DatabaseService {
  private _users?: UserRepository;
  private _friendships?: FriendshipRepository;
  private _conversations?: ConversationRepository;
  private _conversationMembers?: ConversationMemberRepository;
  private _messages?: MessageRepository;
  private _typing?: TypingRepository;
  private _sessions?: SessionRepository;

  get users(): UserRepository {
    if (!this._users) {
      this._users = new UserRepository();
    }
    return this._users;
  }

  get friendships(): FriendshipRepository {
    if (!this._friendships) {
      this._friendships = new FriendshipRepository();
    }
    return this._friendships;
  }

  get conversations(): ConversationRepository {
    if (!this._conversations) {
      this._conversations = new ConversationRepository();
    }
    return this._conversations;
  }

  get conversationMembers(): ConversationMemberRepository {
    if (!this._conversationMembers) {
      this._conversationMembers = new ConversationMemberRepository();
    }
    return this._conversationMembers;
  }

  get messages(): MessageRepository {
    if (!this._messages) {
      this._messages = new MessageRepository();
    }
    return this._messages;
  }

  get typing(): TypingRepository {
    if (!this._typing) {
      this._typing = new TypingRepository();
    }
    return this._typing;
  }

  get sessions(): SessionRepository {
    if (!this._sessions) {
      this._sessions = new SessionRepository();
    }
    return this._sessions;
  }

  // ============================================
  // USER METHODS
  // ============================================

  async createUser(input: CreateUserInput) {
    return this.users.create(input);
  }

  async getUserById(id: string) {
    return this.users.findById(id);
  }

  async getUserByUsername(username: string) {
    return this.users.findByUsername(username);
  }

  async searchUsers(query: string, limit: number = 20) {
    return this.users.searchUsers(query, limit);
  }

  async updateUserStatus(userId: string, status: 'online' | 'offline' | 'away' | 'busy') {
    return this.users.updateStatus(userId, status);
  }

  async getOnlineUsers() {
    return this.users.findOnlineUsers();
  }

  // ============================================
  // FRIENDSHIP METHODS
  // ============================================

  async sendFriendRequest(userId: string, friendId: string, requestId: string) {
    return this.friendships.create({
      id: requestId,
      user_id: userId,
      friend_id: friendId,
      status: 'pending',
    });
  }

  async acceptFriendRequest(friendshipId: string) {
    return this.friendships.accept(friendshipId);
  }

  async declineFriendRequest(friendshipId: string) {
    return this.friendships.decline(friendshipId);
  }

  async getFriends(userId: string) {
    return this.friendships.findFriends(userId);
  }

  async areFriends(userId: string, friendId: string) {
    return this.friendships.areFriends(userId, friendId);
  }

  // ============================================
  // CONVERSATION METHODS
  // ============================================

  async createConversation(
    input: CreateConversationInput,
    memberIds: string[],
    ownerId: string
  ) {
    const conversation = this.conversations.create(input);

    for (const userId of memberIds) {
      const memberId = crypto.randomUUID();
      const role: MemberRole = userId === ownerId ? 'owner' : 'member';
      this.conversationMembers.create({
        id: memberId,
        conversation_id: conversation.id,
        user_id: userId,
        role,
      });
    }

    return conversation;
  }

  async getConversationsByUser(userId: string) {
    return this.conversations.findByUser(userId);
  }

  async getActiveConversation(conversationId: string) {
    return this.conversations.findById(conversationId);
  }

  async getDirectConversation(user1Id: string, user2Id: string) {
    return this.conversations.findDirectConversation(user1Id, user2Id);
  }

  async pinConversation(conversationId: string) {
    return this.conversations.pin(conversationId);
  }

  async unpinConversation(conversationId: string) {
    return this.conversations.unpin(conversationId);
  }

  // ============================================
  // CONVERSATION MEMBER METHODS
  // ============================================

  async addConversationMember(
    conversationId: string,
    userId: string,
    role: MemberRole = 'member'
  ) {
    return this.conversationMembers.create({
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      user_id: userId,
      role,
    });
  }

  async getConversationMembers(conversationId: string) {
    return this.conversationMembers.findByConversation(conversationId);
  }

  async markConversationAsRead(
    conversationId: string,
    userId: string,
    messageId: string
  ) {
    await this.conversations.markAsRead(conversationId);
    return this.conversationMembers.updateReadState(
      conversationId,
      userId,
      messageId,
      new Date()
    );
  }

  // ============================================
  // MESSAGE METHODS
  // ============================================

  async createMessage(input: CreateMessageInput) {
    const message = this.messages.create(input);
    await this.conversations.updateLastMessage(
      input.conversation_id,
      message.id,
      message.created_at
    );
    return message;
  }

  async getMessages(
    conversationId: string,
    params: PaginationParams = {}
  ) {
    return this.messages.findByConversation(conversationId, params);
  }

  async editMessage(messageId: string, content: string) {
    return this.messages.editMessage(messageId, content);
  }

  async deleteMessage(messageId: string) {
    return this.messages.delete(messageId);
  }

  async addMessageReaction(input: CreateMessageReactionInput) {
    return this.messages.addReaction(input);
  }

  async removeMessageReaction(
    messageId: string,
    userId: string,
    emoji: string
  ) {
    return this.messages.removeReaction(messageId, userId, emoji);
  }

  async getMessageReactions(messageId: string) {
    return this.messages.getReactions(messageId);
  }

  async addMessageAttachment(input: CreateMessageAttachmentInput) {
    return this.messages.addAttachment(input);
  }

  async getMessageAttachments(messageId: string) {
    return this.messages.getAttachments(messageId);
  }

  // ============================================
  // TYPING METHODS
  // ============================================

  async setTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) {
    return this.typing.setTyping(conversationId, userId, isTyping);
  }

  async getTypingUsers(conversationId: string) {
    return this.typing.getTypingUsers(conversationId);
  }

  async cleanupTypingIndicators() {
    this.typing.cleanupOldIndicators();
  }

  // ============================================
  // SESSION METHODS
  // ============================================

  async createSession(input: CreateSessionInput) {
    return this.sessions.create(input);
  }

  async getSessionByToken(token: string) {
    return this.sessions.findByToken(token);
  }

  async getSessionsByUser(userId: string) {
    return this.sessions.findByUser(userId);
  }

  async revokeSession(sessionId: string) {
    return this.sessions.revoke(sessionId);
  }

  async revokeAllSessions(userId: string) {
    return this.sessions.revokeAllByUser(userId);
  }

  async isTokenValid(token: string) {
    return this.sessions.isTokenValid(token);
  }

  async cleanupExpiredSessions() {
    return this.sessions.cleanupExpired();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async getDatabaseStats() {
    return {
      users: this.users.count(),
      conversations: this.conversations.count(),
      messages: this.messages.count(),
      friendships: this.friendships.count(),
    };
  }
}

let databaseService: DatabaseService | null = null;

export function getDatabaseService(): DatabaseService {
  if (!databaseService) {
    databaseService = new DatabaseService();
  }
  return databaseService;
}

export default DatabaseService;
