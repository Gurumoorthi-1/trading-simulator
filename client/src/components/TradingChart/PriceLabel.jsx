import React from 'react';
import { motion } from 'framer-motion';

export const PriceLabel = ({ price, priceDirection }) => {
  const isPositive = priceDirection === 'up';
  const bgColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <motion.div
      className="absolute right-0 z-10 flex items-center"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      <motion.div
        className="relative px-3 py-1 rounded-l-md font-bold font-mono text-white shadow-lg"
        style={{
          backgroundColor: bgColor,
        }}
        animate={{
          scale: priceDirection !== 'neutral' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.3,
        }}
      >
        <span className="text-sm">
          ${price.toFixed(2)}
        </span>
      </motion.div>
      <motion.div
        className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px]"
        style={{
          borderLeftColor: bgColor,
        }}
      />
    </motion.div>
  );
};
