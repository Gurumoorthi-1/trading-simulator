import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';

const AISection = () => {
  return (
    <section className="py-24 bg-dark-bg relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium mb-6">
              <Sparkles size={16} />
              <span>Meet TradeBot AI</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Trade Smarter with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">AI Intelligence</span>
            </h2>
            
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Our advanced AI assistant analyzes millions of data points per second to identify patterns, evaluate risk, and suggest optimal entry and exit points for your trades.
            </p>

            <ul className="space-y-4 mb-10">
              {['Real-time pattern recognition', 'Sentiment analysis from news & social media', 'Personalized risk assessment', 'Automated strategy backtesting'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <TrendingUp size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="p-8 rounded-3xl bg-dark-card/60 backdrop-blur-xl border border-dark-border shadow-[0_0_50px_rgba(168,85,247,0.15)] relative z-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-dark-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Brain className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">TradeBot AI</h4>
                    <p className="text-emerald-400 text-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Analyzing Markets
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-dark-bg/50 border border-dark-border">
                  <p className="text-slate-300 text-sm mb-2">Detected strong bullish divergence on <span className="font-bold text-primary-400">AAPL</span> 15m timeframe. Volume is increasing.</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-profit/20 text-profit rounded border border-profit/30">Buy Signal</span>
                    <span className="text-xs px-2 py-1 bg-dark-border text-slate-400 rounded">Confidence: 87%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-bg/50 border border-dark-border">
                  <p className="text-slate-300 text-sm mb-2">News sentiment for Tech Sector has turned negative. Consider tightening stop losses on long positions.</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500/30">Warning</span>
                    <span className="text-xs px-2 py-1 bg-dark-border text-slate-400 rounded">Impact: High</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements behind the card */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
