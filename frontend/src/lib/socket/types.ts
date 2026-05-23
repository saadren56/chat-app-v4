export interface SocketUser {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
}

export interface SocketMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  replyToId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender?: SocketUser;
}

export interface SocketReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  user?: SocketUser;
}

export interface TypingUser {
  userId: string;
  username: string;
  avatar?: string;
}

export interface ConversationUpdateData {
  conversationId: string;
  updates: {
    name?: string;
    avatar?: string;
    description?: string;
    isPinned?: boolean;
    isMuted?: boolean;
  };
  updatedBy: string;
}

export interface MemberChangeData {
  conversationId: string;
  member: SocketUser;
  addedBy: string;
}

export interface MessageReadData {
  conversationId: string;
  messageId: string;
  readBy: string;
  readAt: Date;
}

export interface SocketStatus {
  connected: boolean;
  authenticated: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
}

export interface SocketEvents {
  'auth:authenticated': (data: { user: SocketUser }) => void;
  'auth:error': (data: { error: string }) => void;
  
  'message:new': (data: { message: SocketMessage; conversationId: string }) => void;
  'message:edited': (data: { messageId: string; content: string; conversationId: string; editedAt: Date }) => void;
  'message:deleted': (data: { messageId: string; conversationId: string; deletedAt: Date }) => void;
  'message:read': (data: MessageReadData) => void;
  
  'reaction:added': (data: { reaction: SocketReaction; messageId: string; conversationId: string }) => void;
  'reaction:removed': (data: { messageId: string; userId: string; emoji: string; conversationId: string }) => void;
  
  'typing:start': (data: { conversationId: string; user: TypingUser }) => void;
  'typing:stop': (data: { conversationId: string; userId: string }) => void;
  
  'user:online': (data: { userId: string; user?: SocketUser }) => void;
  'user:offline': (data: { userId: string }) => void;
  'user:status': (data: { userId: string; status: SocketUser['status'] }) => void;
  
  'conversation:updated': (data: ConversationUpdateData) => void;
  'conversation:deleted': (data: { conversationId: string; deletedBy: string }) => void;
  'conversation:pinned': (data: { conversationId: string; pinnedBy: string }) => void;
  'conversation:unpinned': (data: { conversationId: string; unpinnedBy: string }) => void;
  
  'member:joined': (data: MemberChangeData) => void;
  'member:left': (data: { conversationId: string; memberId: string; leftBy: string }) => void;
  
  'error': (data: { message: string; code?: string }) => void;
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnecting': (attemptNumber: number) => void;
  'reconnect_error': (error: Error) => void;
  'reconnect_failed': () => void;
}

export interface SocketEmitEvents {
  'auth:authenticate': (data: { token: string }) => void;
  
  'message:send': (data: { conversationId: string; content: string; type?: SocketMessage['type']; replyToId?: string }) => void;
  'message:edit': (data: { messageId: string; content: string }) => void;
  'message:delete': (data: { messageId: string }) => void;
  'message:read': (data: { conversationId: string; messageId: string }) => void;
  
  'reaction:add': (data: { messageId: string; emoji: string }) => void;
  'reaction:remove': (data: { messageId: string; emoji: string }) => void;
  
  'typing:start': (data: { conversationId: string }) => void;
  'typing:stop': (data: { conversationId: string }) => void;
  
  'conversation:join': (data: { conversationId: string }) => void;
  'conversation:leave': (data: { conversationId: string }) => void;
  
  'presence:status': (data: { status: SocketUser['status'] }) => void;
}

export const SocketEventNames = {
  CLIENT: {
    AUTH_AUTHENTICATE: 'auth:authenticate',
    
    MESSAGE_SEND: 'message:send',
    MESSAGE_EDIT: 'message:edit',
    MESSAGE_DELETE: 'message:delete',
    MESSAGE_READ: 'message:read',
    
    REACTION_ADD: 'reaction:add',
    REACTION_REMOVE: 'reaction:remove',
    
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    
    CONVERSATION_JOIN: 'conversation:join',
    CONVERSATION_LEAVE: 'conversation:leave',
    
    PRESENCE_STATUS: 'presence:status',
  } as const,
  
  SERVER: {
    AUTH_AUTHENTICATED: 'auth:authenticated',
    AUTH_ERROR: 'auth:error',
    
    MESSAGE_NEW: 'message:new',
    MESSAGE_EDITED: 'message:edited',
    MESSAGE_DELETED: 'message:deleted',
    MESSAGE_READ: 'message:read',
    
    REACTION_ADDED: 'reaction:added',
    REACTION_REMOVED: 'reaction:removed',
    
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',
    USER_STATUS: 'user:status',
    
    CONVERSATION_UPDATED: 'conversation:updated',
    CONVERSATION_DELETED: 'conversation:deleted',
    CONVERSATION_PINNED: 'conversation:pinned',
    CONVERSATION_UNPINNED: 'conversation:unpinned',
    
    MEMBER_JOINED: 'member:joined',
    MEMBER_LEFT: 'member:left',
    
    ERROR: 'error',
  } as const,
  
  SYSTEM: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    RECONNECT: 'reconnect',
    RECONNECTING: 'reconnecting',
    RECONNECT_ERROR: 'reconnect_error',
    RECONNECT_FAILED: 'reconnect_failed',
  } as const,
} as const;
