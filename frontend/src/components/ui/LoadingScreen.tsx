import React, { useMemo } from 'react';
import { Logo } from './Logo';

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
}

const INSPIRATIONAL_QUOTES = [
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Atomic habits compound over time. 1% better every day leads to massive results.", author: "James Clear" },
  { text: "Consistency is not about perfection. It is about showing up when you do not feel like it.", author: "Unknown" },
  { text: "He who has a why to live for can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Focus on the process, not the outcome. Fall in love with the system.", author: "Unknown" }
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Syncing your momentum",
  subtext = "Fetching timetables, habits, and active goals..."
}) => {
  const quote = useMemo(() => {
    return INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center select-none text-center px-6 animate-in fade-in duration-300">
      <div className="relative mb-6">
        {/* Glowing background ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-xl animate-pulse" />
        
        {/* Custom logo spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-150 dark:border-gray-800 rounded-full shadow-lg">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <Logo />
        </div>
      </div>
      
      <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
        {message}
        <span className="inline-flex gap-0.5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
        </span>
      </h2>
      <p className="text-xs text-gray-400 dark:text-gray-550 mt-1 font-semibold">
        {subtext}
      </p>

      {/* Inspirational Loader Quote */}
      <div className="mt-10 max-w-sm p-4 rounded-2xl bg-white/50 dark:bg-card-bg/40 border border-gray-100/50 dark:border-gray-800/40 backdrop-blur-sm">
        <p className="text-xs italic font-bold text-gray-550 dark:text-gray-400 leading-relaxed">
          "{quote.text}"
        </p>
        <p className="text-[10px] text-gray-450 dark:text-gray-555 mt-1.5 font-bold uppercase tracking-wider">— {quote.author}</p>
      </div>
    </div>
  );
};
