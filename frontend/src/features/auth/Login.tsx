import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../app/store';
import { apiClient } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { Navbar } from '../../components/ui/Navbar';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth, theme } = useStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    const toastId = toast.loading('Signing in with Google...');
    try {
      const res = await apiClient.auth.googleLogin(response.credential);
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`, { id: toastId });
      navigate('/overview');
    } catch (e: any) {
      const err = e.message || 'Google authentication failed';
      setErrorMsg(err);
      toast.error(err, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initGoogleOAuth = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-oauth-client-id-goes-here.apps.googleusercontent.com';
        (window as any).google.accounts.id.initialize({
          client_id,
          callback: handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { 
            type: 'icon',
            theme: 'outline', 
            size: 'large',
            shape: 'circle'
          }
        );
      }
    };

    // Poll for the Google SDK availability
    let attempts = 0;
    const interval = setInterval(() => {
      if ((window as any).google) {
        initGoogleOAuth();
        clearInterval(interval);
      } else {
        attempts++;
        if (attempts > 30) clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [theme]);

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

  const onInvalid = (formErrors: any) => {
    const firstError = Object.values(formErrors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setShowResend(false);
    const toastId = toast.loading('Signing in...');
    try {
      const res = await apiClient.auth.login(data);
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`, { id: toastId });
      navigate('/overview');
    } catch (e: any) {
      const err = e.message || 'Invalid email or password';
      setErrorMsg(err);
      toast.error(err, { id: toastId });
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
      <Navbar />

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
                  <Logo showText={true} center={true} className="h-16 w-full flex justify-center mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.25)]" />
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Sign In</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium leading-relaxed max-w-xs mx-auto">Track habits, achieve goals, and log job search applications</p>
                </div>

                {/* Error & Resend — unified premium card when unverified, plain banner otherwise */}
                {errorMsg && !showResend && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-semibold"
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

                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-slate-400 mb-1.5 uppercase tracking-widest select-none">
                      Email Address
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-slate-950/20 text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-800 dark:text-white
                          ${errors.email ? 'border-red-300 dark:border-red-900 focus:border-red-550 focus:ring-red-200' : 'border-gray-200 dark:border-slate-800 focus:border-emerald-500'}
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
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-bold text-gray-450 dark:text-slate-400 uppercase tracking-widest select-none">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setErrorMsg(null);
                        }}
                        className="text-xs font-bold text-emerald-500 hover:text-emerald-450 transition-colors cursor-pointer focus:outline-none border-none bg-transparent"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-slate-950/20 text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-800 dark:text-white
                           ${errors.password ? 'border-red-300 dark:border-red-900 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-slate-800 focus:border-emerald-500'}
                        `}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer focus:outline-none border-none bg-transparent"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1 select-none font-semibold">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="gradient"
                    fullWidth
                    size="lg"
                    className="mt-6 font-semibold py-3 hover:scale-[1.01] active:scale-99 transition-all cursor-pointer shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                </form>

                {/* Google OAuth Divider */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-800" />
                  <span className="absolute px-4 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 text-xs font-semibold select-none">
                    Or Sign in With
                  </span>
                </div>

                {/* Google Sign-in Button */}
                <div className="w-full flex justify-center items-center select-none py-1">
                  <div className="rounded-full shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <div id="googleSignInButton" className="flex justify-center rounded-full overflow-hidden" />
                  </div>
                </div>

                {/* Redirect link */}
                <div className="text-center mt-6 pt-5 border-t border-gray-200 dark:border-gray-850">
                  <span className="text-xs text-gray-450 dark:text-gray-500">Don't have an account? </span>
                  <Link 
                    to="/register" 
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-450 hover:underline transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Brand logo inside card for forgot password */}
                <div className="text-center mb-8">
                  <Logo showText={true} className="h-10 w-auto mx-auto justify-center mb-5 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Reset Password</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium leading-relaxed max-w-xs mx-auto">Enter your email and we'll send you a password reset link.</p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-semibold">
                    <ShieldAlert size={16} className="flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 dark:text-slate-400 mb-1.5 uppercase tracking-widest select-none">
                      Email Address
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-slate-950/20 text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all border-gray-200 dark:border-slate-800 focus:border-emerald-500 text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="gradient"
                    fullWidth
                    size="lg"
                    className="mt-6 font-semibold py-3 hover:scale-[1.01] active:scale-99 transition-all cursor-pointer shadow-md"
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
                    className="w-full text-center text-xs font-bold text-emerald-500 hover:text-emerald-450 transition-colors pt-2 cursor-pointer focus:outline-none border-none bg-transparent"
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
