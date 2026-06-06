import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Menu, X, ArrowRight } from 'lucide-react';

const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { title: 'Home', path: '#home' },
        { title: 'About Us', path: '#features' },
        { title: 'Pricing', path: '#pricing' },
        { title: 'Contact Us', path: '#footer' },
    ];

    const scrollToSection = (e, path) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);

        // Small delay so mobile menu close animation doesn't block scroll
        setTimeout(() => {
            if (path === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (path.startsWith('#')) {
                const id = path.substring(1);
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 150);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 ${isScrolled
                ? 'py-4 bg-dark-bg/80 backdrop-blur-lg border-b border-white/5'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-500">
                    <LineChart size={28} />
                    <span>TradeSim</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.title}
                            href={link.path}
                            onClick={(e) => scrollToSection(e, link.path)}
                            className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors"
                        >
                            {link.title}
                        </a>
                    ))}
                    <Link to="/login" className="text-sm font-medium text-white hover:text-primary-400 transition-colors">
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-full transition-all flex items-center gap-2"
                    >
                        Get Started <ArrowRight size={16} />
                    </Link>
                </div>

                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-dark-card border-b border-dark-border overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.title}
                                    href={link.path}
                                    onClick={(e) => scrollToSection(e, link.path)}
                                    className="text-lg font-medium text-slate-300 hover:text-primary-400 py-2 border-b border-white/5"
                                >
                                    {link.title}
                                </a>
                            ))}
                            <div className="flex flex-col gap-4 pt-4">
                                <Link to="/login" className="py-3 text-center font-bold text-white border border-dark-border rounded-xl">
                                    Login
                                </Link>
                                <Link to="/register" className="py-3 text-center font-bold text-white bg-primary-600 rounded-xl">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default LandingNavbar;
