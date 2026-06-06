import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MoreHorizontal, ShoppingCart, Download, Eye, Briefcase } from 'lucide-react';
import { useTradeStore } from '../../context/store';
import { allStocks } from '../../utils/marketData';
import StockModal from '../market/StockModal';
import TradeModal from '../market/TradeModal';

const HoldingsTable = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [selectedStock, setSelectedStock] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [tradeModalConfig, setTradeModalConfig] = useState({ isOpen: false, type: 'buy', stock: null });

  const { holdings, isLoading } = useTradeStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleDownloadCSV = () => {
    if (holdings.length === 0) return;
    const headers = ["Asset", "Name", "Shares", "Avg. Price", "Current Price", "Total Value", "Return ($)", "Return (%)"];

    const csvRows = [];
    csvRows.push(headers.join(','));

    holdings.forEach(stock => {
      const liveStock = allStocks.find(s => s.symbol === stock.symbol.toUpperCase());
      const currentPrice = liveStock ? liveStock.price : stock.averagePrice;
      const totalValue = stock.shares * currentPrice;
      const totalCost = stock.shares * stock.averagePrice;
      const returnAmt = totalValue - totalCost;
      const returnPct = totalCost > 0 ? (returnAmt / totalCost) * 100 : 0;

      const row = [
        stock.symbol,
        `"${stock.name}"`,
        stock.shares,
        stock.averagePrice.toFixed(2),
        currentPrice.toFixed(2),
        totalValue.toFixed(2),
        returnAmt.toFixed(2),
        returnPct.toFixed(2)
      ];

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'portfolio_holdings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDropdown = (symbol, e) => {
    e.stopPropagation();
    if (activeDropdown === symbol) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(symbol);
    }
  };

  const handleAction = (action, stockItem) => {
    setActiveDropdown(null);

    let fullStock = allStocks.find(s => s.symbol === stockItem.symbol.toUpperCase());

    if (!fullStock) {
      const currentP = stockItem.averagePrice || 100;
      fullStock = {
        symbol: stockItem.symbol,
        name: stockItem.name || stockItem.symbol,
        price: currentP,
        change: 0,
        changePercent: 0,
        sector: 'Unknown',
        volume: 'N/A',
        marketCap: 'N/A',
        pe: 0,
        high52: currentP * 1.2,
        low52: currentP * 0.8,
      };
    }

    if (action === 'buy') {
      setTradeModalConfig({ isOpen: true, type: 'buy', stock: fullStock });
    } else if (action === 'sell') {
      setTradeModalConfig({ isOpen: true, type: 'sell', stock: fullStock });
    } else if (action === 'details') {
      setSelectedStock(fullStock);
      setIsStockModalOpen(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="card overflow-x-auto"
    >
      <div className="flex items-center justify-between mb-6 min-w-[800px]">
        <h3 className="text-lg font-bold text-light-text dark:text-white">Your Assets</h3>
        {holdings.length > 0 && (
          <button
            onClick={handleDownloadCSV}
            className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1"
          >
            <Download size={16} />
            Download CSV
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-dark-bg animate-pulse" />
          ))}
        </div>
      ) : holdings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-light-border dark:border-dark-border rounded-2xl bg-light-bg dark:bg-dark-bg/25">
          <Briefcase size={40} className="text-slate-400 dark:text-slate-600 mb-4" />
          <h4 className="text-light-text dark:text-white font-bold text-base mb-1">No Assets Owned</h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mb-4">
            You don't own any stocks yet. Use the Market page to browse stocks and execute trades.
          </p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border text-slate-500 text-xs uppercase tracking-wider">
              <th className="pb-3 text-left font-semibold">Asset</th>
              <th className="pb-3 text-center font-semibold">Shares</th>
              <th className="pb-3 text-center font-semibold">Avg. Price</th>
              <th className="pb-3 text-center font-semibold">Current Price</th>
              <th className="pb-3 text-center font-semibold">Total Value</th>
              <th className="pb-3 text-right font-semibold">Return</th>
              <th className="pb-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((stock, i) => {
              const liveStock = allStocks.find(s => s.symbol === stock.symbol.toUpperCase());
              const currentPrice = liveStock ? liveStock.price : stock.averagePrice;
              const totalValue = stock.shares * currentPrice;
              const totalCost = stock.shares * stock.averagePrice;
              const returnAmt = totalValue - totalCost;
              const returnPct = totalCost > 0 ? (returnAmt / totalCost) * 100 : 0;
              const isPositive = returnAmt >= 0;

              return (
                <tr key={stock.symbol || i} className="border-b border-light-border dark:border-dark-border/50 hover:bg-light-bg dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${isPositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                        {stock.symbol.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-light-text dark:text-white font-bold text-sm tracking-wide">{stock.symbol}</span>
                        <span className="text-slate-500 text-[10px] truncate max-w-[100px]">{stock.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">{stock.shares.toLocaleString()}</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">${stock.averagePrice.toFixed(2)}</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-light-text dark:text-white font-bold text-sm">${currentPrice.toFixed(2)}</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-light-text dark:text-white font-black text-sm">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
                        {isPositive ? '+' : ''}${returnAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-profit' : 'text-loss'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(returnPct).toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center relative">
                    <button
                      onClick={(e) => toggleDropdown(stock.symbol || i, e)}
                      className="p-2 hover:bg-light-bg dark:hover:bg-dark-border rounded-lg text-slate-400 dark:text-slate-400 hover:text-light-text dark:hover:text-white transition-colors focus:outline-none"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeDropdown === (stock.symbol || i) && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-8 top-10 z-50 w-36 bg-dark-bg border border-dark-border rounded-lg shadow-lg overflow-hidden"
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction('buy', stock); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-card hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <ShoppingCart size={14} /> Buy More
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction('sell', stock); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-card hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <TrendingDown size={14} /> Sell
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction('details', stock); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-card hover:text-white flex items-center gap-2 border-t border-dark-border transition-colors"
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Stock Details Modal */}
      <StockModal
        stock={selectedStock}
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
      />

      {/* Trade Modal */}
      <TradeModal
        stock={tradeModalConfig.stock}
        isOpen={tradeModalConfig.isOpen}
        initialType={tradeModalConfig.type}
        onClose={() => setTradeModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
};

export default HoldingsTable;
