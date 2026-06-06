import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { marketIndices } from '../../utils/marketData';

const MarketIndices = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {marketIndices.map((index, i) => (
        <motion.div
          key={index.name}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="p-4 rounded-2xl bg-light-card/60 dark:bg-dark-card/60 backdrop-blur-md border border-light-border dark:border-dark-border hover:border-primary-500/30 transition-all cursor-pointer group"
        >
          <p className="text-slate-500 text-xs font-medium mb-1 tracking-wider uppercase">{index.name}</p>
          <p className="text-light-text dark:text-white font-bold text-lg md:text-xl">{index.value}</p>
          <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${index.isPositive ? 'text-profit' : 'text-loss'}`}>
            {index.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{index.change}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MarketIndices;
