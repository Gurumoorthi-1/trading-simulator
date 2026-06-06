import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: "Is this platform really free to use?",
    answer: "Yes, our Starter plan is completely free and gives you $10,000 in virtual funds to practice trading US equities. You can upgrade to premium plans for advanced features like crypto, AI insights, and options trading."
  },
  {
    question: "Does the simulation use real market data?",
    answer: "Absolutely. Our platform is connected to real-time market data feeds. The price you see in the simulator is the exact price happening in the real market at that moment."
  },
  {
    question: "Can I lose real money here?",
    answer: "No. TradeSim is a purely educational platform. All funds are virtual. It's the perfect place to make mistakes and learn without any financial risk."
  },
  {
    question: "How accurate is the AI TradeBot?",
    answer: "TradeBot uses advanced machine learning models trained on decades of market data. While it provides high-probability setups and excellent risk analysis, no AI can predict the market with 100% certainty. It should be used as a tool, not financial advice."
  }
];

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Beginner Trader",
    content: "I was terrified of losing money in the real market. TradeSim gave me the confidence to test my strategies. The UI is incredibly intuitive!",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "David Chen",
    role: "Day Trader",
    content: "The execution speed on this simulator is mind-blowing. It perfectly mimics the slippage and liquidity of the real market. Highly recommended for backtesting.",
    avatar: "https://i.pravatar.cc/150?u=david"
  },
  {
    name: "Elena Rodriguez",
    role: "Finance Student",
    content: "The AI TradeBot insights taught me more about technical analysis in a month than a whole semester at university. Best educational tool out there.",
    avatar: "https://i.pravatar.cc/150?u=elena"
  }
];

const TestimonialsFAQ = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-24 bg-dark-bg relative overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Testimonials */}
        <div className="mb-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Loved by <span className="text-primary-500">Traders</span></h2>
            <p className="text-slate-400 text-lg">Don't just take our word for it. Here's what our community has to say.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-dark-card/40 backdrop-blur-md border border-dark-border relative"
              >
                <MessageCircle className="absolute top-6 right-6 text-dark-border opacity-50" size={40} />
                <p className="text-slate-300 mb-8 relative z-10">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full border border-dark-border" />
                  <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border border-dark-border rounded-2xl bg-dark-card/30 overflow-hidden"
              >
                <button 
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-white font-medium text-lg">{faq.question}</span>
                  <ChevronDown className={`text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5"
                    >
                      <p className="text-slate-400">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsFAQ;
