import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../app/store';
import { apiClient } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, ShieldAlert, User as UserIcon, Sun, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.auth.register(data);
      if (res?.emailError) {
        toast.error(res.message, { duration: 6000 });
      } else {
        toast.success(res.message || 'Registration successful! Please check your email to verify your account.');
      }
      navigate('/login');
    } catch (e: any) {
      const err = e.message || 'Registration failed';
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
        
        {/* Brand header */}
        <div className="text-center mb-6">
          <motion.div 
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-flex p-3 rounded-2xl bg-white dark:bg-card-bg shadow-md border border-gray-100 dark:border-gray-800 mb-3"
          >
            <Logo showText={false} />
          </motion.div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create Your Account</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-semibold">Start tracking habits and goals systematically</p>
        </div>

        {/* Register Card */}
        <div className="relative">
          {/* Neon border-glow effect beneath card */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-blue/10 to-emerald-500/10 blur-xl opacity-60 dark:opacity-80 rounded-3xl" />
          
          <Card className="p-6 md:p-8 bg-white/95 dark:bg-card-bg/95 backdrop-blur-md border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">Sign Up</h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-105/50 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-semibold">
                <ShieldAlert size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-450 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-primary-blue transition-colors pointer-events-none">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 dark:bg-gray-950/20 text-sm focus:bg-white dark:focus:bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all text-gray-800 dark:text-white
                      ${errors.name ? 'border-red-300 dark:border-red-900 focus:border-red-550 focus:ring-red-200' : 'border-gray-200 dark:border-gray-800 focus:border-primary-blue'}
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
                <label className="block text-xs font-semibold text-gray-455 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
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
                <label className="block text-xs font-semibold text-gray-455 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

            </form>

            {/* Redirect link */}
            <div className="text-center mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-450 dark:text-gray-500">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-xs font-bold text-primary-blue hover:underline hover:text-primary-blue-hover transition-colors"
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
