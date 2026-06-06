import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { useThemeStore } from '../../context/store';

// Mock data generator for different timeframes
const generateData = (timeframe) => {
  const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 12;
  const labels = timeframe === '1D' ? Array.from({ length: 24 }, (_, i) => `${i}:00`) :
    timeframe === '1W' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
      timeframe === '1M' ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`) :
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let baseValue = 4000;
  return labels.map(label => {
    const change = (Math.random() - 0.45) * 500;
    baseValue += change;
    return { name: label, value: Math.max(100, baseValue) };
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-3 rounded-lg shadow-xl">
        <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-light-text dark:text-white font-bold text-lg">
          ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const MarketOverview = ({ isLoading }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [activeTimeframe, setActiveTimeframe] = useState('1M');

  const chartData = useMemo(() => generateData(activeTimeframe), [activeTimeframe]);

  if (isLoading) {
    return (
      <div className="card h-[400px] flex flex-col">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card h-[400px] flex flex-col"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-bold text-light-text dark:text-white">Portfolio Performance</h3>
        <div className="flex flex-wrap gap-1 bg-light-bg dark:bg-dark-bg p-1 rounded-lg border border-light-border dark:border-dark-border">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${activeTimeframe === tf
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} opacity={0.4} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              dy={10}
              interval={activeTimeframe === '1D' ? 4 : 'preserveStartEnd'}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              tickFormatter={(value) => `$${value > 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MarketOverview;
