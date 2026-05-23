import { motion } from 'framer-motion';
import { MessageCircle, Users, Check, CheckCheck, Pin } from 'lucide-react';
import { Chat } from '../types';
import { useAppStore } from '../store/useAppStore';

interface ChatItemProps {
  chat: Chat;
}

export const ChatItem = ({ chat }: ChatItemProps) => {
  const { activeChatId, setActiveChatId, currentUser } = useAppStore();
  const isActive = activeChatId === chat.id;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const isOwnMessage = chat.lastMessage?.senderId === currentUser?.id;

  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveChatId(chat.id)}
      className={`w-full p-4 rounded-2xl text-left transition-all duration-300 relative group ${
        isActive
          ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="active-chat-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-r-full"
        />
      )}

      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
            chat.type === 'group'
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-cyan-500 to-purple-500'
          }`}>
            {chat.type === 'group' ? (
              <Users className="w-6 h-6 text-white" />
            ) : (
              chat.name.charAt(0).toUpperCase()
            )}
          </div>
          
          {chat.type === 'direct' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold truncate ${
                isActive ? 'text-white' : 'text-gray-200'
              }`}>
                {chat.name}
              </h3>
              {chat.isPinned && (
                <Pin className="w-3 h-3 text-cyan-400" />
              )}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isOwnMessage && chat.lastMessage && (
                <div className="flex-shrink-0">
                  {chat.lastMessage.isRead ? (
                    <CheckCheck className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Check className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              )}
              <p className={`text-sm truncate ${
                chat.unreadCount > 0 ? 'text-gray-200' : 'text-gray-500'
              }`}>
                {chat.lastMessage ? chat.lastMessage.text : 'No messages yet'}
              </p>
            </div>
            
            {chat.unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0 ml-2"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold rounded-full">
                  {chat.unreadCount}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};
