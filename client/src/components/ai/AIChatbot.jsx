import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { initialChatMessages } from '../../utils/aiData';

const AIChatbot = () => {
  const [messages, setMessages] = useState(initialChatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let botText = "I'm analyzing that right now. The technical indicators suggest a holding pattern, but keep an eye on volume changes over the next 48 hours.";
      
      const lowerInput = userMessage.text.toLowerCase();
      if (lowerInput.includes('buy') && lowerInput.includes('apple')) {
        botText = "AAPL is currently rated as a HOLD. While fundamentals are strong, the price is nearing strong resistance at $180. I'd wait for a pullback before initiating a new position.";
      } else if (lowerInput.includes('trend')) {
        botText = "The overall market trend is Bullish. We are seeing strong capital inflows into the Technology sector, while Energy is experiencing slight outflows.";
      }

      setMessages((prev) => [...prev, { id: Date.now(), sender: 'bot', text: botText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="card h-full flex flex-col p-0 overflow-hidden border-primary-500/20 bg-gradient-to-b from-dark-card to-dark-bg/80">
      {/* Header */}
      <div className="p-4 border-b border-dark-border/50 bg-dark-bg/50 backdrop-blur-md flex items-center gap-3 relative z-10">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]">
            <Bot size={20} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-profit border-2 border-dark-card rounded-full"></div>
        </div>
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-1">
            TradeBot <Sparkles size={12} className="text-primary-400" />
          </h3>
          <p className="text-primary-400 text-xs font-medium">Online · Analyzing Markets</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-slate-700 text-white' : 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-700 text-white rounded-tr-sm' 
                  : 'bg-dark-bg border border-dark-border text-slate-300 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="p-4 rounded-2xl bg-dark-bg border border-dark-border rounded-tl-sm flex gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-dark-border/50 bg-dark-bg/50">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask TradeBot a question..."
            className="w-full bg-dark-card border border-dark-border rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
