import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, DollarSign, Brain, TrendingUp, PieChart, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend
} from 'recharts';
import api from '../../utils/api';
import { useThemeStore } from '../../context/store';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const StatCard = ({ title, value, change, isPositive, icon, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
          {icon}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-7 w-24 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-light-text dark:text-white">{value}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{title}</p>
        </>
      )}
    </motion.div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const tooltipStyle = {
    contentStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
    itemStyle: { color: isDark ? '#f8fafc' : '#1e293b' },
    labelStyle: { color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold', marginBottom: '4px' }
  };
  const axisTickStyle = { fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 };

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Connect admin socket and listen for updates
    const socket = connectAdminSocket();

    socket.on('statsUpdate', () => {
      fetchStats();
    });

    socket.on('user-login', (data) => {
      console.log('User logged in:', data);
    });

    socket.on('newTrade', (data) => {
      console.log('New trade:', data);
    });

    return () => {
      if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); }
    };
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Dashboard Overview</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor platform activity and key metrics.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard title="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} icon={<Users size={24} />} isLoading={isLoading} />
        <StatCard title="Active Users" value={stats?.activeUsers?.toLocaleString() || 0} icon={<Activity size={24} />} isLoading={isLoading} />
        <StatCard title="Premium Users" value={stats?.premiumUsers?.toLocaleString() || 0} icon={<TrendingUp size={24} />} isLoading={isLoading} />
        <StatCard title="Total Trades" value={stats?.totalTrades?.toLocaleString() || 0} icon={<BarChart3 size={24} />} isLoading={isLoading} />
        <StatCard title="Today's Trades" value={stats?.todaysTrades?.toLocaleString() || 0} icon={<Activity size={24} />} isLoading={isLoading} />
        <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} icon={<DollarSign size={24} />} isLoading={isLoading} />
        <StatCard title="Monthly Revenue" value={`₹${stats?.monthlyRevenue?.toLocaleString() || 0}`} icon={<DollarSign size={24} />} isLoading={isLoading} />
        <StatCard title="AI Requests" value={stats?.aiRequests?.toLocaleString() || 0} icon={<Brain size={24} />} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">User Growth</h3>
          {isLoading ? (
            <div className="h-[300px] bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.userGrowth || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Revenue</h3>
          {isLoading ? (
            <div className="h-[300px] bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.revenueGrowth || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="amount" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Trades Trend</h3>
          {isLoading ? (
            <div className="h-[300px] bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.tradesTrend || []}>
                <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Premium Conversion</h3>
          {isLoading ? (
            <div className="h-[300px] bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={stats?.premiumConversion || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  <Cell fill="#64748b" />
                  <Cell fill="#a855f7" />
                </Pie>
                <Tooltip {...tooltipStyle} />
              </RePieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
