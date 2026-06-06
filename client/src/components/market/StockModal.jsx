import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, DollarSign, Activity, Layers } from 'lucide-react';
import TradingChart from '../TradingChart/Chart';
import TradeModal from './TradeModal';
import { useMarketStore } from '../../context/store';

const StockModal = ({ stock: initialStock, isOpen, onClose }) => {
  const { stocks, getStock } = useMarketStore();
  const [stock, setStock] = useState(initialStock);
  const [tradeModalConfig, setTradeModalConfig] = useState({ isOpen: false, type: 'buy' });

  // Update stock from market store when it changes
  useEffect(() => {
    if (initialStock) {
      const liveStock = getStock(initialStock.symbol);
      if (liveStock) {
        setStock(liveStock);
      }
    }
  }, [stocks, initialStock, getStock]);

  if (!stock) return null;

  const stats = [
    { label: 'Market Cap', value: stock.marketCap, icon: <DollarSign size={16} /> },
    { label: 'P/E Ratio', value: stock.pe, icon: <BarChart3 size={16} /> },
    { label: 'Volume', value: stock.volume, icon: <Activity size={16} /> },
    { label: 'Sector', value: stock.sector, icon: <Layers size={16} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-light-bg dark:bg-dark-bg flex flex-col overflow-hidden text-light-text dark:text-dark-text"
          >
            {/* Header */}
            <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-light-border dark:border-dark-border p-4 md:p-5 flex items-center justify-between shrink-0">
              <button onClick={onClose} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 md:p-5 overflow-y-auto flex-1 flex flex-col">
              <TradingChart
                symbol={stock.symbol}
                basePrice={stock.basePrice}
                name={stock.name}
              />

              {/* Stats & Ranges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-6 shrink-0">
                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center gap-3">
                      <div className="text-primary-600 dark:text-primary-400">{stat.icon}</div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">{stat.label}</p>
                        <p className="text-light-text dark:text-white font-bold text-sm">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border flex flex-col justify-center">
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-3">52-Week Range</p>
                  <div className="flex items-center gap-3">
                    <span className="text-loss text-sm font-medium">${stock.low52.toFixed(2)}</span>
                    <div className="flex-1 relative h-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                        style={{ width: `${((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100}%` }}
                      />
                    </div>
                    <span className="text-profit text-sm font-medium">${stock.high52.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto shrink-0">
                <button
                  onClick={() => setTradeModalConfig({ isOpen: true, type: 'buy' })}
                  className="flex-1 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition-colors shadow-[0_0_20px_rgba(34,197,94,0.15)] flex items-center justify-center gap-2"
                >
                  Buy {stock.symbol}
                </button>
                <button
                  onClick={() => setTradeModalConfig({ isOpen: true, type: 'sell' })}
                  className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg transition-colors shadow-[0_0_20px_rgba(239,68,68,0.15)] flex items-center justify-center gap-2"
                >
                  Sell {stock.symbol}
                </button>
              </div>

            </div>
          </motion.div>

          <TradeModal
            stock={stock}
            isOpen={tradeModalConfig.isOpen}
            initialType={tradeModalConfig.type}
            onClose={() => setTradeModalConfig(prev => ({ ...prev, isOpen: false }))}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default StockModal;
