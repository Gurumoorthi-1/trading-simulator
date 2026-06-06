import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PriceTicker = ({ price, priceDirection, change, changePercent }) => {
  const [displayPrice, setDisplayPrice] = useState(price);
  const animationRef = useRef(null);
  const lastPriceRef = useRef(price);

  useEffect(() => {
    const targetPrice = price;
    const startPrice = lastPriceRef.current;
    const startTime = Date.now();
    const duration = 300; // 300ms animation

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentPrice = startPrice + (targetPrice - startPrice) * easeOutQuart;
      
      setDisplayPrice(currentPrice);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        lastPriceRef.current = targetPrice;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [price]);

  const isPositive = priceDirection === 'up';
  const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
  const bgClass = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';

  return (
    <div className="flex items-baseline gap-3">
      <motion.span
        key={displayPrice.toFixed(2)}
        className={`text-4xl font-bold font-mono ${colorClass}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 0.2 }}
      >
        ${displayPrice.toFixed(2)}
      </motion.span>
      
      {change !== undefined && changePercent !== undefined && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${change}-${changePercent}`}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${bgClass}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className={`text-sm font-semibold ${colorClass}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}
            </span>
            <span className={`text-sm font-semibold ${colorClass}`}>
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
