import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';

import MarketIndices from '../components/market/MarketIndices';
import StockCard from '../components/market/StockCard';
import StockModal from '../components/market/StockModal';
import GainersLosers from '../components/market/GainersLosers';
import { Skeleton } from '../components/ui/Skeleton';
import { sectors } from '../utils/marketData';
import { useDebounce } from '../hooks/useDebounce';
import { useMarketStore } from '../context/store';

const Market = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const { stocks, startRealTimeUpdates, stopRealTimeUpdates } = useMarketStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    startRealTimeUpdates();
    return () => {
      clearTimeout(timer);
      stopRealTimeUpdates();
    };
  }, []);

  // Update last updated time whenever stocks change
  useEffect(() => {
    setLastUpdated(new Date());
  }, [stocks]);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        stock.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [stocks, debouncedSearch, selectedSector]);

  // Top gainers & losers
  const topGainers = useMemo(() => {
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);
  }, [stocks]);

  const topLosers = useMemo(() => {
    return [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4);
  }, [stocks]);

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Market</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Live market data · Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Market Indices */}
      <div className="mb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <MarketIndices />
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks by name or symbol..."
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedSector === sector
                  ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/30'
                  : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-light-border/80 dark:hover:border-dark-border/80'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="mb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : filteredStocks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">No stocks found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStocks.map((stock, i) => (
              <StockCard key={stock.symbol} stock={stock} index={i} onClick={handleStockClick} />
            ))}
          </div>
        )}
      </div>

      {/* Gainers & Losers */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Market Movers</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <GainersLosers gainers={topGainers} losers={topLosers} onStockClick={handleStockClick} />
        )}
      </div>

      {/* Stock Details Modal */}
      <StockModal
        stock={selectedStock}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Market;
