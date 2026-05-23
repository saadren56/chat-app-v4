export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  type: 'direct' | 'group';
  users: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
}

export interface Theme {
  mode: 'dark' | 'light';
}
