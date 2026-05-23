import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MoreHorizontal,
  MessageSquare,
  Users,
  Bell,
  Settings,
  Plus,
  Menu,
  X,
  Hash,
  Star,
  Pin,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  useConversations,
  useActiveConversationId,
  useTotalUnreadCount,
  useConversationsLoading,
  useCurrentUser,
  useStoreActions,
} from '../store';
import { useConversationsApi, useAuth } from '../shared/hooks';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Avatar } from '../shared/components/ui/Avatar';
import { Badge } from '../shared/components/ui/Badge';
import { Skeleton } from '../shared/components/ui/Skeleton';
import { formatRelativeTime } from '../shared/utils/date';
import { cn } from '../shared/utils/helpers';

interface ChatListProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function ChatList({ isMobile, onClose }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sortBy, setSortBy] = useState<'unread' | 'date'>('unread');
  
  const conversations = useConversations();
  const activeId = useActiveConversationId();
  const unreadCount = useTotalUnreadCount();
  const loading = useConversationsLoading();
  const currentUser = useCurrentUser();
  const { setActiveConversation, markAsRead } = useStoreActions();
  const { fetchConversations } = useConversationsApi();
  const { logout } = useAuth();

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(conv =>
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.type === 'direct'
    );

    if (sortBy === 'unread') {
      filtered.sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.updatedAt || b.updated_at).getTime() - new Date(a.updatedAt || a.updated_at).getTime();
      });
    } else {
      filtered.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.updatedAt || b.updated_at).getTime() - new Date(a.updatedAt || a.updated_at).getTime();
      });
    }

    return filtered;
  }, [conversations, searchQuery, sortBy]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
    markAsRead(conversationId);
    if (isMobile && onClose) {
      onClose();
    }
  }, [setActiveConversation, markAsRead, isMobile, onClose]);

  const getUnreadIcon = (conv: any) => {
    if (conv.lastMessage?.status === 'read') {
      return <CheckCheck className="w-3 h-3 text-cyan-400" />;
    }
    if (conv.lastMessage?.status === 'delivered') {
      return <CheckCheck className="w-3 h-3 text-gray-500" />;
    }
    if (conv.lastMessage?.status === 'sent') {
      return <Check className="w-3 h-3 text-gray-500" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`}
              alt={currentUser?.username || 'User'}
              size="md"
              status="online"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white truncate">
                {currentUser?.username || 'User'}
              </h2>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto rounded-full hover:bg-gray-700/50"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold shadow-lg">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto rounded-full hover:bg-gray-700/50"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
            isSearchFocused ? 'text-purple-400' : 'text-gray-500'
          )} />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              'pl-10 bg-gray-800/50 border-gray-700/50',
              'focus:border-purple-500/50 focus:ring-purple-500/20'
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-700/30">
        <Button
          variant={sortBy === 'unread' ? 'primary' : 'ghost'}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setSortBy('unread')}
        >
          Unread
        </Button>
        <Button
          variant={sortBy === 'date' ? 'primary' : 'ghost'}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setSortBy('date')}
        >
          Recent
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Start a new conversation to begin chatting
            </p>
            <Button
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
              onClick={() => fetchConversations()}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        ) : (
          <div className="py-2">
            {filteredConversations.map((conversation, index) => (
              <motion.button
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectConversation(conversation.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200',
                  activeId === conversation.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 shadow-lg'
                    : 'hover:bg-gray-800/50'
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={conversation.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.id}`}
                    alt={conversation.name || 'Conversation'}
                    size="md"
                    status={conversation.type === 'direct' ? 'online' : undefined}
                  />
                  {conversation.is_pinned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Pin className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {conversation.is_pinned && (
                        <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      )}
                      <h3 className={cn(
                        'font-semibold text-sm truncate',
                        conversation.unreadCount > 0 ? 'text-white' : 'text-gray-300'
                      )}>
                        {conversation.name || 'Conversation'}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatRelativeTime(conversation.updatedAt || conversation.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      'text-xs truncate',
                      conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-500'
                    )}>
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {conversation.type === 'direct' && conversation.lastMessage?.senderId === currentUser?.id && getUnreadIcon(conversation)}
                      {conversation.unreadCount > 0 && (
                        <Badge
                          variant="primary"
                          className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-purple-500 to-cyan-500"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700/50">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm mx-4 p-6 rounded-2xl bg-gray-800/95 border border-gray-700/50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto rounded-full"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Account Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Users className="w-5 h-5 mr-3" />
                  Friends
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Notifications
                </Button>
                <div className="h-px bg-gray-700/50 my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => {
                    setShowSettings(false);
                    logout();
                  }}
                >
                  <X className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
