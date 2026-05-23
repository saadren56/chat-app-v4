import { io, Socket } from 'socket.io-client';

interface SocketConfig {
  url: string;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  randomizationFactor: number;
  timeout: number;
  transports: ('websocket' | 'polling')[];
}

const DEFAULT_CONFIG: SocketConfig = {
  url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
  timeout: 20000,
  transports: ['websocket', 'polling'],
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface SocketServiceEvents {
  connect: () => void;
  disconnect: (reason: string) => void;
  reconnect: (attempt: number) => void;
  reconnect_attempt: (attempt: number) => void;
  reconnect_error: (error: Error) => void;
  reconnect_failed: () => void;
  error: (error: Error) => void;
  connect_error: (error: Error) => void;
}

export class SocketService {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private status: ConnectionStatus = 'disconnected';
  private eventHandlers = new Map<string, Set<(...args: any[]) => void>>();
  private reconnectAttempts = 0;
  private shouldReconnect = true;

  constructor(config: Partial<SocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.status = 'connecting';
      this.shouldReconnect = true;
      this.reconnectAttempts = 0;

      try {
        this.socket = io(this.config.url, {
          reconnection: this.config.reconnection,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
          reconnectionDelayMax: this.config.reconnectionDelayMax,
          randomizationFactor: this.config.randomizationFactor,
          timeout: this.config.timeout,
          transports: this.config.transports,
          autoConnect: true,
        });

        this.setupEventListeners();

        this.socket.once('connect', () => {
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.emit('connect');
          resolve();
        });

        this.socket.once('connect_error', (error) => {
          this.status = 'error';
          this.emit('connect_error', error);
          this.emit('error', error);
          reject(error);
        });
      } catch (error) {
        this.status = 'error';
        this.emit('error', error as Error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.status = 'disconnected';
    this.emit('disconnect', 'manual');
  }

  reconnect(): Promise<void> {
    this.disconnect();
    return this.connect();
  }

  authenticate(token: string): void {
    if (!this.socket) {
      console.warn('Socket not connected, cannot authenticate');
      return;
    }

    this.socket.emit('authenticate', { token });
  }

  emit<T = any>(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }

  on<T = any>(event: string, handler: (...args: any[]) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }

    return () => this.off(event, handler);
  }

  once<T = any>(event: string, handler: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.once(event, handler);
    }
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (handler) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (this.socket) {
          this.socket.off(event, handler);
        }
      }
    } else {
      this.eventHandlers.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  removeAllListeners(): void {
    this.eventHandlers.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('room:join', { roomId });
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('room:leave', { roomId });
    }
  }

  sendMessage(conversationId: string, content: string): void {
    if (this.socket) {
      this.socket.emit('message:send', { conversationId, content });
    }
  }

  startTyping(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  stopTyping(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getId(): string | undefined {
    return this.socket?.id;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.status = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason) => {
      this.status = this.shouldReconnect ? 'reconnecting' : 'disconnected';
      this.emit('disconnect', reason);
    });

    this.socket.on('reconnect', (attempt) => {
      this.status = 'connected';
      this.reconnectAttempts = 0;
      this.emit('reconnect', attempt);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      this.status = 'reconnecting';
      this.reconnectAttempts = attempt;
      this.emit('reconnect_attempt', attempt);
    });

    this.socket.on('reconnect_error', (error) => {
      this.status = 'error';
      this.emit('reconnect_error', error);
      this.emit('error', error);
    });

    this.socket.on('reconnect_failed', () => {
      this.status = 'error';
      this.emit('reconnect_failed');
    });

    this.socket.on('connect_error', (error) => {
      this.status = 'error';
      this.emit('connect_error', error);
      this.emit('error', error);
    });

    this.socket.on('error', (error) => {
      this.emit('error', error);
    });
  }
}

let socketServiceInstance: SocketService | null = null;

export function getSocketService(): SocketService {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService();
  }
  return socketServiceInstance;
}

export function resetSocketService(): void {
  if (socketServiceInstance) {
    socketServiceInstance.disconnect();
    socketServiceInstance = null;
  }
}
