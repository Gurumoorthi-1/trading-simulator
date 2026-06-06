import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const StockCard = ({ stock, index, onClick }) => {
  const isPositive = stock.change >= 0;
  const [prevPrice, setPrevPrice] = useState(stock.price);
  const [priceColor, setPriceColor] = useState('text-slate-900 dark:text-white');

  useEffect(() => {
    if (stock.price !== prevPrice) {
      const color = stock.price > prevPrice ? 'text-profit' : 'text-loss';
      setPriceColor(color);
      setPrevPrice(stock.price);
      
      // Reset to theme color after animation
      const timer = setTimeout(() => setPriceColor('text-slate-900 dark:text-white'), 600);
      return () => clearTimeout(timer);
    }
  }, [stock.price, prevPrice]);

  // Convert sparkline array to chart data
  const chartData = stock.sparkline.map((val, i) => ({ v: val }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      onClick={() => onClick(stock)}
      className="p-4 rounded-2xl bg-light-card/60 dark:bg-dark-card/60 backdrop-blur-md border border-light-border dark:border-dark-border hover:border-primary-500/30 transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isPositive ? 'bg-profit/[0.03]' : 'bg-loss/[0.03]'}`} />

      {/* Flash effect for price change */}
      <motion.div
        animate={{
          opacity: (priceColor !== 'text-slate-900' && priceColor !== 'text-slate-900 dark:text-white') ? 0.15 : 0
        }}
        transition={{ duration: 0.4 }}
        className={`absolute inset-0 pointer-events-none ${priceColor === 'text-profit' ? 'bg-profit' : 'bg-loss'}`}
      />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isPositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
              {stock.symbol.substring(0, 1)}
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">{stock.symbol}</h4>
              <p className="text-slate-500 text-xs truncate max-w-[120px]">{stock.name}</p>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </div>
      </div>

      {/* Mini sparkline chart */}
      <div className="h-12 mb-3 relative z-10">
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`sparkGrad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#sparkGrad-${stock.symbol})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <motion.p
          key={stock.price}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`font-bold text-lg transition-colors duration-200 ${priceColor}`}
        >
          ${stock.price.toFixed(2)}
        </motion.p>
        <p className={`text-xs font-medium ${isPositive ? 'text-profit' : 'text-loss'}`}>
          {isPositive ? '+' : ''}{stock.change.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
};

export default StockCard;
