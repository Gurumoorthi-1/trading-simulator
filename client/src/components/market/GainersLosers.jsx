import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

const GainersLosers = ({ gainers, losers, onStockClick }) => {
  const [activeTab, setActiveTab] = useState('gainers');

  const displayData = activeTab === 'gainers' ? gainers : losers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
    >
      {/* Gainers Card */}
      <div className="card">
        <h3 className="text-lg font-bold text-light-text dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-profit" />
          Top Gainers
        </h3>
        <div className="space-y-2">
          {gainers.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => onStockClick && onStockClick(stock)}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg border border-transparent hover:border-light-border dark:hover:border-dark-border cursor-pointer transition-colors group"
              >
                <div>
                  <h4 className="text-light-text dark:text-white font-bold text-sm tracking-wide">{stock.symbol}</h4>
                  <p className="text-slate-500 text-xs truncate max-w-[120px]">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-light-text dark:text-white font-bold text-sm">${stock.price.toFixed(2)}</p>
                  <div className={`flex items-center justify-end gap-1 text-[11px] font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Losers Card */}
      <div className="card">
        <h3 className="text-lg font-bold text-light-text dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-loss" style={{ transform: 'rotate(180deg)' }} />
          Top Losers
        </h3>
        <div className="space-y-2">
          {losers.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => onStockClick && onStockClick(stock)}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg border border-transparent hover:border-light-border dark:hover:border-dark-border cursor-pointer transition-colors group"
              >
                <div>
                  <h4 className="text-light-text dark:text-white font-bold text-sm tracking-wide">{stock.symbol}</h4>
                  <p className="text-slate-500 text-xs truncate max-w-[120px]">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-light-text dark:text-white font-bold text-sm">${stock.price.toFixed(2)}</p>
                  <div className={`flex items-center justify-end gap-1 text-[11px] font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default GainersLosers;
