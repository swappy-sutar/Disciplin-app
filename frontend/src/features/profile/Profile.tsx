import React, { useState } from 'react';
import { useStore } from '../../app/store';
import { apiClient } from '../../lib/api-client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Mail, Lock } from 'lucide-react';

export default function Profile() {
  const { user, token, setAuth } = useStore();
  const [name, setName] = useState(user?.name || '');
  const email = user?.email || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 select-none py-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
          Account Settings
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 font-semibold">
          Manage your personal details and account credentials.
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-white/95 dark:bg-card-bg/95 border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Full Name
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
              Email Address
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
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-canvas-bg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isLoading ? 'Saving Changes...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
