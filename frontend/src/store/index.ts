import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import { AppState } from './types';
import { createUserSlice } from './slices/userSlice';
import { createFriendsSlice } from './slices/friendsSlice';
import { createConversationsSlice } from './slices/conversationsSlice';
import { createMessagesSlice } from './slices/messagesSlice';
import { createTypingSlice } from './slices/typingSlice';
import { createThemeSlice } from './slices/themeSlice';
import { createOnlineUsersSlice } from './slices/onlineUsersSlice';
import { createNotificationsSlice } from './slices/notificationsSlice';

const STORAGE_KEY = 'cyberchat-store';

const PERSIST_PATHS = [
  'theme',
] as const;

type PersistPath = (typeof PERSIST_PATHS)[number];

const initialState = {
  currentUser: null,
  userLoading: false,
  userError: null,
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  friendsLoading: false,
  friendsError: null,
  conversations: [],
  activeConversationId: null,
  conversationsLoading: false,
  conversationsError: null,
  messages: {},
  messagesLoading: {},
  messagesError: {},
  hasMoreMessages: {},
  typingStates: {},
  theme: {
    mode: 'dark',
    accent: 'purple',
  },
  onlineUserIds: new Set(),
  notifications: [],
  unreadCount: 0,
};

export const useAppStore = create<AppState>()(
  immer(
    persist(
      (set, get, store) => ({
        ...initialState,
        ...createUserSlice(set, get, store),
        ...createFriendsSlice(set, get, store),
        ...createConversationsSlice(set, get, store),
        ...createMessagesSlice(set, get, store),
        ...createTypingSlice(set, get, store),
        ...createThemeSlice(set, get, store),
        ...createOnlineUsersSlice(set, get, store),
        ...createNotificationsSlice(set, get, store),
        
        resetStore: () => {
          const { theme } = get();
          set({
            ...initialState,
            theme,
          });
        },
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => {
          const partial: Partial<AppState> = {};
          PERSIST_PATHS.forEach((path) => {
            (partial as any)[path] = (state as any)[path];
          });
          return partial;
        },
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error('Failed to rehydrate store:', error);
            } else if (state) {
              if (state.theme.mode === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (state.theme.mode === 'light') {
                document.documentElement.classList.remove('dark');
              } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }
            }
          };
        },
      }
    )
  )
);

// ============================================
// SELECTORS
// ============================================

export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useUserLoading = () => useAppStore((state) => state.userLoading);
export const useUserError = () => useAppStore((state) => state.userError);
export const useSetCurrentUser = () => useAppStore((state) => state.setCurrentUser);
export const useUpdateCurrentUser = () => useAppStore((state) => state.updateCurrentUser);

export const useFriends = () => useAppStore((state) => state.friends);
export const usePendingRequests = () => useAppStore((state) => state.pendingRequests);
export const useSentRequests = () => useAppStore((state) => state.sentRequests);
export const useFriendsLoading = () => useAppStore((state) => state.friendsLoading);
export const useFriendsError = () => useAppStore((state) => state.friendsError);

export const useConversations = () => useAppStore((state) => state.conversations);
export const useActiveConversationId = () => useAppStore((state) => state.activeConversationId);
export const useActiveConversation = () => {
  const conversations = useConversations();
  const activeId = useActiveConversationId();
  return conversations.find((c) => c.id === activeId) || null;
};
export const useConversationsLoading = () => useAppStore((state) => state.conversationsLoading);
export const useConversationsError = () => useAppStore((state) => state.conversationsError);
export const usePinnedConversations = () =>
  useAppStore((state) => state.conversations.filter((c) => c.isPinned || c.is_pinned));
export const useUnpinnedConversations = () =>
  useAppStore((state) => state.conversations.filter((c) => !(c.isPinned || c.is_pinned) && !(c.isArchived || c.is_archived)));
export const useTotalUnreadCount = () =>
  useAppStore((state) =>
    state.conversations.reduce((total, c) => total + c.unreadCount, 0)
  );

export const useMessages = (conversationId: string) =>
  useAppStore((state) => state.messages[conversationId] || []);
export const useAllMessages = () => useAppStore((state) => state.messages);
export const useMessagesLoading = (conversationId: string) =>
  useAppStore((state) => state.messagesLoading[conversationId] || false);
export const useMessagesError = (conversationId: string) =>
  useAppStore((state) => state.messagesError[conversationId] || null);
export const useHasMoreMessages = (conversationId: string) =>
  useAppStore((state) => state.hasMoreMessages[conversationId] || false);

export const useTypingUsers = (conversationId: string) =>
  useAppStore((state) => state.getTypingUsers(conversationId));
export const useTypingStates = () => useAppStore((state) => state.typingStates);

export const useTheme = () => useAppStore((state) => state.theme);
export const useThemeMode = () => useAppStore((state) => state.theme.mode);
export const useThemeAccent = () => useAppStore((state) => state.theme.accent);
export const useSetThemeMode = () => useAppStore((state) => state.setThemeMode);
export const useToggleThemeMode = () => useAppStore((state) => state.toggleThemeMode);

export const useOnlineUserIds = () => useAppStore((state) => Array.from(state.onlineUserIds));
export const useIsUserOnline = (userId: string) =>
  useAppStore((state) => state.isUserOnline(userId));

export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadNotificationsCount = () =>
  useAppStore((state) => state.unreadCount);

// ============================================
// BATCH SELECTORS (for multiple values)
// ============================================

export const useChatContext = () =>
  useAppStore(
    (state) => ({
      currentUser: state.currentUser,
      activeConversationId: state.activeConversationId,
      conversations: state.conversations,
    }),
    shallow
  );

export const useThemeContext = () =>
  useAppStore(
    (state) => ({
      theme: state.theme,
      setThemeMode: state.setThemeMode,
      setThemeAccent: state.setThemeAccent,
      toggleThemeMode: state.toggleThemeMode,
    }),
    shallow
  );

export const useAuthContext = () =>
  useAppStore(
    (state) => ({
      currentUser: state.currentUser,
      setCurrentUser: state.setCurrentUser,
      updateCurrentUser: state.updateCurrentUser,
      clearCurrentUser: state.clearCurrentUser,
    }),
    shallow
  );

// ============================================
// ACTIONS (for batch operations)
// ============================================

export const useStoreActions = () =>
  useAppStore(
    (state) => ({
      setCurrentUser: state.setCurrentUser,
      updateCurrentUser: state.updateCurrentUser,
      clearCurrentUser: state.clearCurrentUser,
      setUserLoading: state.setUserLoading,
      setUserError: state.setUserError,
      
      setFriends: state.setFriends,
      addFriend: state.addFriend,
      removeFriend: state.removeFriend,
      setFriendsLoading: state.setFriendsLoading,
      setFriendsError: state.setFriendsError,
      
      setConversations: state.setConversations,
      addConversation: state.addConversation,
      updateConversation: state.updateConversation,
      removeConversation: state.removeConversation,
      setActiveConversationId: state.setActiveConversationId,
      pinConversation: state.pinConversation,
      unpinConversation: state.unpinConversation,
      markAsRead: state.markAsRead,
      setConversationsLoading: state.setConversationsLoading,
      setConversationsError: state.setConversationsError,
      
      setMessages: state.setMessages,
      addMessage: state.addMessage,
      updateMessage: state.updateMessage,
      removeMessage: state.removeMessage,
      addReaction: state.addReaction,
      removeReaction: state.removeReaction,
      setMessagesLoading: state.setMessagesLoading,
      setMessagesError: state.setMessagesError,
      setHasMoreMessages: state.setHasMoreMessages,
      
      setTyping: state.setTyping,
      clearTyping: state.clearTyping,
      
      setThemeMode: state.setThemeMode,
      setThemeAccent: state.setThemeAccent,
      toggleThemeMode: state.toggleThemeMode,
      
      setOnlineUsers: state.setOnlineUsers,
      addOnlineUser: state.addOnlineUser,
      removeOnlineUser: state.removeOnlineUser,
      
      setNotifications: state.setNotifications,
      addNotification: state.addNotification,
      markNotificationAsRead: state.markNotificationAsRead,
      markAllAsRead: state.markAllAsRead,
      removeNotification: state.removeNotification,
      clearAllNotifications: state.clearAllNotifications,
      
      resetStore: state.resetStore,
    }),
    shallow
  );

// ============================================
// STORE UTILITIES
// ============================================

export const getAppStore = () => useAppStore.getState();
export const subscribeToStore = useAppStore.subscribe;
