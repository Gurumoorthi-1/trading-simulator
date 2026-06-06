import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import { getRecentTrades } from '../../utils/services';

const TransactionsTable = ({ isLoading: parentLoading }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecentTrades();
        setTrades(data.trades || []);
      } catch (error) {
        console.error('Failed to fetch recent trades:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!parentLoading) {
      fetchData();
    }
  }, [parentLoading]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (parentLoading || loading) {
    return (
      <div className="card">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="card overflow-x-auto"
    >
      <div className="flex justify-between items-center mb-6 min-w-[600px]">
        <h3 className="text-lg font-bold text-light-text dark:text-white">Recent Transactions</h3>
        <Link to="/wallet" className="text-primary-600 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400 text-sm font-medium">View All</Link>
      </div>
      
      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt size={36} className="text-slate-500 dark:text-slate-600 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No transactions yet</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Your trade history will appear here.</p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border text-slate-500 dark:text-slate-500 text-sm">
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Asset</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((tx) => {
              const isBuy = tx.type === 'trade_buy';
              return (
                <tr key={tx._id} className="border-b border-light-border/50 dark:border-dark-border/50 hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="py-4">
                    <div className={`flex items-center gap-2 text-sm font-medium ${isBuy ? 'text-profit' : 'text-loss'}`}>
                      {isBuy ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      {isBuy ? 'Buy' : 'Sell'}
                    </div>
                  </td>
                  <td className="py-4 font-bold text-light-text dark:text-white text-sm">{tx.stockSymbol || 'N/A'}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">{tx.quantity || 0} shares</td>
                  <td className="py-4 text-light-text dark:text-white font-medium text-sm">${(tx.pricePerShare || 0).toFixed(2)}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 text-sm">{formatDate(tx.createdAt)}</td>
                  <td className="py-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.status === 'completed' ? 'bg-profit/10 text-profit border border-profit/20' 
                      : tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'bg-loss/10 text-loss border border-loss/20'
                    }`}>
                      {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </motion.div>
  );
};

export default TransactionsTable;
