import React from 'react';
import { motion } from 'framer-motion';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useAuthStore, useTradeStore } from '../../context/store';
import { allStocks } from '../../utils/marketData';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-3 rounded-lg shadow-xl flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <p className="text-light-text dark:text-slate-300 text-sm font-medium">{payload[0].name}</p>
        <p className="text-light-text dark:text-white font-bold ml-2">
          ${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

const SECTOR_COLORS = {
  'Technology': '#0ea5e9',
  'Finance': '#8b5cf6',
  'Consumer': '#f59e0b',
  'Healthcare': '#ec4899',
  'Energy': '#10b981',
  'Automotive': '#3b82f6',
  'Entertainment': '#ef4444',
  'Cash': '#a855f7',
  'Unknown': '#64748b'
};

const AssetAllocation = () => {
  const { user } = useAuthStore();
  const { holdings } = useTradeStore();

  const cashBalance = user?.balance ?? 0;

  // Group holdings by sector
  const sectorDataMap = {};

  holdings.forEach(item => {
    const liveStock = allStocks.find(s => s.symbol === item.symbol.toUpperCase());
    const sector = liveStock ? liveStock.sector : 'Unknown';
    const currentPrice = liveStock ? liveStock.price : item.averagePrice;
    const value = item.shares * currentPrice;

    if (sectorDataMap[sector]) {
      sectorDataMap[sector] += value;
    } else {
      sectorDataMap[sector] = value;
    }
  });

  // Create data array
  const allocationData = Object.keys(sectorDataMap).map(sector => ({
    name: sector,
    value: sectorDataMap[sector],
    color: SECTOR_COLORS[sector] || SECTOR_COLORS['Unknown']
  }));

  // Add Cash to allocation
  if (cashBalance > 0 || allocationData.length === 0) {
    allocationData.push({
      name: 'Cash',
      value: cashBalance,
      color: SECTOR_COLORS['Cash']
    });
  }

  // Sort by value descending
  allocationData.sort((a, b) => b.value - a.value);

  const total = allocationData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="card h-full flex flex-col hover:shadow-xl"
    >
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon size={20} className="text-primary-600 dark:text-primary-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Asset Allocation</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total Portfolio</p>
          <p className="text-slate-900 dark:text-white font-bold text-xl">${(total / 1000).toFixed(1)}k</p>
        </div>

        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1}>
            <RePieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={allocationData.length > 1 ? 4 : 0}
                dataKey="value"
                stroke="none"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RePieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-slate-500 text-sm">No assets to display</div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2">
        {allocationData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{item.name}</span>
            </div>
            <span className="text-light-text dark:text-white font-medium">
              {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AssetAllocation;
