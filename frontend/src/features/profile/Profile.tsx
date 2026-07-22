import React, { useState } from 'react';
import { useStore } from '../../app/store';
import { apiClient } from '../../lib/api-client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Bell, Globe } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
] as const;

export default function Profile() {
  const { user, token, setAuth, language, setLanguage } = useStore();
  const { t } = useTranslation();
  const [name, setName] = useState(user?.name || '');
  const email = user?.email || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [systemNotifications, setSystemNotifications] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('disciplin_system_notifications') === 'true' : false
  );

  const handleToggleSystemNotifications = async () => {
    const nextState = !systemNotifications;
    
    if (nextState) {
      const { requestNotificationPermission } = await import('../../utils/notifications');
      const granted = await requestNotificationPermission();
      if (granted) {
        localStorage.setItem('disciplin_system_notifications', 'true');
        setSystemNotifications(true);
        toast.success('System notifications enabled! 🔔');
      } else {
        localStorage.setItem('disciplin_system_notifications', 'false');
        setSystemNotifications(false);
        toast.error('Permission denied or browser not supported.');
      }
    } else {
      localStorage.setItem('disciplin_system_notifications', 'false');
      setSystemNotifications(false);
      toast.success('System notifications disabled.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }
    if (password) {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      const updatedUser = await apiClient.auth.updateProfile({
        name,
        email,
        ...(password ? { password } : {})
      });
      setAuth(updatedUser, token);
      setPassword('');
      setConfirmPassword('');
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto select-none py-2 md:py-4">
      {/* Title block at the top corner (matching Habits style) */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
          {t.profileSettings}
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">
          Manage your personal details and account credentials.
        </p>
      </div>

      <Card className="p-5 md:p-6 bg-white/95 dark:bg-card-bg/95 border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Account Details & Password */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  {t.fullName}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-555">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-555">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-450 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold cursor-not-allowed opacity-70 transition-all select-none focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-50 dark:border-gray-850/60 pt-4 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">Change Password</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Leave blank to keep current password.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                      {t.newPassword}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-9 pr-8 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                        placeholder="Min 6 chars"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-650 dark:text-gray-400 dark:hover:text-gray-250 transition-colors cursor-pointer focus:outline-none border-none bg-transparent"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                      {t.confirmPassword}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-9 pr-8 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                        placeholder="Repeat password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-655 dark:text-gray-400 dark:hover:text-gray-250 transition-colors cursor-pointer focus:outline-none border-none bg-transparent"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Notifications, Language & Save Button */}
            <div className="flex flex-col justify-between space-y-4">
              
              {/* Push Notifications Block */}
              <div className="space-y-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-2">
                    <Bell size={14} className="text-emerald-500" />
                    <span>{t.notificationsTitle}</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-550 font-semibold mt-0.5">
                    Configure browser-level push updates on your device.
                  </p>
                </div>

                <div className="flex items-center justify-between bg-canvas-bg/60 dark:bg-slate-900/50 border border-gray-100/50 dark:border-slate-800/60 p-3 rounded-2xl">
                  <div className="space-y-0.5 text-left pr-2">
                    <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{t.systemNotifications}</p>
                    <p className="text-[9px] text-gray-400 dark:text-slate-500 font-semibold leading-relaxed">
                      Receive alerts for checklist completion and habits streaks.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleToggleSystemNotifications}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                      ${systemNotifications ? 'bg-primary-blue' : 'bg-gray-200 dark:bg-gray-800'}
                    `}
                    aria-label="Toggle System Notifications"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${systemNotifications ? 'translate-x-4' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              </div>

              {/* Language selection block */}
              <div className="space-y-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-2">
                    <Globe size={14} className="text-emerald-500" />
                    <span>Language / भाषा</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-550 font-semibold mt-0.5">
                    Choose interface language.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => {
                    const isSelected = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer relative overflow-hidden group focus:outline-none
                          ${
                            isSelected
                              ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border-emerald-500 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                              : 'bg-canvas-bg dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                          }
                        `}
                      >
                        <div className="text-base mb-1 select-none">{lang.flag}</div>
                        <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 leading-none">
                          {lang.nativeName}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button Block */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-8 py-3 text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  {isLoading ? 'Saving Changes...' : t.saveChanges}
                </Button>
              </div>

            </div>

          </div>
        </form>
      </Card>
    </div>
  );
}
