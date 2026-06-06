import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, Clock } from 'lucide-react';
import { useThemeStore } from '../../context/store';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b'];

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
            <h3 className="text-2xl font-bold text-light-text dark:text-white">{value}</h3>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

const AdminAIAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useThemeStore();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/ai-analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load AI analytics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Connect admin socket and listen for updates
    const socket = connectAdminSocket();

    socket.on('statsUpdate', () => {
      fetchData();
    });

    return () => {
      if (socket) { socket.removeAllListeners('statsUpdate'); socket.removeAllListeners('user-login'); }
    };
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">AI Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Monitor AI usage and performance</p>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="Total AI Requests"
          value={analytics?.totalAIRequests?.toLocaleString() || 0}
          icon={Brain}
          color="bg-purple-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Average Response Time"
          value={analytics?.averageResponseTime || '0s'}
          icon={Clock}
          color="bg-blue-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* AI Requests Per Day */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">AI Requests Per Day</h3>
          {isLoading ? (
            <div className="h-80 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={analytics?.aiRequestsPerDay || []}>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                  labelStyle={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="requests" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Feature Usage Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Feature Usage Distribution</h3>
          {isLoading ? (
            <div className="h-80 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={analytics?.featureUsage || []}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="count"
                >
                  {analytics?.featureUsage?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                  labelStyle={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Popular AI Questions */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Popular AI Questions</h3>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-light-bg dark:bg-dark-bg rounded animate-pulse mb-3"></div>
            ))
          ) : (
            <div className="space-y-3">
              {analytics?.popularQuestions?.map((question, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <p className="text-light-text dark:text-slate-200">{question}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAIAnalytics;
