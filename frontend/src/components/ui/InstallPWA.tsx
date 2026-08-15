import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa_install_dismissed');
    if (dismissed) return;

    // Don't show if already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 3s so it doesn't pop immediately on landing
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    sessionStorage.setItem('pwa_install_dismissed', '1');
  };

  if (!showBanner || isDismissed) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[9999]"
        onClick={handleDismiss}
      />

      {/* Centered Modal — matches HDFC MyCards style exactly */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-6 pointer-events-none">
        <div
          className="relative bg-white dark:bg-[#1C2333] rounded-3xl shadow-2xl w-full max-w-[340px] overflow-hidden pointer-events-auto
            animate-in zoom-in-95 fade-in duration-200"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border-none bg-transparent z-10"
            aria-label="Dismiss"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">

            {/* App icon + arrow + phone — exact match to screenshot */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 shrink-0">
                <img
                  src="/icon-192.png"
                  alt="Disciplin"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl text-slate-400 dark:text-slate-500 font-light">›</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
                <Smartphone size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* App name */}
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
              Disciplin
            </h3>

            {/* Description — matches HDFC copy style */}
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
              Add an app icon for{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">Disciplin</span>{' '}
              on your homescreen for quick access and updates
            </p>

            {/* CTA Button — full width, dark blue like HDFC */}
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="
                w-full py-3.5 rounded-2xl
                bg-emerald-500 hover:bg-emerald-600
                active:scale-[0.98] disabled:opacity-60
                text-white text-sm font-black tracking-wide
                transition-all duration-150
                cursor-pointer border-none
                shadow-lg shadow-emerald-500/20
              "
            >
              {isInstalling ? 'Installing…' : 'Add Disciplin App Icon'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
