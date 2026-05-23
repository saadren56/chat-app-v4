import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  X,
  Link2,
} from 'lucide-react';
import { useSocket } from '../features/socket';
import { useActiveConversationId, useCurrentUser, useTypingUsers } from '../store';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Avatar } from '../shared/components/ui/Avatar';
import { cn } from '../shared/utils/helpers';

const EMOJI_PICKER = ['😀', '😂', '🥰', '😎', '🤔', '😢', '😡', '🎉', '👍', '👎', '❤️', '🔥', '✨', '🚀'];

interface MessageInputProps {
  replyTo?: { id: string; content: string; sender: string } | null;
  onCancelReply?: () => void;
}

export function MessageInput({ replyTo, onCancelReply }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeId = useActiveConversationId();
  const currentUser = useCurrentUser();
  const typingUsers = useTypingUsers(activeId!);
  const { sendMessage, startTyping, stopTyping } = useSocket();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeId]);

  const handleTyping = useCallback((value: string) => {
    setMessage(value);
    
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      if (activeId) {
        startTyping(activeId);
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeId) {
        stopTyping(activeId);
      }
    }, 2000);
  }, [activeId, isTyping, startTyping, stopTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = useCallback(() => {
    if (!message.trim() || !activeId) return;

    sendMessage(activeId, message.trim());
    setMessage('');
    setAttachments([]);
    
    if (isTyping) {
      setIsTyping(false);
      stopTyping(activeId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [message, activeId, isTyping, sendMessage, stopTyping]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleAddEmoji = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const otherTypingUsers = typingUsers.filter(id => id !== currentUser?.id);

  return (
    <div className="flex flex-col border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-xl">
      {otherTypingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 flex items-center gap-2 text-sm text-gray-400"
        >
          <div className="flex -space-x-2">
            {otherTypingUsers.slice(0, 3).map(userId => (
              <Avatar
                key={userId}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
                size="xs"
                className="border-2 border-gray-800"
              />
            ))}
          </div>
          <span className="animate-pulse">
            {otherTypingUsers.length === 1
              ? 'Someone is typing...'
              : `${otherTypingUsers.length} people are typing...`}
          </span>
        </motion.div>
      )}

      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-l-4 border-purple-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-400 mb-1">
                  Replying to {replyTo.sender}
                </p>
                <p className="text-sm text-gray-300 truncate">
                  {replyTo.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto ml-2"
                onClick={onCancelReply}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-2 flex gap-2 overflow-x-auto pb-2"
          >
            {attachments.map((url, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={url}
                  alt="Attachment"
                  className="w-20 h-20 rounded-xl object-cover border border-gray-600"
                />
                <button
                  onClick={() => handleRemoveAttachment(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4">
        <div className="flex items-end gap-3">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto rounded-full hover:bg-gray-700/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto rounded-full hover:bg-gray-700/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className={cn(
                  'w-full px-4 py-3 rounded-2xl resize-none',
                  'bg-gray-700/50 border border-gray-600/50',
                  'focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20',
                  'text-gray-100 placeholder-gray-500',
                  'min-h-[52px] max-h-[200px]'
                )}
                rows={1}
              />

              <AnimatePresence>
                {showEmojis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 p-3 rounded-2xl bg-gray-800/95 border border-gray-700/50 shadow-2xl"
                  >
                    <div className="grid grid-cols-7 gap-1">
                      {EMOJI_PICKER.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddEmoji(emoji)}
                          className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-700/50 rounded-xl transition-all hover:scale-110"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto rounded-full hover:bg-gray-700/50"
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Smile className="w-5 h-5 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto rounded-full hover:bg-gray-700/50"
            >
              <Mic className="w-5 h-5 text-gray-400" />
            </Button>
            <Button
              size="sm"
              className={cn(
                'p-2 h-auto rounded-full',
                message.trim()
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-500/25'
                  : 'bg-gray-700/50 cursor-not-allowed'
              )}
              disabled={!message.trim()}
              onClick={handleSend}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
