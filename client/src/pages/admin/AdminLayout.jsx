import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useThemeStore } from '../../context/store';
import {
  LayoutDashboard, Users, Menu, X, ChevronLeft, ChevronRight, LogOut, ArrowLeft, Shield, DollarSign, Activity,
  Brain, Bell, Monitor, ShieldAlert, Settings
} from 'lucide-react';
import ThemeToggle from '../../components/ui/ThemeToggle';

const adminNavLinks = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: Shield },
  { name: 'Payments', path: '/admin/payments', icon: DollarSign },
  { name: 'Trading Analytics', path: '/admin/trading-analytics', icon: Activity },
  { name: 'AI Analytics', path: '/admin/ai-analytics', icon: Brain },
  { name: 'Notification Center', path: '/admin/notification-center', icon: Bell },
  { name: 'System Monitoring', path: '/admin/system-monitoring', icon: Monitor },
  { name: 'Security Center', path: '/admin/security-center', icon: ShieldAlert },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();

  return (
    <>
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
        <div className={`h-16 flex items-center border-b border-light-border dark:border-dark-border shrink-0 ${isCollapsed ? 'justify-center px-2' : 'px-5 justify-between'}`}>
          <div className="flex items-center gap-2.5 text-primary-500 font-bold">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 shrink-0">
              <LayoutDashboard size={18} />
            </div>
            {!isCollapsed && <span className="text-lg tracking-tight">Admin Panel</span>}
          </div>
          <button className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={`flex flex-col gap-1 flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {adminNavLinks.map((link) => {
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
                `}>
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span>{link.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-xs font-medium text-light-text dark:text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-50 pointer-events-none">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className={`border-t border-light-border dark:border-dark-border py-3 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <button onClick={logout} className={`flex items-center gap-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-loss transition-all text-sm font-medium w-full ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}`}>
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>

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

const AdminTopbar = ({ setIsMobileOpen }) => {
  return (
    <div className="h-16 border-b border-light-border dark:border-dark-border bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 gap-4">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-bold text-light-text dark:text-white hidden sm:block">Admin Panel</h1>
      </div>
      <ThemeToggle />
    </div>
  );
};

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}
      >
        <AdminTopbar setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
