import { StateCreator } from 'zustand';
import { Conversation, ConversationsState } from '../types';

export const createConversationsSlice: StateCreator<ConversationsState> = (set, get) => ({
  conversations: [],
  activeConversationId: null,
  conversationsLoading: false,
  conversationsError: null,

  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  addConversation: (conversation: Conversation) => {
    const { conversations } = get();
    if (!conversations.find((c) => c.id === conversation.id)) {
      set({ conversations: [conversation, ...conversations] });
    }
  },

  updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
    const { conversations } = get();
    set({
      conversations: conversations.map((c) =>
        c.id === conversationId ? { ...c, ...updates } : c
      ),
    });
  },

  removeConversation: (conversationId: string) => {
    const { conversations, activeConversationId } = get();
    set({
      conversations: conversations.filter((c) => c.id !== conversationId),
      activeConversationId: activeConversationId === conversationId ? null : activeConversationId,
    });
  },

  setActiveConversationId: (id: string | null) => {
    set({ activeConversationId: id });
  },

  pinConversation: (conversationId: string) => {
    const { conversations } = get();
    set({
      conversations: conversations.map((c) =>
        c.id === conversationId ? { ...c, isPinned: true, is_pinned: true } : c
      ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)),
    });
  },

  unpinConversation: (conversationId: string) => {
    const { conversations } = get();
    set({
      conversations: conversations.map((c) =>
        c.id === conversationId ? { ...c, isPinned: false, is_pinned: false } : c
      ),
    });
  },

  markAsRead: (conversationId: string, messageId?: string) => {
    const { conversations } = get();
    set({
      conversations: conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    });
  },

  setConversationsLoading: (loading: boolean) => {
    set({ conversationsLoading: loading });
  },

  setConversationsError: (error: string | null) => {
    set({ conversationsError: error });
  },
});
