import { motion } from 'framer-motion';
import { Phone, Video, MoreVertical, Users, Search } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const ChatHeader = () => {
  const { activeChatId, chats } = useAppStore();
  const activeChat = chats.find((c) => c.id === activeChatId);

  if (!activeChat) return null;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="h-20 glass border-b border-white/10 px-8 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
            activeChat.type === 'group'
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-cyan-500 to-purple-500'
          }`}>
            {activeChat.type === 'group' ? (
              <Users className="w-6 h-6 text-white" />
            ) : (
              activeChat.name.charAt(0).toUpperCase()
            )}
          </div>
          {activeChat.type === 'direct' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {activeChat.name}
            {activeChat.type === 'group' && (
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {activeChat.users.length}
              </span>
            )}
          </h2>
          <p className="text-sm text-cyan-400">
            {activeChat.type === 'direct' ? 'Online' : '5 online'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <Search className="w-5 h-5 text-gray-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <Phone className="w-5 h-5 text-gray-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <Video className="w-5 h-5 text-gray-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>
    </motion.header>
  );
};
