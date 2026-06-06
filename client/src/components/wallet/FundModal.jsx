import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Building, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useWalletStore } from '../../context/store';

const FundModal = ({ isOpen, onClose, initialType = 'deposit' }) => {
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { user } = useAuthStore();
  const { deposit, withdraw, isLoading: isProcessing } = useWalletStore();

  const balance = user?.balance ?? 0;

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount('');
      setIsSuccess(false);
    }
  }, [isOpen, initialType]);

  const presetAmounts = [100, 500, 1000, 5000];

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  const numericAmount = parseInt(amount) || 0;
  const isValid = numericAmount > 0 && (type === 'deposit' || numericAmount <= balance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    let result;
    if (type === 'deposit') {
      result = await deposit(numericAmount);
    } else {
      result = await withdraw(numericAmount);
    }

    if (result.success) {
      setIsSuccess(true);
      toast.success(result.message);
      setTimeout(() => onClose(), 2500);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
            onClick={!isProcessing ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50">
              <h2 className="text-xl font-bold text-light-text dark:text-white">
                {type === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
              </h2>
              {!isProcessing && !isSuccess && (
                <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-light-text dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 rounded-full bg-profit/10 flex items-center justify-center text-profit mb-4"
                >
                  <CheckCircle2 size={40} />
                </motion.div>
                <h3 className="text-2xl font-bold text-light-text dark:text-white mb-2">Transfer Successful!</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  ${numericAmount.toLocaleString()} has been {type === 'deposit' ? 'added to' : 'withdrawn from'} your wallet.
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-5">

                {/* Type Toggle */}
                <div className="flex bg-light-bg dark:bg-dark-bg p-1 rounded-xl border border-light-border dark:border-dark-border mb-6">
                  <button
                    type="button"
                    onClick={() => setType('deposit')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'deposit' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-border dark:hover:bg-dark-border'
                      }`}
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('withdraw')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'withdraw' ? 'bg-light-card dark:bg-dark-card text-light-text dark:text-white border border-light-border dark:border-dark-border shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-border dark:hover:bg-dark-border'
                      }`}
                  >
                    Withdraw
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white font-bold text-2xl focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Preset Amounts */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className="py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-slate-600 dark:text-slate-300 font-medium text-sm hover:border-primary-500/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                {/* Bank Info Mock */}
                <div className="mb-6 p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-light-border dark:bg-slate-800 flex items-center justify-center">
                    <Building size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-light-text dark:text-white font-medium text-sm">Linked Bank Account</p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs">Chase Checking •••• 4589</p>
                  </div>
                </div>

                {/* Validation Warning */}
                {type === 'withdraw' && numericAmount > balance && (
                  <div className="mb-4 flex items-center gap-2 text-loss text-sm bg-loss/10 p-3 rounded-lg border border-loss/20">
                    <AlertCircle size={16} />
                    <span>Insufficient funds. Max available: ${balance.toLocaleString()}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isValid || isProcessing}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    ${type === 'deposit' ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20 text-white' : 'bg-light-text dark:bg-white text-white dark:text-black hover:opacity-90'}
                  `}
                >
                  {isProcessing ? (
                    <>
                      <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${type === 'deposit' ? 'border-white/30' : 'border-black/30'}`}></div>
                      Processing...
                    </>
                  ) : (
                    <>Confirm {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FundModal;
