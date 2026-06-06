import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, BarChart3, BrainCircuit, Globe } from 'lucide-react';

const features = [
  {
    icon: <Activity size={24} className="text-primary-500" />,
    title: "Real-time Simulation",
    description: "Experience the market with zero latency. Our simulation engine mirrors live market conditions perfectly."
  },
  {
    icon: <BrainCircuit size={24} className="text-purple-500" />,
    title: "AI-Powered Insights",
    description: "Get personalized trading suggestions and risk analysis powered by advanced machine learning."
  },
  {
    icon: <BarChart3 size={24} className="text-profit" />,
    title: "Advanced Analytics",
    description: "Deep dive into your portfolio performance with professional-grade charting and technical indicators."
  },
  {
    icon: <Globe size={24} className="text-blue-400" />,
    title: "Global Markets",
    description: "Trade stocks, crypto, and forex from major exchanges around the world in one unified platform."
  },
  {
    icon: <Shield size={24} className="text-emerald-500" />,
    title: "Risk-Free Learning",
    description: "Test your strategies with virtual funds before committing real capital to the market."
  },
  {
    icon: <Zap size={24} className="text-yellow-500" />,
    title: "Lightning Execution",
    description: "Practice high-frequency trading with our ultra-low latency simulated order matching engine."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-dark-bg relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Professional Tools for <br/> <span className="text-slate-400">Every Trader</span></h2>
          <p className="text-slate-400 text-lg">
            Whether you are a beginner learning the ropes or a professional backtesting complex strategies, we have the tools you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-dark-card/40 backdrop-blur-lg border border-dark-border hover:border-primary-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-dark-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
