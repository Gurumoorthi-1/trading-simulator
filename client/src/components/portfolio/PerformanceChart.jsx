import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../ui/Skeleton';
import { getPortfolioGrowth } from '../../utils/services';

const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-white text-lg">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const PerformanceChart = () => {
  const [activeRange, setActiveRange] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrowth = async () => {
      setLoading(true);
      try {
        const res = await getPortfolioGrowth(activeRange);
        setChartData(res.growth || []);
      } catch (error) {
        console.error('Failed to fetch portfolio growth', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowth();
  }, [activeRange]);

  // Compute change percentage safely
  const startVal = chartData[0]?.value || 0;
  const endVal = chartData[chartData.length - 1]?.value || 0;
  const absoluteChange = endVal - startVal;
  const percentageChange = startVal === 0 ? 0 : (absoluteChange / startVal) * 100;
  const isPositive = absoluteChange >= 0;

  if (loading && !chartData.length) {
    return (
      <div className="card lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-12 rounded-lg" />)}
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="card lg:col-span-2 flex flex-col h-[450px] hover:shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-1">Portfolio Performance</h3>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-bold text-light-text dark:text-white">${endVal.toLocaleString()}</h2>
          </div>
        </div>

        <div className="flex gap-1 bg-light-bg dark:bg-dark-bg p-1 rounded-xl">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveRange(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeRange === tf
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-dark-card'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              dy={10}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              width={45}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
