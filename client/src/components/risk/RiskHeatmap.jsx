import React from 'react';
import { motion } from 'framer-motion';
import { Grid, TrendingUp, TrendingDown } from 'lucide-react';

const RiskHeatmap = ({ returns = [] }) => {
  if (!returns.length) {
    return (
      <div className="card h-[250px] flex items-center justify-center text-slate-500">
        No return data to map.
      </div>
    );
  }

  // Calculate intensity based on absolute value, maxed around 3%
  const getColor = (val) => {
    if (val === 0) return 'bg-slate-700 hover:bg-slate-600';

    const intensity = Math.min(100, (Math.abs(val) / 3) * 100);

    if (val > 0) {
      if (intensity < 30) return 'bg-profit/40 hover:bg-profit/50 border border-profit/20';
      if (intensity < 60) return 'bg-profit/60 hover:bg-profit/70 border border-profit/30';
      return 'bg-profit hover:bg-profit/90 border border-profit/50 shadow-[0_0_10px_rgba(34,197,94,0.3)] shadow-profit/40 z-10 scale-105';
    } else {
      if (intensity < 30) return 'bg-loss/40 hover:bg-loss/50 border border-loss/20';
      if (intensity < 60) return 'bg-loss/60 hover:bg-loss/70 border border-loss/30';
      return 'bg-loss hover:bg-loss/90 border border-loss/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] shadow-loss/40 z-10 scale-105';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Grid size={20} className="text-primary-600 dark:text-primary-500" />
          <h3 className="text-lg font-bold text-light-text dark:text-white">Daily Returns Heatmap</h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium bg-light-bg dark:bg-dark-bg px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border w-fit">
          <span className="text-slate-600 dark:text-slate-400">Scale:</span>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-loss rounded-sm"></div> <TrendingDown size={12} className="text-loss" /></div>
          <div className="w-16 h-1 bg-gradient-to-r from-loss via-slate-500 dark:via-slate-700 to-profit rounded-full mx-1"></div>
          <div className="flex items-center gap-1.5"><TrendingUp size={12} className="text-profit" /> <div className="w-3 h-3 bg-profit rounded-sm"></div></div>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid grid-rows-5 gap-2 grid-flow-col auto-cols-max min-w-max pr-4">
          {returns.map((day, i) => (
            <div
              key={i}
              title={`${day.day}: ${day.value > 0 ? '+' : ''}${day.value}%`}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded text-[9px] sm:text-[10px] font-bold text-light-text dark:text-white flex items-center justify-center transition-all cursor-crosshair relative group ${getColor(day.value)}`}
            >
              {Math.abs(day.value) > 1.5 ? Math.round(day.value) : ''}

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
                <span className="text-slate-600 dark:text-slate-400 mr-1">{day.day}:</span>
                <span className={day.value >= 0 ? 'text-profit' : 'text-loss'}>{day.value > 0 ? '+' : ''}{day.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RiskHeatmap;
