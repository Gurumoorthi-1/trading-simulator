import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { getTrendingStocks } from '../../utils/services';

const TrendingStocks = ({ isLoading: parentLoading }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getTrendingStocks();
      setStocks(data.trending || []);
    } catch (error) {
      console.error('Failed to fetch trending stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!parentLoading) {
      fetchData();
      // Auto-refresh every 15 seconds for live price simulation
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [parentLoading]);

  if (parentLoading || loading) {
    return (
      <div className="card flex flex-col h-full">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16 mb-1 ml-auto" />
                <Skeleton className="h-3 w-10 ml-auto" />
              </div>
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
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-light-text dark:text-white">Trending Stocks</h3>
        <button 
          onClick={fetchData}
          className="text-primary-600 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400 text-sm font-medium flex items-center gap-1"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      
      {stocks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center py-8">
          <div>
            <TrendingUp size={36} className="text-slate-500 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No stocks yet</p>
            <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Buy some stocks to see them here!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {stocks.map((stock, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer border border-transparent hover:border-light-border dark:hover:border-dark-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${stock.isPositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                  {stock.symbol.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-light-text dark:text-white font-bold text-sm">{stock.symbol}</h4>
                  <p className="text-slate-500 dark:text-slate-500 text-xs truncate max-w-[100px]">{stock.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-light-text dark:text-white font-bold text-sm">${stock.price.toFixed(2)}</p>
                <div className={`flex items-center justify-end gap-1 text-xs font-medium ${stock.isPositive ? 'text-profit' : 'text-loss'}`}>
                  {stock.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stock.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TrendingStocks;
