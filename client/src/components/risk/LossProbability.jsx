import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { BarChart3 } from 'lucide-react';

const LossProbability = ({ distribution = [] }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-3 rounded-lg shadow-xl text-center">
          <p className="text-light-text dark:text-white font-bold text-lg">{payload[0].value} Days</p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">Return: {payload[0].payload.range}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="card h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={20} className="text-primary-600 dark:text-primary-500" />
        <h3 className="text-lg font-bold text-light-text dark:text-white">Return Distribution</h3>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-xl">
        Histogram showing the frequency of daily returns. A wider spread indicates higher volatility and fatter tails (extreme events).
      </p>

      {distribution.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          No distribution data available
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={distribution} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="range"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                dy={10}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51,65,85,0.2)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={true} animationDuration={1000}>
                {distribution.map((entry, index) => {
                  const isNegative = entry.range.includes('-');
                  return <Cell key={`cell-${index}`} fill={isNegative ? '#ef4444' : '#22c55e'} fillOpacity={isNegative ? 0.7 : 0.8} />;
                })}
              </Bar>
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#8b5cf6' }}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default LossProbability;
