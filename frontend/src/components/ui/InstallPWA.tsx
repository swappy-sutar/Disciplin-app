import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

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
    // Don't show if already dismissed in this session or installed
    const dismissed = sessionStorage.getItem('pwa_install_dismissed');
    if (dismissed) return;

    // Don't show if already running as PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so it doesn't pop up immediately on page load
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] md:hidden"
        onClick={handleDismiss}
      />

      {/* Install Card — slides up from bottom on mobile, toast on desktop */}
      <div className="
        fixed z-[10000] select-none
        bottom-0 left-0 right-0
        md:bottom-6 md:right-6 md:left-auto md:w-[340px]
        animate-in slide-in-from-bottom-4 fade-in duration-300
      ">
        <div className="
          bg-white dark:bg-[#151B2C]
          rounded-t-3xl md:rounded-3xl
          shadow-2xl shadow-black/20 dark:shadow-black/50
          border-t border-x border-slate-200/60 dark:border-slate-700/50
          md:border
          overflow-hidden
        ">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          <div className="p-5 pb-6 md:p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* App Icon */}
                <div className="w-14 h-14 md:w-12 md:h-12 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/40 shadow-md shrink-0">
                  <img src="/icon-192.png" alt="Disciplin" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Disciplin</h3>
                    <span className="text-slate-400 dark:text-slate-500">›</span>
                    <Smartphone size={14} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    disciplin.app
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4 text-center">
              Add <span className="font-black text-emerald-600 dark:text-emerald-400">Disciplin</span> to your home screen for quick access — works offline, no App Store needed.
            </p>

            {/* Install Button */}
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="
                w-full py-3 rounded-2xl
                bg-emerald-500 hover:bg-emerald-600 active:scale-95
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white text-sm font-black tracking-wide
                flex items-center justify-center gap-2
                transition-all duration-200
                shadow-lg shadow-emerald-500/25
                cursor-pointer border-none
              "
            >
              <Download size={15} />
              {isInstalling ? 'Installing…' : 'Add Disciplin App Icon'}
            </button>

            <p className="text-center text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Free • No account needed to install
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
