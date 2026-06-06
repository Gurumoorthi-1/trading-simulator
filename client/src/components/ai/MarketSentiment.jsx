import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { marketSentiment } from '../../utils/aiData';

const MarketSentiment = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card relative overflow-hidden bg-gradient-to-br from-dark-card to-dark-bg border border-dark-border"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Activity size={150} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <BarChart2 size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Global Market Sentiment</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-2xl">
            {marketSentiment.summary}
          </p>
          
          <div className="flex gap-4">
            {Object.entries(marketSentiment.indicators).map(([key, value]) => (
              <div key={key} className="bg-dark-bg px-3 py-1.5 rounded-lg border border-dark-border">
                <span className="text-slate-500 text-xs capitalize mr-2">{key}:</span>
                <span className="text-white font-medium text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Simple SVG Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#1e293b" // slate-800
                strokeWidth="8"
              />
              {/* Foreground circle (progress) */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray="283" // 2 * pi * 45
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * marketSentiment.score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" /> {/* profit */}
                  <stop offset="100%" stopColor="#0ea5e9" /> {/* primary */}
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{marketSentiment.score}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{marketSentiment.status}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketSentiment;
