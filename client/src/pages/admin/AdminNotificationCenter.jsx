import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const StatusBadge = ({ status }) => {
  const colors = {
    delivered: 'bg-green-500/20 text-green-400',
    queued: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.queued}`}>
      {status}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const colors = {
    broadcast: 'bg-blue-500/20 text-blue-400',
    premium: 'bg-purple-500/20 text-purple-400',
    single: 'bg-slate-500/20 text-slate-400'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[type] || colors.single}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

const AdminNotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('broadcast');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    userId: ''
  });
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState([]); // For single user search
  const [searchUser, setSearchUser] = useState('');

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/notifications/history');
      if (res.data.success) {
        setNotificationHistory(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load notification history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users for single user tab
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users?limit=100');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchUsers();

    const socket = connectAdminSocket();
    socket.on('statsUpdate', () => {
      fetchHistory();
    });

    return () => { if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); } };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      let endpoint = '/admin/notifications/broadcast';
      if (activeTab === 'premium') endpoint = '/admin/notifications/premium';
      if (activeTab === 'single') endpoint = '/admin/notifications/user';

      const res = await api.post(endpoint, formData);
      if (res.data.success) {
        toast.success(res.data.message);
        setFormData({ title: '', message: '', userId: '' });
        setSearchUser('');
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Notification Center</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Send notifications to users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-light-text dark:text-white mb-6">Send Notification</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-light-border dark:border-dark-border pb-4">
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'broadcast' ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg'
                }`}
            >
              Broadcast
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'premium' ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg'
                }`}
            >
              Premium Users
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'single' ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg'
                }`}
            >
              Single User
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'single' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select User</label>
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search user by name or email"
                  className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500 mb-2"
                />
                {/* User list (filtered) */}
                <div className="max-h-40 overflow-y-auto bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl mb-2">
                  {users
                    .filter(user => user.name.toLowerCase().includes(searchUser.toLowerCase()) || user.email.toLowerCase().includes(searchUser.toLowerCase()))
                    .map(user => (
                      <div
                        key={user._id}
                        onClick={() => {
                          setFormData({ ...formData, userId: user._id });
                          setSearchUser(user.name);
                        }}
                        className={`px-3 py-2 cursor-pointer hover:bg-primary-500/10 transition-colors ${formData.userId === user._id ? 'bg-primary-500/10 border-l-2 border-primary-500' : ''
                          }`}
                      >
                        <div className="font-medium text-light-text dark:text-white">{user.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                placeholder="Notification title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                placeholder="Notification message"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSending || (activeTab === 'single' && !formData.userId)}
              className="w-full px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-light-text dark:text-white mb-6">Notification History</h2>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-light-bg dark:bg-dark-bg rounded animate-pulse mb-3"></div>
            ))
          ) : notificationHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {notificationHistory.map((notification) => (
                <div key={notification._id} className="p-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-light-text dark:text-white">{notification.title}</h4>
                      <TypeBadge type={notification.type} />
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={notification.status} />
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{notification.message}</p>
                  <div className="text-xs text-slate-500">
                    Sent to: {notification.sentTo} {notification.sentTo === 1 ? 'user' : 'users'}
                    {notification.recipientEmail && (
                      <span className="ml-2 text-primary-400">({notification.recipientEmail})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationCenter;
