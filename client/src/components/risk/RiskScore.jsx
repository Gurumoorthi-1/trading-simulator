import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

const RiskScore = ({ score = 0 }) => {
  // Determine risk level config
  const getRiskLevel = (val) => {
    if (val < 40) return { label: 'Conservative', color: 'text-profit', bg: 'bg-profit', icon: <ShieldCheck size={28} className="text-profit" /> };
    if (val < 70) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500', icon: <Shield size={28} className="text-amber-500" /> };
    return { label: 'Aggressive', color: 'text-loss', bg: 'bg-loss', icon: <ShieldAlert size={28} className="text-loss" /> };
  };

  const level = getRiskLevel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card h-full flex flex-col justify-center items-center text-center p-8 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full -mr-8 -mt-8 ${level.bg}`} />

      <div className={`p-4 rounded-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border mb-4 shadow-lg`}>
        {level.icon}
      </div>

      <h2 className={`text-6xl font-black mb-2 ${level.color} drop-shadow-sm`}>
        {score}
      </h2>
      <h3 className="text-light-text dark:text-white font-bold text-lg">{level.label} Risk</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-[200px]">
        Calculated from exposure, concentration, and historical sector volatility.
      </p>
    </motion.div>
  );
};

export default RiskScore;
