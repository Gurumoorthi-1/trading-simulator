import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useNotificationStore, useThemeStore } from '../context/store';
import {
  LayoutDashboard, LineChart, PieChart,
  Wallet, Brain, Star, Bell, ShieldAlert, Menu, X,
  LogOut, Search, ChevronLeft, ChevronRight, Settings,
  User, CreditCard, HelpCircle, ChevronDown, Shield, Sun, Moon
} from 'lucide-react';
import NotificationDropdown from '../components/ui/NotificationDropdown';
import ThemeToggle from '../components/ui/ThemeToggle';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Market', path: '/market', icon: LineChart },
  { name: 'Portfolio', path: '/portfolio', icon: PieChart },
  { name: 'Wallet', path: '/wallet', icon: Wallet },
  { name: 'AI Suggestions', path: '/ai-suggestions', icon: Brain },
  { name: 'Risk Analysis', path: '/risk-analysis', icon: ShieldAlert },
  { name: 'Premium', path: '/premium', icon: Star },
];

// ─── Sidebar ───────────────────────────────────
const Sidebar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const bottomLinks = [
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed top-0 left-0 z-40 h-screen bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'}
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-light-border dark:border-dark-border shrink-0 ${isCollapsed ? 'justify-center px-2' : 'px-5 justify-between'}`}>
          <Link to="/" className="flex items-center gap-2.5 text-primary-500 font-bold" onClick={() => setIsMobileOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 shrink-0">
              <LineChart size={18} />
            </div>
            {!isCollapsed && <span className="text-lg tracking-tight">TradeSim</span>}
          </Link>
          {/* Mobile close */}
          <button className="md:hidden text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <div className={`flex flex-col gap-1 flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? link.name : undefined}
                className={`group relative flex items-center gap-3 rounded-xl transition-all text-sm font-medium
                  ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                  ${isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }
                `}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span>{link.name}</span>}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-xs font-medium text-light-text dark:text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-50 pointer-events-none">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}


        </div>

        {/* Bottom Links */}
        <div className={`border-t border-light-border dark:border-dark-border py-3 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {bottomLinks.map((link) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? link.name : undefined}
                className={`group relative flex items-center gap-3 rounded-xl transition-all text-sm font-medium mb-1
                  ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                  ${isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }
                `}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && (
                  <>
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="ml-auto text-xs bg-loss text-white px-1.5 py-0.5 rounded-full font-bold">
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && link.badge && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-loss text-white w-4 h-4 rounded-full font-bold flex items-center justify-center">
                    {link.badge}
                  </span>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-xs font-medium text-light-text dark:text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-50 pointer-events-none">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}

          <button onClick={logout} className={`flex items-center gap-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-loss transition-all text-sm font-medium w-full ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}`}>
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-primary-500 hover:border-primary-500 transition-all shadow-md z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </>
  );
};

// ─── User Profile Dropdown ────────────────────
const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise': return 'from-amber-500 to-orange-600';
      case 'pro': return 'from-primary-600 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlanColor(user?.subscriptionPlan)} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
          {initials}
        </div>
        <div className="hidden sm:block text-left max-w-[120px]">
          <p className="text-light-text dark:text-white text-xs font-bold leading-tight truncate">{user?.name || 'User'}</p>
          <p className="text-slate-500 text-[10px] leading-tight truncate">
            {user?.subscriptionPlan ? (user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1) + ' Plan') : 'Basic Plan'}
          </p>
        </div>
        <ChevronDown size={14} className={`text-slate-600 dark:text-slate-400 hidden sm:block transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            {/* User Info */}
            <div className="p-4 border-b border-light-border/50 dark:border-dark-border/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getPlanColor(user?.subscriptionPlan)} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-light-text dark:text-white font-bold text-sm truncate">{user?.name || 'User'}</p>
                  <p className="text-slate-500 text-xs truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="p-2">
              {[
                { icon: User, label: 'My Profile', path: '/settings' },
                { icon: CreditCard, label: 'Subscription', path: '/premium' },
                { icon: HelpCircle, label: 'Help Center', path: '#' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                >
                  <item.icon size={16} className="text-slate-500" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-light-border/50 dark:border-dark-border/50">
              <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-loss/10 hover:text-loss transition-colors text-sm w-full">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Topbar ───────────────────────────────────
const Topbar = ({ setIsMobileOpen, isCollapsed }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="h-16 border-b border-light-border dark:border-dark-border bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 gap-4">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={22} />
        </button>

        {/* Search Bar */}
        <div className={`relative hidden sm:block transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search stocks, pages..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden font-bold text-lg text-primary-500 flex items-center gap-1.5 sm:hidden">
          <LineChart size={20} /> TradeSim
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationDropdown />

        <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1 hidden sm:block" />

        <UserDropdown />
      </div>
    </div>
  );
};

// ─── Main Layout ──────────────────────────────
const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}
      >
        <Topbar setIsMobileOpen={setIsMobileOpen} isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
