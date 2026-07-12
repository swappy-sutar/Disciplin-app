import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, Loader2, Sun, Moon, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '../../components/ui/Logo';
import { useStore } from '../../app/store';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { theme, toggleTheme } = useStore();

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Verifying your email address, please wait...');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token found in the URL. Please make sure the link is copied correctly.');
        return;
      }

      try {
        const res = await apiClient.auth.verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Your email address has been successfully verified!');
        toast.success('Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or has expired.');
        toast.error('Email verification failed.');
      }
    };

    performVerification();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setIsResending(true);
    try {
      const res = await apiClient.auth.resendVerification(resendEmail);
      if (res?.emailError) {
        toast.error(res.message || 'Failed to send verification email.', { duration: 6000 });
      } else {
        toast.success(res?.message || 'New verification link sent! Check your inbox.');
        setResendDone(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Email Verification</h1>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary-blue/10 to-emerald-500/10 blur-xl opacity-60 dark:opacity-80 rounded-3xl" />
          
          <Card className="p-6 md:p-8 bg-white/95 dark:bg-card-bg/95 backdrop-blur-md border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl text-center">
            
            {status === 'loading' && (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-12 h-12 text-primary-blue animate-spin mb-4" />
                <h2 className="text-base font-bold text-gray-800 dark:text-white mb-2">Validating Token...</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[280px] leading-relaxed mx-auto">
                  {message}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">Verification Success!</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[300px] leading-relaxed mx-auto mb-6 font-semibold">
                  {message}
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  fullWidth
                  size="lg"
                  className="font-semibold shadow-md shadow-emerald-500/10"
                >
                  Proceed to Login
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in duration-200">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[300px] leading-relaxed mx-auto mb-5 font-semibold">
                  {message}
                </p>

                {/* Resend verification section */}
                {!resendDone ? (
                  <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleResend}
                    className="w-full mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-left"
                  >
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2.5 flex items-center gap-1.5">
                      <RefreshCw size={12} /> Get a new verification link
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-gray-950/30 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={isResending}
                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                      >
                        {isResending ? 'Sending…' : 'Resend'}
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <div className="w-full mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✅ New link sent! Check your inbox.</p>
                  </div>
                )}

                <Button 
                  onClick={() => navigate('/login')}
                  fullWidth
                  size="lg"
                  variant="outline"
                  className="font-semibold shadow-sm border-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

          </Card>
        </div>
      </motion.div>
    </div>
  );
}
