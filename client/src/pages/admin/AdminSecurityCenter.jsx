import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Lock, Ban, ShieldAlert, KeyRound } from 'lucide-react';
import { useThemeStore } from '../../context/store';
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

const AdminSecurityCenter = () => {
  const [securityData, setSecurityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/security-analytics');
      if (res.data.success) {
        setSecurityData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load security analytics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = connectAdminSocket();
    socket.on('statsUpdate', () => {
      fetchData();
    });

    return () => { if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); } };
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Security Center</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor security events and threats</p>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="Failed Login Attempts"
          value={securityData?.failedLoginAttempts || 0}
          icon={Lock}
          color="bg-red-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Blocked Requests"
          value={securityData?.blockedRequests || 0}
          icon={Ban}
          color="bg-orange-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Rate Limit Hits"
          value={securityData?.rateLimitHits || 0}
          icon={ShieldAlert}
          color="bg-yellow-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Password Reset Requests"
          value={securityData?.passwordResetRequests || 0}
          icon={KeyRound}
          color="bg-blue-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Login Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Login Activity</h3>
          {isLoading ? (
            <div className="h-80 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={securityData?.loginActivity || []}>
                <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                  labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="successful" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Security Events */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Security Events</h3>
          {isLoading ? (
            <div className="h-80 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={securityData?.securityEvents || []}>
                <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                  labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="blockedRequests" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                <Line type="monotone" dataKey="rateLimitHits" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                <Line type="monotone" dataKey="passwordResets" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityCenter;
