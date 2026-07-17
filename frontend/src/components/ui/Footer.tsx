import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50/60 dark:bg-slate-950/65 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-900/60 pt-10 pb-6 select-none text-xs text-slate-500 dark:text-slate-400 font-semibold relative z-10 w-full overflow-hidden">
      {/* Subtle ambient gradient glow behind footer content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/5 dark:bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-6 border-b border-slate-200/60 dark:border-slate-850/60 pb-8">

        {/* Column 1: Logo, description, and social icons */}
        <div className="col-span-2 md:col-span-5 space-y-3.5 text-left">
          <Logo className="h-12 md:h-14" />
          <p className="max-w-xs leading-relaxed text-slate-400 dark:text-slate-500 font-medium">
            Helping you land your dream role through systematic organization and habit excellence.
          </p>
          {/* Social Icons with rounded bordered boxes */}
          <div className="flex items-center gap-2.5 pt-1.5">
            <a
              href="https://www.linkedin.com/in/swappy-sutar/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 border border-slate-200/80 dark:border-slate-850 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm"
              aria-label="LinkedIn"
            >
              <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://github.com/swappy-sutar"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 border border-slate-200/80 dark:border-slate-850 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-550/30 dark:hover:border-slate-500/30 hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm"
              aria-label="GitHub"
            >
              <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
            <a
              href="https://er-swapppy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 border border-slate-200/80 dark:border-slate-850 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm"
              aria-label="Profile Website"
            >
              <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Platform / Product */}
        <div className="col-span-1 md:col-span-2 space-y-3 text-left">
          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2.5">Product</span>
          <Link
            to="/"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="block text-slate-450 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:translate-x-0.5 transition-all duration-300 font-bold"
          >
            Home
          </Link>
          <a href="/#features" className="block text-slate-450 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:translate-x-0.5 transition-all duration-300 font-bold">Features</a>
          <Link to="/about" className="block text-slate-450 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:translate-x-0.5 transition-all duration-300 font-bold">About Us</Link>
          <Link to="/contact" className="block text-slate-450 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:translate-x-0.5 transition-all duration-300 font-bold">Contact Us</Link>
        </div>

        {/* Column 3: Legal */}
        <div className="col-span-1 md:col-span-2 space-y-3 text-left">
          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2.5">Legal</span>
          <a href="#" className="block text-slate-450 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:translate-x-0.5 transition-all duration-300 font-bold">Privacy Policy</a>
          <a href="#" className="block text-slate-450 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:translate-x-0.5 transition-all duration-300 font-bold">Terms of Service</a>
        </div>

        {/* Column 4: Newsletter Stay Updated */}
        <div className="col-span-2 md:col-span-3 space-y-3.5 text-left">
          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2.5">Stay Updated</span>
          <p className="leading-relaxed text-slate-400 dark:text-slate-500 font-medium">
            Subscribe to our newsletter for productivity insights, release updates, and community news.
          </p>
          <form className="relative flex items-center max-w-sm mt-3 w-full" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white/90 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800/80 rounded-2xl pl-4 pr-12 py-3.5 text-xs font-bold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl p-2.5 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95 duration-200"
              aria-label="Subscribe"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

      </div>

      {/* Bottom copyright credits and operational status bar */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 dark:text-slate-500 text-xs font-semibold">
        <p className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left font-medium">
          <span>© 2026 Swapnil Sutar. All rights reserved.</span>
          <span className="hidden sm:inline text-slate-200 dark:text-slate-850">|</span>
          <span className="flex items-center gap-1 mt-1 sm:mt-0">
            Made with <span className="text-emerald-550 dark:text-emerald-450 animate-pulse font-extrabold">💚</span> by{' '}
            <a
              href="https://github.com/swappy-sutar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-all"
            >
              Er-Swapnil
            </a>{' '}
            for all.
          </span>
        </p>
      </div>
    </footer>
  );
};
