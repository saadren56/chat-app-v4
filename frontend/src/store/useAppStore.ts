import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Message, Chat } from '../types';

interface AppStore {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  
  messages: Record<string, Message[]>;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      currentUser: {
        id: 'user-1',
        name: 'Alex Morgan',
        status: 'online',
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      
      chats: [
        {
          id: 'chat-1',
          name: 'Jessica Chen',
          type: 'direct',
          users: ['user-1', 'user-2'],
          unreadCount: 2,
          isPinned: true,
          lastMessage: {
            id: 'msg-1',
            text: 'That looks amazing! 🚀',
            timestamp: new Date(Date.now() - 60000),
            senderId: 'user-2',
            isRead: false,
          },
        },
        {
          id: 'chat-2',
          name: 'Design Team',
          type: 'group',
          users: ['user-1', 'user-3', 'user-4', 'user-5'],
          unreadCount: 5,
          lastMessage: {
            id: 'msg-2',
            text: 'Meeting at 3pm tomorrow',
            timestamp: new Date(Date.now() - 3600000),
            senderId: 'user-3',
            isRead: false,
          },
        },
        {
          id: 'chat-3',
          name: 'Marcus Johnson',
          type: 'direct',
          users: ['user-1', 'user-6'],
          unreadCount: 0,
          lastMessage: {
            id: 'msg-3',
            text: 'Thanks! Talk soon.',
            timestamp: new Date(Date.now() - 86400000),
            senderId: 'user-1',
            isRead: true,
          },
        },
      ],
      setChats: (chats) => set({ chats }),
      activeChatId: 'chat-1',
      setActiveChatId: (chatId) => set({ activeChatId: chatId }),
      
      messages: {
        'chat-1': [
          {
            id: 'msg-10',
            text: 'Hey! Check out this new design concept I\'ve been working on.',
            timestamp: new Date(Date.now() - 120000),
            senderId: 'user-1',
            isRead: true,
          },
          {
            id: 'msg-11',
            text: 'That looks amazing! 🚀',
            timestamp: new Date(Date.now() - 60000),
            senderId: 'user-2',
            isRead: false,
          },
        ],
        'chat-2': [
          {
            id: 'msg-20',
            text: 'Good morning team!',
            timestamp: new Date(Date.now() - 7200000),
            senderId: 'user-3',
            isRead: true,
          },
          {
            id: 'msg-21',
            text: 'Morning! Ready for the sprint review.',
            timestamp: new Date(Date.now() - 6800000),
            senderId: 'user-4',
            isRead: true,
          },
          {
            id: 'msg-22',
            text: 'Meeting at 3pm tomorrow',
            timestamp: new Date(Date.now() - 3600000),
            senderId: 'user-3',
            isRead: false,
          },
        ],
        'chat-3': [
          {
            id: 'msg-30',
            text: 'Hey Marcus, did you get the files?',
            timestamp: new Date(Date.now() - 172800000),
            senderId: 'user-1',
            isRead: true,
          },
          {
            id: 'msg-31',
            text: 'Yes, got them! Looks perfect.',
            timestamp: new Date(Date.now() - 90000000),
            senderId: 'user-6',
            isRead: true,
          },
          {
            id: 'msg-32',
            text: 'Thanks! Talk soon.',
            timestamp: new Date(Date.now() - 86400000),
            senderId: 'user-1',
            isRead: true,
          },
        ],
      },
      addMessage: (chatId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), message],
          },
        })),
      setMessages: (chatId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: messages,
          },
        })),
      
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
