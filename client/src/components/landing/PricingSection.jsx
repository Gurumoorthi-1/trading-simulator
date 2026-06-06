import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for beginners learning the basics of trading.",
    features: [
      "₹0 Virtual Balance",
      "Real-time IN Equities Data",
      "Basic Charting Tools",
      "Community Forum Access",
      "Standard Execution Speed"
    ],
    buttonText: "Start for Free",
    buttonClass: "bg-dark-card hover:bg-dark-border text-white border border-dark-border",
    popular: false
  },
  {
    name: "Pro",
    price: "₹199/mo",
    description: "Advanced tools for serious traders and simulated testing.",
    features: [
      "₹199 Virtual Balance",
      "Global Markets & Crypto Data",
      "Advanced Technical Indicators",
      "AI TradeBot Assistant (Basic)",
      "Low Latency Execution",
      "Portfolio Performance Analytics"
    ],
    buttonText: "Upgrade to Pro",
    buttonClass: "bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]",
    popular: true
  },
  {
    name: "Elite",
    price: "₹999/mo",
    description: "Institutional-grade simulation for algorithmic traders.",
    features: [
      "Custom Virtual Balance",
      "Level 2 Market Data",
      "AI TradeBot Assistant (Advanced)",
      "Zero Latency Execution",
      "Options & Derivatives Trading",
      "1-on-1 Strategy Mentoring"
    ],
    buttonText: "Get Elite Access",
    buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white",
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-dark-bg relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, Transparent <span className="text-primary-500">Pricing</span></h2>
          <p className="text-slate-400 text-lg">
            Choose the plan that fits your trading journey. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl bg-dark-card/40 backdrop-blur-md border ${plan.popular ? 'border-primary-500 shadow-[0_0_30px_rgba(14,165,233,0.15)] transform md:-translate-y-4' : 'border-dark-border'} flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                  <Star size={14} fill="currentColor" /> Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm h-10 mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <Check size={20} className="text-primary-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className={`w-full py-4 rounded-xl font-bold text-center transition-all ${plan.buttonClass}`}>
                {plan.buttonText}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
