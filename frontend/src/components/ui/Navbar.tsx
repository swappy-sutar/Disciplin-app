import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SunDim, MoonStar, Menu, X, CheckSquare, Shield, HelpCircle, Award } from 'lucide-react';
import { useStore } from '../../app/store';
import { AnimatePresence, motion } from 'framer-motion';

const navLinks = [
  { label: 'Features', href: '/#features', icon: CheckSquare },
  { label: 'Solutions', href: '/#demo', icon: Shield },
  { label: 'Pricing', href: '/#pricing', icon: Award },
  { label: 'Testimonials', href: '/#testimonials', icon: HelpCircle },
];

export const Navbar: React.FC = () => {
  const { token, theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';
  const logoSrc = isDark ? '/disciplin-logo.svg' : '/disciplin-logo-light.svg';

  return (
    <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 fixed top-0 left-0 right-0 z-50 select-none transition-all duration-300">
      {/* Glow accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent dark:via-emerald-500/50" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between gap-3">
        {/* Logo - Made significantly bigger */}
        <Link
          to="/"
          className="flex-shrink-0 hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Disciplin home"
        >
          <img
            src={logoSrc}
            alt="Disciplin"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
            draggable={false}
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-2 text-slate-650 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-colors duration-250 cursor-pointer group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] rounded-full bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-250 origin-center" />
            </a>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all duration-250 cursor-pointer flex-shrink-0"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {isDark ? <SunDim size={19} className="text-yellow-400" /> : <MoonStar size={19} className="text-slate-700 dark:text-slate-350" />}
              </motion.span>
            </AnimatePresence>
          </button>

          {token ? (
            /* Logged in → Dashboard */
            <Link to="/overview" className="flex-shrink-0">
              <button className="whitespace-nowrap text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-full bg-primary-blue hover:bg-primary-blue-hover text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer">
                <span className="hidden sm:inline">Go to Dashboard →</span>
                <span className="sm:hidden">Dashboard →</span>
              </button>
            </Link>
          ) : (
            <>
              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login">
                  <button className="text-sm font-semibold px-4 py-2.5 rounded-full text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-all duration-250 cursor-pointer whitespace-nowrap">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="text-sm font-bold px-6 py-2.5 rounded-full bg-primary-blue hover:bg-primary-blue-hover text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap">
                    Sign Up
                  </button>
                </Link>
              </div>

              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="sm:hidden w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all duration-200 cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -20, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 20, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center justify-center"
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 top-16 z-40 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="sm:hidden overflow-hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 z-50 shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50"
            >
              <div className="px-5 pt-3 pb-6 flex flex-col gap-1">
                {/* Nav links with icons for attractive layout */}
                {navLinks.map((link, i) => {
                  const LinkIcon = link.icon;
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className="flex items-center gap-3.5 py-3.5 px-4 text-[15px] font-semibold text-slate-700 dark:text-slate-350 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 rounded-2xl transition-all duration-150 active:scale-[0.98]"
                    >
                      <LinkIcon size={18} className="text-slate-450 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
                      {link.label}
                    </motion.a>
                  );
                })}

                {/* Divider with high-fidelity glow */}
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

                {/* Auth actions in dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.2 }}
                  className="flex flex-col gap-3 pt-2"
                >
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white text-[15px] font-extrabold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-150"
                  >
                    Get Started Free →
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[15px] font-bold hover:bg-slate-50 dark:hover:bg-slate-850/60 active:scale-[0.98] transition-all duration-150 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
