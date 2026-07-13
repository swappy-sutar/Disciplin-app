import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
import { useStore } from '../../app/store';

export const Navbar: React.FC = () => {
  const { token, theme, toggleTheme } = useStore();

  return (
    <header className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/40 fixed top-0 left-0 right-0 z-50 select-none transition-all duration-300">
      {/* Glow underside line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dark:via-emerald-500/30" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <a
            href="/#features"
            className="relative py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 cursor-pointer group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <a
            href="/#demo"
            className="relative py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 cursor-pointer group"
          >
            Solutions
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <a
            href="/#pricing"
            className="relative py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 cursor-pointer group"
          >
            Pricing
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <a
            href="/#testimonials"
            className="relative py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 cursor-pointer group"
          >
            Testimonials
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-450 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/50 transition-all duration-300 cursor-pointer"
            aria-label="Toggle Theme Mode"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
          </button>

          {token ? (
            <Link to="/overview">
              <Button size="sm" className="px-5 py-2 font-bold shadow-md hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300">
                Go to Dashboard →
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-900/60 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="px-5 py-2 font-bold shadow-md hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
