import { StateCreator } from 'zustand';
import { Notification, NotificationsState } from '../types';

export const createNotificationsSlice: StateCreator<NotificationsState> = (set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications: Notification[]) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },

  addNotification: (notification: Notification) => {
    const { notifications } = get();
    const newNotifications = [notification, ...notifications];
    set({
      notifications: newNotifications,
      unreadCount: newNotifications.filter((n) => !n.isRead).length,
    });
  },

  markNotificationAsRead: (notificationId: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    set({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });
  },

  removeNotification: (notificationId: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
    set({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
    });
  },

  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
});
