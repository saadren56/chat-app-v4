export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const APP_NAME = 'CyberChat';
export const APP_VERSION = '1.0.0';

export const MESSAGES_PER_PAGE = 50;
export const CONVERSATIONS_PER_PAGE = 20;

export const TYPING_DEBOUNCE_MS = 1000;
export const TYPING_TIMEOUT_MS = 3000;

export const STORAGE_KEYS = {
  THEME: 'cyberchat-theme',
  AUTH_TOKEN: 'cyberchat-auth-token',
  USER: 'cyberchat-user',
} as const;

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1280,
} as const;
