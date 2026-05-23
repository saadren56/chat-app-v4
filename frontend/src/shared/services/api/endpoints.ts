export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  USERS: {
    BASE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    SEARCH: '/users/search',
    PROFILE: '/users/profile',
  },
  
  CONVERSATIONS: {
    BASE: '/conversations',
    GET_BY_ID: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
    MEMBERS: (id: string) => `/conversations/${id}/members`,
  },
  
  MESSAGES: {
    BASE: '/messages',
    GET_BY_ID: (id: string) => `/messages/${id}`,
    REACT: (id: string) => `/messages/${id}/react`,
  },
} as const;
