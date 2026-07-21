import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface GoToTopProps {
  className?: string;
  offset?: number;
}

export const GoToTop: React.FC<GoToTopProps> = ({ className = '', offset = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > offset) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [offset]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed z-40 w-10 h-10 md:w-11 md:h-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-full shadow-lg hover:shadow-emerald-500/10 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center animate-scale-up select-none ${className}`}
      aria-label="Scroll to top"
      title="Scroll back to top"
    >
      <ChevronUp size={18} className="transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
};
