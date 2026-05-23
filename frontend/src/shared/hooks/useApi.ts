import { useCallback, useState } from 'react';
import {
  useStoreActions,
  useConversationsLoading,
  useConversationsError,
  useMessagesLoading,
  useMessagesError,
  useHasMoreMessages,
} from '../../store';
import { conversationApi, messageApi } from '../services/api';
import { Message, Conversation } from '../../store/types';

export function useConversationsApi() {
  const { setConversations, setConversationsLoading, setConversationsError } = useStoreActions();
  const loading = useConversationsLoading();
  const error = useConversationsError();

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      setConversationsError(null);
      
      const conversations = await conversationApi.getConversations();
      const transformedConversations: Conversation[] = conversations.map(conv => ({
        ...conv,
        isPinned: conv.isPinned ?? conv.is_pinned,
        isMuted: conv.isMuted ?? conv.is_muted,
        isArchived: conv.isArchived ?? conv.is_archived,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
      }));
      
      setConversations(transformedConversations);
    } catch (err) {
      setConversationsError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, [setConversations, setConversationsLoading, setConversationsError]);

  return {
    fetchConversations,
    loading,
    error,
  };
}

export function useMessagesApi(conversationId: string) {
  const { 
    setMessages, 
    setMessagesLoading, 
    setMessagesError,
    setHasMoreMessages,
  } = useStoreActions();
  const loading = useMessagesLoading(conversationId);
  const error = useMessagesError(conversationId);
  const hasMore = useHasMoreMessages(conversationId);

  const fetchMessages = useCallback(async (
    options?: { limit?: number; offset?: number; before?: string; after?: string; append?: boolean }
  ) => {
    if (!conversationId) return;

    try {
      setMessagesLoading(conversationId, true);
      setMessagesError(conversationId, null);
      
      const result = await messageApi.getMessages(conversationId, options);
      
      const transformedMessages: Message[] = result.data.map(msg => ({
        ...msg,
        conversationId: msg.conversationId ?? msg.conversation_id,
        senderId: msg.senderId ?? msg.sender_id,
        isEdited: msg.isEdited ?? msg.is_edited,
        isDeleted: msg.isDeleted ?? msg.is_deleted,
        replyTo: msg.replyTo ?? msg.reply_to_id,
        createdAt: new Date(msg.createdAt ?? msg.created_at),
        updatedAt: new Date(msg.updatedAt ?? msg.updated_at),
        status: 'sent' as const,
      }));
      
      if (options?.append) {
        const currentStore = useStoreActions.getState();
        const existing = currentStore.messages[conversationId] || [];
        setMessages(conversationId, [...transformedMessages, ...existing]);
      } else {
        setMessages(conversationId, transformedMessages);
      }
      
      setHasMoreMessages(conversationId, result.pagination.hasMore);
    } catch (err) {
      setMessagesError(conversationId, err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setMessagesLoading(conversationId, false);
    }
  }, [conversationId, setMessages, setMessagesLoading, setMessagesError, setHasMoreMessages]);

  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || loading) return;
    
    const currentStore = useStoreActions.getState();
    const messages = currentStore.messages[conversationId] || [];
    const oldestMessage = messages[0];
    
    if (oldestMessage) {
      await fetchMessages({
        before: oldestMessage.createdAt.toISOString(),
        append: true,
      });
    }
  }, [conversationId, hasMore, loading, fetchMessages]);

  return {
    fetchMessages,
    loadMore,
    loading,
    error,
    hasMore,
  };
}
