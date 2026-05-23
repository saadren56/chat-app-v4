import { motion } from 'framer-motion';
import { MessageSquare, Users, Settings, Bell, User } from 'lucide-react';
import { ChatList } from './ChatList';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../store/useAppStore';

export const Sidebar = () => {
  const { currentUser, sidebarCollapsed } = useAppStore();

  const navItems = [
    { icon: MessageSquare, label: 'Chats', active: true },
    { icon: Users, label: 'Contacts', active: false },
    { icon: Bell, label: 'Notifications', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <motion.aside
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-80 h-full glass border-r border-white/10 flex flex-col"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>
            <div>
              <p className="font-semibold text-white">{currentUser?.name}</p>
              <p className="text-xs text-cyan-400">Online</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-6 py-4">
        <nav className="flex gap-2">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${
                item.active
                  ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </motion.button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatList />
      </div>
    </motion.aside>
  );
};
