import { create } from 'zustand';
import {
  SocketService,
  SocketUser,
  SocketMessage,
  SocketReaction,
  TypingUser,
  SocketStatus,
  MessageReadData,
} from '../../lib/socket';

interface SocketState {
  socketService: SocketService | null;
  status: SocketStatus;
  currentUser: SocketUser | null;
  connected: boolean;
  authenticated: boolean;
  onlineUsers: Map<string, SocketUser>;
  typingUsers: Map<string, Set<string>>;
  lastReadMessages: Map<string, string>;
  
  initialize: (url?: string) => void;
  connect: () => void;
  disconnect: () => void;
  authenticate: (token: string) => void;
  setStatus: (status: Partial<SocketStatus>) => void;
  setCurrentUser: (user: SocketUser | null) => void;
  setConnected: (connected: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  
  addOnlineUser: (userId: string, user?: SocketUser) => void;
  removeOnlineUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: SocketUser['status']) => void;
  
  addTypingUser: (conversationId: string, user: TypingUser) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  
  markMessageRead: (conversationId: string, messageId: string, readBy: string, readAt: Date) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socketService: null,
  status: {
    connected: false,
    authenticated: false,
    reconnecting: false,
    reconnectAttempts: 0,
  },
  currentUser: null,
  connected: false,
  authenticated: false,
  onlineUsers: new Map(),
  typingUsers: new Map(),
  lastReadMessages: new Map(),

  initialize: (url?: string) => {
    if (get().socketService) return;
    
    const socketService = new SocketService(url);
    set({ socketService });
  },

  connect: () => {
    const { socketService } = get();
    socketService?.connect();
  },

  disconnect: () => {
    const { socketService } = get();
    socketService?.disconnect();
    set({
      status: {
        connected: false,
        authenticated: false,
        reconnecting: false,
        reconnectAttempts: 0,
      },
      currentUser: null,
      connected: false,
      authenticated: false,
      onlineUsers: new Map(),
      typingUsers: new Map(),
    });
  },

  authenticate: (token: string) => {
    const { socketService } = get();
    socketService?.authenticate(token);
  },

  setStatus: (status) => {
    set((state) => ({
      status: { ...state.status, ...status },
    }));
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  setConnected: (connected) => {
    set({ connected });
  },

  setAuthenticated: (authenticated) => {
    set({ authenticated });
  },

  addOnlineUser: (userId, user) => {
    set((state) => {
      const newOnlineUsers = new Map(state.onlineUsers);
      if (user) {
        newOnlineUsers.set(userId, user);
      }
      return { onlineUsers: newOnlineUsers };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => {
      const newOnlineUsers = new Map(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    });
  },

  updateUserStatus: (userId, status) => {
    set((state) => {
      const newOnlineUsers = new Map(state.onlineUsers);
      const user = newOnlineUsers.get(userId);
      if (user) {
        newOnlineUsers.set(userId, { ...user, status });
      }
      return { onlineUsers: newOnlineUsers };
    });
  },

  addTypingUser: (conversationId, user) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      const users = newTypingUsers.get(conversationId) || new Set();
      users.add(user.userId);
      newTypingUsers.set(conversationId, users);
      return { typingUsers: newTypingUsers };
    });
  },

  removeTypingUser: (conversationId, userId) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      const users = newTypingUsers.get(conversationId);
      if (users) {
        users.delete(userId);
        if (users.size === 0) {
          newTypingUsers.delete(conversationId);
        } else {
          newTypingUsers.set(conversationId, users);
        }
      }
      return { typingUsers: newTypingUsers };
    });
  },

  markMessageRead: (conversationId, messageId, readBy, readAt) => {
    set((state) => {
      const newLastRead = new Map(state.lastReadMessages);
      newLastRead.set(conversationId, messageId);
      return { lastReadMessages: newLastRead };
    });
  },
}));

export function setupSocketListeners(): void {
  const store = useSocketStore.getState();
  const { socketService } = store;
  
  if (!socketService) return;

  socketService.on('connect', () => {
    store.setConnected(true);
    store.setStatus({ connected: true, reconnecting: false, reconnectAttempts: 0 });
  });

  socketService.on('disconnect', (reason) => {
    store.setConnected(false);
    store.setAuthenticated(false);
    store.setStatus({ connected: false, authenticated: false });
  });

  socketService.on('reconnecting', (attempt) => {
    store.setStatus({ reconnecting: true, reconnectAttempts: attempt });
  });

  socketService.on('reconnect', (attempt) => {
    store.setConnected(true);
    store.setStatus({ connected: true, reconnecting: false, reconnectAttempts: 0 });
  });

  socketService.on('auth:authenticated', (data) => {
    store.setAuthenticated(true);
    store.setCurrentUser(data.user);
    store.setStatus({ authenticated: true });
  });

  socketService.on('auth:error', () => {
    store.setAuthenticated(false);
    store.setStatus({ authenticated: false });
  });

  socketService.on('user:online', (data) => {
    if (data.user) {
      store.addOnlineUser(data.userId, data.user);
    }
  });

  socketService.on('user:offline', (data) => {
    store.removeOnlineUser(data.userId);
  });

  socketService.on('user:status', (data) => {
    store.updateUserStatus(data.userId, data.status);
  });

  socketService.on('typing:start', (data) => {
    store.addTypingUser(data.conversationId, data.user);
  });

  socketService.on('typing:stop', (data) => {
    store.removeTypingUser(data.conversationId, data.userId);
  });

  socketService.on('message:read', (data) => {
    store.markMessageRead(data.conversationId, data.messageId, data.readBy, data.readAt);
  });
}
