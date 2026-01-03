import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '../components/layout/MainLayout';
import { UserIcon, LockIcon, BrainCircuitIcon, SaveIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

// CSS to force text visibility
const forceVisibleClass = `
  .force-visible-input {
    color: #000000 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #000000 !important;
    opacity: 1 !important;
  }
  .force-visible-input option {
    color: #000000 !important;
    background-color: #ffffff !important;
  }
`;

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Load AI preferences from localStorage
  const savedAiPrefs = JSON.parse(localStorage.getItem('ai_preferences') || '{}');

  const [settings, setSettings] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    role: user?.role || 'User',
    notifications: {
      email: true,
      push: false,
      weekly: true
    },
    language: 'English',
    aiDepth: savedAiPrefs.depth || 'balanced',
    aiTone: savedAiPrefs.tone || 'professional',
    aiConfidence: savedAiPrefs.confidence || 75,
    aiModel: savedAiPrefs.model || 'groq',
    theme: 'dark',
    retention: '90'
  });

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'User'
      }));
    }
    console.log(settings);
  }, [user]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserIcon size={18} /> },
    { id: 'security', label: 'Security', icon: <LockIcon size={18} /> },
    // { id: 'notifications', label: 'Notifications', icon: <BellIcon size={18} /> },
    // { id: 'language', label: 'Language', icon: <GlobeIcon size={18} /> },
    { id: 'ai', label: 'AI Preferences', icon: <BrainCircuitIcon size={18} /> },
    // { id: 'privacy', label: 'Privacy', icon: <ShieldIcon size={18} /> },
    // { id: 'appearance', label: 'Appearance', icon: <PaletteIcon size={18} /> }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'profile') {
        await authService.updateProfile({
          full_name: settings.name,
          email: settings.email
        });
        alert('Profile updated successfully!');
      } else if (activeTab === 'ai') {
        // Save AI preferences to localStorage
        const aiPrefs = {
          model: settings.aiModel,
          depth: settings.aiDepth,
          tone: settings.aiTone,
          confidence: settings.aiConfidence
        };
        localStorage.setItem('ai_preferences', JSON.stringify(aiPrefs));
        alert('AI Preferences saved successfully!');
      }
      setSaving(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaving(false);
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Failed to change password. Check current password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <MainLayout>
      <style>{forceVisibleClass}</style>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      Profile Information
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={settings.name}
                          onChange={e => setSettings({ ...settings, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 force-visible-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={e => setSettings({ ...settings, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 force-visible-input"
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                          <SaveIcon size={18} className="mr-2" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      Security Settings
                    </h2>

                    {/* Password Change Message */}
                    {passwordMessage.text && (
                      <div className={`mb-6 p-4 rounded-lg ${passwordMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        {passwordMessage.text}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none force-visible-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password (min 8 chars)"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none force-visible-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none force-visible-input"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handlePasswordChange}
                          disabled={passwordLoading}
                          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <LockIcon size={18} className="mr-2" />
                          {passwordLoading ? 'Changing Password...' : 'Change Password'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      AI Preferences
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred AI Model
                        </label>
                        <select
                          value={settings.aiModel}
                          onChange={e => setSettings({ ...settings, aiModel: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 force-visible-input"
                        >
                          <option value="groq">Groq (Fastest)</option>
                          <option value="gemini">Gemini (Balanced)</option>
                          <option value="openai">OpenAI (Most Capable)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Select the AI model used for analysis and drafting.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Analysis Depth
                        </label>
                        <select
                          value={settings.aiDepth}
                          onChange={e => setSettings({ ...settings, aiDepth: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 force-visible-input"
                        >
                          <option value="standard">Standard (Faster)</option>
                          <option value="balanced">Balanced</option>
                          <option value="comprehensive">Comprehensive (Slower)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Drafting Tone
                        </label>
                        <select
                          value={settings.aiTone}
                          onChange={e => setSettings({ ...settings, aiTone: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 force-visible-input"
                        >
                          <option value="professional">Professional</option>
                          <option value="neutral">Neutral</option>
                          <option value="strict">Strict/Legalistic</option>
                          <option value="friendly">Friendly/Simple</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Select the tone used for generated document drafts.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confidence Threshold ({settings.aiConfidence}%)
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="95"
                          step="5"
                          value={settings.aiConfidence}
                          onChange={e => setSettings({ ...settings, aiConfidence: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>More Creative (50%)</span>
                          <span>More Strict (95%)</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                          <SaveIcon size={18} className="mr-2" />
                          {saving ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}