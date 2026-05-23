import { StateCreator } from 'zustand';
import { Message, MessagesState, Reaction } from '../types';

export const createMessagesSlice: StateCreator<MessagesState> = (set, get) => ({
  messages: {},
  messagesLoading: {},
  messagesError: {},
  hasMoreMessages: {},

  setMessages: (conversationId: string, messages: Message[]) => {
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    }));
  },

  addMessage: (conversationId: string, message: Message) => {
    const { messages } = get();
    const existingMessages = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: [...existingMessages, message],
      },
    });
  },

  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ) => {
    const { messages } = get();
    const conversationMessages = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: conversationMessages.map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    });
  },

  removeMessage: (conversationId: string, messageId: string) => {
    const { messages } = get();
    const conversationMessages = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: conversationMessages.filter((m) => m.id !== messageId),
      },
    });
  },

  clearMessages: (conversationId: string) => {
    const { messages } = get();
    const newMessages = { ...messages };
    delete newMessages[conversationId];
    set({ messages: newMessages });
  },

  addReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => {
    const { messages } = get();
    const conversationMessages = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: conversationMessages.map((m) => {
          if (m.id !== messageId) return m;
          
          const reactions = m.reactions || [];
          const existingReaction = reactions.find((r) => r.emoji === emoji);
          
          let updatedReactions: Reaction[];
          if (existingReaction) {
            if (!existingReaction.userIds.includes(userId)) {
              updatedReactions = reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, userIds: [...r.userIds, userId] }
                  : r
              );
            } else {
              updatedReactions = reactions;
            }
          } else {
            updatedReactions = [...reactions, { emoji, userIds: [userId] }];
          }
          
          return { ...m, reactions: updatedReactions };
        }),
      },
    });
  },

  removeReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => {
    const { messages } = get();
    const conversationMessages = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: conversationMessages.map((m) => {
          if (m.id !== messageId) return m;
          
          const reactions = m.reactions || [];
          const updatedReactions = reactions
            .map((r) =>
              r.emoji === emoji
                ? { ...r, userIds: r.userIds.filter((id) => id !== userId) }
                : r
            )
            .filter((r) => r.userIds.length > 0);
          
          return { ...m, reactions: updatedReactions };
        }),
      },
    });
  },

  setMessagesLoading: (conversationId: string, loading: boolean) => {
    set((state) => ({
      messagesLoading: { ...state.messagesLoading, [conversationId]: loading },
    }));
  },

  setMessagesError: (conversationId: string, error: string | null) => {
    set((state) => ({
      messagesError: { ...state.messagesError, [conversationId]: error },
    }));
  },

  setHasMoreMessages: (conversationId: string, hasMore: boolean) => {
    set((state) => ({
      hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: hasMore },
    }));
  },
});
