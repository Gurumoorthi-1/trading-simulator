import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, TrendingUp, TrendingDown, Bot, Wallet, AlertTriangle,
  CheckCheck, Trash2, X, RefreshCw
} from 'lucide-react';
import { useNotificationStore } from '../context/store';
import {
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
} from '../utils/services';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { notifications, unreadCount, isLoading, fetchNotifications, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'trade': return <TrendingUp size={18} className="text-profit" />;
      case 'wallet': return <Wallet size={18} className="text-purple-400" />;
      case 'premium': return <Bot size={18} className="text-yellow-400" />;
      default: return <Bell size={18} className="text-slate-400" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'alert': return 'bg-amber-500/10 border-amber-500/20';
      case 'trade': return 'bg-profit/10 border-profit/20';
      case 'wallet': return 'bg-purple-500/10 border-purple-500/20';
      case 'premium': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const categories = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'trade', label: 'Trades', count: notifications.filter(n => n.type === 'trade').length },
    { key: 'wallet', label: 'Wallet', count: notifications.filter(n => n.type === 'wallet').length },
    { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
    { key: 'alert', label: 'Alerts', count: notifications.filter(n => n.type === 'alert').length },
  ];

  const filtered = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeCategory);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications(1, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      fetchNotifications(1, true);
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      fetchNotifications(1, true);
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success('All marked as read');
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={() => fetchNotifications()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-slate-500 dark:text-slate-300 hover:text-light-text dark:hover:text-white text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-slate-500 dark:text-slate-300 hover:text-light-text dark:hover:text-white text-sm font-medium transition-colors"
            >
              <CheckCheck size={16} /> Mark All Read
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-slate-500 dark:text-slate-300 hover:text-loss text-sm font-medium transition-colors"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.key
              ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/30'
              : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:border-light-border/80 dark:hover:border-dark-border/80'
              }`}
          >
            {cat.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${activeCategory === cat.key ? 'bg-primary-500/20 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300' : 'bg-light-bg dark:bg-dark-bg text-slate-500'
              }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-light-card dark:bg-dark-card animate-pulse border border-light-border dark:border-dark-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Bell size={56} className="mx-auto text-slate-400/50 dark:text-slate-600 mb-4" />
          <h3 className="text-light-text dark:text-white font-bold text-lg mb-1">No notifications</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">When something happens, you'll see it here.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((notification, index) => (
              <motion.div
                key={notification._id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => !notification.isRead && handleMarkRead(notification._id)}
                className={`relative flex items-start gap-4 p-4 md:p-5 rounded-2xl cursor-pointer transition-all group border
                  ${!notification.isRead
                    ? 'bg-primary-100/50 dark:bg-primary-500/5 border-primary-500/20 dark:border-primary-500/15 hover:bg-primary-100/80 dark:hover:bg-primary-500/10'
                    : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg/50'
                  }
                `}
              >
                {/* Unread Dot */}
                {!notification.isRead && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                )}

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${getIconBg(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold mb-0.5 ${!notification.isRead ? 'text-light-text dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{notification.message}</p>
                  <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-2 font-medium uppercase tracking-wider">{formatTime(notification.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, notification._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-loss hover:bg-loss/10 transition-colors md:opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                  {!notification.isRead && (
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 font-black uppercase tracking-wider bg-primary-500/10 px-2 py-0.5 rounded">New</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;
