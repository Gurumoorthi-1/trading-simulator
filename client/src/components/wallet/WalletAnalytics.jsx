import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWalletStore } from '../../context/store';

const WalletAnalytics = () => {
  const { transactions } = useWalletStore();

  const data = useMemo(() => {
    // Basic aggregation: group by type for simplicity in this demo
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalInvested = 0; // trade_buy
    let totalReturns = 0; // trade_sell

    transactions.forEach(tx => {
      if (tx.type === 'deposit') totalDeposits += tx.amount;
      if (tx.type === 'withdrawal') totalWithdrawals += tx.amount;
      if (tx.type === 'trade_buy') totalInvested += tx.amount;
      if (tx.type === 'trade_sell') totalReturns += tx.amount;
    });

    return [
      { name: 'Deposits', value: totalDeposits, fill: '#0ea5e9' }, // primary-500
      { name: 'Withdrawals', value: totalWithdrawals, fill: '#64748b' }, // slate-500
      { name: 'Investments', value: totalInvested, fill: '#8b5cf6' }, // purple-500
      { name: 'Returns', value: totalReturns, fill: '#22c55e' }, // profit
    ];
  }, [transactions]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{payload[0].payload.name}</p>
          <p className="text-white font-bold text-lg" style={{ color: payload[0].payload.fill }}>
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card h-full flex flex-col"
    >
      <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Cash Flow Analytics</h3>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }} />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WalletAnalytics;
