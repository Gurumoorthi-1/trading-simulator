import { useState, useEffect, useRef, useCallback } from 'react';

const TIMEFRAMES = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1H': 60 * 60 * 1000,
  '4H': 4 * 60 * 60 * 1000,
  '1D': 24 * 60 * 60 * 1000,
};

const generateInitialCandles = (basePrice, timeframe, count = 100) => {
  const candles = [];
  const now = Date.now();
  const tfMs = TIMEFRAMES[timeframe];
  let currentPrice = basePrice;

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * tfMs;
    const volatility = 0.002; // 0.2% volatility
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice;
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    candles.push({
      time: Math.floor(time / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
};

export const useChartSimulation = (basePrice, timeframe) => {
  const [candles, setCandles] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const [prevPrice, setPrevPrice] = useState(basePrice);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const tfMs = TIMEFRAMES[timeframe];

  // Initialize candles when timeframe or base price changes
  const initCandles = useCallback(() => {
    const initialCandles = generateInitialCandles(basePrice, timeframe);
    setCandles(initialCandles);
    if (initialCandles.length > 0) {
      setCurrentPrice(initialCandles[initialCandles.length - 1].close);
      setPrevPrice(initialCandles[initialCandles.length - 1].close);
    }
  }, [basePrice, timeframe]);

  // Update current candle with new price tick
  const updateCurrentCandle = useCallback(() => {
    setCandles((prevCandles) => {
      if (prevCandles.length === 0) return prevCandles;

      const lastCandle = prevCandles[prevCandles.length - 1];
      const now = Date.now();
      const currentCandleTime = lastCandle.time * 1000;

      // Check if we need to create a new candle
      if (now - currentCandleTime >= tfMs) {
        const newTime = Math.floor(now / 1000);
        const newCandle = {
          time: newTime,
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          volume: Math.floor(Math.random() * 500000) + 100000,
        };
        return [...prevCandles, newCandle].slice(-200); // Keep last 200 candles
      }

      // Update existing candle
      const volatility = 0.0015;
      const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
      const newPrice = currentPrice + change;

      const updatedCandle = {
        ...lastCandle,
        high: Math.max(lastCandle.high, newPrice),
        low: Math.min(lastCandle.low, newPrice),
        close: newPrice,
        volume: lastCandle.volume + Math.floor(Math.random() * 10000),
      };

      setPrevPrice(currentPrice);
      setCurrentPrice(newPrice);

      const updatedCandles = [...prevCandles];
      updatedCandles[updatedCandles.length - 1] = updatedCandle;
      return updatedCandles;
    });
  }, [tfMs, currentPrice]);

  useEffect(() => {
    initCandles();
  }, [initCandles]);

  useEffect(() => {
    // Start real-time updates
    intervalRef.current = setInterval(() => {
      updateCurrentCandle();
    }, 800 + Math.random() * 1200); // 800ms to 2000ms interval

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateCurrentCandle]);

  const priceDirection = currentPrice > prevPrice ? 'up' : currentPrice < prevPrice ? 'down' : 'neutral';

  return {
    candles,
    currentPrice,
    prevPrice,
    priceDirection,
    timeframes: Object.keys(TIMEFRAMES),
  };
};
