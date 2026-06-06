import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { getRiskChatResponse } from '../../utils/services';

const AIChat = ({ riskData, variant = 'floating' }) => {
    const [isOpen, setIsOpen] = useState(variant === 'sidebar');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I am your AI Assistant. I can help you analyze your portfolio, manage risks, and find trading opportunities. What's on your mind today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const isSidebar = variant === 'sidebar';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const chatHistory = [...messages, userMessage];
            const res = await getRiskChatResponse(chatHistory, riskData);

            setMessages(prev => [...prev, { role: 'assistant', content: res.message }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I couldn't process your request at the moment. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const ChatContent = (
        <div className={`bg-dark-card border border-dark-border rounded-2xl shadow-2xl flex flex-col overflow-hidden ${isSidebar ? 'h-full border-none shadow-none rounded-none' : 'w-[350px] md:w-[400px] h-[500px] mb-4'
            }`}>
            {/* Header */}
            <div className={`p-4 ${isSidebar ? 'bg-dark-bg border-b border-dark-border' : 'bg-primary-600'} flex justify-between items-center text-white`}>
                <div className="flex items-center gap-2">
                    <Sparkles size={20} className={isSidebar ? 'text-primary-500' : 'text-white'} />
                    <span className={`font-bold ${isSidebar ? 'text-white' : 'text-white'}`}>AI Assistant</span>
                </div>
                {!isSidebar && (
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-dark-card/30">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl flex gap-x-2 ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-dark-bg text-slate-200 border border-dark-border rounded-tl-none'
                            }`}>
                            {msg.role === 'assistant' && <Bot size={16} className="shrink-0 mt-1 text-primary-400" />}
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-dark-bg text-slate-200 border border-dark-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-primary-500" />
                            <span className="text-xs text-slate-400">Processing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-border bg-dark-card/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything..."
                        className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 p-2 rounded-xl text-white transition-all shadow-lg shadow-primary-500/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
                {isSidebar && (
                    <p className="text-[10px] text-slate-500 text-center mt-2">
                        Powered by OpenRouter AI
                    </p>
                )}
            </div>
        </div>
    );

    if (isSidebar) {
        return ChatContent;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        {ChatContent}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary-600/40 border-2 border-white/10 hover:bg-primary-500 transition-all group"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />}
            </motion.button>
        </div>
    );
};

export default AIChat;
