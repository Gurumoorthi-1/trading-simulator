import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '../ui/Skeleton';
import { useThemeStore } from '../../context/store';
import { getWeeklyPnL } from '../../utils/services';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const entry = payload[0].payload;
    return (
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-3 rounded-lg shadow-xl">
        <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">{label} ({entry.date})</p>
        <p className={`font-bold text-lg ${val >= 0 ? 'text-profit' : 'text-loss'}`}>
          {val >= 0 ? '+' : ''}${Math.abs(val).toLocaleString()}
        </p>
        <div className="mt-1 text-xs space-y-0.5">
          <p className="text-profit">Sold: ${entry.sellTotal?.toLocaleString() || 0}</p>
          <p className="text-loss">Bought: ${entry.buyTotal?.toLocaleString() || 0}</p>
        </div>
      </div>
    );
  }
  return null;
};

const ProfitLossChart = ({ isLoading: parentLoading }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWeeklyPnL();
        setChartData(data.weeklyPnL || []);
      } catch (error) {
        console.error('Failed to fetch weekly P&L:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!parentLoading) {
      fetchData();
    }
  }, [parentLoading]);

  if (parentLoading || loading) {
    return (
      <div className="card h-[300px] flex flex-col">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  const hasActivity = chartData.some(d => d.net !== 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="card h-[300px] flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-light-text dark:text-white">Weekly P&L</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-profit"></div>
            <span className="text-slate-600 dark:text-slate-400">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-loss"></div>
            <span className="text-slate-600 dark:text-slate-400">Loss</span>
          </div>
        </div>
      </div>

      {!hasActivity ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No trading activity this week</p>
            <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Make some trades to see your P&L chart!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full flex items-center justify-center bg-light-bg/50 dark:bg-dark-bg/50 rounded-xl border border-dashed border-light-border dark:border-dark-border">
          <div className="text-center p-4">
            <p className="text-slate-500 text-sm font-medium">Weekly P&L Analysis</p>
            <p className="text-slate-400 text-xs mt-1">Syncing with portfolio data...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfitLossChart;
