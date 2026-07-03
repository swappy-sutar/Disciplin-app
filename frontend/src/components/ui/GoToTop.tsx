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
      className={`fixed z-40 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center animate-scale-up ${className}`}
      aria-label="Scroll to top"
    >
      <ChevronUp size={20} className="animate-bounce" style={{ animationDuration: '2s' }} />
    </button>
  );
};
