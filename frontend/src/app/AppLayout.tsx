import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
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
  Check,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen
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
  const location = useLocation();
  const isOverviewPage = location.pathname === '/overview';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('disciplin_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('disciplin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Scroll to top automatically whenever route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

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
    { name: t.topics || 'Studies', path: '/topics', icon: BookOpen },
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

  // Get active week range label e.g. "Jul 20 - 26"
  const currentWeekStart = parseISO(activeWeekStart);
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const isSameMonthWeek = currentWeekStart.getMonth() === currentWeekEnd.getMonth();
  const dateRangeLabel = isSameMonthWeek
    ? `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'd')}`
    : `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d')}`;


  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col pb-16 md:pb-0 pt-16">
      
      {/* Left Sidebar for Desktop */}
      <aside className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-[#0B0F19] border-r border-slate-200/80 dark:border-slate-800/80 z-50 transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-16' : 'w-52'}`}>
        {/* Sidebar Header with Logo & Toggle Button */}
        <div className="h-16 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/70 shrink-0 px-3">
          {!isSidebarCollapsed ? (
            <>
              <Link to="/" className="flex items-center">
                <Logo className="h-12 shrink-0" />
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={toggleSidebar}
                className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-emerald-500/10 transition-all duration-200 cursor-pointer group relative text-slate-400 hover:text-emerald-500"
                title="Expand Sidebar"
              >
                <Logo showText={false} className="h-9 w-9 shrink-0 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PanelLeftOpen size={19} />
                </div>
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold shadow-xl border border-slate-700/60 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-x-1 group-hover:translate-x-0">
                  Expand Sidebar
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-4 px-3 space-y-1.5 select-none">
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Navigation
            </div>
          )}

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 rounded-xl text-xs font-bold transition-all cursor-pointer group relative
                ${isSidebarCollapsed ? 'w-10 h-10 mx-auto justify-center p-0' : 'w-full px-3 py-2.5 justify-start'}
                ${isActive 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }
              `}
            >
              <item.icon size={20} className="shrink-0" />

              {!isSidebarCollapsed && (
                <span className="truncate">{item.name}</span>
              )}

              {/* Floating Tooltip when Collapsed */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold shadow-xl border border-slate-700/60 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-x-1 group-hover:translate-x-0">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `
                flex items-center gap-3 rounded-xl text-xs font-bold transition-all cursor-pointer group relative mt-4
                ${isSidebarCollapsed ? 'w-10 h-10 mx-auto justify-center p-0' : 'w-full px-3 py-2.5 justify-start'}
                ${isActive 
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm font-extrabold' 
                  : 'text-purple-600/80 dark:text-purple-400/80 hover:bg-purple-500/10 dark:hover:bg-purple-950/30 border border-transparent'
                }
              `}
            >
              <ShieldCheck size={20} className="shrink-0 text-purple-500" />
              
              {!isSidebarCollapsed && (
                <span className="truncate">Admin Panel</span>
              )}

              {/* Floating Tooltip when Collapsed */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-purple-950 text-purple-200 text-xs font-bold shadow-xl border border-purple-800/60 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-x-1 group-hover:translate-x-0">
                  Admin Control Panel
                </div>
              )}
            </NavLink>
          )}
        </div>

        {/* Sidebar Footer - User Profile Snippet */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/70 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-2.5 border border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[10px] font-medium text-slate-400 truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center group relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold shadow-xl border border-slate-700/60 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-x-1 group-hover:translate-x-0">
                {user?.name || 'Profile'}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Top Navbar */}
      <header className={`bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-800/80 fixed top-0 left-0 right-0 z-40 select-none transition-all duration-300 ${isSidebarCollapsed ? 'md:left-16' : 'md:left-52'}`}>
        {/* Glow underside line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dark:via-emerald-500/30" />
        
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo (Mobile only) */}
          <Link to="/" className="md:hidden hover:opacity-90 transition-opacity flex-shrink-0 -ml-5 sm:-ml-7">
            <Logo className="h-12" />
          </Link>

          {/* Controls: Date range selector + Bell + User Menu */}
          <div className="flex items-center justify-end w-full gap-4">
            
            {/* Date Switcher */}
            <div className="hidden md:flex items-center bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 rounded-full px-1.5 py-0.5 gap-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <button 
                onClick={handlePrevDay}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Previous day"
                title="Previous day"
              >
                <ChevronLeft size={14} />
              </button>
              <CalendarPicker dateRangeLabel={dateRangeLabel} />
              <button 
                onClick={handleNextDay}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Next day"
                title="Next day"
              >
                <ChevronRight size={14} />
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
            <div className="relative z-[9999]" ref={userMenuRef}>
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
                <div className="absolute right-0 top-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100/80 dark:border-slate-800/80 p-2 min-w-[220px] z-[9999] animate-in fade-in slide-in-from-top-2 duration-150 select-none">
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

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50/60 dark:hover:bg-purple-950/20 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors block my-0.5"
                      >
                        <ShieldCheck size={14} className="text-purple-500" />
                        Admin Control Panel
                      </Link>
                    )}
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
      <main className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-52'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Sticky Bottom Nav Bar for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/50 dark:border-slate-900/60 flex items-center justify-around h-16 z-40 shadow-lg px-2 select-none backdrop-blur-md">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full text-[9px] font-black transition-all duration-200 cursor-pointer
              ${isActive 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`py-1 px-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
                  <item.icon size={18} />
                </div>
                <span className="mt-0.5 tracking-tight">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Go to Top Button */}
      <GoToTop 
        className={
          isOverviewPage 
            ? "bottom-36 md:bottom-20 right-5 md:right-6" 
            : "bottom-20 md:bottom-6 right-5 md:right-6"
        } 
      />

    </div>
  );
};
