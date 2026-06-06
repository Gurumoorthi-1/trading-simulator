import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, TrendingUp, TrendingDown, Bot, Wallet, AlertTriangle,
  Check, CheckCheck, Trash2, X
} from 'lucide-react';
import { useNotificationStore } from '../../context/store';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const dropdownRef = useRef(null);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Connect to Zustand store
  const { notifications, unreadCount, fetchNotifications, markAllRead } = useNotificationStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // REAL-TIME POLLING: Fetch notifications on mount and every 10 seconds
  useEffect(() => {
    fetchNotifications(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 10000); // 10 seconds polling for "real-time" feel

    return () => clearInterval(intervalId);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'trade': return <TrendingUp size={16} className="text-profit" />;
      case 'system': return <Bot size={16} className="text-primary-400" />;
      case 'wallet': return <Wallet size={16} className="text-purple-400" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'alert': return 'bg-amber-500/10 border-amber-500/20';
      case 'trade': return 'bg-profit/10 border-profit/20';
      case 'system': return 'bg-primary-500/10 border-primary-500/20';
      case 'wallet': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'trade', label: 'Trades' },
    { key: 'alert', label: 'Alerts' },
    { key: 'system', label: 'System' },
    { key: 'wallet', label: 'Wallet' }
  ];

  const filtered = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeCategory);

  const handleMarkAsRead = (id) => {
    // Optimistic UI update could go here, or just let polling handle it
    // If backend endpoint for marking single notification as read exists, call it.
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-loss text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-loss/30"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-[380px] max-h-[520px] bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-2xl shadow-black/20 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-light-border/50 dark:border-dark-border/50 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-light-text dark:text-white font-bold text-base">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeCategory === cat.key
                        ? 'bg-primary-500/20 text-primary-500 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Bell size={36} className="text-slate-600 mb-3" />
                  <p className="text-slate-400 font-medium text-sm">No notifications</p>
                  <p className="text-slate-500 text-xs">You're all caught up!</p>
                </div>
              ) : (
                <div>
                  {filtered.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group border-b border-light-border/30 dark:border-dark-border/30 last:border-0
                        ${!notification.isRead ? 'bg-primary-500/5 hover:bg-primary-500/10' : 'hover:bg-light-bg/50 dark:hover:bg-dark-bg/50'}
                      `}
                    >
                      {/* Unread indicator dot */}
                      {!notification.isRead && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                      )}

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${getIconBg(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${!notification.isRead ? 'text-light-text dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-slate-500 dark:text-slate-500 text-[11px] mt-1.5 font-medium">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-light-border/50 dark:border-dark-border/50 text-center shrink-0">
              <button className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-xs font-bold transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
