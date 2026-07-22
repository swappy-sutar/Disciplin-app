import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../app/store';
import { apiClient } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, ShieldAlert, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { Navbar } from '../../components/ui/Navbar';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, theme } = useStore();

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsGoogleLoading(true);
    const toastId = toast.loading('Signing up with Google...');
    try {
      const res = await apiClient.auth.googleLogin(response.credential);
      setAuth(res.user, res.token);
      toast.success(`Welcome to Disciplin, ${res.user.name}! 🚀`, { id: toastId, duration: 4000 });
      navigate('/overview');
    } catch (e: any) {
      const err = e.message || 'Google signup failed';
      setErrorMsg(err);
      toast.error(err, { id: toastId, duration: 5000 });
    } finally {
      setIsGoogleLoading(false);
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
          document.getElementById('googleSignUpButton'),
          { 
            type: 'standard',
            theme: 'outline', 
            size: 'large',
            shape: 'pill',
            logo_alignment: 'left',
            width: 180
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onInvalid = (formErrors: any) => {
    const firstError = Object.values(formErrors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsFormLoading(true);
    setErrorMsg(null);
    const toastId = toast.loading('Creating account...');
    try {
      const res = await apiClient.auth.register(data);
      if (res?.emailError) {
        toast.error(res.message, { id: toastId, duration: 6000 });
      } else {
        toast.success(res.message || 'Registration successful! Check your inbox to verify your account.', { id: toastId, duration: 4000 });
      }
      navigate('/login');
    } catch (e: any) {
      const err = e.message || 'Registration failed';
      setErrorMsg(err);
      toast.error(err, { id: toastId, duration: 5000 });
    } finally {
      setIsFormLoading(false);
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
        
        {/* Register Card */}
        <div className="relative">
          {/* Neon border-glow effect beneath card */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-blue/10 to-emerald-500/10 blur-xl opacity-60 dark:opacity-80 rounded-3xl" />
          
          <Card className="p-6 md:p-8 bg-white/95 dark:bg-card-bg/95 backdrop-blur-md border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl">
            {/* Brand logo inside card */}
            <div className="text-center mb-8">
              <Logo showText={true} center={true} className="h-16 w-full flex justify-center mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.25)]" />
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Sign Up</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-semibold leading-relaxed max-w-xs mx-auto">Start tracking habits and goals systematically</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-semibold">
                <ShieldAlert size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
              
              {/* Name Field */}
              <div>
                <label className="block text-[10px] font-bold text-gray-450 dark:text-slate-400 mb-1.5 uppercase tracking-widest select-none">
                  Full Name
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-slate-950/20 text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-800 dark:text-white
                      ${errors.name ? 'border-red-300 dark:border-red-900 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-slate-800 focus:border-emerald-500'}
                    `}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1 select-none font-semibold">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[10px] font-bold text-gray-455 dark:text-slate-400 mb-1.5 uppercase tracking-widest select-none">
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
                      ${errors.email ? 'border-red-300 dark:border-red-900 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-slate-800 focus:border-emerald-500'}
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
                <label className="block text-[10px] font-bold text-gray-455 dark:text-slate-400 mb-1.5 uppercase tracking-widest select-none">
                  Password
                </label>
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
                fullWidth
                size="lg"
                variant="gradient"
                className="mt-6 font-semibold py-3 hover:scale-[1.01] active:scale-99 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                disabled={isFormLoading || isGoogleLoading}
              >
                {isFormLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

            </form>

            {/* Google OAuth Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-800" />
              <span className="absolute px-4 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 text-xs font-semibold select-none">
                or
              </span>
            </div>

            {/* Google Sign-in Button */}
            <div className="w-full flex flex-col justify-center items-center select-none py-1 relative">
              <div className={`rounded-full shadow-xs transition-all duration-200 ${isGoogleLoading ? 'opacity-50 pointer-events-none' : 'hover:shadow-md hover:scale-[1.02]'}`}>
                {isGoogleLoading ? (
                  <button
                    type="button"
                    disabled
                    className="w-[180px] h-[40px] px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-not-allowed select-none transition-all duration-200"
                  >
                    <span className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0" />
                    <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-500 animate-pulse whitespace-nowrap">
                      Authenticating...
                    </span>
                  </button>
                ) : (
                  <div id="googleSignUpButton" className="flex justify-center rounded-full overflow-hidden" />
                )}
              </div>
            </div>

            {/* Redirect link */}
            <div className="text-center mt-6 pt-5 border-t border-gray-200 dark:border-gray-855">
              <span className="text-xs text-gray-450 dark:text-gray-500">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-xs font-bold text-emerald-500 hover:text-emerald-450 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>

          </Card>
        </div>

      </motion.div>
    </div>
  );
}
