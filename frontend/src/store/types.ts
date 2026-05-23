// ============================================
// USER TYPES
// ============================================

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  status: UserStatus;
  lastSeen?: Date;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friend extends User {
  isMutual: boolean;
  since: Date;
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
  created_by?: string;
  is_pinned?: boolean;
  is_muted?: boolean;
  is_archived?: boolean;
  last_message_id?: string;
  last_message_at?: Date;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  conversationId: string;
  conversation_id: string;
  senderId: string;
  sender_id: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  isEdited: boolean;
  is_edited: boolean;
  isDeleted: boolean;
  is_deleted: boolean;
  reactions?: Reaction[];
  attachments?: Attachment[];
  replyTo?: string;
  reply_to_id?: string;
  createdAt: Date;
  created_at: Date;
  updatedAt: Date;
  updated_at: Date;
}

export interface Reaction {
  id?: string;
  emoji: string;
  userIds: string[];
  user_id?: string;
  createdAt?: Date;
  created_at?: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  mime_type?: string;
}

// ============================================
// TYPING TYPES
// ============================================

export interface TypingState {
  [conversationId: string]: {
    [userId: string]: boolean;
  };
}

// ============================================
// THEME TYPES
// ============================================

export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeAccent = 'purple' | 'cyan' | 'pink' | 'gold' | 'emerald';

export interface ThemeState {
  mode: ThemeMode;
  accent: ThemeAccent;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | 'message'
  | 'friend_request'
  | 'friend_accepted'
  | 'user_joined'
  | 'mention'
  | 'reaction';

export interface Notification {
  id: string;
  type: NotificationType;
  userId?: string;
  conversationId?: string;
  messageId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

// ============================================
// LOADING/ERROR STATES
// ============================================

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// ============================================
// STORE STATE INTERFACES
// ============================================

export interface UserState {
  currentUser: User | null;
  userLoading: boolean;
  userError: string | null;
  setCurrentUser: (user: User | null) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  clearCurrentUser: () => void;
  setUserLoading: (loading: boolean) => void;
  setUserError: (error: string | null) => void;
}

export interface FriendsState {
  friends: Friend[];
  pendingRequests: Friend[];
  sentRequests: Friend[];
  friendsLoading: boolean;
  friendsError: string | null;
  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateFriend: (friendId: string, updates: Partial<Friend>) => void;
  setPendingRequests: (requests: Friend[]) => void;
  setSentRequests: (requests: Friend[]) => void;
  setFriendsLoading: (loading: boolean) => void;
  setFriendsError: (error: string | null) => void;
}

export interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
  conversationsLoading: boolean;
  conversationsError: string | null;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  removeConversation: (conversationId: string) => void;
  setActiveConversationId: (id: string | null) => void;
  pinConversation: (conversationId: string) => void;
  unpinConversation: (conversationId: string) => void;
  markAsRead: (conversationId: string, messageId?: string) => void;
  setConversationsLoading: (loading: boolean) => void;
  setConversationsError: (error: string | null) => void;
}

export interface MessagesState {
  messages: Record<string, Message[]>;
  messagesLoading: Record<string, boolean>;
  messagesError: Record<string, string | null>;
  hasMoreMessages: Record<string, boolean>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  clearMessages: (conversationId: string) => void;
  addReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => void;
  removeReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => void;
  setMessagesLoading: (conversationId: string, loading: boolean) => void;
  setMessagesError: (conversationId: string, error: string | null) => void;
  setHasMoreMessages: (conversationId: string, hasMore: boolean) => void;
}

export interface TypingStateSlice {
  typingStates: TypingState;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  clearTyping: (conversationId: string) => void;
  getTypingUsers: (conversationId: string) => string[];
}

export interface ThemeStateSlice {
  theme: ThemeState;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeAccent: (accent: ThemeAccent) => void;
  toggleThemeMode: () => void;
}

export interface OnlineUsersState {
  onlineUserIds: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  isUserOnline: (userId: string) => boolean;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

export interface AppState
  extends UserState,
    FriendsState,
    ConversationsState,
    MessagesState,
    TypingStateSlice,
    ThemeStateSlice,
    OnlineUsersState,
    NotificationsState {
  resetStore: () => void;
}
