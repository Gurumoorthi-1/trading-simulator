import React from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Award, Shield, BellRing, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import { useAuthStore } from '../../context/store';
import toast from 'react-hot-toast';

const UserProfile = ({ isLoading }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="card"
    >
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-light-border dark:border-dark-border">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {getInitials(user?.name)}
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-profit rounded-full border-2 border-light-card dark:border-dark-card"></span>
        </div>
        <div>
          <h3 className="text-light-text dark:text-white font-bold text-lg">{user?.name || 'Trader'}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{user?.email || ''}</p>
          <div className="flex items-center gap-1 mt-1">
            {user?.isPremium ? (
              <>
                <Award size={12} className="text-yellow-500" />
                <span className="text-yellow-500 text-xs font-medium">Premium Member</span>
              </>
            ) : (
              <span className="text-slate-500 text-xs">Free Account</span>
            )}
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-center">
          <p className="text-slate-500 text-xs mb-1">Email Verified</p>
          <p className={`font-bold text-sm ${user?.isEmailVerified ? 'text-profit' : 'text-loss'}`}>
            {user?.isEmailVerified ? '✓ Verified' : '✗ Pending'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-center">
          <p className="text-slate-500 text-xs mb-1">Member Since</p>
          <p className="text-light-text dark:text-white font-bold text-sm">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        {[
          { icon: <Settings size={18} />, label: 'Account Settings', to: '/settings' },
          { icon: <Shield size={18} />, label: 'Risk Profile', to: '/risk-analysis' },
          { icon: <BellRing size={18} />, label: 'Notifications', to: '/notifications' },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-slate-600 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-loss/10 text-slate-700 dark:text-slate-300 hover:text-loss transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-slate-500 group-hover:text-loss transition-colors">
              <LogOut size={18} />
            </span>
            <span className="text-sm font-medium">Logout</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default UserProfile;
