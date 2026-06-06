import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { Skeleton } from '../ui/Skeleton';

const AdvancedChart = forwardRef(({
  candleData,
  volumeData,
  markers = [],
  isLoading = false
}, ref) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  // Expose methods to parent component (e.g., to handle timeframe changes)
  useImperativeHandle(ref, () => ({
    updateData: (newCandleData, newVolumeData, newMarkers) => {
      if (seriesRef.current && volumeSeriesRef.current) {
        seriesRef.current.setData(newCandleData);
        volumeSeriesRef.current.setData(newVolumeData);

        // Note: markers are managed via plugins in v5, omitting for now
        // if (newMarkers) {
        //   seriesRef.current.setMarkers(newMarkers);
        // }

        chartRef.current.timeScale().fitContent();
      }
    }
  }));

  useEffect(() => {
    if (isLoading || !chartContainerRef.current) return;

    // Initialize Chart
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#94a3b8', // slate-400
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.4)' }, // dark-border
        horzLines: { color: 'rgba(51, 65, 85, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#cbd5e1',
          style: 3, // dashed
        },
        horzLine: {
          width: 1,
          color: '#cbd5e1',
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 85, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add Candlestick Series using v5 method
    const mainSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', // profit
      downColor: '#ef4444', // loss
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = mainSeries;
    mainSeries.setData(candleData);

    // Add Volume Series using v5 method
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart height
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;
    volumeSeries.setData(volumeData);

    // Note: markers are managed via plugins or different API in v5, omitting for now to prevent crashes until plugin is set up
    // if (markers && markers.length > 0) {
    //   mainSeries.setMarkers(markers);
    // }

    // Fit content
    chart.timeScale().fitContent();

    // Hide TradingView attribution logo defensively
    const hideLogo = () => {
      chartContainerRef.current?.querySelectorAll('a#tv-attr-logo, a[href*="tradingview.com"]').forEach(el => {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
      });
    };

    hideLogo();
    setTimeout(hideLogo, 100);
    setTimeout(hideLogo, 500);
    setTimeout(hideLogo, 1000);

    // Setup resize observer
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
      hideLogo();
    });
    resizeObserver.observe(chartContainerRef.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candleData, volumeData, markers, isLoading]);

  if (isLoading) {
    return <Skeleton className="w-full h-full min-h-[400px] rounded-2xl" />;
  }

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden bg-dark-bg border border-dark-border/50"
    />
  );
});

AdvancedChart.displayName = 'AdvancedChart';

export default AdvancedChart;
