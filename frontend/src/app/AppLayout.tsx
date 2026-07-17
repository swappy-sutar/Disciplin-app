import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Briefcase, 
  BookOpen, 
  Dumbbell,
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Sun,
  Moon,
  User as UserIcon,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { useStore } from './store';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
] as const;

import { apiClient } from '../lib/api-client';
import { addDays, subDays, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { CalendarPicker } from '../components/ui/CalendarPicker';

import { Logo } from '../components/ui/Logo';
import { GoToTop } from '../components/ui/GoToTop';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { 
    user, 
    logout, 
    activeDate, 
    setActiveDate, 
    activeWeekStart, 
    setActiveWeekStart,
    theme,
    toggleTheme,
    notifications,
    markAllAsRead,
    clearNotifications,
    language,
    setLanguage
  } = useStore();

  const { t } = useTranslation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'S';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleToggleNotifications = () => {
    if (!isNotificationsOpen) {
      markAllAsRead();
    }
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsUserMenuOpen(false);
  };

  const handleToggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationsOpen(false);
  };

  const handleLogout = async () => {
    await apiClient.auth.logout();
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: t.overview, path: '/overview', icon: LayoutDashboard },
    { name: t.habits, path: '/habits', icon: CheckSquare },
    { name: t.goals, path: '/goals', icon: Target },
    { name: t.applications, path: '/applications', icon: Briefcase },
    { name: t.topics, path: '/topics', icon: BookOpen },
    { name: t.workout || 'Workout', path: '/workout', icon: Dumbbell },
  ];

  // Mobile navigation items (Overview centered)
  const mobileNavItems = [
    { name: t.habits, path: '/habits', icon: CheckSquare },
    { name: t.workout || 'Workout', path: '/workout', icon: Dumbbell },
    { name: t.overview, path: '/overview', icon: LayoutDashboard },
    { name: t.goals, path: '/goals', icon: Target },
    { name: t.applications, path: '/applications', icon: Briefcase },
  ];

  // Shifting dates
  const handlePrevDay = () => {
    const prev = subDays(parseISO(activeDate), 1);
    const prevStr = format(prev, 'yyyy-MM-dd');
    setActiveDate(prevStr);
    
    // Shift week if date falls out of current week
    const newWeekStart = startOfWeek(prev, { weekStartsOn: 1 });
    setActiveWeekStart(format(newWeekStart, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const next = addDays(parseISO(activeDate), 1);
    const nextStr = format(next, 'yyyy-MM-dd');
    setActiveDate(nextStr);

    const newWeekStart = startOfWeek(next, { weekStartsOn: 1 });
    setActiveWeekStart(format(newWeekStart, 'yyyy-MM-dd'));
  };

  // Get active week range label e.g. "Oct 12 - Oct 18"
  const currentWeekStart = parseISO(activeWeekStart);
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const dateRangeLabel = `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d')}`;


  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col pb-16 md:pb-0 pt-16">
      {/* Top Navbar */}
      <header className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/40 fixed top-0 left-0 right-0 z-30 select-none transition-all duration-300">
        {/* Glow underside line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dark:via-emerald-500/30" />
        
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="hover:opacity-90 transition-opacity flex-shrink-0 -ml-5 sm:-ml-7 md:-ml-8">
            <Logo className="h-12 md:h-14" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  relative py-2 text-sm font-semibold transition-colors duration-300 cursor-pointer group
                  ${isActive 
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 transition-transform duration-300 origin-center ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Controls: Date range selector + Bell + User Menu */}
          <div className="flex items-center gap-4">
            
            {/* Date Switcher */}
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-2 py-1 gap-1 text-xs md:text-sm font-medium text-gray-700 shadow-sm">
              <button 
                onClick={handlePrevDay}
                className="p-1 rounded-full hover:bg-white text-gray-500 transition-colors cursor-pointer"
                aria-label="Previous day"
              >
                <ChevronLeft size={16} />
              </button>
              <CalendarPicker dateRangeLabel={dateRangeLabel} />
              <button 
                onClick={handleNextDay}
                className="p-1 rounded-full hover:bg-white text-gray-500 transition-colors cursor-pointer"
                aria-label="Next day"
              >
                <ChevronRight size={16} />
              </button>
            </div>


            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative overflow-hidden"
              aria-label="Toggle Theme Mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -15, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 15, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun size={19} className="text-yellow-500" /> : <Moon size={19} className="text-slate-750 dark:text-slate-300" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={handleToggleNotifications}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 relative transition-colors cursor-pointer"
                aria-label="View Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-attention-pink rounded-full border border-white" />
                )}
              </button>

              {/* Notification Dropdown Box */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100/80 dark:border-gray-800/85 rounded-2xl shadow-xl p-4 w-[320px] md:w-[360px] z-50 animate-in fade-in slide-in-from-top-2 duration-205 select-none">
                    <div className="flex justify-between items-center pb-2.5 mb-2 border-b border-gray-50 dark:border-gray-800">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-[9px] font-extrabold bg-attention-pink/10 text-attention-pink px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => {
                            clearNotifications();
                            setIsNotificationsOpen(false);
                          }}
                          className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-[280px] overflow-y-auto space-y-2.5 pr-0.5">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs font-semibold select-none flex flex-col items-center justify-center gap-2">
                          <span>🎉</span>
                          All caught up!
                        </div>
                      ) : (
                        notifications.map((n) => {
                          let Icon = Sparkles;
                          let iconColor = 'text-primary-blue bg-blue-50 dark:bg-blue-950/30';
                          if (n.type === 'goal') {
                            Icon = Target;
                            iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                          } else if (n.type === 'topic') {
                            Icon = BookOpen;
                            iconColor = 'text-purple-500 bg-purple-50 dark:bg-purple-950/30';
                          } else if (n.type === 'habit') {
                            Icon = CheckSquare;
                            iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                          } else if (n.type === 'timetable') {
                            Icon = Clock;
                            iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/30';
                          }

                          return (
                            <div key={n.id} className="flex gap-3 items-start p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors relative group/item">
                              <div className={`p-2 rounded-xl flex-shrink-0 ${iconColor}`}>
                                <Icon size={14} />
                              </div>
                              <div className="text-left flex-1 min-w-0 pr-4">
                                <h5 className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{n.title}</h5>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5 leading-normal">{n.message}</p>
                                <span className="text-[8px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-wider block mt-1">{n.timestamp}</span>
                              </div>
                              {!n.isRead && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-attention-pink rounded-full" />
                              )}
                            </div>
                          );
                        })
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & Logout */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={handleToggleUserMenu}
                className="flex items-center justify-center p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs tracking-wider flex items-center justify-center shadow-sm select-none border border-emerald-500/10">
                  {getInitials(user?.name)}
                </div>
              </button>
              
              {/* Dropdown Menu on Click */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100/80 dark:border-slate-800/80 p-2 min-w-[220px] z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
                    <div className="px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl mb-1.5 border border-slate-100/30 dark:border-slate-800/20">
                      <p className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate">{user?.name || ''}</p>
                      <p className="text-[10px] text-gray-450 dark:text-slate-450 font-semibold truncate mt-0.5">{user?.email || ''}</p>
                    </div>

                    {/* Language Selector for Mobile inside dropdown */}
                    <div className="block md:hidden border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2 px-1">
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-2.5">Language / भाषा</p>
                      <div className="flex flex-col gap-0.5">
                        {languages.map((lang) => {
                          const isSelected = lang.code === language;
                          return (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code);
                              }}
                              className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors duration-150
                                ${
                                  isSelected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs">{lang.flag}</span>
                                <span>{lang.nativeName}</span>
                              </div>
                              {isSelected && <Check size={12} className="text-emerald-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors block"
                    >
                      <UserIcon size={14} className="text-gray-400 dark:text-slate-450" />
                      {t.accountSettings}
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors mt-0.5"
                    >
                      <LogOut size={14} />
                      {t.signOut}
                    </button>
                  </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 md:py-8 overflow-x-hidden">
        {children}
      </main>

      {/* Sticky Bottom Nav Bar for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/60 flex items-center justify-around h-16 z-40 shadow-lg px-2 select-none backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full text-[10px] font-bold transition-all duration-300
              ${isActive 
                ? 'text-emerald-600 dark:text-emerald-400 scale-105' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            <item.icon size={19} className="mb-0.5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Go to Top Button */}
      <GoToTop className="bottom-20 md:bottom-6 right-20" />

    </div>
  );
};
