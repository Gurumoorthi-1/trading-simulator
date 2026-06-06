import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import { useTradeStore } from '../../context/store';
import { allStocks } from '../../utils/marketData';

const Watchlist = ({ isLoading }) => {
  const { holdings } = useTradeStore();

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="card"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-light-text dark:text-white">My Holdings</h3>
        <Link to="/market" className="p-1.5 bg-primary-500/10 text-primary-600 dark:text-primary-500 hover:bg-primary-500/20 rounded-md transition-colors">
          <Plus size={16} />
        </Link>
      </div>

      {(!holdings || holdings.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Briefcase size={36} className="text-slate-500 dark:text-slate-600 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No holdings yet</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Visit the market to buy stocks!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {holdings.slice(0, 5).map((stock, index) => {
            const liveStock = allStocks.find(s => s.symbol === stock.symbol.toUpperCase());
            const currentPrice = liveStock ? liveStock.price : stock.averagePrice;
            const fluctuation = ((currentPrice - stock.averagePrice) / stock.averagePrice);
            const changeStr = `${fluctuation >= 0 ? '+' : ''}${(fluctuation * 100).toFixed(1)}%`;
            const isUp = fluctuation >= 0;

            return (
              <div key={index} className="flex justify-between items-center p-3 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer border border-transparent hover:border-light-border dark:hover:border-dark-border group">
                <div>
                  <h4 className="text-light-text dark:text-white font-bold text-sm">{stock.symbol}</h4>
                  <p className="text-slate-500 dark:text-slate-500 text-xs">{stock.shares} shares @ ${stock.averagePrice?.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`text-xs font-medium px-2 py-1 rounded ${isUp ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                    {changeStr}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Watchlist;
