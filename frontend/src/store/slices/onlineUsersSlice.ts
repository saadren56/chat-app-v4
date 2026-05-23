import { StateCreator } from 'zustand';
import { OnlineUsersState } from '../types';

export const createOnlineUsersSlice: StateCreator<OnlineUsersState> = (set, get) => ({
  onlineUserIds: new Set(),

  setOnlineUsers: (userIds: string[]) => {
    set({ onlineUserIds: new Set(userIds) });
  },

  addOnlineUser: (userId: string) => {
    const { onlineUserIds } = get();
    const newSet = new Set(onlineUserIds);
    newSet.add(userId);
    set({ onlineUserIds: newSet });
  },

  removeOnlineUser: (userId: string) => {
    const { onlineUserIds } = get();
    const newSet = new Set(onlineUserIds);
    newSet.delete(userId);
    set({ onlineUserIds: newSet });
  },

  isUserOnline: (userId: string) => {
    const { onlineUserIds } = get();
    return onlineUserIds.has(userId);
  },
});
