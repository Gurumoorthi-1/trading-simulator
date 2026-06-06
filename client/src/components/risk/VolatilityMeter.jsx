import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const VolatilityMeter = ({ volatility }) => {
  const { value, status } = volatility || { value: 0, status: 'Low' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card h-full flex flex-col justify-center"
    >
      <div className="flex items-center gap-2 mb-6">
        <Activity size={20} className="text-primary-600 dark:text-primary-500" />
        <h3 className="text-lg font-bold text-light-text dark:text-white">Daily Volatility Exposure</h3>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-4xl font-extrabold text-light-text dark:text-white">{value}%</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Estimated daily portfolio swing</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${status === 'High' ? 'bg-loss/20 text-loss' : status === 'Medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-profit/20 text-profit'
          }`}>
          {status} Volatility
        </div>
      </div>

      {/* Visual Bar */}
      <div className="w-full h-4 bg-light-bg dark:bg-dark-bg rounded-full overflow-hidden flex border border-light-border dark:border-dark-border mt-4">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, Math.max(10, parseFloat(value) * 30))}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
        <span>Stable (0.5%)</span>
        <span>Average (1.5%)</span>
        <span>Volatile (3.0%+)</span>
      </div>
    </motion.div>
  );
};

export default VolatilityMeter;
