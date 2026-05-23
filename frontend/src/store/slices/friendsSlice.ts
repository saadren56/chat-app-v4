import { StateCreator } from 'zustand';
import { Friend, FriendsState } from '../types';

export const createFriendsSlice: StateCreator<FriendsState> = (set, get) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],

  setFriends: (friends: Friend[]) => {
    set({ friends });
  },

  addFriend: (friend: Friend) => {
    const { friends } = get();
    if (!friends.find((f) => f.id === friend.id)) {
      set({ friends: [...friends, friend] });
    }
  },

  removeFriend: (friendId: string) => {
    const { friends } = get();
    set({ friends: friends.filter((f) => f.id !== friendId) });
  },

  updateFriend: (friendId: string, updates: Partial<Friend>) => {
    const { friends } = get();
    set({
      friends: friends.map((f) =>
        f.id === friendId ? { ...f, ...updates } : f
      ),
    });
  },

  setPendingRequests: (requests: Friend[]) => {
    set({ pendingRequests: requests });
  },

  setSentRequests: (requests: Friend[]) => {
    set({ sentRequests: requests });
  },
});
