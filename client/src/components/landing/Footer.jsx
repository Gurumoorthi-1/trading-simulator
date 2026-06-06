import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Globe, MessageSquare, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer id="footer" className="bg-dark-bg border-t border-dark-border pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-500 mb-4">
                            <LineChart /> TradeSim
                        </Link>
                        <p className="text-slate-400 text-sm mb-6">
                            The most advanced risk-free stock market simulation platform. Learn, test, and master trading strategies without losing real money.
                        </p>
                        <div className="flex gap-4">
                            <a href="mailto:support@tradesim.in" className="text-slate-400 hover:text-white transition-colors" title="Email Support"><Mail size={20} /></a>
                            <span className="text-slate-400" title="Website"><Globe size={20} /></span>
                            <a href="mailto:support@tradesim.in" className="text-slate-400 hover:text-white transition-colors" title="Contact"><MessageSquare size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Platform</h4>
                        <ul className="space-y-2">
                            <li><Link to="/market" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Market Overview</Link></li>
                            <li><Link to="/portfolio" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Portfolio Simulator</Link></li>
                            <li><Link to="/ai-suggestions" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">AI TradeBot</Link></li>
                            <li><a href="#pricing" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Pricing Plans</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Trading Academy</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Documentation</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Blog</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link to="/terms" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link to="/refund-policy" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">Refund Policy</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-dark-border pt-8 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-slate-500 text-sm mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} TradeSim Platform. All rights reserved.
                    </p>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 animate-pulse"></span>
                        <span className="text-slate-400 text-sm">System Status: Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
