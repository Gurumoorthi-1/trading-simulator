import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, PieChart } from 'lucide-react';
import { useAuthStore, useTradeStore } from '../../context/store';
import { allStocks } from '../../utils/marketData';

const PortfolioStats = () => {
  const { user } = useAuthStore();
  const { holdings } = useTradeStore();

  const cashBalance = user?.balance ?? 0;

  // Calculate stats from holdings
  const totalInvested = holdings.reduce((sum, item) => sum + (item.shares * item.averagePrice), 0);

  const getStockCurrentPrice = (symbol, avgPrice) => {
    const stock = allStocks.find(s => s.symbol === symbol.toUpperCase());
    return stock ? stock.price : avgPrice;
  };

  const getStockDayChange = (symbol) => {
    const stock = allStocks.find(s => s.symbol === symbol.toUpperCase());
    return stock ? stock.change : 0;
  };

  const currentValue = holdings.reduce((sum, item) => {
    const currentPrice = getStockCurrentPrice(item.symbol, item.averagePrice);
    return sum + (item.shares * currentPrice);
  }, 0);

  const totalValue = cashBalance + currentValue;
  const totalProfit = currentValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const dayChange = holdings.reduce((sum, item) => {
    const change = getStockDayChange(item.symbol);
    return sum + (item.shares * change);
  }, 0);
  
  const dayChangePercentage = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;
  const isDayChangePositive = dayChange >= 0;
  const isTotalProfitPositive = totalProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        className="card bg-gradient-to-br from-primary-600/20 to-purple-600/20 border-primary-500/30 shadow-lg shadow-primary-500/5 hover:shadow-xl hover:shadow-primary-500/10"
      >
        <div className="flex items-center gap-3 mb-2 text-slate-600 dark:text-slate-300">
          <Briefcase size={18} className="text-primary-600 dark:text-primary-400" />
          <h3 className="text-sm font-medium">Total Portfolio Value</h3>
        </div>
        <h2 className="text-3xl font-bold text-light-text dark:text-white mb-2 animate-pulse">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
            isDayChangePositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
          }`}>
            {isDayChangePositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isDayChangePositive ? '+' : ''}${dayChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-slate-500 text-xs">Today</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        className="card hover:shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2 text-slate-600 dark:text-slate-400">
          <DollarSign size={18} className="text-slate-600 dark:text-slate-400" />
          <h3 className="text-sm font-medium">Total Invested</h3>
        </div>
        <h2 className="text-2xl font-bold text-light-text dark:text-white">
          ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <p className="text-slate-500 text-sm mt-1">{holdings.length} Active Positions</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        className="card hover:shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2 text-slate-600 dark:text-slate-400">
          {isTotalProfitPositive ? (
            <TrendingUp size={18} className="text-profit" />
          ) : (
            <TrendingDown size={18} className="text-loss" />
          )}
          <h3 className="text-sm font-medium">Total Profit</h3>
        </div>
        <h2 className={`text-2xl font-bold mb-1 ${isTotalProfitPositive ? 'text-profit' : 'text-loss'}`}>
          {isTotalProfitPositive ? '+' : ''}${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <p className="text-slate-500 text-sm">All Time</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        className="card hover:shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2 text-slate-600 dark:text-slate-400">
          <PieChart size={18} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-medium">Available Cash</h3>
        </div>
        <h2 className="text-2xl font-bold text-light-text dark:text-white mb-1">
          ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <p className="text-slate-500 text-sm">Ready to invest</p>
      </motion.div>
    </div>
  );
};

export default PortfolioStats;
