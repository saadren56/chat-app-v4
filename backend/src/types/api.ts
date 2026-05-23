export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: number;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  avatar?: string;
}

export interface SendMessageRequest {
  content: string;
  conversationId: string;
  type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  replyToId?: string;
}

export interface CreateConversationRequest {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
  avatar?: string;
  description?: string;
}
