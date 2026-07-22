import React, { useState } from 'react';
import { useStore } from '../../app/store';
import { apiClient } from '../../lib/api-client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Mail, Lock, ArrowLeft, Eye, EyeOff, Bell, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
] as const;

export default function Profile() {
  const navigate = useNavigate();
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
    <div className="max-w-2xl mx-auto select-none pb-12">
      {/* Sticky page header pinned under the top navbar */}
      <div className="sticky top-16 z-30 bg-canvas-bg/90 backdrop-blur-md pt-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/50 mb-6 space-y-3">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Go Back</span>
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {t.profileSettings}
          </h1>
          <p className="text-sm text-gray-450 dark:text-gray-500 mt-1.5 font-semibold">
            Manage your personal details and account credentials.
          </p>
        </div>
      </div>

      <Card className="p-6 md:p-8 bg-white/95 dark:bg-card-bg/95 border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t.fullName}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <UserIcon size={16} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t.emailAddress}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-450 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold cursor-not-allowed opacity-70 transition-all select-none focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="border-t border-gray-50 dark:border-gray-850 pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Change Password</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Leave blank if you don't want to change it.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  {t.newPassword}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-250 transition-colors cursor-pointer focus:outline-none border-none bg-transparent"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-250 transition-colors cursor-pointer focus:outline-none border-none bg-transparent"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification settings section */}
          <div className="border-t border-gray-50 dark:border-gray-850 pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell size={15} className="text-emerald-500" />
                <span>{t.notificationsTitle}</span>
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                Configure browser-level push updates on your laptop or mobile.
              </p>
            </div>

            <div className="flex items-center justify-between bg-canvas-bg/60 dark:bg-slate-900/50 border border-gray-100/50 dark:border-slate-800/60 p-4 rounded-2xl">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{t.systemNotifications}</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold max-w-[340px]">
                  Receive instant system alerts when completing review checklists, streaks, and focus blocks.
                  Ensure browser permissions are allowed.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleToggleSystemNotifications}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${systemNotifications ? 'bg-primary-blue' : 'bg-gray-200 dark:bg-gray-800'}
                `}
                aria-label="Toggle System Notifications"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${systemNotifications ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Language selection section */}
          <div className="border-t border-gray-50 dark:border-gray-850 pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <Globe size={15} className="text-emerald-500" />
                <span>Language / भाषा</span>
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-555 font-semibold mt-0.5">
                Choose your preferred interface language for the dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {languages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group focus:outline-none
                      ${
                        isSelected
                          ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border-emerald-500 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-canvas-bg dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                      }
                    `}
                  >
                    {/* Glowing highlight blob */}
                    {isSelected && (
                      <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
                    )}

                    {/* Header line: Flag and Indicator */}
                    <div className="w-full flex items-center justify-between mb-3 select-none">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-850 flex items-center justify-center text-sm shadow-sm border border-gray-100/60 dark:border-slate-800/40">
                        {lang.flag}
                      </div>

                      {/* Custom check ring */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200
                        ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500 text-white scale-110 shadow-sm'
                            : 'border-slate-300 dark:border-slate-750 group-hover:border-slate-400'
                        }
                      `}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Labels */}
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none">
                      {lang.nativeName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 mt-1.5 leading-none">
                      {lang.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isLoading ? 'Saving Changes...' : t.saveChanges}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
