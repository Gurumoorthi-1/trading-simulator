import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Eye, Edit, Ban, Trash2, X, CheckCircle, UserPlus, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'red' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-light-bg dark:bg-dark-bg text-light-text dark:text-white rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-lg text-white transition-colors ${confirmColor === 'red'
              ? 'bg-red-600 hover:bg-red-500'
              : confirmColor === 'green'
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-yellow-600 hover:bg-yellow-500'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    isPremium: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: 'red',
    onConfirm: null,
  });

  const fetchUsers = async (page = 1, searchQuery = '', filterOptions = filters) => {
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      if (searchQuery) params.set('search', searchQuery);
      if (filterOptions.role) params.set('role', filterOptions.role);
      if (filterOptions.isActive) params.set('isActive', filterOptions.isActive);
      if (filterOptions.isPremium) params.set('isPremium', filterOptions.isPremium);

      const res = await api.get(`/admin/users?${params}`);
      if (res.data.success) {
        setUsers(res.data.users);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          total: res.data.total,
        });
      }
    } catch (err) {
      toast.error('Failed to load users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search, filters);

    // Connect admin socket and listen for updates
    const socket = connectAdminSocket();

    socket.on('statsUpdate', () => {
      fetchUsers(pagination.currentPage, search, filters);
    });

    socket.on('user-login', () => {
      fetchUsers(pagination.currentPage, search, filters);
    });

    return () => {
      if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); }
    };
  }, [search, filters]);

  const handleUpdateUser = async (updates) => {
    try {
      const res = await api.put(`/admin/users/${selectedUser._id}`, updates);
      if (res.data.success) {
        toast.success('User updated');
        fetchUsers(pagination.currentPage, search, filters);
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to update user');
      console.error(err);
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u._id === userId);
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete ${user?.name || 'this user'}? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/users/${userId}`);
          if (res.data.success) {
            toast.success('User deleted');
            fetchUsers(pagination.currentPage, search, filters);
            setConfirmModal({ ...confirmModal, isOpen: false });
          }
        } catch (err) {
          toast.error('Failed to delete user');
          console.error(err);
        }
      },
    });
  };

  const handleSuspendUser = (user) => {
    const action = user.isActive ? 'suspend' : 'activate';
    setConfirmModal({
      isOpen: true,
      title: user.isActive ? 'Suspend User' : 'Activate User',
      message: `Are you sure you want to ${action} ${user.name}?`,
      confirmText: user.isActive ? 'Suspend' : 'Activate',
      confirmColor: user.isActive ? 'yellow' : 'green',
      onConfirm: async () => {
        try {
          const res = await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
          if (res.data.success) {
            toast.success(`User ${action}ed`);
            fetchUsers(pagination.currentPage, search, filters);
            setConfirmModal({ ...confirmModal, isOpen: false });
          }
        } catch (err) {
          toast.error(`Failed to ${action} user`);
          console.error(err);
        }
      },
    });
  };

  const openModal = (user, mode) => {
    setSelectedUser(user);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">User Management</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage all platform users and their accounts.</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </select>
            <select
              value={filters.isPremium}
              onChange={(e) => setFilters({ ...filters, isPremium: e.target.value })}
              className="px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Plans</option>
              <option value="true">Premium</option>
              <option value="false">Free</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan="6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-light-bg dark:bg-dark-bg animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
                          <div className="h-3 w-24 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-slate-400">No users found</div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-light-text dark:text-white">{user.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : user.role === 'premium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-500/20 text-slate-400'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isPremium
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-slate-500/20 text-slate-400'
                        }`}>
                        {user.subscriptionPlan || (user.isPremium ? 'Premium' : 'Free')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        if (!user.isActive) {
                          // Account is suspended
                          return (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit bg-loss/20 text-loss">
                              <Ban size={12} />
                              Suspended
                            </span>
                          );
                        }
                        // Check online status using lastActivity
                        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
                        const isOnline = lastActivity && lastActivity >= twentyFourHoursAgo;
                        return (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${isOnline
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-500/20 text-slate-400'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-slate-400'
                              }`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user, 'view')}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openModal(user, 'edit')}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleSuspendUser(user)}
                          className={`p-2 rounded-lg transition-colors ${user.isActive
                            ? 'text-slate-400 hover:text-loss hover:bg-loss/10'
                            : 'text-slate-400 hover:text-profit hover:bg-profit/10'
                            }`}
                          title={user.isActive ? 'Suspend' : 'Activate'}
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-loss hover:bg-loss/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-border flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {users.length} of {pagination.total} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-light-border dark:border-dark-border text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-light-border dark:border-dark-border text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <UserModal
            user={selectedUser}
            mode={modalMode}
            onClose={() => setIsModalOpen(false)}
            onUpdate={handleUpdateUser}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
      />
    </div>
  );
};

const UserModal = ({ user, mode, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    isActive: user?.isActive ?? true,
    isPremium: user?.isPremium ?? false,
    subscriptionPlan: user?.subscriptionPlan || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-light-text dark:text-white">
            {mode === 'view' ? 'User Details' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={mode === 'view'}
              className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={mode === 'view'}
              className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={mode === 'view'}
                className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="user">User</option>
                <option value="premium">Premium</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={formData.isActive.toString()}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                disabled={mode === 'view'}
                className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="true">Active</option>
                <option value="false">Suspended</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Premium</label>
              <select
                value={formData.isPremium.toString()}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.value === 'true' })}
                disabled={mode === 'view'}
                className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Plan</label>
              <select
                value={formData.subscriptionPlan}
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                disabled={mode === 'view'}
                className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">None</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {mode !== 'view' && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default AdminUsers;
