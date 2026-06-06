import React, { useState } from 'react';
import { useAuthStore } from '../context/store';
import { User, Mail, Shield, Bell, Key, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Name is required');

    try {
      setIsLoading(true);
      const res = await api.put('/auth/update-profile', formData);
      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      console.error('=== Profile Update Error ===', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error('Please fill in all password fields');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    try {
      setIsLoading(true);
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('=== Password Change Error ===', err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {/* Tabs: Horizontal scroll on mobile, vertical on desktop */}
        <div className="md:col-span-1">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-slate-900 dark:hover:text-white border border-transparent'
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="card">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-bold text-light-text dark:text-white mb-4 border-b border-light-border dark:border-dark-border pb-4">Profile Information</h2>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-light-text dark:text-white">{user?.name}</p>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type="text"
                          className="input-field pl-10"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type="email"
                          className="input-field pl-10 opacity-70 cursor-not-allowed"
                          value={user?.email || ''}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isLoading} className="btn-primary px-8">
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-bold text-light-text dark:text-white mb-4 border-b border-light-border dark:border-dark-border pb-4">Security Settings</h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className="input-field pl-10 pr-10"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-500 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="input-field pl-10 pr-10"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-500 transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="input-field pl-10 pr-10"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isLoading} className="btn-primary px-8">
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-bold text-light-text dark:text-white mb-4 border-b border-light-border dark:border-dark-border pb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { title: 'Trade Alerts', desc: 'Get notified when your orders are executed' },
                    { title: 'Price Alerts', desc: 'Receive alerts when stocks hit your target price' },
                    { title: 'Market Updates', desc: 'Daily market summaries and breaking news' },
                    { title: 'Security Alerts', desc: 'New logins and account changes' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-light-border/50 dark:border-dark-border/50 last:border-0">
                      <div>
                        <p className="text-light-text dark:text-white text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                        <div className="w-11 h-6 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 peer-checked:border-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
