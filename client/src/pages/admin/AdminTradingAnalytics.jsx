import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { useThemeStore } from '../../context/store';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { connectAdminSocket } from '../../utils/adminSocket';

const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, icon: Icon, color, isLoading, subtitle }) => {
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
          {subtitle && !isLoading && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AdminTradingAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    itemStyle: { color: isDark ? '#f8fafc' : '#1e293b' },
    labelStyle: { color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold', marginBottom: '4px' }
  };

  const axisTickStyle = { fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/trading-analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load trading analytics');
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Trading Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Real-time trading activity and trends (Last 7 Days)</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="Total Trades"
          value={analytics?.totalTradeCount?.toLocaleString() || '0'}
          icon={Activity}
          color="bg-blue-600"
          isLoading={isLoading}
          subtitle="Last 7 days"
        />
        <StatCard
          title="Trade Volume"
          value={`$${(analytics?.totalTradeValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color="bg-green-600"
          isLoading={isLoading}
          subtitle="Total value traded"
        />
        <StatCard
          title="Avg Trade Size"
          value={`$${(analytics?.avgTradeSize || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={BarChart3}
          color="bg-purple-600"
          isLoading={isLoading}
          subtitle="Per transaction"
        />
        <StatCard
          title="Buy/Sell Ratio"
          value={`${analytics?.buySellRatio?.buy || 0} / ${analytics?.buySellRatio?.sell || 0}`}
          icon={TrendingUp}
          color="bg-amber-600"
          isLoading={isLoading}
          subtitle="Buy vs Sell count"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Most Traded Stocks */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Most Traded Stocks</h3>
          {isLoading ? (
            <div className="h-80 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (analytics?.mostTradedStocks?.length > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.mostTradedStocks}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.4} />
                <XAxis dataKey="_id" tick={axisTickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Trade Count" />
                <Bar dataKey="volume" fill="#a855f7" radius={[6, 6, 0, 0]} name="Shares Traded" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 size={40} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">No trading data yet</p>
                <p className="text-slate-500 text-xs mt-1">Trades will appear here once users start trading</p>
              </div>
            </div>
          )}
        </div>

        {/* Buy vs Sell Ratio */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Buy vs Sell Ratio</h3>
          {isLoading ? (
            <div className="h-80 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : ((analytics?.buySellRatio?.buy || 0) + (analytics?.buySellRatio?.sell || 0) > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Buy Orders', value: analytics?.buySellRatio?.buy || 0 },
                    { name: 'Sell Orders', value: analytics?.buySellRatio?.sell || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Activity size={40} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">No trade data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Trading Volume Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Trading Volume Trend</h3>
          {isLoading ? (
            <div className="h-80 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics?.volumeTrend || []}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.4} />
                <XAxis dataKey="date" tick={axisTickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="volume" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" name="Shares Traded" />
                <Area type="monotone" dataKey="trades" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} name="Trade Count" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Most Active Traders */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Most Active Traders</h3>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-light-bg dark:bg-dark-bg rounded animate-pulse mb-3"></div>
            ))
          ) : (analytics?.mostActiveTraders?.length > 0) ? (
            <div className="space-y-3">
              {analytics.mostActiveTraders.map((trader, index) => (
                <div key={trader.userId} className="flex items-center justify-between p-3 bg-light-bg dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-light-text dark:text-white text-sm">{trader.name}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{trader.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-600 dark:text-primary-400">{trader.tradeCount}</div>
                    <div className="text-xs text-slate-500">
                      {trader.totalValue ? `$${trader.totalValue.toLocaleString()}` : 'trades'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <div className="text-center">
                <Activity size={40} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">No active traders yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminTradingAnalytics;
