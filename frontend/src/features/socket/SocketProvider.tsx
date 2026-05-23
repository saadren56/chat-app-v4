import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { useSocketStore } from '../../store/slices/socketSlice';
import { getAppStore, useStoreActions, useCurrentUser } from '../../store';
import { SocketMessage, SocketReaction, ConversationUpdateData, MemberChangeData } from '../../lib/socket';
import { getApiClient } from '../../shared/services/api';

interface SocketContextType {
  sendMessage: (conversationId: string, content: string, type?: any, replyToId?: string) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  markMessageRead: (conversationId: string, messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  updatePresenceStatus: (status: any) => void;
  connect: () => void;
  disconnect: () => void;
  authenticate: (token: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const {
    socketService,
    initialize,
    connect,
    disconnect,
    authenticate,
    addOnlineUser,
    removeOnlineUser,
    updateUserStatus,
    addTypingUser,
    removeTypingUser,
    markMessageRead: markReadInStore,
  } = useSocketStore();
  const {
    addMessage,
    updateMessage,
    removeMessage,
    addReaction: addReactionToStore,
    removeReaction: removeReactionFromStore,
    setTyping,
    addOnlineUser: addOnlineToAppStore,
    removeOnlineUser: removeOnlineFromAppStore,
    updateConversation,
    markAsRead,
  } = useStoreActions();
  const currentUser = useCurrentUser();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!socketService && !initializedRef.current) {
      initialize(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');
      initializedRef.current = true;
    }
  }, [socketService, initialize]);

  useEffect(() => {
    if (!socketService || !socketService.isConnected()) return;

    const unsubscribeNewMessage = socketService.on('message:new', handleNewMessage);
    const unsubscribeMessageEdited = socketService.on('message:edited', handleMessageEdited);
    const unsubscribeMessageDeleted = socketService.on('message:deleted', handleMessageDeleted);
    const unsubscribeMessageRead = socketService.on('message:read', handleMessageRead);
    const unsubscribeReactionAdded = socketService.on('reaction:added', handleReactionAdded);
    const unsubscribeReactionRemoved = socketService.on('reaction:removed', handleReactionRemoved);
    const unsubscribeTypingStart = socketService.on('typing:start', handleTypingStart);
    const unsubscribeTypingStop = socketService.on('typing:stop', handleTypingStop);
    const unsubscribeUserOnline = socketService.on('user:online', handleUserOnline);
    const unsubscribeUserOffline = socketService.on('user:offline', handleUserOffline);
    const unsubscribeUserStatus = socketService.on('user:status', handleUserStatus);
    const unsubscribeConversationUpdated = socketService.on('conversation:updated', handleConversationUpdated);
    const unsubscribeConversationDeleted = socketService.on('conversation:deleted', handleConversationDeleted);
    const unsubscribeMemberJoined = socketService.on('member:joined', handleMemberJoined);
    const unsubscribeMemberLeft = socketService.on('member:left', handleMemberLeft);
    const unsubscribeAuthAuthenticated = socketService.on('auth:authenticated', handleAuthAuthenticated);

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageEdited();
      unsubscribeMessageDeleted();
      unsubscribeMessageRead();
      unsubscribeReactionAdded();
      unsubscribeReactionRemoved();
      unsubscribeTypingStart();
      unsubscribeTypingStop();
      unsubscribeUserOnline();
      unsubscribeUserOffline();
      unsubscribeUserStatus();
      unsubscribeConversationUpdated();
      unsubscribeConversationDeleted();
      unsubscribeMemberJoined();
      unsubscribeMemberLeft();
      unsubscribeAuthAuthenticated();
    };
  }, [socketService]);

  useEffect(() => {
    if (socketService && currentUser) {
      const token = getApiClient().getToken();
      if (token) {
        connect();
        socketService.once('connect', () => {
          authenticate(token);
        });
      }
    }
  }, [socketService, currentUser, connect, authenticate]);

  const handleNewMessage = useCallback((data: { message: SocketMessage; conversationId: string }) => {
    const transformedMessage = {
      ...data.message,
      conversationId: data.message.conversationId ?? data.message.conversation_id,
      senderId: data.message.senderId ?? data.message.sender_id,
      isEdited: data.message.isEdited ?? data.message.is_edited,
      isDeleted: data.message.isDeleted ?? data.message.is_deleted,
      replyTo: data.message.replyTo ?? data.message.reply_to_id,
      createdAt: new Date(data.message.createdAt ?? data.message.created_at),
      updatedAt: new Date(data.message.updatedAt ?? data.message.updated_at),
      status: 'sent' as const,
    };
    addMessage(data.conversationId, transformedMessage);
  }, [addMessage]);

  const handleMessageEdited = useCallback((data: { messageId: string; content: string; conversationId: string; editedAt: Date }) => {
    updateMessage(data.conversationId, data.messageId, {
      content: data.content,
      isEdited: true,
      updatedAt: data.editedAt,
    });
  }, [updateMessage]);

  const handleMessageDeleted = useCallback((data: { messageId: string; conversationId: string }) => {
    removeMessage(data.conversationId, data.messageId);
  }, [removeMessage]);

  const handleMessageRead = useCallback((data: { conversationId: string; messageId: string; readBy: string; readAt: Date }) => {
    markReadInStore(data.conversationId, data.messageId, data.readBy, data.readAt);
    markAsRead(data.conversationId, data.messageId);
  }, [markReadInStore, markAsRead]);

  const handleReactionAdded = useCallback((data: { reaction: SocketReaction; messageId: string; conversationId: string }) => {
    if (currentUser && data.reaction.user_id) {
      addReactionToStore(data.conversationId, data.messageId, data.reaction.emoji, data.reaction.user_id);
    }
  }, [currentUser, addReactionToStore]);

  const handleReactionRemoved = useCallback((data: { messageId: string; userId: string; emoji: string; conversationId: string }) => {
    removeReactionFromStore(data.conversationId, data.messageId, data.emoji, data.userId);
  }, [removeReactionFromStore]);

  const handleTypingStart = useCallback((data: { conversationId: string; user: { userId: string; username: string; avatar?: string } }) => {
    addTypingUser(data.conversationId, data.user);
    setTyping(data.conversationId, data.user.userId, true);
  }, [addTypingUser, setTyping]);

  const handleTypingStop = useCallback((data: { conversationId: string; userId: string }) => {
    removeTypingUser(data.conversationId, data.userId);
    setTyping(data.conversationId, data.userId, false);
  }, [removeTypingUser, setTyping]);

  const handleUserOnline = useCallback((data: { userId: string; user?: any }) => {
    addOnlineUser(data.userId, data.user);
    addOnlineToAppStore(data.userId);
  }, [addOnlineUser, addOnlineToAppStore]);

  const handleUserOffline = useCallback((data: { userId: string }) => {
    removeOnlineUser(data.userId);
    removeOnlineFromAppStore(data.userId);
  }, [removeOnlineUser, removeOnlineFromAppStore]);

  const handleUserStatus = useCallback((data: { userId: string; status: any }) => {
    updateUserStatus(data.userId, data.status);
  }, [updateUserStatus]);

  const handleConversationUpdated = useCallback((data: ConversationUpdateData) => {
    updateConversation(data.conversationId, data.updates);
  }, [updateConversation]);

  const handleConversationDeleted = useCallback((data: { conversationId: string }) => {
    // Conversation deletion handled by store
  }, []);

  const handleMemberJoined = useCallback((data: MemberChangeData) => {
    console.log('Member joined:', data);
  }, []);

  const handleMemberLeft = useCallback((data: { conversationId: string; memberId: string }) => {
    console.log('Member left:', data);
  }, []);

  const handleAuthAuthenticated = useCallback((data: { user: any }) => {
    console.log('Authenticated:', data.user);
  }, []);

  const sendMessage = useCallback((
    conversationId: string,
    content: string,
    type?: any,
    replyToId?: string
  ) => {
    socketService?.sendMessage(conversationId, content, type, replyToId);
  }, [socketService]);

  const editMessage = useCallback((messageId: string, content: string) => {
    socketService?.editMessage(messageId, content);
  }, [socketService]);

  const deleteMessage = useCallback((messageId: string) => {
    socketService?.deleteMessage(messageId);
  }, [socketService]);

  const markMessageRead = useCallback((conversationId: string, messageId: string) => {
    socketService?.markMessageRead(conversationId, messageId);
  }, [socketService]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    socketService?.addReaction(messageId, emoji);
  }, [socketService]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    socketService?.removeReaction(messageId, emoji);
  }, [socketService]);

  const startTyping = useCallback((conversationId: string) => {
    socketService?.startTyping(conversationId);
  }, [socketService]);

  const stopTyping = useCallback((conversationId: string) => {
    socketService?.stopTyping(conversationId);
  }, [socketService]);

  const joinConversation = useCallback((conversationId: string) => {
    socketService?.joinConversation(conversationId);
  }, [socketService]);

  const leaveConversation = useCallback((conversationId: string) => {
    socketService?.leaveConversation(conversationId);
  }, [socketService]);

  const updatePresenceStatus = useCallback((status: any) => {
    socketService?.updatePresenceStatus(status);
  }, [socketService]);

  const connectSocket = useCallback(() => {
    socketService?.connect();
  }, [socketService]);

  const disconnectSocket = useCallback(() => {
    socketService?.disconnect();
  }, [socketService]);

  const authenticateSocket = useCallback((token: string) => {
    socketService?.authenticate(token);
  }, [socketService]);

  const contextValue: SocketContextType = {
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageRead,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation,
    updatePresenceStatus,
    connect: connectSocket,
    disconnect: disconnectSocket,
    authenticate: authenticateSocket,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
