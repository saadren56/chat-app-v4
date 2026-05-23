// ============================================
// USER TYPES
// ============================================

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  status: UserStatus;
  last_seen?: Date;
  password_hash?: string;
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  password_hash?: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  status?: UserStatus;
  last_seen?: Date;
}

// ============================================
// FRIENDSHIP TYPES
// ============================================

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  is_mutual: number;
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFriendshipInput {
  id: string;
  user_id: string;
  friend_id: string;
  status?: FriendshipStatus;
}

export interface UpdateFriendshipInput {
  status?: FriendshipStatus;
  is_mutual?: number;
}

// ============================================
// CONVERSATION TYPES
// ============================================

export type ConversationType = 'direct' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatar?: string;
  description?: string;
  created_by: string;
  is_pinned: number;
  is_muted: number;
  is_archived: number;
  is_deleted: number;
  last_message_id?: string;
  last_message_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateConversationInput {
  id: string;
  type: ConversationType;
  name?: string;
  avatar?: string;
  description?: string;
  created_by: string;
}

export interface UpdateConversationInput {
  name?: string;
  avatar?: string;
  description?: string;
  is_pinned?: number;
  is_muted?: number;
  is_archived?: number;
  last_message_id?: string;
  last_message_at?: Date;
}

// ============================================
// CONVERSATION MEMBER TYPES
// ============================================

export type MemberRole = 'member' | 'admin' | 'owner';

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MemberRole;
  last_read_at?: Date;
  last_read_message_id?: string;
  joined_at: Date;
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateConversationMemberInput {
  id: string;
  conversation_id: string;
  user_id: string;
  role?: MemberRole;
}

export interface UpdateConversationMemberInput {
  role?: MemberRole;
  last_read_at?: Date;
  last_read_message_id?: string;
}

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  content: string;
  reply_to_id?: string;
  is_edited: number;
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMessageInput {
  id: string;
  conversation_id: string;
  sender_id: string;
  type?: MessageType;
  content: string;
  reply_to_id?: string;
}

export interface UpdateMessageInput {
  content?: string;
  is_edited?: number;
}

// ============================================
// MESSAGE REACTION TYPES
// ============================================

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  is_deleted: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMessageReactionInput {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

// ============================================
// MESSAGE ATTACHMENT TYPES
// ============================================

export type AttachmentType = 'image' | 'file' | 'audio' | 'video';

export interface MessageAttachment {
  id: string;
  message_id: string;
  type: AttachmentType;
  url: string;
  name?: string;
  size?: number;
  mime_type?: string;
  is_deleted: number;
  created_at: Date;
}

export interface CreateMessageAttachmentInput {
  id: string;
  message_id: string;
  type: AttachmentType;
  url: string;
  name?: string;
  size?: number;
  mime_type?: string;
}

// ============================================
// TYPING INDICATOR TYPES
// ============================================

export interface TypingIndicator {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: number;
  updated_at: Date;
}

// ============================================
// SESSION TYPES
// ============================================

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  expires_at: Date;
  is_revoked: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSessionInput {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  expires_at: Date;
}

// ============================================
// QUERY TYPES
// ============================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}
