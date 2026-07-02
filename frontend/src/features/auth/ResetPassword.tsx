import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Lock, ShieldAlert, Sun, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { useStore } from '../../app/store';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { theme, toggleTheme } = useStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('No reset token found. Try requesting another password reset link.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await apiClient.auth.resetPassword({ token, password });
      toast.success('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (e: any) {
      const err = e.message || 'Failed to reset password';
      setErrorMsg(err);
      toast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col items-center justify-center p-4 pt-20 select-none relative overflow-hidden">
      {/* Public Header */}
      <header className="bg-white/70 dark:bg-card-bg/70 backdrop-blur-md border-b border-gray-100/80 dark:border-border-main fixed top-0 left-0 right-0 z-50 select-none">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Decorative dot-mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] dark:bg-[radial-gradient(#27314A_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Decorative circular glow highlights */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-card-bg shadow-md border border-gray-100 dark:border-gray-800 mb-3">
            <Logo showText={false} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create New Password</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-semibold">Choose a secure password for your Disciplin account</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-blue/10 to-emerald-500/10 blur-xl opacity-60 dark:opacity-80 rounded-3xl" />
          
          <Card className="p-6 md:p-8 bg-white/95 dark:bg-card-bg/95 backdrop-blur-md border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 font-bold">New Credentials</h2>

            {!token ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 text-xs font-semibold leading-relaxed">
                No active reset token found in the link parameters. Please request a new password recovery email from the sign-in page.
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-105/50 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-semibold">
                    <ShieldAlert size={16} className="flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-450 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-primary-blue transition-colors pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-gray-950/20 text-sm focus:bg-white dark:focus:bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all border-gray-200 dark:border-gray-800 focus:border-primary-blue text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-450 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-primary-blue transition-colors pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-gray-950/20 text-sm focus:bg-white dark:focus:bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all border-gray-200 dark:border-gray-800 focus:border-primary-blue text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    className="mt-6 font-semibold py-3 hover:scale-[1.01] active:scale-99 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting Password...' : 'Save Password'}
                  </Button>
                </form>
              </>
            )}

            <div className="text-center mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <Link 
                to="/login" 
                className="text-xs font-bold text-primary-blue hover:underline hover:text-primary-blue-hover transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
