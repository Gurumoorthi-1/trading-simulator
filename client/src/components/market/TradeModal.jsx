import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Wallet, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useTradeStore } from '../../context/store';

const TradeModal = ({ stock, initialType = 'buy', isOpen, onClose }) => {
  const [type, setType] = useState(initialType);
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const { user } = useAuthStore();
  const { holdings, executeBuy, executeSell, isLoading: isProcessing } = useTradeStore();

  const balance = user?.balance ?? 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setQuantity(1);
      setIsSuccess(false);
    }
  }, [isOpen, initialType]);

  if (!stock) return null;

  const currentPrice = stock.price;
  const estimatedValue = currentPrice * quantity;

  // Get currently owned shares from portfolio
  const ownedAsset = holdings.find(h => h.symbol.toUpperCase() === stock.symbol.toUpperCase());
  const ownedShares = ownedAsset ? ownedAsset.shares : 0;

  // Validation
  const canAfford = type === 'buy' ? balance >= estimatedValue : true;
  const hasShares = type === 'sell' ? ownedShares >= quantity : true;
  const isValid = quantity > 0 && canAfford && hasShares;

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setQuantity(val);
    } else if (e.target.value === '') {
      setQuantity('');
    }
  };

  const handleMax = () => {
    if (type === 'buy') {
      setQuantity(Math.floor(balance / currentPrice));
    } else {
      setQuantity(ownedShares);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    let result;
    if (type === 'buy') {
      result = await executeBuy(stock.symbol, stock.name, quantity, currentPrice);
    } else {
      result = await executeSell(stock.symbol, quantity, currentPrice);
    }

    if (result.success) {
      setIsSuccess(true);
      toast.success(result.message);
      setTimeout(() => onClose(), 2000);
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
            className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-border bg-dark-bg/50">
              <h2 className="text-xl font-bold text-white">Execute Trade</h2>
              {!isProcessing && !isSuccess && (
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
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
                <h3 className="text-2xl font-bold text-white mb-2">Order Filled!</h3>
                <p className="text-slate-400">
                  Successfully {type === 'buy' ? 'bought' : 'sold'} {quantity} shares of {stock.symbol}.
                </p>
              </div>
            ) : (
              /* Trade Form */
              <form onSubmit={handleSubmit} className="p-5">
                {/* Stock Info */}
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-dark-bg border border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold">
                      {stock.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{stock.symbol}</h3>
                      <p className="text-slate-400 text-xs">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">${currentPrice.toFixed(2)}</p>
                    <p className="text-slate-400 text-xs">Market Price</p>
                  </div>
                </div>

                {/* Buy/Sell Toggle */}
                <div className="flex bg-dark-bg p-1 rounded-xl border border-dark-border mb-6">
                  <button
                    type="button"
                    onClick={() => setType('buy')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'buy'
                      ? 'bg-profit text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('sell')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'sell'
                      ? 'bg-loss text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Quantity Input */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-medium text-slate-300">Quantity (Shares)</label>
                    <button type="button" onClick={handleMax} className="text-xs text-primary-500 hover:text-primary-400 font-medium">
                      Max Available
                    </button>
                  </div>

                  <div className="flex items-center bg-dark-bg border border-dark-border rounded-xl overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, (quantity || 0) - 1))}
                      className="p-4 bg-transparent hover:bg-dark-border/50 transition-colors text-slate-400 hover:text-white"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="flex-1 w-full py-3 bg-transparent text-center text-white font-bold text-xl focus:outline-none"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((quantity || 0) + 1)}
                      className="p-4 bg-transparent hover:bg-dark-border/50 transition-colors text-slate-400 hover:text-white"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {type === 'sell' && ownedShares > 0 && (
                    <p className="text-xs text-slate-400 mt-2 text-right">You own {ownedShares} shares</p>
                  )}
                  {type === 'sell' && ownedShares === 0 && (
                    <p className="text-xs text-loss mt-2 text-right">You don't own this stock</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-3 mb-6 bg-dark-bg/50 p-4 rounded-xl border border-dark-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Value</span>
                    <span className="text-white font-bold">${estimatedValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Available Balance</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <Wallet size={14} /> ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-dark-border/50 flex justify-between text-sm">
                    <span className="text-slate-300 font-medium">Est. New Balance</span>
                    <span className={`font-bold ${!canAfford && type === 'buy' ? 'text-loss' : 'text-primary-400'}`}>
                      ${(type === 'buy' ? balance - estimatedValue : balance + estimatedValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Error Messages */}
                {!canAfford && type === 'buy' && (
                  <p className="text-loss text-sm font-medium mb-4 text-center bg-loss/10 py-2 rounded-lg border border-loss/20">
                    Insufficient funds for this trade
                  </p>
                )}
                {!hasShares && type === 'sell' && (
                  <p className="text-loss text-sm font-medium mb-4 text-center bg-loss/10 py-2 rounded-lg border border-loss/20">
                    You don't own enough shares
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isValid || isProcessing}
                  className={`w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    ${type === 'buy' ? 'bg-profit hover:bg-profit/90 shadow-profit/20' : 'bg-loss hover:bg-loss/90 shadow-loss/20'}
                  `}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Execute {type === 'buy' ? 'Buy' : 'Sell'} Order <ArrowRightLeft size={18} />
                    </>
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

export default TradeModal;
