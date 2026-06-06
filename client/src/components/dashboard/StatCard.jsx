import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

const StatCard = ({ title, value, change, isPositive, icon, isLoading, delay = 0 }) => {
  if (isLoading) {
    return (
      <div className="card h-[132px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card hover:border-primary-500/30 transition-colors flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-600 dark:text-slate-400 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-light-bg dark:bg-dark-bg rounded-lg text-primary-600 dark:text-primary-400">
          {icon}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-light-text dark:text-white mb-2">{value}</h2>
        <div className="flex items-center gap-1 text-sm">
          {isPositive ? (
            <TrendingUp size={16} className="text-profit" />
          ) : (
            <TrendingDown size={16} className="text-loss" />
          )}
          <span className={isPositive ? "text-profit font-medium" : "text-loss font-medium"}>
            {change}
          </span>
          <span className="text-slate-500 dark:text-slate-500 ml-1">vs last month</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
