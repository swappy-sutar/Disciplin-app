import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, CheckSquare, Shield, HelpCircle, Award, ChevronRight, Check } from 'lucide-react';
import { useStore } from '../../app/store';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageSelector } from './LanguageSelector';

const navLinks = [
  { label: 'Features', href: '/#features', icon: CheckSquare },
  { label: 'Solutions', href: '/#demo', icon: Shield },
  { label: 'Pricing', href: '/#pricing', icon: Award },
  { label: 'Testimonials', href: '/#testimonials', icon: HelpCircle },
];

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
] as const;

export const Navbar: React.FC = () => {
  const { token, theme, toggleTheme, language, setLanguage } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';
  const logoSrc = isDark ? '/disciplin-logo.svg' : '/disciplin-logo-light.svg';

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 fixed top-0 left-0 right-0 z-50 select-none transition-all duration-300">
      {/* Glow accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent dark:via-emerald-500/50" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between gap-3">
        {/* Logo - Made significantly bigger */}
        <Link
          to="/"
          className="flex-shrink-0 hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] -ml-5 sm:-ml-7 md:-ml-8"
          aria-label="Disciplin home"
        >
          <img
            src={logoSrc}
            alt="Disciplin"
            className="h-12 sm:h-15 md:h-16 w-auto object-contain"
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
          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

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
                {isDark ? <Sun size={19} className="text-yellow-400" /> : <Moon size={19} className="text-slate-700 dark:text-slate-300" />}
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
                ref={hamburgerBtnRef}
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
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="sm:hidden overflow-hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 z-50 shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50"
          >
              <div className="px-4 pt-2.5 pb-5 flex flex-col gap-1">
                {/* Nav links with refined boxes and chevrons */}
                {navLinks.map((link, i) => {
                  const LinkIcon = link.icon;
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.15 }}
                      className="flex items-center justify-between py-2 px-2.5 text-[14.5px] font-semibold text-slate-850 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-450 hover:bg-emerald-500/8 dark:hover:bg-emerald-500/8 rounded-xl transition-all duration-150 active:scale-[0.98] group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100/60 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-450 group-hover/item:bg-emerald-500/10 group-hover/item:text-emerald-500 transition-colors duration-200">
                          <LinkIcon size={16} />
                        </div>
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight size={15} className="text-slate-400 dark:text-slate-550 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200" />
                    </motion.a>
                  );
                })}

                {/* Language selection block */}
                <div className="border-t border-slate-100 dark:border-slate-900/60 mt-1.5 pt-3 px-2.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Language / भाषा</span>
                  <div className="flex gap-1.5">
                    {languages.map((lang) => {
                      const isSelected = lang.code === language;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors duration-150 border
                            ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/10'
                                : 'bg-transparent text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/60'
                            }
                          `}
                        >
                          <span className="text-xs select-none">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                          {isSelected && <Check size={12} className="text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-2.5 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

                {/* Auth actions in one row */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.18 }}
                  className="flex flex-row items-center gap-2.5 pt-1 w-full"
                >
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center py-3.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-[14px] font-bold shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center py-3.5 rounded-xl border border-slate-200/85 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[14px] font-bold hover:bg-slate-55 dark:hover:bg-slate-850/60 active:scale-[0.98] transition-all duration-150 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
