import { io, Socket } from 'socket.io-client';
import {
  SocketUser,
  SocketMessage,
  SocketReaction,
  TypingUser,
  SocketStatus,
  SocketEvents,
  SocketEmitEvents,
  SocketEventNames,
  MessageReadData,
  ConversationUpdateData,
  MemberChangeData,
} from './types';

type TypedSocket = Socket<SocketEvents, SocketEmitEvents>;

export class SocketService {
  private socket: TypedSocket | null = null;
  private status: SocketStatus = {
    connected: false,
    authenticated: false,
    reconnecting: false,
    reconnectAttempts: 0,
  };
  private currentUser: SocketUser | null = null;
  private joinedConversations: Set<string> = new Set();
  private typingTimeout: Map<string, NodeJS.Timeout> = new Map();
  private eventHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor(private url: string = 'http://localhost:3001') {}

  getStatus(): SocketStatus {
    return { ...this.status };
  }

  getCurrentUser(): SocketUser | null {
    return this.currentUser;
  }

  isConnected(): boolean {
    return this.status.connected;
  }

  isAuthenticated(): boolean {
    return this.status.authenticated;
  }

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    }) as TypedSocket;

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.status = {
      connected: false,
      authenticated: false,
      reconnecting: false,
      reconnectAttempts: 0,
    };
    this.currentUser = null;
    this.joinedConversations.clear();
    this.typingTimeout.forEach(timeout => clearTimeout(timeout));
    this.typingTimeout.clear();
  }

  authenticate(token: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(SocketEventNames.CLIENT.AUTH_AUTHENTICATE, { token });
  }

  sendMessage(
    conversationId: string,
    content: string,
    type?: SocketMessage['type'],
    replyToId?: string
  ): void {
    if (!this.socket || !this.status.authenticated) return;
    this.socket.emit(SocketEventNames.CLIENT.MESSAGE_SEND, {
      conversationId,
      content,
      type: type || 'text',
      replyToId,
    });
  }

  editMessage(messageId: string, content: string): void {
    if (!this.socket || !this.status.authenticated) return;
    this.socket.emit(SocketEventNames.CLIENT.MESSAGE_EDIT, { messageId, content });
  }

  deleteMessage(messageId: string): void {
    if (!this.socket || !this.status.authenticated) return;
    this.socket.emit(SocketEventNames.CLIENT.MESSAGE_DELETE, { messageId });
  }

  markMessageRead(conversationId: string, messageId: string): void {
    if (!this.socket || !this.status.authenticated) return;
    this.socket.emit(SocketEventNames.CLIENT.MESSAGE_READ, { conversationId, messageId });
  }

  addReaction(messageId: string, emoji: string): void {
    if (!this.socket || !this.status.authenticated) return;
    this.socket.emit(SocketEventNames.CLIENT.REACTION_ADD, { messageId, emoji });
  }

  removeReaction(messageId: string, emoji: string): void {
    if (!this.socket || !this.status.authenticated) return;
    this.socket.emit(SocketEventNames.CLIENT.REACTION_REMOVE, { messageId, emoji });
  }

  startTyping(conversationId: string): void {
    if (!this.socket || !this.status.authenticated) return;
    
    this.socket.emit(SocketEventNames.CLIENT.TYPING_START, { conversationId });
    
    const existingTimeout = this.typingTimeout.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeout = setTimeout(() => {
      this.stopTyping(conversationId);
    }, 3000);
    
    this.typingTimeout.set(conversationId, timeout);
  }

  stopTyping(conversationId: string): void {
    if (!this.socket || !this.status.authenticated) return;
    
    const timeout = this.typingTimeout.get(conversationId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeout.delete(conversationId);
    }
    
    this.socket.emit(SocketEventNames.CLIENT.TYPING_STOP, { conversationId });
  }

  joinConversation(conversationId: string): void {
    if (!this.socket || !this.status.authenticated) return;
    if (this.joinedConversations.has(conversationId)) return;
    
    this.socket.emit(SocketEventNames.CLIENT.CONVERSATION_JOIN, { conversationId });
    this.joinedConversations.add(conversationId);
  }

  leaveConversation(conversationId: string): void {
    if (!this.socket || !this.status.authenticated) return;
    if (!this.joinedConversations.has(conversationId)) return;
    
    this.socket.emit(SocketEventNames.CLIENT.CONVERSATION_LEAVE, { conversationId });
    this.joinedConversations.delete(conversationId);
  }

  updatePresenceStatus(status: SocketUser['status']): void {
    if (!this.socket || !this.status.authenticated) return;
    this.socket.emit(SocketEventNames.CLIENT.PRESENCE_STATUS, { status });
  }

  on<T extends keyof SocketEvents>(
    event: T,
    handler: SocketEvents[T]
  ): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    
    if (this.socket) {
      this.socket.on(event, handler as any);
    }
    
    return () => this.off(event, handler);
  }

  off<T extends keyof SocketEvents>(
    event: T,
    handler: SocketEvents[T]
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
    
    if (this.socket) {
      this.socket.off(event, handler as any);
    }
  }

  once<T extends keyof SocketEvents>(
    event: T,
    handler: SocketEvents[T]
  ): void {
    if (this.socket) {
      this.socket.once(event, handler as any);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on(SocketEventNames.SYSTEM.CONNECT, () => {
      this.status.connected = true;
      this.status.reconnecting = false;
      this.status.reconnectAttempts = 0;
      this.emit('connect');
      console.log('✅ Socket connected');
    });

    this.socket.on(SocketEventNames.SYSTEM.DISCONNECT, (reason) => {
      this.status.connected = false;
      this.status.authenticated = false;
      this.emit('disconnect', reason);
      console.log(`🔌 Socket disconnected: ${reason}`);
    });

    this.socket.on(SocketEventNames.SYSTEM.RECONNECTING, (attempt) => {
      this.status.reconnecting = true;
      this.status.reconnectAttempts = attempt;
      this.emit('reconnecting', attempt);
      console.log(`🔄 Reconnecting... (attempt ${attempt})`);
    });

    this.socket.on(SocketEventNames.SYSTEM.RECONNECT, (attempt) => {
      this.status.connected = true;
      this.status.reconnecting = false;
      this.status.reconnectAttempts = 0;
      this.emit('reconnect', attempt);
      console.log(`✅ Reconnected after ${attempt} attempts`);
    });

    this.socket.on(SocketEventNames.SYSTEM.RECONNECT_ERROR, (error) => {
      this.emit('reconnect_error', error);
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on(SocketEventNames.SYSTEM.RECONNECT_FAILED, () => {
      this.status.reconnecting = false;
      this.emit('reconnect_failed');
      console.error('❌ Reconnection failed');
    });

    this.socket.on(SocketEventNames.SERVER.AUTH_AUTHENTICATED, (data) => {
      this.status.authenticated = true;
      this.currentUser = data.user;
      this.emit('auth:authenticated', data);
      console.log(`✅ Authenticated as ${data.user.username}`);
    });

    this.socket.on(SocketEventNames.SERVER.AUTH_ERROR, (data) => {
      this.status.authenticated = false;
      this.emit('auth:error', data);
      console.error('❌ Authentication error:', data.error);
    });

    this.socket.on(SocketEventNames.SERVER.ERROR, (data) => {
      this.emit('error', data);
      console.error('❌ Socket error:', data.message);
    });
  }

  private emit<T extends keyof SocketEvents>(
    event: T,
    ...args: Parameters<SocketEvents[T]>
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        (handler as any)(...args);
      });
    }
  }
}

let socketServiceInstance: SocketService | null = null;

export function getSocketService(url?: string): SocketService {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService(url);
  }
  return socketServiceInstance;
}

export default SocketService;
