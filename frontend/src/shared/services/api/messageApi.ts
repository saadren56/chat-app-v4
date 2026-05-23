import { getApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { Message } from '../../../store/types';
import { PaginatedResponse } from './client';

const api = getApiClient();

export const messageApi = {
  async getMessages(
    conversationId: string,
    params?: { limit?: number; offset?: number; before?: string; after?: string }
  ): Promise<PaginatedResponse<Message>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.before) searchParams.set('before', params.before);
    if (params?.after) searchParams.set('after', params.after);

    const queryString = searchParams.toString();
    const url = `${API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)}${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<PaginatedResponse<Message>>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch messages');
    }
    return response.data;
  },

  async sendMessage(data: {
    conversationId: string;
    content: string;
    type?: 'text' | 'image' | 'file' | 'audio' | 'video';
    replyToId?: string;
  }): Promise<Message> {
    const response = await api.post<Message>(API_ENDPOINTS.MESSAGES.BASE, data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to send message');
    }
    return response.data;
  },

  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await api.patch<Message>(API_ENDPOINTS.MESSAGES.GET_BY_ID(messageId), { content });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to edit message');
    }
    return response.data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    const response = await api.delete(API_ENDPOINTS.MESSAGES.GET_BY_ID(messageId));
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete message');
    }
  },

  async addReaction(messageId: string, emoji: string): Promise<void> {
    const response = await api.post(`${API_ENDPOINTS.MESSAGES.GET_BY_ID(messageId)}/reactions`, { emoji });
    if (!response.success) {
      throw new Error(response.error || 'Failed to add reaction');
    }
  },

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    const response = await api.delete(`${API_ENDPOINTS.MESSAGES.GET_BY_ID(messageId)}/reactions`, {
      body: JSON.stringify({ emoji }),
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove reaction');
    }
  },
};
