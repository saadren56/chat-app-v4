import { StateCreator } from 'zustand';
import { User, UserState } from '../types';

export const createUserSlice: StateCreator<UserState> = (set, get) => ({
  currentUser: null,
  userLoading: false,
  userError: null,

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user });
  },

  updateCurrentUser: (updates: Partial<User>) => {
    const { currentUser } = get();
    if (currentUser) {
      set({ currentUser: { ...currentUser, ...updates } });
    }
  },

  clearCurrentUser: () => {
    set({ currentUser: null });
  },

  setUserLoading: (loading: boolean) => {
    set({ userLoading: loading });
  },

  setUserError: (error: string | null) => {
    set({ userError: error });
  },
});
