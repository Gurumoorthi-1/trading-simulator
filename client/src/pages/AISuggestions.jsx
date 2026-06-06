import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Bell, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAiSuggestions } from '../utils/services';
import AIChat from '../components/ai/AIChat';

const AIAssistantInfo = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="card bg-gradient-to-br from-primary-500/10 to-purple-600/10 border-primary-500/20 mb-6"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-primary-500/20 rounded-xl text-primary-600 dark:text-primary-400 shrink-0">
        <Brain size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-light-text dark:text-white mb-2">TradeSim AI Assistant</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
          Our advanced AI analyzes your portfolio composition, market trends, and historical
          performance to deliver personalized, actionable insights. These intelligent suggestions
          are designed to help you optimize returns and manage risk effectively.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Portfolio Analysis', 'Risk Management', 'Market Insights'].map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const SuggestionCard = ({ suggestion, index }) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (suggestion.type) {
      case 'Buy':
      case 'Rebalance': return <Lightbulb size={20} className="text-primary-600 dark:text-primary-400" />;
      case 'Sell':
      case 'Review': return <AlertTriangle size={20} className="text-amber-500" />;
      default: return <Bell size={20} className="text-purple-500 dark:text-purple-400" />;
    }
  };

  const getBadgeColor = () => {
    switch (suggestion.priority) {
      case 'High': return 'bg-loss/20 text-loss border-loss/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'Low': return 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border-primary-500/30';
      default: return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const handleAction = () => {
    if (suggestion.type === 'Buy') {
      navigate('/market');
    } else {
      navigate('/portfolio');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleAction}
      className="card group hover:border-primary-500/30 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center justify-center shadow-lg ${suggestion.type === 'Sell' ? 'shadow-amber-500/10' : 'shadow-primary-500/10'}`}>
          {getIcon()}
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getBadgeColor()}`}>
          {suggestion.priority} Priority
        </span>
      </div>

      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{suggestion.type}</span>
        </div>
        <h3 className="text-lg font-bold text-light-text dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {suggestion.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {suggestion.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border flex items-center text-primary-600 dark:text-primary-500 text-sm font-bold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all relative z-10">
        Take Action <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAI = async () => {
    setLoading(true);
    try {
      const res = await getAiSuggestions();
      setSuggestions(res.suggestions || []);
    } catch (e) {
      console.error('Failed to get AI suggestions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAI();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 lg:max-w-[calc(100%-400px)]">
          <div className="flex justify-between items-center mb-8 text-light-text dark:text-white">
            <div>
              <h1 className="text-2xl font-bold mb-1">AI Suggestions</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Actionable insights driven by machine learning.</p>
            </div>
          </div>

          <AIAssistantInfo />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="card h-[250px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Running AI Model...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="card text-center py-16">
              <Brain size={48} className="mx-auto text-slate-500 mb-4" />
              <h3 className="text-light-text dark:text-white font-bold text-lg mb-2">No active suggestions</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Your portfolio looks great right now. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestions.map((sug, i) => (
                <SuggestionCard key={i} suggestion={sug} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="lg:sticky lg:top-24 h-[500px] lg:h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-dark-border shadow-2xl">
            <AIChat variant="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
