import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const StatCard = ({ title, value, icon: Icon, color, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          {isLoading ? (
            <div className="h-8 w-20 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <h3 className="text-2xl font-bold text-light-text dark:text-white">{value.toLocaleString()}</h3>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

const AdminSubscriptions = () => {
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchData = async (page = 1, searchQuery = '') => {
    try {
      setIsLoading(true);
      const [statsRes, subsRes] = await Promise.all([
        api.get('/admin/subscriptions/stats'),
        api.get(`/admin/subscriptions?page=${page}&search=${searchQuery}`)
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (subsRes.data.success) {
        setSubscriptions(subsRes.data.subscriptions);
        setPagination({
          currentPage: subsRes.data.currentPage,
          totalPages: subsRes.data.totalPages,
          total: subsRes.data.total,
        });
      }
    } catch (err) {
      toast.error('Failed to load subscriptions data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.currentPage, search);

    const socket = connectAdminSocket();
    socket.on('statsUpdate', () => {
      fetchData(pagination.currentPage, search);
    });

    return () => { if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); } };
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, search);
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, search);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Subscription Management</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage user subscriptions and track metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="Free Users"
          value={stats?.freeUsers || 0}
          icon={Search}
          color="bg-slate-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Pro Users"
          value={stats?.proUsers || 0}
          icon={Search}
          color="bg-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Enterprise Users"
          value={stats?.enterpriseUsers || 0}
          icon={Search}
          color="bg-purple-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={Search}
          color="bg-green-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Expiring Subscriptions"
          value={stats?.expiringSubscriptions || 0}
          icon={Search}
          color="bg-yellow-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Renewals"
          value={stats?.renewals || 0}
          icon={Search}
          color="bg-pink-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={Search}
          color="bg-primary-600"
          isLoading={isLoading}
        />
      </div>

      {/* Subscriptions Table */}
      <div className="card">
        <div className="p-4 border-b border-dark-border">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-semibold text-light-text dark:text-white">Subscriptions</h2>
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg dark:bg-dark-bg">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan="6">
                      <div className="h-4 w-40 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-slate-400">No subscriptions found</div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub, index) => (
                  <tr key={index} className="hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-light-text dark:text-white">{sub.user.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{sub.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.plan === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">₹{sub.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {sub.status}
                      </span>
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
              Showing {subscriptions.length} of {pagination.total} subscriptions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;
