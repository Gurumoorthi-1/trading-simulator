import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../context/store';

const BalanceCard = ({ onOpenFundModal }) => {
  const { user } = useAuthStore();
  const balance = user?.balance ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card shrink-0 relative overflow-hidden bg-gradient-to-br from-primary-600 to-purple-800 border-none shadow-2xl shadow-primary-500/20"
    >
      {/* Abstract Background Design */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Wallet size={18} />
              <h2 className="text-sm font-medium uppercase tracking-wider">Available Balance</h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            {user && (
              <p className="text-white/60 text-sm mt-1">Welcome, {user.name} 👋</p>
            )}
          </div>
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shrink-0">
            <CreditCard className="text-white" size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-2">
          <button
            onClick={() => onOpenFundModal('deposit')}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
            style={{ color: '#1e3a8a' }}
          >
            <ArrowDownToLine size={18} />
            Deposit
          </button>
          <button
            onClick={() => onOpenFundModal('withdraw')}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-black/20 text-white font-bold rounded-xl hover:bg-black/30 border border-white/20 transition-colors backdrop-blur-sm"
          >
            <ArrowUpFromLine size={18} />
            Withdraw
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
