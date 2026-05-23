import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Smile,
  Share2,
  Check,
  CheckCheck,
  Clock,
  Reply,
  Copy,
  Reaction,
} from 'lucide-react';
import { cn } from '../shared/utils/helpers';
import { useCurrentUser, useIsUserOnline } from '../store';
import { Button } from '../shared/components/ui/Button';
import { Avatar } from '../shared/components/ui/Avatar';
import { Message, User } from '../store/types';
import { formatDate } from '../shared/utils/date';

interface MessageBubbleProps {
  message: Message;
  previousMessage?: Message;
  nextMessage?: Message;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReply?: (message: Message) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  showAvatar?: boolean;
  isLast?: boolean;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🚀'];

export function MessageBubble({
  message,
  previousMessage,
  nextMessage,
  onEdit,
  onDelete,
  onReply,
  onAddReaction,
  onRemoveReaction,
  showAvatar = true,
  isLast = false,
}: MessageBubbleProps) {
  const currentUser = useCurrentUser();
  const isOwn = currentUser?.id === message.senderId;
  const isOnline = useIsUserOnline(message.senderId);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);

  const isGrouped = previousMessage?.senderId === message.senderId;
  const shouldShowTail = !isGrouped || !nextMessage || nextMessage.senderId !== message.senderId;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(e.target as Node)
      ) {
        setShowActions(false);
      }
      if (
        reactionsRef.current &&
        !reactionsRef.current.contains(e.target as Node)
      ) {
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReactionToggle = (emoji: string) => {
    const userReacted = message.reactions?.some(r =>
      r.userIds.includes(currentUser!.id) && r.emoji === emoji
    );
    
    if (userReacted) {
      onRemoveReaction?.(message.id, emoji);
    } else {
      onAddReaction?.(message.id, emoji);
    }
    setShowReactions(false);
  };

  const getStatusIcon = () => {
    if (message.status === 'read') return <CheckCheck className="w-3 h-3 text-cyan-400" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-500" />;
    if (message.status === 'sent') return <Check className="w-3 h-3 text-gray-500" />;
    if (message.status === 'sending') return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-end gap-2 px-4 py-1',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwn && showAvatar && !isGrouped && (
        <div className="flex flex-col items-center">
          <Avatar
            src={getSenderAvatar(message)}
            alt={getSenderName(message)}
            size="sm"
            status={isOnline ? 'online' : 'offline'}
          />
        </div>
      )}
      
      {!isOwn && showAvatar && isGrouped && (
        <div className="w-8" />
      )}

      <div className={cn(
        'flex flex-col max-w-[70%]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {!isGrouped && !isOwn && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-semibold text-gray-300">
              {getSenderName(message)}
            </span>
            <span className="text-[10px] text-gray-500">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}

        <div className="relative group">
          <div className={cn(
            'relative px-4 py-2 rounded-2xl backdrop-blur-sm',
            shouldShowTail ? (
              isOwn
                ? 'rounded-br-sm bg-gradient-to-br from-purple-600/90 to-cyan-600/90 shadow-lg shadow-purple-500/20'
                : 'rounded-bl-sm bg-gray-700/80 shadow-lg shadow-gray-900/20'
            ) : (
              isOwn
                ? 'bg-gradient-to-br from-purple-600/90 to-cyan-600/90'
                : 'bg-gray-700/80'
            )
          )}>
            <p className={cn(
              'text-sm break-words',
              isOwn ? 'text-white' : 'text-gray-100'
            )}>
              {message.content}
            </p>
          </div>

          <AnimatePresence>
            {(isHovered || showActions || showReactions) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  'absolute flex items-center gap-1 p-1 rounded-xl bg-gray-800/95 border border-gray-700/50 shadow-xl',
                  isOwn ? '-left-1 -top-10' : '-right-1 -top-10'
                )}
                ref={actionsRef}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto"
                  onClick={() => onReply?.(message)}
                >
                  <Reply className="w-4 h-4" />
                </Button>

                {isOwn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto"
                    onClick={() => onEdit?.(message)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto"
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>

                {isOwn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => onDelete?.(message)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn(
                        'absolute flex items-center gap-1 p-2 rounded-2xl bg-gray-800/95 border border-gray-700/50 shadow-xl',
                        isOwn ? '-left-1 top-12' : '-right-1 top-12'
                      )}
                      ref={reactionsRef}
                    >
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReactionToggle(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className={cn(
            'flex flex-wrap gap-1 mt-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}>
            {message.reactions.map((reaction) => (
              <motion.button
                key={reaction.emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReactionToggle(reaction.emoji)}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all',
                  reaction.userIds.includes(currentUser!.id)
                    ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-white'
                    : 'bg-gray-700/50 border border-gray-600/30 text-gray-300 hover:bg-gray-600/50'
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.userIds.length}</span>
              </motion.button>
            ))}
          </div>
        )}

        {isOwn && isLast && (
          <div className="flex items-center gap-1 mt-1">
            {getStatusIcon()}
            <span className="text-[10px] text-gray-500">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getSenderAvatar(message: Message): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`;
}

function getSenderName(message: Message): string {
  return message.senderId.substring(0, 8);
}
