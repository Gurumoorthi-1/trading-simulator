import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, Info } from 'lucide-react';

const AIRiskInsights = ({ insights = [], loading = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="card bg-gradient-to-br from-primary-500/5 to-purple-600/5 border-primary-500/20 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-primary-500/20 rounded-lg text-primary-600 dark:text-primary-400">
          <Brain size={20} />
        </div>
        <h3 className="text-lg font-bold text-light-text dark:text-white flex items-center gap-2">
          AI Risk Insights <Sparkles size={14} className="text-yellow-500" />
        </h3>
      </div>

      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="flex items-center gap-3 p-4">
            <div className="w-5 h-5 border-2 border-primary-400/30 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Generating AI risk insights...</p>
          </div>
        ) : insights.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm">No insights available.</p>
        ) : (
          insights.map((insight, index) => {
            const isWarning = insight.toLowerCase().includes('risk') || insight.toLowerCase().includes('warning') || insight.toLowerCase().includes('heavy');

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border flex items-start gap-4 transition-all hover:bg-light-bg dark:hover:bg-dark-bg
                  ${isWarning
                    ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                    : 'bg-primary-500/5 border-primary-500/20 hover:border-primary-500/40'
                  }
                `}
              >
                <div className={`mt-0.5 shrink-0 ${isWarning ? 'text-amber-500' : 'text-primary-600 dark:text-primary-400'}`}>
                  {isWarning ? <AlertTriangle size={18} /> : <Info size={18} />}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {insight}
                </p>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default AIRiskInsights;
