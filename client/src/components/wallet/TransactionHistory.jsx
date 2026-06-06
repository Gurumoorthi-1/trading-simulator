import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Clock, RefreshCw } from 'lucide-react';
import { useWalletStore } from '../../context/store';

const TransactionHistory = () => {
  const { transactions, isLoading, fetchTransactions } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight size={20} className="text-profit" />;
      case 'withdrawal':
        return <ArrowUpRight size={20} className="text-slate-400" />;
      case 'trade_buy':
      case 'trade_sell':
        return <ArrowRightLeft size={20} className="text-primary-500" />;
      default:
        return <Clock size={20} className="text-slate-400" />;
    }
  };

  const getTitle = (tx) => {
    switch (tx.type) {
      case 'deposit': return 'Bank Deposit';
      case 'withdrawal': return 'Bank Withdrawal';
      case 'trade_buy': return `Bought ${tx.stockSymbol || 'Stock'}`;
      case 'trade_sell': return `Sold ${tx.stockSymbol || 'Stock'}`;
      default: return 'Transaction';
    }
  };

  const isPositive = (type) => {
    return type === 'deposit' || type === 'trade_sell';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-light-text dark:text-white">Recent Transactions</h3>
        <button
          onClick={() => fetchTransactions()}
          className="text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-light-bg dark:bg-dark-bg animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">No transactions yet</p>
          <p className="text-slate-600 text-sm mt-1">Make a deposit or trade to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors border border-transparent hover:border-light-border/50 dark:hover:border-dark-border/50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-light-bg dark:bg-dark-bg flex items-center justify-center border border-light-border dark:border-dark-border group-hover:bg-light-card dark:group-hover:bg-dark-card transition-colors">
                  {getIcon(tx.type)}
                </div>
                <div>
                  <h4 className="text-light-text dark:text-white font-bold text-sm">{getTitle(tx)}</h4>
                  <p className="text-slate-500 text-xs mt-0.5">{tx.details}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${isPositive(tx.type) ? 'text-profit' : 'text-light-text dark:text-white'}`}>
                  {isPositive(tx.type) ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TransactionHistory;
