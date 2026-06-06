import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import tradingVideo from '../../assets/trading.mp4';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg pt-20">
      {/* Background Video Container */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src={tradingVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/40 via-transparent to-dark-bg"></div>
      </div>

      {/* Background Grid & Glows */}
      <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay z-[1]"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-card/50 border border-dark-border backdrop-blur-md mb-6 text-sm text-primary-500 font-medium">
            <TrendingUp size={16} />
            <span>Next-Gen Trading Simulator</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Master the Market <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-profit">Without the Risk</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Experience real-time market data, AI-driven insights, and professional trading tools in a risk-free simulation environment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
              Start Trading <ArrowRight size={20} />
            </Link>
            <Link to="/market" className="w-full sm:w-auto px-8 py-4 rounded-full bg-dark-card/50 hover:bg-dark-card border border-dark-border text-white font-semibold transition-all backdrop-blur-md flex items-center justify-center">
              Explore Market
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
