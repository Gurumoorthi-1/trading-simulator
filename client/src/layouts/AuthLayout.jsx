import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LineChart, TrendingUp, ShieldCheck, Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen flex bg-dark-bg text-dark-text selection:bg-primary-500 selection:text-white">

      {/* Left side - Branding & Graphics (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-dark-card border-r border-dark-border overflow-hidden items-center justify-center">

        {/* Background glow & noise */}
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 p-12 max-w-xl">
          <Link to="/" className="flex items-center gap-2 text-3xl font-bold text-primary-500 mb-12">
            <LineChart size={32} /> TradeSim
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Master the Markets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Without the Risk</span>
            </h1>
            <p className="text-slate-400 text-lg mb-10">
              Join thousands of traders using our advanced simulation platform to test strategies, analyze trends, and build confidence before deploying real capital.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-dark-bg/50 border border-dark-border backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Real-time Simulation</h4>
                  <p className="text-sm text-slate-400">Zero latency market data mirroring live exchanges.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-dark-bg/50 border border-dark-border backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Risk-Free Environment</h4>
                  <p className="text-sm text-slate-400">$100,000 virtual starting balance to practice.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-dark-bg/50 border border-dark-border backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Globe2 size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Global Markets Access</h4>
                  <p className="text-sm text-slate-400">Trade US Equities, Crypto, and Forex in one place.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 pt-24 lg:pt-12 relative">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-2xl font-bold text-primary-500">
          <LineChart size={28} /> TradeSim
        </Link>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
