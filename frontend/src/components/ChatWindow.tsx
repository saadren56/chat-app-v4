import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  MoreVertical,
  Phone,
  Video,
  Search,
  X,
  Users,
  ChevronLeft,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Send,
  Check,
  CheckCheck,
  Clock,
  Star,
  Pin,
  Edit2,
  Trash2,
  Reply,
  MessageSquare,
} from 'lucide-react';
import {
  useMessages,
  useActiveConversationId,
  useActiveConversation,
  useMessagesLoading,
  useCurrentUser,
  useTypingUsers,
  useStoreActions,
} from '../store';
import { useMessagesApi } from '../shared/hooks';
import { useSocket } from '../features/socket';
import { Button } from '../shared/components/ui/Button';
import { Avatar } from '../shared/components/ui/Avatar';
import { Skeleton } from '../shared/components/ui/Skeleton';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { formatDate } from '../shared/utils/date';
import { cn } from '../shared/utils/helpers';

interface ChatWindowProps {
  isMobile?: boolean;
  onBack?: () => void;
}

export function ChatWindow({ isMobile, onBack }: ChatWindowProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [replyTo, setReplyTo] = useState<{ id: string; content: string; sender: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const activeId = useActiveConversationId();
  const conversation = useActiveConversation();
  const messages = useMessages(activeId!);
  const loading = useMessagesLoading(activeId!);
  const currentUser = useCurrentUser();
  const typingUsers = useTypingUsers(activeId!);
  const { fetchMessages, loadMore, hasMore } = useMessagesApi(activeId!);
  const { sendMessage, startTyping, stopTyping } = useSocket();

  useEffect(() => {
    if (activeId) {
      fetchMessages();
      setSearchQuery('');
      setShowSearch(false);
      setReplyTo(null);
    }
  }, [activeId, fetchMessages]);

  useEffect(() => {
    if (isScrolledToBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledToBottom(isAtBottom);

    if (scrollTop === 0 && hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleEdit = useCallback((message: any) => {
    console.log('Edit message:', message);
  }, []);

  const handleDelete = useCallback((message: any) => {
    console.log('Delete message:', message);
  }, []);

  const handleReply = useCallback((message: any) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      sender: message.senderId.substring(0, 8),
    });
  }, []);

  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    console.log('Add reaction:', messageId, emoji);
  }, []);

  const handleRemoveReaction = useCallback((messageId: string, emoji: string) => {
    console.log('Remove reaction:', messageId, emoji);
  }, []);

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter(m =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  if (!activeId || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 via-gray-800/50 to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-6">
            <MessageSquare className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            Select a conversation
          </h2>
          <p className="text-gray-500 max-w-md">
            Choose a conversation from the sidebar or start a new one
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800/30 to-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-auto rounded-full mr-1"
              onClick={onBack}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <Avatar
            src={conversation.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.id}`}
            alt={conversation.name || 'Conversation'}
            size="md"
            status={conversation.type === 'direct' ? 'online' : undefined}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">
                {conversation.name || 'Conversation'}
              </h3>
              {conversation.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              {conversation.type === 'direct' && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
              {conversation.type === 'direct' ? 'Online' : `${conversation.participants?.length || 0} participants`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto rounded-full hover:bg-gray-700/50"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto rounded-full hover:bg-gray-700/50"
          >
            <Phone className="w-5 h-5 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto rounded-full hover:bg-gray-700/50"
          >
            <Video className="w-5 h-5 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto rounded-full hover:bg-gray-700/50"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Users className="w-5 h-5 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto rounded-full hover:bg-gray-700/50"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700/50 bg-gray-800/30 overflow-hidden"
          >
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search in conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn(
                'flex items-end gap-3',
                i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'
              )}>
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className={cn(
                  'space-y-2',
                  i % 2 === 0 ? 'items-end' : 'items-start'
                )}>
                  <Skeleton className={cn(
                    'h-12 rounded-2xl',
                    i % 2 === 0 ? 'w-48' : 'w-64'
                  )} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500">
              Be the first to say hello!
            </p>
          </div>
        ) : (
          <div className="py-4">
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  className="text-gray-400"
                >
                  Load older messages
                </Button>
              </div>
            )}

            {filteredMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                previousMessage={filteredMessages[index - 1]}
                nextMessage={filteredMessages[index + 1]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReply={handleReply}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                isLast={index === filteredMessages.length - 1}
              />
            ))}

            {typingUsers.filter(id => id !== currentUser?.id).length > 0 && (
              <div className="flex items-end gap-2 px-4 py-1">
                <Avatar
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${typingUsers.filter(id => id !== currentUser?.id)[0]}`}
                  size="sm"
                />
                <div className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-gray-700/80">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-gray-400"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-gray-400"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} className="h-px" />
      </div>

      {!isScrolledToBottom && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToBottom}
          className="absolute bottom-24 right-4 z-10 p-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-cyan-500 transition-all"
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </motion.button>
      )}

      <MessageInput
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
