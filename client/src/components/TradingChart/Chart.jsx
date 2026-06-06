import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../context/store';
import { useChartSimulation } from './useChartSimulation';
import { PriceTicker } from './PriceTicker';
import { MarketStats } from './MarketStats';

const TradingChart = ({ symbol, basePrice, name }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1m');
  const { theme } = useThemeStore();

  const {
    candles,
    currentPrice,
    prevPrice,
    priceDirection,
    timeframes,
  } = useChartSimulation(basePrice, timeframe);

  const change = currentPrice - basePrice;
  const changePercent = (change / basePrice) * 100;

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: isDark ? '#0f172a' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#64748b',
      },
      grid: {
        vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
        horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: isDark ? '#475569' : '#cbd5e1',
          style: 2,
        },
        horzLine: {
          width: 1,
          color: isDark ? '#475569' : '#cbd5e1',
          style: 2,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isDark ? '#1e293b' : '#f1f5f9',
      },
      rightPriceScale: {
        borderColor: isDark ? '#1e293b' : '#f1f5f9',
      },
      autoSize: true,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    candlestickSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(
      candles.map((candle) => ({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? '#22c55e80' : '#ef444480',
      }))
    );

    // Scroll to the right
    chartRef.current?.timeScale().scrollToRealTime();
  }, [candles]);

  // Handle theme changes
  useEffect(() => {
    if (!chartRef.current) return;
    const isDark = theme === 'dark';
    chartRef.current.applyOptions({
      layout: {
        background: { type: 'solid', color: isDark ? '#0f172a' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#64748b',
      },
      grid: {
        vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
        horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
      },
      timeScale: {
        borderColor: isDark ? '#1e293b' : '#f1f5f9',
      },
      rightPriceScale: {
        borderColor: isDark ? '#1e293b' : '#f1f5f9',
      },
    });
  }, [theme]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
            {symbol.charAt(0)}
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-light-text dark:text-white">{name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{symbol}</p>
          </div>
        </div>

        <PriceTicker
          price={currentPrice}
          priceDirection={priceDirection}
          change={change}
          changePercent={changePercent}
        />
      </div>

      <div className="flex items-center gap-2">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${timeframe === tf
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
              : 'bg-light-bg dark:bg-dark-bg text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-transparent'
              }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div
        ref={chartContainerRef}
        className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-light-border dark:border-dark-border"
      />

      <MarketStats
        candles={candles}
        currentPrice={currentPrice}
        basePrice={basePrice}
      />
    </div>
  );
};

export default TradingChart;
