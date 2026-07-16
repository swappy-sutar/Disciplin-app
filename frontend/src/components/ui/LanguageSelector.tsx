import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../app/store';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
] as const;

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 flex items-center gap-2 text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/60 transition-all duration-200 cursor-pointer text-xs font-bold font-sans"
        aria-label="Change Language"
      >
        <Globe size={15} className="text-slate-400 dark:text-slate-500" />
        <span>{currentLang.nativeName}</span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-150/70 dark:border-slate-800/80 py-2 z-50 overflow-hidden"
          >
            <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 mb-1">
              Change Language
            </div>
            <div className="flex flex-col gap-0.5 px-1">
              {languages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-150
                      ${
                        isSelected
                          ? 'bg-emerald-500/8 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm select-none" role="img" aria-label={lang.name}>
                        {lang.flag}
                      </span>
                      <span>
                        {lang.nativeName}{' '}
                        <span className="text-[10px] font-normal text-slate-450 dark:text-slate-500 ml-0.5">
                          ({lang.name})
                        </span>
                      </span>
                    </div>
                    {isSelected && <Check size={14} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
