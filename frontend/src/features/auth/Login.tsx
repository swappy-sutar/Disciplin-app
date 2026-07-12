import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../app/store';
import { apiClient } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, ShieldAlert, Sun, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth, theme, toggleTheme } = useStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.auth.forgotPassword(forgotEmail);
      if (res?.emailError) {
        toast.error(res.message, { duration: 6000 });
      } else {
        toast.success(res?.message || 'Password reset link sent! Check your inbox.');
      }
      setIsForgotMode(false);
      setForgotEmail('');
    } catch (e: any) {
      const err = e.message || 'Failed to send reset link';
      setErrorMsg(err);
      toast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail.trim() || isResending) return;
    setIsResending(true);
    try {
      const res = await apiClient.auth.resendVerification(resendEmail);
      if (res?.emailError) {
        toast.error(res.message || 'Failed to send verification email.', { duration: 6000 });
      } else {
        toast.success(res?.message || 'Verification link sent! Check your inbox.');
        setShowResend(false);
        setResendEmail('');
        setErrorMsg(null);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setShowResend(false);
    try {
      const res = await apiClient.auth.login(data);
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/overview');
    } catch (e: any) {
      const err = e.message || 'Invalid email or password';
      setErrorMsg(err);
      toast.error(err);
      // Show resend option when email is unverified
      if (err.toLowerCase().includes('verify')) {
        setResendEmail(data.email);
        setShowResend(true);
      }
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
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <Link to="/#features" className="hover:text-primary-blue transition-colors">Features</Link>
            <Link to="/#demo" className="hover:text-primary-blue transition-colors">Solutions</Link>
            <Link to="/#pricing" className="hover:text-primary-blue transition-colors">Pricing</Link>
            <Link to="/#testimonials" className="hover:text-primary-blue transition-colors">Testimonials</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
            </button>

            <Link to="/register">
              <Button size="sm" className="px-5 py-2 font-semibold shadow-sm">Get started</Button>
            </Link>
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
        
        {/* Login Card */}
        <div className="relative">
          {/* Neon border-glow effect beneath card */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-blue/10 to-emerald-500/10 blur-xl opacity-60 dark:opacity-80 rounded-3xl" />
          
          <Card className="p-6 md:p-8 bg-white/95 dark:bg-card-bg/95 backdrop-blur-md border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl">
            {!isForgotMode ? (
              <>
                {/* Brand logo inside card */}
                <div className="text-center mb-8">
                  <Logo showText={true} className="h-12 w-auto mx-auto justify-center mb-5" />
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Sign In</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-semibold leading-relaxed max-w-xs mx-auto">Track habits, achieve goals, and log job search applications</p>
                </div>

                {/* Error & Resend — unified premium card when unverified, plain banner otherwise */}
                {errorMsg && !showResend && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-105/50 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-semibold"
                  >
                    <ShieldAlert size={16} className="flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Premium resend verification card — app theme */}
                {showResend && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="relative mb-4 overflow-hidden rounded-2xl"
                  >
                    {/* Emerald glow backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 via-success-green/10 to-primary-blue/5 blur-sm" />
                    <div className="relative flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-card-bg/90 dark:bg-card-bg/90 backdrop-blur-md border border-primary-blue/25 shadow-lg shadow-success-green/10">
                      {/* Left side */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Pulsing dot — emerald */}
                        <span className="relative flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-primary-blue opacity-50" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-blue" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-text-main leading-tight">Verify your email</p>
                          <p className="text-[10px] text-primary-blue/70 font-medium mt-0.5 truncate">Check inbox or get a new link</p>
                        </div>
                      </div>

                      {/* Resend button — emerald gradient */}
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isResending}
                        className="group relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg overflow-hidden text-[11px] font-bold text-white transition-all disabled:opacity-50 cursor-pointer border-none focus:outline-none"
                      >
                        {/* Button bg with shimmer */}
                        <span className="absolute inset-0 bg-gradient-to-r from-primary-blue to-success-green-hover group-hover:from-success-green-hover group-hover:to-primary-blue transition-all duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative">
                          {isResending ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Sending…
                            </span>
                          ) : (
                            'Resend Link'
                          )}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}


                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-450 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-primary-blue transition-colors pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-gray-950/20 text-sm focus:bg-white dark:focus:bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all text-gray-800 dark:text-white
                          ${errors.email ? 'border-red-300 dark:border-red-900 focus:border-red-550 focus:ring-red-200' : 'border-gray-200 dark:border-gray-800 focus:border-primary-blue'}
                        `}
                        {...register('email')} 
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1 select-none font-semibold">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-gray-455 dark:text-gray-500 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setErrorMsg(null);
                        }}
                        className="text-xs font-bold text-primary-blue hover:underline cursor-pointer focus:outline-none border-none bg-transparent"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-primary-blue transition-colors pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-gray-950/20 text-sm focus:bg-white dark:focus:bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all text-gray-800 dark:text-white
                          ${errors.password ? 'border-red-300 dark:border-red-900 focus:border-red-550 focus:ring-red-200' : 'border-gray-200 dark:border-gray-800 focus:border-primary-blue'}
                        `}
                        {...register('password')}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1 select-none font-semibold">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    className="mt-6 font-semibold py-3 hover:scale-[1.01] active:scale-99 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                </form>

                {/* Redirect link */}
                <div className="text-center mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-455 dark:text-gray-500">Don't have an account? </span>
                  <Link 
                    to="/register" 
                    className="text-xs font-bold text-primary-blue hover:underline hover:text-primary-blue-hover transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Brand logo inside card for forgot password */}
                <div className="text-center mb-8">
                  <Logo showText={true} className="h-12 w-auto mx-auto justify-center mb-5" />
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Reset Password</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-semibold leading-relaxed max-w-xs mx-auto">Enter your email and we'll send you a password reset link.</p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-105/50 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-semibold">
                    <ShieldAlert size={16} className="flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-450 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-primary-blue transition-colors pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
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
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false);
                      setErrorMsg(null);
                    }}
                    className="w-full text-center text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-650 dark:hover:text-gray-300 transition-colors pt-2 cursor-pointer focus:outline-none border-none bg-transparent"
                  >
                    Back to Sign In
                  </button>

                </form>
              </>
            )}
          </Card>
        </div>

      </motion.div>
    </div>
  );
}
