import { StateCreator } from 'zustand';
import { TypingState, TypingStateSlice } from '../types';

export const createTypingSlice: StateCreator<TypingStateSlice> = (set, get) => ({
  typingStates: {},

  setTyping: (conversationId: string, userId: string, isTyping: boolean) => {
    const { typingStates } = get();
    set({
      typingStates: {
        ...typingStates,
        [conversationId]: {
          ...typingStates[conversationId],
          [userId]: isTyping,
        },
      },
    });
  },

  clearTyping: (conversationId: string) => {
    const { typingStates } = get();
    const newTypingStates = { ...typingStates };
    delete newTypingStates[conversationId];
    set({ typingStates: newTypingStates });
  },

  getTypingUsers: (conversationId: string) => {
    const { typingStates } = get();
    const conversationTyping = typingStates[conversationId] || {};
    return Object.entries(conversationTyping)
      .filter(([_, isTyping]) => isTyping)
      .map(([userId]) => userId);
  },
});
