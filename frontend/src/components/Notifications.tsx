import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  MessageSquare,
  UserPlus,
  Heart,
  Check,
  Settings,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Avatar } from '../shared/components/ui/Avatar';
import { Badge } from '../shared/components/ui/Badge';
import { cn } from '../shared/utils/helpers';

interface Notification {
  id: string;
  type: 'message' | 'friend_request' | 'reaction' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'Alice sent you a message',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: '2',
    type: 'friend_request',
    title: 'Friend Request',
    message: 'Bob wants to connect',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: '3',
    type: 'reaction',
    title: 'Reaction',
    message: 'Charlie reacted to your message',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'System',
    message: 'Welcome to the chat app!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

interface NotificationsProps {
  show: boolean;
  onClose: () => void;
}

export function Notifications({ show, onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4" />;
      case 'reaction':
        return <Heart className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-purple-400';
      case 'friend_request':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400';
      case 'reaction':
        return 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400';
      case 'system':
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-4 top-20 w-full max-w-sm z-50"
          >
            <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bell className="w-6 h-6 text-gray-300" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold shadow-lg">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto rounded-full"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'primary' : 'ghost'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setFilter('unread')}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <Badge
                        variant="primary"
                        size="sm"
                        className="ml-2"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 border-b border-gray-700/30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs justify-center gap-2"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="w-4 h-4" />
                  Mark all as read
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/30">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          'p-4 hover:bg-gray-700/30 transition-colors cursor-pointer group',
                          !notification.read && 'bg-gradient-to-r from-purple-500/5 to-cyan-500/5'
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br border',
                            getColor(notification.type)
                          )}>
                            {getIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-white text-sm truncate">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm truncate">
                                  {notification.message}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1.5 h-auto rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1.5 h-auto rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
