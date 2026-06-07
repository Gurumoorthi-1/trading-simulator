import React, { useMemo } from 'react';

export const MarketStats = ({ candles, currentPrice, basePrice }) => {
  const lastCandle = useMemo(() => {
    return candles?.length > 0 ? candles[candles.length - 1] : null;
  }, [candles]);

  const change = useMemo(() => currentPrice - basePrice, [currentPrice, basePrice]);
  const changePercent = useMemo(() => (change / basePrice) * 100, [change, basePrice]);
  const isPositive = change >= 0;

  if (!lastCandle) return null;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open</span>
        <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
          ${lastCandle.open.toFixed(2)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">High</span>
        <span className="text-sm font-mono font-semibold text-green-600 dark:text-green-400">
          ${lastCandle.high.toFixed(2)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Low</span>
        <span className="text-sm font-mono font-semibold text-red-600 dark:text-red-400">
          ${lastCandle.low.toFixed(2)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Close</span>
        <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
          ${lastCandle.close.toFixed(2)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Volume</span>
        <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
          {(lastCandle.volume.toLocaleString())}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Change</span>
        <span className={`text-sm font-mono font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
};
