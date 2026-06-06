import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Zap, Clock } from 'lucide-react';

const SuggestionCard = ({ suggestion, index }) => {
  const getActionColor = (action) => {
    switch (action) {
      case 'BUY': return 'text-profit border-profit/50 bg-profit/10';
      case 'SELL': return 'text-loss border-loss/50 bg-loss/10';
      default: return 'text-amber-500 border-amber-500/50 bg-amber-500/10';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'BUY': return <TrendingUp size={20} />;
      case 'SELL': return <TrendingDown size={20} />;
      default: return <Minus size={20} />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'text-loss';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-profit';
      default: return 'text-slate-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-dark-card/60 backdrop-blur-xl border border-white/5 p-5 hover:border-white/10 transition-colors group"
    >
      {/* Background glow based on action */}
      <div 
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40
          ${suggestion.action === 'BUY' ? 'bg-profit' : suggestion.action === 'SELL' ? 'bg-loss' : 'bg-amber-500'}
        `}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-dark-bg flex items-center justify-center font-bold text-lg text-white border border-dark-border">
            {suggestion.symbol.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{suggestion.symbol}</h3>
            <p className="text-slate-400 text-xs">{suggestion.name}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border ${getActionColor(suggestion.action)}`}>
          {getActionIcon(suggestion.action)}
          {suggestion.action}
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-5 leading-relaxed relative z-10">
        "{suggestion.reason}"
      </p>

      <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
        <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Zap size={14} className="text-primary-400" />
            Predicted Move
          </div>
          <p className={`font-bold ${suggestion.predictedMove.startsWith('+') ? 'text-profit' : 'text-loss'}`}>
            {suggestion.predictedMove}
          </p>
        </div>
        <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <ShieldAlert size={14} className={getRiskColor(suggestion.risk)} />
            Risk Level
          </div>
          <p className="text-white font-bold">{suggestion.risk}</p>
        </div>
      </div>

      <div className="mb-2 relative z-10">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">AI Confidence Score</span>
          <span className="text-white font-bold">{suggestion.confidence}%</span>
        </div>
        <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden border border-dark-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${suggestion.confidence}%` }}
            transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
            className={`h-full rounded-full bg-gradient-to-r 
              ${suggestion.confidence > 80 ? 'from-primary-600 to-primary-400' : 'from-purple-600 to-purple-400'}
            `}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border/50 relative z-10">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
          <Clock size={14} />
          {suggestion.timeframe}
        </div>
        <button className="text-primary-400 hover:text-primary-300 text-sm font-bold transition-colors">
          View Chart
        </button>
      </div>
    </motion.div>
  );
};

export default SuggestionCard;
