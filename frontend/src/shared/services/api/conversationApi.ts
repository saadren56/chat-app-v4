import { getApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { Conversation } from '../../../store/types';

const api = getApiClient();

export const conversationApi = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS.BASE);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch conversations');
    }
    return response.data || [];
  },

  async getConversation(id: string): Promise<Conversation> {
    const response = await api.get<Conversation>(API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(id));
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch conversation');
    }
    return response.data;
  },

  async createConversation(data: {
    type: 'direct' | 'group';
    participantIds: string[];
    name?: string;
    avatar?: string;
    description?: string;
  }): Promise<Conversation> {
    const response = await api.post<Conversation>(API_ENDPOINTS.CONVERSATIONS.BASE, data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create conversation');
    }
    return response.data;
  },

  async updateConversation(
    id: string,
    data: Partial<{ name: string; avatar: string; description: string }>
  ): Promise<Conversation> {
    const response = await api.patch<Conversation>(API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(id), data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update conversation');
    }
    return response.data;
  },

  async deleteConversation(id: string): Promise<void> {
    const response = await api.delete(API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(id));
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete conversation');
    }
  },

  async pinConversation(id: string): Promise<Conversation> {
    const response = await api.post<Conversation>(`${API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(id)}/pin`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to pin conversation');
    }
    return response.data;
  },

  async unpinConversation(id: string): Promise<Conversation> {
    const response = await api.post<Conversation>(`${API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(id)}/unpin`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to unpin conversation');
    }
    return response.data;
  },

  async markAsRead(id: string, messageId: string): Promise<void> {
    const response = await api.post(`${API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(id)}/mark-read`, { messageId });
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark as read');
    }
  },

  async addMember(conversationId: string, userId: string): Promise<void> {
    const response = await api.post(`${API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(conversationId)}/members`, { userId });
    if (!response.success) {
      throw new Error(response.error || 'Failed to add member');
    }
  },

  async removeMember(conversationId: string, userId: string): Promise<void> {
    const response = await api.delete(`${API_ENDPOINTS.CONVERSATIONS.GET_BY_ID(conversationId)}/members/${userId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove member');
    }
  },
};
