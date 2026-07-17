import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckSquare,
  Target,
  BookOpen,
  Briefcase,
  Flame,
  ArrowRight,
  Star,
  Zap,
  Shield,
  EyeOff,
  Server,
  Play,
  BarChart2,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../app/store';
import { Footer } from '../../components/ui/Footer';
import { GoToTop } from '../../components/ui/GoToTop';
import { Navbar } from '../../components/ui/Navbar';
import { useTranslation } from '../../hooks/useTranslation';

// ─── CountUp: animates a number when it scrolls into view ───────────────────
function CountUp({
  to,
  suffix = '',
  duration = 1800,
  formatter,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  formatter?: (n: number) => string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * to));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  const display = formatter ? formatter(value) : value.toLocaleString();
  return <span ref={ref}>{display}{suffix}</span>;
}
// ─────────────────────────────────────────────────────────────────────────────

const renderFaqTitle = (title: string) => {
  if (title.endsWith('Questions')) {
    const base = title.substring(0, title.length - 'Questions'.length);
    return (
      <>
        {base}
        <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Questions
        </span>
      </>
    );
  }
  if (title.endsWith('प्रश्न')) {
    const base = title.substring(0, title.length - 'प्रश्न'.length);
    return (
      <>
        {base}
        <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
          प्रश्न
        </span>
      </>
    );
  }
  return title;
};

export default function LandingPage() {
  const { token } = useStore();
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Always start from the top when the page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const features = [
    {
      title: t.dailyTimetable,
      desc: t.dailyTimetableDesc,
      icon: Calendar,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      accent: '#3B82F6'
    },
    {
      title: t.habitTracker,
      desc: t.habitTrackerDesc,
      icon: CheckSquare,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      accent: '#10B981'
    },
    {
      title: t.weeklyGoals,
      desc: t.weeklyGoalsDesc,
      icon: Target,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
      accent: '#EC4899'
    },
    {
      title: t.studyPlanner,
      desc: t.studyPlannerDesc,
      icon: BookOpen,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      accent: '#8B5CF6'
    },
    {
      title: t.jobAppTracker,
      desc: t.jobAppTrackerDesc,
      icon: Briefcase,
      color: 'text-slate-600 bg-slate-600/10 border-slate-600/20',
      accent: '#475569'
    },
    {
      title: t.smartAnalytics,
      desc: t.smartAnalyticsDesc,
      icon: BarChart2,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      accent: '#F59E0B'
    },
  ];

  const demoFeatures = [
    {
      id: 'dash',
      label: 'Main Dashboard',
      subtitle: 'FEATURE 01',
      title: 'All key systems, aggregated in one window',
      desc: 'Get an immediate visual pulse of your day. Monitor daily schedules, pending weekly goals, consistency grids, and recent applications on a single screen.',
      preview: (
        <div className="bg-canvas-bg dark:bg-slate-950 rounded-2xl p-4 border border-gray-100 dark:border-slate-850/80 shadow-inner space-y-4 text-left select-none text-[10px] w-full min-h-[235px] flex flex-col justify-between">
          {/* Header row */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-gray-100/50 dark:border-slate-800/80 shadow-sm">
            <div>
              <span className="font-extrabold text-gray-800 dark:text-slate-100 text-xs block leading-none">Today's Overview</span>
              <span className="text-[8px] text-gray-400 dark:text-slate-500 mt-1 block font-semibold">Monday, Oct 16, 2023</span>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] bg-indigo-50/50 dark:bg-indigo-950/30 text-primary-blue dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
              <Calendar size={10} />
              <span>Oct 12 - Oct 18</span>
            </div>
          </div>
          {/* Dashboard contents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-gray-100/50 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between">
              <span className="font-extrabold text-gray-800 dark:text-slate-100 text-xs block">Daily Timetable</span>
              <div className="relative border-l-2 border-gray-100 dark:border-slate-850 pl-3 ml-1 space-y-2.5">
                <div className="relative">
                  <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  <p className="font-semibold text-gray-700 dark:text-slate-350 leading-none">Morning Routine</p>
                  <span className="text-[8px] text-gray-400 dark:text-slate-550 mt-0.5 block">08:00 - 09:00</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-primary-blue border-2 border-white dark:border-slate-900" />
                  <p className="font-semibold text-gray-700 dark:text-slate-350 leading-none">DSA Practice: Graphs</p>
                  <span className="text-[8px] text-gray-400 dark:text-slate-550 mt-0.5 block">12:00 - 13:30</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-white dark:border-slate-900" />
                  <p className="font-semibold text-gray-700 dark:text-slate-350 leading-none">System Architecture</p>
                  <span className="text-[8px] text-gray-400 dark:text-slate-550 mt-0.5 block">16:00 - 17:30</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-gray-100/50 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between">
              <span className="font-extrabold text-gray-800 dark:text-slate-100 text-xs block">Day Progress</span>
              <div className="flex items-center justify-around py-0.5">
                <div className="w-13 h-13 rounded-full border-4 border-primary-blue border-r-transparent flex flex-col items-center justify-center font-bold text-gray-850 dark:text-slate-200 text-xs">
                  <span>68%</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-extrabold text-xs">▲ +5%</span>
                  <span className="text-[8px] text-gray-400 dark:text-slate-500 block mt-0.5">vs yesterday</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-gray-400 dark:text-slate-500 select-none text-[8px]">
                  <span>Focus Hours</span>
                  <span>5.5 / 8 hrs</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-blue rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'habits',
      label: 'Habit Tracking',
      subtitle: 'FEATURE 02',
      title: 'Build consistency, day by day',
      desc: 'Track habits on a responsive weekly grid. Circular checklist markers show active streak counts and completion summaries immediately.',
      preview: (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4 text-left select-none text-[10px] w-full min-h-[235px] flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2.5">
            <div>
              <span className="font-extrabold text-gray-800 dark:text-slate-100 text-xs block">Weekly Consistency</span>
              <span className="text-[8px] text-gray-400 dark:text-slate-500 block mt-0.5 font-semibold">Oct 23 - Oct 29</span>
            </div>
            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-emerald-100/50 dark:border-emerald-900/30">
              <Flame size={12} fill="currentColor" />
              12 Day Streak
            </span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Workout', color: '#3B82F6', done: 4 },
              { name: 'DSA Study', color: '#EC4899', done: 3 },
              { name: 'Project Code', color: '#10B981', done: 4 },
              { name: 'LeetCode Daily', color: '#F59E0B', done: 4 }
            ].map((habit, hIdx) => (
              <div key={hIdx} className="grid grid-cols-[1fr_repeat(7,24px)] gap-1.5 items-center">
                <span className="font-bold text-gray-700 dark:text-slate-350 truncate">{habit.name}</span>
                {Array.from({ length: 7 }).map((_, i) => {
                  const isDone = i < habit.done;
                  return (
                    <div key={i} className="flex justify-center">
                      <div
                        className="w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[8px] font-black"
                        style={{
                          borderColor: isDone ? habit.color : '#E5E7EB',
                          backgroundColor: isDone ? habit.color : 'transparent',
                          color: '#FFFFFF'
                        }}
                      >
                        {isDone && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'goals',
      label: 'Goal Management',
      subtitle: 'FEATURE 03',
      title: 'Target weekly milestone checkpoints',
      desc: 'Outline targets for the active week. Categorize milestone focus items with colored badge chips (Career, Learning, Personal).',
      preview: (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4 text-left select-none text-[10px] w-full min-h-[235px] flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-2.5">
            <span className="font-extrabold text-gray-800 dark:text-slate-100 text-xs block">Goals This Week</span>
            <span className="text-[8px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-100/50 dark:border-blue-900/30">3/5 Completed</span>
          </div>
          <div className="space-y-2.5">
            {[
              { title: 'Complete Portfolio UI', cat: 'Career', done: true },
              { title: 'Apply to 20 Jobs', cat: 'Career', done: true },
              { title: 'Finish 10 DSA Medium', cat: 'Learning', done: false },
              { title: 'Call Recruiters', cat: 'Personal', done: false }
            ].map((g, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-slate-850 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[8px]
                    ${g.done ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 dark:border-slate-800'}
                  `}>
                    {g.done && '✓'}
                  </div>
                  <span className={`font-semibold ${g.done ? 'text-gray-400 line-through dark:text-slate-600' : 'text-gray-700 dark:text-slate-350'}`}>{g.title}</span>
                </div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded border
                  ${g.cat === 'Career' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/30' :
                    g.cat === 'Learning' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-900/30' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30'}
                `}>
                  {g.cat}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'apps',
      label: 'Job Applications',
      subtitle: 'FEATURE 04',
      title: 'Organize recruitment pipelines',
      desc: 'Track company logs, statuses, assessment dates, and interview calendars. Check off pipeline stages and status distribution cards.',
      preview: (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4 text-left select-none text-[10px] w-full min-h-[235px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <div>
              <span className="font-extrabold text-gray-800 dark:text-slate-100 text-xs block">Applications Log</span>
              <span className="text-[8px] text-gray-400 dark:text-slate-500 block mt-0.5 font-semibold">Active Pipelines</span>
            </div>
            <span className="text-[9px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-100/50 dark:border-blue-900/30">14/20 Today</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-850 text-[8px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Company</th>
                <th className="pb-2">Role</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-850">
              {[
                { company: 'TechFlow', role: 'Frontend Dev', status: 'Interview', color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/30' },
                { company: 'GlobalSaaS', role: 'Product Mgr', status: 'Offer', color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30' },
                { company: 'MetaPixel', role: 'UI Designer', status: 'Applied', color: 'bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-450 border-slate-200/50 dark:border-slate-800/80' },
                { company: 'ByteCraft', role: 'Backend Eng', status: 'Technical', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30' },
              ].map((app, idx) => (
                <tr key={idx} className="text-gray-700 dark:text-slate-350">
                  <td className="py-2 font-bold">{app.company}</td>
                  <td className="py-2 text-gray-500 dark:text-slate-450 font-medium">{app.role}</td>
                  <td className="py-2 text-right">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${app.color}`}>{app.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-canvas-bg text-gray-800 selection:bg-emerald-500/10 selection:text-emerald-500 relative overflow-hidden font-sans pt-16">

      {/* Cinematic Spotlight mesh background graphics - theme aware to prevent muddy green fill in light mode */}
      <div className="absolute top-[-15%] left-[-15%] w-[65%] h-[60%] bg-violet-100/50 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[50%] bg-indigo-100/40 dark:bg-teal-500/8 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[12s] delay-[2s]" />
      <div className="absolute bottom-[15%] right-[-5%] w-[45%] h-[45%] bg-pink-100/30 dark:bg-cyan-500/5 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-10%] w-[40%] h-[40%] bg-blue-100/20 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Decorative dot-mesh background - Made clearly visible */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-90 dark:opacity-50 pointer-events-none" />

      {/* 1. Header/Navigation */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="w-full min-h-[calc(100vh-64px)] flex flex-col justify-between relative z-10">

        {/* ── Hero grid (vertically centered in remaining space) ── */}
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 md:py-16">

          {/* Left main text details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Beta/Status Badge with subtle pulsing ring */}
            <div className="inline-flex items-center gap-2 bg-emerald-55/60 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450 px-3.5 py-1 rounded-full text-xs font-bold shadow-sm select-none animate-fade-in relative overflow-hidden group">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute left-3" />
              <Zap size={11} fill="currentColor" className="ml-2.5" />
              <span>Introducing v1.0 Release</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[62px] font-black tracking-tight leading-[1.05] flex flex-col">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                className="block bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-black"
              >
                {t.planYourDay}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                className="block bg-gradient-to-r from-emerald-600 via-teal-650 to-emerald-700 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-450 bg-clip-text text-transparent font-black"
              >
                {t.buildYourHabits}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base md:text-lg text-slate-650 dark:text-slate-350 font-medium max-w-lg leading-relaxed select-none"
            >
              {t.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-4 pt-3 select-none"
            >
              {token ? (
                <Link to="/overview">
                  <Button variant="gradient" size="lg" className="font-extrabold px-8 py-4 shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-300 rounded-full">
                    {t.goToDashboard} <ArrowRight size={17} className="ml-1.5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="gradient" size="lg" className="font-extrabold px-8 py-4 shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-300 rounded-full">
                    {t.getStartedFree} <ArrowRight size={17} className="ml-1.5" />
                  </Button>
                </Link>
              )}
              <a href="#demo">
                <button className="inline-flex items-center justify-center font-bold text-sm px-6 py-4 gap-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-855 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/80 active:scale-95 transition-all duration-200 bg-white/60 dark:bg-slate-900/30 backdrop-blur-md shadow-sm hover:shadow hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  <Play size={14} fill="currentColor" className="text-emerald-500 mr-0.5" />
                  {t.seeHowItWorks}
                </button>
              </a>
            </motion.div>
          </motion.div>

          {/* Right floating mockup display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 relative flex justify-center"
          >
            {/* Double background blur circle to lift mockup */}
            <div className="absolute w-[85%] h-[85%] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none select-none" />

            {/* Animated Float Container - Added premium rounded-2xl glassmorphism borders */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full max-w-[560px] bg-white/80 dark:bg-slate-950/80 p-3 shadow-2xl border border-slate-250/70 dark:border-slate-900/90 rounded-2xl relative overflow-hidden select-none backdrop-blur-md"
            >
              {/* Top window dots */}
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
                <div className="bg-gray-55 dark:bg-slate-900/60 border border-gray-200/50 dark:border-slate-800/80 rounded-lg text-[9px] font-bold text-gray-600 dark:text-slate-400 px-3 py-0.5 ml-4 flex-1 text-center max-w-[280px]">
                  disciplin.app/overview
                </div>
              </div>

              {/* Mock browser viewport */}
              <div className="bg-canvas-bg rounded-2xl border border-gray-100/50 dark:border-slate-900/60 p-4 space-y-4 shadow-inner">

                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-900 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white leading-none">Today's Overview</h4>
                    <span className="text-[8px] text-gray-500 dark:text-slate-450 mt-1 block select-none">Monday, Oct 16</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-4 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full text-[8px] font-bold flex items-center justify-center">
                      +5% progress
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-800 border border-white dark:border-slate-900 shadow-sm flex items-center justify-center font-bold text-[8px] text-gray-600 dark:text-slate-400">
                      V
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.6 }}
                    className="col-span-2 bg-white dark:bg-slate-900/80 rounded-xl border border-gray-100 dark:border-slate-800/80 p-3 space-y-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/60 pb-1.5">
                      <span className="text-[9px] font-bold text-gray-800 dark:text-slate-200">Habit Tracker</span>
                      <span className="text-[8px] text-emerald-500 font-extrabold">12 Day Streak</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white">✓</div>
                        <div className="w-20 h-2 bg-gray-100 dark:bg-slate-800/80 rounded-full" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] text-white">✓</div>
                        <div className="w-16 h-2 bg-gray-100 dark:bg-slate-800/80 rounded-full" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.8 }}
                    className="bg-white dark:bg-slate-900/80 rounded-xl border border-gray-100 dark:border-slate-800/80 p-3 flex flex-col justify-center items-center gap-2 shadow-sm"
                  >
                    <span className="text-[8px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-center">Day Progress</span>
                    <div className="w-11 h-11 rounded-full border-4 border-primary-blue border-r-transparent flex items-center justify-center font-black text-[10px] text-gray-800 dark:text-slate-350">
                      68%
                    </div>
                  </motion.div>
                </div>

                {/* Mini Timetable preview */}
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 80, damping: 14, delay: 1.0 }}
                  className="bg-white dark:bg-slate-900/80 rounded-xl border border-gray-100 dark:border-slate-800/80 p-3 space-y-2 shadow-sm"
                >
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800/60 pb-1.5">
                    <span className="text-[9px] font-bold text-gray-800 dark:text-slate-200">Today's Schedule</span>
                    <span className="text-[8px] text-primary-blue font-extrabold">3 of 5 completed</span>
                  </div>
                  <div className="space-y-1.5 text-[8px] font-medium">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-gray-800 dark:text-slate-300 font-bold">Morning Routine</span>
                      </div>
                      <span className="text-gray-400 dark:text-slate-500 font-semibold">08:00 - 09:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-gray-800 dark:text-slate-300 font-bold">System Architecture Review</span>
                      </div>
                      <span className="text-gray-400 dark:text-slate-500 font-semibold">09:30 - 11:30</span>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Floats badges around mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.4, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 10, delay: 1.2 }}
                className="absolute top-10 right-6 bg-emerald-500 text-white rounded-full px-3 py-1 text-[10px] font-extrabold border border-emerald-400 shadow-lg flex items-center gap-1 select-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                +12% Applications Lead
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 10, delay: 1.4 }}
                className="absolute bottom-8 left-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-2xl p-2.5 shadow-lg flex items-center gap-2.5 select-none"
              >
                <div className="p-1.5 rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-500/20">
                  <Flame size={14} fill="#FFFFFF" />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-gray-900 dark:text-white leading-none">Today's Streak</p>
                  <p className="text-[8px] text-gray-400 dark:text-slate-400 mt-0.5">14 consecutive days</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>{/* end hero grid */}

        {/* ── Pillars strip pinned to bottom of full-screen hero ── */}
        <div className="w-full border-y border-slate-200/60 dark:border-slate-800/80 py-6 text-center space-y-4 bg-slate-100/40 dark:bg-slate-900/60 backdrop-blur-md shadow-lg shadow-slate-900/5 dark:shadow-slate-950/40 relative z-20">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            DESIGNED AROUND PURE MOMENTUM &amp; PRODUCTIVITY PILLARS
          </p>
          <motion.div
            className="flex flex-wrap justify-center gap-3.5 md:gap-4 text-xs font-bold tracking-wide text-slate-550 dark:text-slate-400 uppercase select-none"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              { icon: Shield, label: 'Privacy First', iconCls: 'text-violet-500', hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-900/60 hover:text-violet-600 dark:hover:text-violet-400' },
              { icon: EyeOff, label: 'Zero Distractions', iconCls: 'text-blue-500', hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-900/60 hover:text-blue-600 dark:hover:text-blue-400' },
              { icon: Target, label: 'Deep Work Focused', iconCls: 'text-orange-500', hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-900/60 hover:text-orange-600 dark:hover:text-orange-400' },
              { icon: Server, label: 'Self-Hosted Friendly', iconCls: 'text-emerald-500', hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-900/60 hover:text-emerald-600 dark:hover:text-emerald-400' },
            ].map((pill, i) => (
              <motion.span
                key={i}
                variants={{ hidden: { opacity: 0, scale: 0.7, y: 14 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
                whileHover={{ scale: 1.06, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 ${pill.hoverBorder} transition-all duration-300 cursor-default group text-[10px] md:text-xs text-slate-700 dark:text-slate-350 shadow-sm`}
              >
                <pill.icon size={15} className={`${pill.iconCls} group-hover:scale-110 transition-transform flex-shrink-0`} />
                <span>{pill.label}</span>
              </motion.span>
            ))}
          </motion.div>
        </div>

      </section>

      {/* 4. Features Grid Section */}
      <section id="features" className="max-w-[1440px] mx-auto px-6 md:px-12 py-14 sm:py-16 md:py-20 text-center select-none relative z-10">
        <div className="max-w-2xl mx-auto space-y-2.5 mb-10 text-center">
          <div className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15 dark:border-emerald-500/30 shadow-sm inline-flex select-none">
            Feature Set
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
            Everything you need to <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent">stay focused</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
            One cockpit dashboard to replace your messy spreadsheets, checklists, calendar dates, and notes.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {features.map((item, idx) => {
            const xInitial = idx % 3 === 0 ? -50 : idx % 3 === 2 ? 50 : 0;
            const yInitial = idx % 3 === 1 ? 50 : 30;

            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, x: xInitial, y: yInitial },
                  show: { opacity: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 70, damping: 14 } }
                }}
                whileHover="hover"
                className="h-full"
              >
                <motion.div
                  variants={{
                    hover: {
                      y: -8,
                      scale: 1.02,
                      boxShadow: `0 20px 40px -15px ${item.accent}30`,
                      borderColor: item.accent
                    }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-5 sm:p-6 flex flex-col items-start text-left bg-white dark:bg-slate-900 border border-gray-100/50 dark:border-slate-800/80 rounded-2xl relative overflow-hidden group shadow-sm h-full cursor-pointer select-none transition-colors duration-300"
                >
                  {/* Corner hover glow effect */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full pointer-events-none"
                    style={{ backgroundColor: `${item.accent}15` }}
                  />

                  {/* Icon and Title Row */}
                  <div className="flex items-center gap-3.5 mb-3.5 w-full">
                    <motion.div
                      variants={{
                        hover: { scale: 1.12, rotate: 6 }
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 12 }}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color} transition-all duration-300`}
                    >
                      <item.icon size={19} className="shrink-0" />
                    </motion.div>
                    <span className="font-extrabold text-[15px] sm:text-[16px] text-gray-900 dark:text-white tracking-tight leading-tight">{item.title}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed select-none">
                    {item.desc}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section id="demo" className="bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900 py-14 sm:py-16 md:py-20 select-none relative z-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-8">

          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-405 border border-blue-500/15 dark:border-blue-500/30 shadow-sm inline-flex select-none">
              Interactive Preview
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
              See <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 bg-clip-text text-transparent">Disciplin</span> in action
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
              Explore each modular segment. Switch controls to watch how widgets recalculate percentages in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch pt-6">

            {/* Mobile Tab Selector (Swipeable, visible only on < lg) */}
            <div className="lg:hidden flex flex-row overflow-x-auto gap-2.5 pb-2 px-1 scrollbar-none snap-x snap-mandatory w-full max-w-full">
              {demoFeatures.map((item, index) => {
                const isActive = activeFeature === index;
                const TabIcon = index === 0 ? Calendar : index === 1 ? CheckSquare : index === 2 ? Target : Briefcase;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveFeature(index)}
                    className={`flex items-center gap-2 px-4.5 py-3 rounded-xl border text-[13px] font-bold whitespace-nowrap cursor-pointer transition-all duration-200 snap-center
                      ${isActive
                        ? 'bg-primary-blue text-white border-primary-blue shadow-md shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-450 border-slate-200/80 dark:border-slate-800/80'
                      }`}
                  >
                    <TabIcon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Tabs Selector columns (hidden on mobile, visible on lg) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col justify-center gap-3">
              {demoFeatures.map((item, index) => {
                const isActive = activeFeature === index;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveFeature(index)}
                    className={`p-5 rounded-2xl text-left transition-all duration-300 border cursor-pointer relative overflow-hidden group
                      ${isActive
                        ? 'bg-primary-blue text-white shadow-xl border-primary-blue shadow-blue-500/10'
                        : 'bg-canvas-bg text-gray-700 border-gray-100 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className={`text-[9px] font-bold tracking-wider uppercase block mb-1.5
                      ${isActive ? 'text-white/80' : 'text-gray-400'}
                    `}>
                      {item.subtitle}
                    </span>
                    <h3 className="text-sm font-black tracking-tight mb-1">{item.label}</h3>
                    <p className={`text-xs leading-normal font-medium transition-colors
                      ${isActive ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-600'}
                    `}>
                      {isActive ? item.desc : 'Learn more about this cockpit widget.'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Mock Screen Display columns */}
            <div className="lg:col-span-8 flex items-center justify-center bg-canvas-bg dark:bg-slate-950/30 border border-gray-100 dark:border-slate-900/60 rounded-3xl p-4 sm:p-6 md:p-8 shadow-inner relative overflow-hidden min-h-[300px]">
              {/* Glow backdrop behind preview */}
              <div className="absolute w-[60%] h-[60%] bg-blue-300/10 dark:bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="w-full max-w-[620px] relative z-10">
                {/* Browser frame - Made theme aware */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-gray-100 dark:border-slate-800/60 shadow-xl relative overflow-hidden">

                  {/* Browser Top Controls */}
                  <div className="flex items-center gap-1.5 mb-4 border-b border-gray-100 dark:border-slate-800/65 pb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 ml-4 uppercase tracking-wider">
                      {demoFeatures[activeFeature].title}
                    </span>
                  </div>

                  {/* Animated screen replacement */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="w-full flex justify-center"
                    >
                      {demoFeatures[activeFeature].preview}
                    </motion.div>
                  </AnimatePresence>

                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Workflow Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-14 sm:py-16 md:py-20 text-center select-none relative z-10">
        <div className="max-w-2xl mx-auto space-y-2.5 mb-10 text-center">
          <div className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-405 border border-indigo-500/15 dark:border-indigo-500/30 shadow-sm inline-flex select-none">
            Process Method
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
            Master <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">your momentum</span>
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
            Three simple procedural stages to organize your routine and outline progress.
          </p>
        </div>

        {/* Desktop view: Horizontal Steps with Connector Line (Borderless minimal flow) */}
        <motion.div
          className="hidden md:grid grid-cols-3 gap-12 relative z-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
        >
          {/* Connector Line between step circles on desktop */}
          <div className="absolute top-[24px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/40 to-emerald-500/20 dark:from-emerald-500/10 dark:via-teal-500/20 dark:to-emerald-500/10 -z-10" />

          {[
            { step: '1', title: 'Plan', desc: 'Map out weekly targets and configure daily timetable work blocks.' },
            { step: '2', title: 'Track', desc: 'Log habit routines, complete checklist goals, and update study checkpoints.' },
            { step: '3', title: 'Stay Accountable', desc: 'Monitor streaks, review stats dashboards, and land your target offer.' },
          ].map((item) => (
            <motion.div
              key={item.step}
              className="flex flex-col items-center text-center group relative select-none"
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 20 },
                show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-950 text-emerald-550 dark:text-emerald-450 flex items-center justify-center font-extrabold text-base border-2 border-emerald-500 dark:border-emerald-450 shadow-md transition-all duration-300 select-none scale-105 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-slate-950 z-10">
                {item.step}
              </div>
              <h3 className="text-[15px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider pt-4 pb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-[240px] leading-relaxed select-none">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile view: Vertical Timeline with Glassmorphism Cards */}
        <motion.div
          className="md:hidden flex flex-col gap-6 relative select-none text-left"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {[
            { step: '1', title: 'Plan', desc: 'Map out weekly targets and configure daily timetable work blocks.' },
            { step: '2', title: 'Track', desc: 'Log habit routines, complete checklist goals, and update study checkpoints.' },
            { step: '3', title: 'Stay Accountable', desc: 'Monitor streaks, review stats dashboards, and land your target offer.' },
          ].map((item) => (
            <motion.div
              key={item.step}
              className="flex items-center gap-4 relative group"
              variants={{
                hidden: { opacity: 0, x: -15 },
                show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
            >
              {/* Left Column: Circle & Centered Connector Line Segment */}
              <div className="flex flex-col items-center shrink-0 relative w-12">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 text-primary-blue dark:text-emerald-450 flex items-center justify-center font-extrabold text-base border-2 border-primary-blue dark:border-emerald-500 shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 transition-all duration-300 z-10 scale-105">
                  {item.step}
                </div>
                {item.step !== '3' && (
                  <div className="absolute top-12 bottom-[-75px] w-[3.5px] bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-500/10 dark:from-emerald-450 dark:via-teal-500/50 dark:to-emerald-500/5 rounded-full z-0" />
                )}
              </div>

              {/* Glass Card on the Right */}
              <div className="flex-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md">
                <h4 className="text-[13.5px] font-black uppercase text-slate-900 dark:text-white tracking-wider mb-1">
                  {item.title}
                </h4>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 7. Stats Grid Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mb-16 select-none relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {[
            { value: 10000, suffix: '+', label: 'Tasks Completed', desc: 'Active habits, daily schedules, and syllabus syllabus items logged.', fromColor: 'from-emerald-500', toColor: 'to-teal-500', glowColor: 'bg-emerald-500/5', borderGlow: 'hover:border-emerald-500/30' },
            { value: 2500, suffix: '+', label: 'Jobs Landed', desc: 'Users landing dream roles at premium product companies.', fromColor: 'from-blue-500', toColor: 'to-indigo-500', glowColor: 'bg-blue-500/5', borderGlow: 'hover:border-blue-500/30' },
            { value: 98, suffix: '%', label: 'Consistency Rating', desc: 'Average user routine and checklist streak maintenance score.', fromColor: 'from-pink-500', toColor: 'to-purple-500', glowColor: 'bg-pink-500/5', borderGlow: 'hover:border-pink-500/30' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-lg text-center flex flex-col justify-center items-center relative overflow-hidden group cursor-default transition-all duration-300 ${stat.borderGlow}`}
            >
              {/* Internal glow backdrop */}
              <div className={`absolute -inset-10 ${stat.glowColor} blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <span className={`text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r ${stat.fromColor} ${stat.toColor} bg-clip-text text-transparent relative z-10`}>
                <CountUp to={stat.value} suffix={stat.suffix} duration={1.6 + i * 0.2} />
              </span>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-3 mb-1 select-none relative z-10">{stat.label}</p>
              <p className="text-[11.5px] font-semibold text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed relative z-10">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none text-center pt-10 select-none relative z-10">
          Ready to find your momentum?
        </h3>
      </section>

      {/* 8. Testimonials Section */}
      <section id="testimonials" className="max-w-[1440px] mx-auto px-6 md:px-12 py-14 sm:py-16 md:py-20 text-center select-none relative z-10">
        <div className="max-w-2xl mx-auto space-y-2.5 mb-10 text-center">
          <div className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-405 border border-pink-500/15 dark:border-pink-500/30 shadow-sm inline-flex select-none">
            Social Proof
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
            Loved by <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">industry builders</span>
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
            Here is what high-performing engineers and designers say about Disciplin.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {[
            {
              text: '"Disciplin turned my chaotic job hunt into a scientific process. I went from 2 interviews a week to 5. Highly recommend it."',
              author: 'Alex Rivera',
              role: 'Software Engineer @ Stripe',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
              accent: 'border-l-4 border-l-blue-500'
            },
            {
              text: '"The streak tracker is addictive. I haven\'t missed a LeetCode day in 4 months thanks to the habit consistency rows!"',
              author: 'Sarah Chen',
              role: 'Full-stack Developer',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
              accent: 'border-l-4 border-l-emerald-500'
            },
            {
              text: '"The only tool that balances career goals with personal health/habits seamlessly. The UI looks stunning."',
              author: 'Mark J',
              role: 'Product Designer',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
              accent: 'border-l-4 border-l-pink-500'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
              className="h-full"
            >
              <Card className={`p-6 md:p-8 flex flex-col justify-between text-left shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow h-full ${item.accent}`}>
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-amber-400 select-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm italic font-semibold text-gray-500 leading-relaxed select-none">
                    {item.text}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-50 select-none">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-9 h-9 rounded-full object-cover border border-gray-100 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.author}`;
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-black text-gray-800 leading-none">{item.author}</h4>
                    <span className="text-[10px] text-gray-400 mt-1 block select-none">{item.role}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className="max-w-[1440px] mx-auto px-6 md:px-12 py-14 sm:py-16 md:py-20 select-none relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Title and Subtitle / CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6 text-center lg:text-left h-fit self-start">
            <div className="space-y-3.5">
              <div className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15 dark:border-emerald-500/30 shadow-sm inline-flex select-none">
                FAQ
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
                {renderFaqTitle(t.faqTitle)}
              </h2>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold leading-relaxed max-w-md mx-auto lg:mx-0">
                {t.faqSubtitle}
              </p>
            </div>

            {/* Glowing support / help card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-950/80 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-md max-w-md mx-auto lg:mx-0 select-none group hover:border-emerald-500/20 transition-all duration-300 h-fit">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 blur-xl rounded-full group-hover:scale-150 transition-transform duration-500" />
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2 flex items-center justify-center lg:justify-start gap-2">
                <span>Still have questions?</span>
              </h3>
              <p className="text-[12.5px] font-semibold text-slate-450 dark:text-slate-500 leading-relaxed mb-5">
                Can't find the answer you're looking for? Reach out to our team and we'll get back to you as soon as possible.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-50 rounded-full transition-all duration-200 shadow-md shadow-emerald-500/15 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Contact Support</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Accordion Items */}
          <div className="lg:col-span-7 space-y-4">
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
              { q: t.faq5Q, a: t.faq5A },
              { q: t.faq6Q, a: t.faq6A },
              { q: t.faq7Q, a: t.faq7A },
              { q: t.faq8Q, a: t.faq8A },
            ].map((item, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden transition-all duration-300 rounded-2xl border ${
                    isOpen
                      ? 'bg-white dark:bg-slate-900/90 border-emerald-500/30 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-white/60 dark:bg-slate-950/40 backdrop-blur-sm border-gray-100 dark:border-slate-850/80 hover:border-gray-200 dark:hover:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Glowing left bar active indicator */}
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b from-emerald-400 to-teal-500 transition-all duration-300 ${
                      isOpen ? 'opacity-100 h-full' : 'opacity-0 h-0'
                    }`}
                  />

                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    className={`w-full flex items-center justify-between p-5 md:px-6 md:py-5 text-left font-bold text-sm md:text-base transition-colors cursor-pointer select-none focus:outline-none border-none bg-transparent ${
                      isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    <span className="pr-4">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex-shrink-0 ml-2 transition-colors ${
                        isOpen ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'
                      }`}
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 md:px-6 md:pb-5 pt-0 text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed border-t border-gray-50/50 dark:border-slate-900/60 select-none">
                          <motion.div
                            initial={{ y: -4, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            className="pt-4"
                          >
                            {item.a}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. CTA Section Banner */}
      <section className="py-16 md:py-20 mb-4 select-none relative z-10 px-6 md:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 dark:from-[#0a1510] dark:via-[#05110c] dark:to-[#020705] text-white p-10 md:p-16 text-center max-w-4xl mx-auto shadow-2xl border border-emerald-500/15 group">
          {/* Subtle mesh background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
          
          {/* Glowing colorful ambient orbs */}
          <div className="absolute top-[-30%] left-[-20%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-[-30%] right-[-20%] w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6 flex flex-col items-center">
            <div className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm select-none">
              Start Today
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Start building momentum today
            </h2>
            
            <p className="text-xs md:text-sm font-semibold text-slate-350 leading-relaxed max-w-xl">
              Join 10,000+ developers landing their dream roles with Disciplin's high-performance habit and applications tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link to="/register" className="select-none">
                <button className="bg-white hover:bg-emerald-50 text-slate-950 text-xs md:text-sm font-black px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-emerald-950/20 hover:scale-[1.03] active:scale-[0.97] cursor-pointer inline-flex items-center gap-2 group/btn">
                  <span>Get Started for Free</span>
                  <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform duration-250" />
                </button>
              </Link>

              <a href="#features" className="text-xs font-bold text-slate-300 hover:text-white transition-colors px-6 py-3 rounded-full hover:bg-white/10 transition-all cursor-pointer">
                Explore Features
              </a>
            </div>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none pt-2">
              No credit card required • Instant setup
            </span>
          </div>
        </div>
      </section>

      {/* 11. Footer Section */}
      <Footer />

      {/* Go to Top Button */}
      <GoToTop className="bottom-6 right-6" />

    </div>
  );
}
