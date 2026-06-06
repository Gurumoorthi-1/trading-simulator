import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('platform');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'TradeSim',
    maintenanceMode: false,
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    razorpayKey: '',
    razorpaySecret: '',
    aiApiKey: '',
    aiModel: 'gpt-4',
    aiEnabled: true
  });

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data.success) setSettings(res.data.data);
    } catch (err) {
      toast.error('Failed to load settings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'platform', name: 'Platform Settings' },
    { id: 'maintenance', name: 'Maintenance Mode' },
    { id: 'smtp', name: 'SMTP Settings' },
    { id: 'razorpay', name: 'Razorpay Settings' }
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Admin Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Configure platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card p-4 h-fit">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeSection === section.id
                  ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400 border border-primary-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-dark-bg'
                  }`}
              >
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-6 w-40 bg-light-bg dark:bg-dark-bg rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
                  <div className="h-10 bg-light-bg dark:bg-dark-bg rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Platform Settings */}
              {activeSection === 'platform' && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-light-text dark:text-white mb-6">Platform Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Platform Name</label>
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance Mode */}
              {activeSection === 'maintenance' && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-light-text dark:text-white mb-6">Maintenance Mode</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl">
                      <div>
                        <p className="text-light-text dark:text-white font-medium">Enable Maintenance Mode</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">This will disable the platform for all non-admin users</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`w-14 h-7 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-primary-500' : 'bg-slate-600'
                          }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-8' : 'translate-x-1'
                            }`}
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SMTP Settings */}
              {activeSection === 'smtp' && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-light-text dark:text-white mb-6">SMTP Settings</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP Host</label>
                        <input
                          type="text"
                          value={settings.smtpHost}
                          onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                          className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                          placeholder="smtp.example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP Port</label>
                        <input
                          type="text"
                          value={settings.smtpPort}
                          onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                          className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                          placeholder="587"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP Username</label>
                      <input
                        type="text"
                        value={settings.smtpUser}
                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                        className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                        placeholder="noreply@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP Password</label>
                      <input
                        type="password"
                        value={settings.smtpPass}
                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                        className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">From Email</label>
                      <input
                        type="email"
                        value={settings.smtpFrom}
                        onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                        className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                        placeholder="noreply@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Razorpay Settings */}
              {activeSection === 'razorpay' && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-light-text dark:text-white mb-6">Razorpay Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">API Key</label>
                      <input
                        type="text"
                        value={settings.razorpayKey}
                        onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                        className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                        placeholder="rzp_test_••••••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">API Secret</label>
                      <input
                        type="password"
                        value={settings.razorpaySecret}
                        onChange={(e) => setSettings({ ...settings, razorpaySecret: e.target.value })}
                        className="w-full px-4 py-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-white focus:outline-none focus:border-primary-500"
                        placeholder="••••••••••••••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}



              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
