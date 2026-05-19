'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Bell, Shield, Palette, Database } from 'lucide-react';
import useUIStore from '@/stores/ui-store';

export default function SettingsPage() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    name: 'Admin User',
    email: 'admin@scrapbook.studio',
    notifications: true,
    autosaveInterval: 30,
    theme: 'dark',
    language: 'en',
  });

  const handleSave = () => {
    showToast('Settings saved successfully', 'success');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'storage', label: 'Storage', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-scrapbook-50">
      <header className="bg-white border-b border-scrapbook-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-scrapbook-100 rounded-lg text-scrapbook-600 transition-smooth"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-scrapbook-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-xl border border-scrapbook-200 overflow-hidden panel-shadow">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-smooth ${
                      activeTab === tab.id
                        ? 'bg-scrapbook-100 text-scrapbook-900'
                        : 'text-scrapbook-600 hover:bg-scrapbook-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-scrapbook-200 p-6 panel-shadow"
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-scrapbook-900 mb-1">General Settings</h2>
                    <p className="text-sm text-scrapbook-500">Manage your account preferences</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-scrapbook-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="w-full px-3 py-2 border border-scrapbook-200 rounded-lg focus:outline-none focus:border-scrapbook-500 text-scrapbook-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-scrapbook-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full px-3 py-2 border border-scrapbook-200 rounded-lg focus:outline-none focus:border-scrapbook-500 text-scrapbook-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-scrapbook-700 mb-1">Autosave Interval (seconds)</label>
                      <input
                        type="number"
                        value={settings.autosaveInterval}
                        onChange={(e) => setSettings({ ...settings, autosaveInterval: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-scrapbook-200 rounded-lg focus:outline-none focus:border-scrapbook-500 text-scrapbook-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-scrapbook-900 mb-1">Appearance</h2>
                    <p className="text-sm text-scrapbook-500">Customize the look and feel</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-scrapbook-700 mb-2">Theme</label>
                      <div className="flex gap-3">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setSettings({ ...settings, theme })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-smooth ${
                              settings.theme === theme
                                ? 'bg-scrapbook-700 text-white'
                                : 'bg-scrapbook-100 text-scrapbook-700 hover:bg-scrapbook-200'
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-scrapbook-900 mb-1">Notifications</h2>
                    <p className="text-sm text-scrapbook-500">Manage your notification preferences</p>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-scrapbook-100">
                    <div>
                      <p className="text-sm font-medium text-scrapbook-900">Email Notifications</p>
                      <p className="text-xs text-scrapbook-500">Receive updates about your projects</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                      className={`w-11 h-6 rounded-full transition-smooth ${
                        settings.notifications ? 'bg-scrapbook-700' : 'bg-scrapbook-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-smooth transform ${
                        settings.notifications ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-scrapbook-900 mb-1">Security</h2>
                    <p className="text-sm text-scrapbook-500">Manage your security settings</p>
                  </div>
                  <div className="space-y-4">
                    <button className="w-full py-2.5 bg-scrapbook-100 hover:bg-scrapbook-200 text-scrapbook-700 rounded-lg text-sm font-medium transition-smooth">
                      Change Password
                    </button>
                    <button className="w-full py-2.5 bg-scrapbook-100 hover:bg-scrapbook-200 text-scrapbook-700 rounded-lg text-sm font-medium transition-smooth">
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-scrapbook-900 mb-1">Storage</h2>
                    <p className="text-sm text-scrapbook-500">Manage your storage usage</p>
                  </div>
                  <div className="bg-scrapbook-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-scrapbook-600">Used Storage</span>
                      <span className="text-scrapbook-900 font-medium">0 MB / 1 GB</span>
                    </div>
                    <div className="h-2 bg-scrapbook-200 rounded-full overflow-hidden">
                      <div className="h-full bg-scrapbook-700 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-smooth">
                    Clear All Data
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-scrapbook-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-scrapbook-700 hover:bg-scrapbook-800 text-white rounded-lg text-sm font-medium transition-smooth"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
