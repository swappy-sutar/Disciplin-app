import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckSquare,
  Target,
  BookOpen,
  Briefcase,
  Sun,
  Flame,
  ArrowRight,
  Star,
  Check,
  Zap,
  Shield,
  EyeOff,
  Server
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../app/store';
import { Footer } from '../../components/ui/Footer';
import { GoToTop } from '../../components/ui/GoToTop';
import { Navbar } from '../../components/ui/Navbar';

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

export default function LandingPage() {
  const { token } = useStore();
  const [activeFeature, setActiveFeature] = useState(0);

  // Always start from the top when the page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const features = [
    {
      title: 'Daily Timetable',
      desc: 'Time-block your day into focused slots. Maximize deep work and structure your applications follow-ups.',
      icon: Calendar,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      accent: '#3B82F6'
    },
    {
      title: 'Habit Tracker',
      desc: 'Develop continuous routines. Log checks in weekly rows and watch active streaks maintain consistency.',
      icon: CheckSquare,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      accent: '#10B981'
    },
    {
      title: 'Weekly Goals',
      desc: 'Formulate weekly benchmarks. Strive for weekly checklist milestones and map out target due days.',
      icon: Target,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
      accent: '#EC4899'
    },
    {
      title: 'Topics Progress',
      desc: 'Construct structured learning curves. Break courses into checklists and track percentage curves.',
      icon: BookOpen,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      accent: '#8B5CF6'
    },
    {
      title: 'Application Tracker',
      desc: 'Log company listings with clinical precision. Track OA links, status cycles, and scheduled dates.',
      icon: Briefcase,
      color: 'text-slate-600 bg-slate-600/10 border-slate-600/20',
      accent: '#475569'
    },
    {
      title: 'Daily Motivation',
      desc: 'Curate quote logs. Favorite lines and write custom notes to spark active focus during the hunt.',
      icon: Sun,
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
        <div className="bg-canvas-bg rounded-2xl p-5 border border-gray-100 shadow-inner space-y-4 text-left select-none text-[10px] w-full">
          {/* Header row */}
          <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-xl border border-gray-100/50 shadow-sm">
            <div>
              <span className="font-extrabold text-gray-800 text-xs block leading-none">Today's Overview</span>
              <span className="text-[8px] text-gray-400 font-semibold mt-1 block">Monday, Oct 16, 2023</span>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] bg-indigo-50/50 text-primary-blue px-2.5 py-1 rounded-full font-bold">
              <Calendar size={10} />
              <span>Oct 12 - Oct 18</span>
            </div>
          </div>
          {/* Dashboard contents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100/50 shadow-sm space-y-3">
              <span className="font-extrabold text-gray-800 text-xs block">Daily Timetable</span>
              <div className="relative border-l-2 border-gray-100 pl-3 ml-1 space-y-3">
                <div className="relative">
                  <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  <p className="font-semibold text-gray-700 leading-none">Morning Routine</p>
                  <span className="text-[8px] text-gray-400 mt-0.5 block">08:00 - 09:00</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-primary-blue border-2 border-white" />
                  <p className="font-semibold text-gray-700 leading-none">DSA Practice: Graphs</p>
                  <span className="text-[8px] text-gray-400 mt-0.5 block">12:00 - 13:30</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100/50 shadow-sm space-y-3 flex flex-col justify-between">
              <span className="font-extrabold text-gray-800 text-xs block">Day Progress</span>
              <div className="flex items-center justify-around py-1">
                <div className="w-14 h-14 rounded-full border-4 border-primary-blue border-r-transparent flex flex-col items-center justify-center font-bold text-gray-800 text-xs">
                  <span>68%</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-extrabold text-xs">▲ +5%</span>
                  <span className="text-[8px] text-gray-400 block mt-0.5">vs yesterday</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-gray-400 select-none text-[8px]">
                  <span>Focus Hours</span>
                  <span>5.5 / 8 hrs</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 text-left select-none text-[10px] w-full">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <div>
              <span className="font-extrabold text-gray-800 text-xs block">Weekly Consistency</span>
              <span className="text-[8px] text-gray-400 block mt-0.5">Oct 23 - Oct 29</span>
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <Flame size={12} fill="currentColor" />
              12 Day Streak
            </span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Workout', color: '#3B82F6', done: 4 },
              { name: 'DSA Study', color: '#EC4899', done: 3 },
              { name: 'Project Code', color: '#10B981', done: 4 }
            ].map((habit, hIdx) => (
              <div key={hIdx} className="grid grid-cols-[1fr_repeat(7,24px)] gap-1.5 items-center">
                <span className="font-bold text-gray-700 truncate">{habit.name}</span>
                {Array.from({ length: 7 }).map((_, i) => {
                  const isDone = i < habit.done;
                  return (
                    <div key={i} className="flex justify-center">
                      <div
                        className="w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-black"
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 text-left select-none text-[10px] w-full">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
            <span className="font-extrabold text-gray-800 text-xs block">Goals This Week</span>
            <span className="text-[8px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold">3/5 Completed</span>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Complete Portfolio UI', cat: 'Career', done: true },
              { title: 'Apply to 20 Jobs', cat: 'Career', done: true },
              { title: 'Finish 10 DSA Medium', cat: 'Learning', done: false },
              { title: 'Call Recruiters', cat: 'Personal', done: false }
            ].map((g, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[8px]
                    ${g.done ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200'}
                  `}>
                    {g.done && '✓'}
                  </div>
                  <span className={`font-semibold ${g.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{g.title}</span>
                </div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded border
                  ${g.cat === 'Career' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    g.cat === 'Learning' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-amber-50 text-amber-600 border-amber-100'}
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 text-left select-none text-[10px] w-full">
          <div className="flex justify-between items-center mb-1">
            <div>
              <span className="font-extrabold text-gray-800 text-xs block">Applications Log</span>
              <span className="text-[8px] text-gray-400 block mt-0.5">Active Pipelines</span>
            </div>
            <span className="text-[9px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold">14/20 Today</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">
                <th className="pb-2">Company</th>
                <th className="pb-2">Role</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { company: 'TechFlow', role: 'Frontend Dev', status: 'Interview', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                { company: 'GlobalSaaS', role: 'Product Mgr', status: 'Offer', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { company: 'MetaPixel', role: 'UI Designer', status: 'Applied', color: 'bg-slate-50 text-slate-500 border-slate-200' },
              ].map((app, idx) => (
                <tr key={idx} className="text-gray-700">
                  <td className="py-2.5 font-bold">{app.company}</td>
                  <td className="py-2.5 text-gray-500 font-medium">{app.role}</td>
                  <td className="py-2.5 text-right">
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
                className="block bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent"
              >
                Plan your day.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                className="block bg-gradient-to-r from-emerald-600 via-teal-650 to-emerald-700 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-450 bg-clip-text text-transparent"
              >
                Build your habits.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base md:text-lg text-slate-650 dark:text-slate-350 font-medium max-w-lg leading-relaxed select-none"
            >
              The all-in-one career dashboard designed for high-performance job seekers. Organize your hunt, track learning goals, and follow habits with clinical precision.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-4 pt-3 select-none"
            >
              {token ? (
                <Link to="/overview">
                  <Button size="lg" className="font-extrabold px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 rounded-full hover:scale-[1.03] active:scale-95">
                    Go to Dashboard <ArrowRight size={17} className="ml-1.5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="lg" className="font-extrabold px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 rounded-full hover:scale-[1.03] active:scale-95">
                    Get Started Free <ArrowRight size={17} className="ml-1.5" />
                  </Button>
                </Link>
              )}
              <a href="#demo">
                <button className="inline-flex items-center justify-center font-bold text-sm px-6 py-3.5 gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60 active:scale-95 transition-all duration-200 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm shadow-sm cursor-pointer">
                  See how it works
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
        <div className="w-full border-t border-white/10 py-6 text-center space-y-4 bg-slate-900/60 backdrop-blur-sm">
          <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            DESIGNED AROUND PURE MOMENTUM &amp; PRODUCTIVITY PILLARS
          </p>
          <motion.div
            className="flex flex-wrap justify-center gap-3.5 md:gap-4 text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400 uppercase select-none"
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
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 ${pill.hoverBorder} transition-all duration-300 cursor-default group text-[10px] md:text-xs`}
              >
                <pill.icon size={15} className={`${pill.iconCls} group-hover:scale-110 transition-transform flex-shrink-0`} />
                <span>{pill.label}</span>
              </motion.span>
            ))}
          </motion.div>
        </div>

      </section>

      {/* 4. Features Grid Section */}
      <section id="features" className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 text-center select-none relative z-10">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex p-2 rounded-xl bg-blue-50 text-primary-blue text-xs font-extrabold uppercase tracking-wider select-none border border-blue-100/50">
            Feature Set
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-none">
            Everything you need to stay focused
          </h2>
          <p className="text-sm md:text-base text-gray-400 font-semibold max-w-lg mx-auto leading-relaxed">
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
                  className="p-6 md:p-8 flex flex-col items-start text-left bg-white dark:bg-slate-900 border border-gray-100/50 dark:border-slate-800/80 rounded-2xl relative overflow-hidden group shadow-sm h-full cursor-pointer select-none transition-colors duration-300"
                >
                  {/* Corner hover glow effect */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full pointer-events-none"
                    style={{ backgroundColor: `${item.accent}15` }}
                  />

                  <div className={`flex items-center gap-3 w-full p-2.5 px-4 rounded-xl border ${item.color} mb-4 transition-all duration-300`}>
                    <motion.div
                      variants={{
                        hover: { scale: 1.15, rotate: 8 }
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    >
                      <item.icon size={18} className="shrink-0" />
                    </motion.div>
                    <span className="font-extrabold text-sm tracking-tight">{item.title}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 font-semibold leading-relaxed select-none">
                    {item.desc}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 5. Product Mockup / Interactive Feature Selector */}
      <section id="demo" className="bg-white border-y border-gray-100 py-24 select-none relative z-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex p-2 rounded-xl bg-purple-50 text-purple-600 text-xs font-extrabold uppercase tracking-wider select-none border border-purple-100/50">
              Interactive Preview
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
              See Disciplin in action
            </h2>
            <p className="text-sm text-gray-400 font-semibold leading-relaxed">
              Explore each modular segment. Switch controls to watch how widgets recalculate percentages in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">

            {/* Tabs Selector columns */}
            <div className="lg:col-span-4 flex flex-col justify-center gap-3">
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
            <div className="lg:col-span-8 flex items-center justify-center bg-canvas-bg border border-gray-100 rounded-3xl p-6 md:p-8 shadow-inner relative overflow-hidden min-h-[300px]">
              {/* Glow backdrop behind preview */}
              <div className="absolute w-[60%] h-[60%] bg-blue-300/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="w-full max-w-[620px] relative z-10">
                {/* Browser frame */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xl relative overflow-hidden">

                  {/* Browser Top Controls */}
                  <div className="flex items-center gap-1.5 mb-4 border-b border-gray-100 pb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-extrabold text-gray-400 ml-4 uppercase tracking-wider">
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
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 text-center select-none relative z-10">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex p-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-extrabold uppercase tracking-wider select-none border border-emerald-100/50">
            Process Method
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-none">
            Master your momentum
          </h2>
          <p className="text-sm text-gray-400 font-semibold max-w-sm mx-auto leading-relaxed">
            Three simple procedural stages to organize your routine and outline progress.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {/* Connector Lines between step circles on desktop */}
          <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-gray-200/80 -z-10" />

          {[
            { step: '1', title: 'Plan', desc: 'Map out weekly targets and configure daily timetable work blocks.' },
            { step: '2', title: 'Track', desc: 'Log habit routines, complete checklist goals, and update study checkpoints.' },
            { step: '3', title: 'Stay Accountable', desc: 'Monitor streaks, review stats dashboards, and land your target offer.' },
          ].map((item) => (
            <motion.div
              key={item.step}
              className="flex flex-col items-center text-center space-y-4 group"
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 20 },
                show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
            >
              <div className="w-12 h-12 rounded-full bg-white text-primary-blue flex items-center justify-center font-extrabold text-base border-2 border-primary-blue shadow-lg shadow-blue-500/10 group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 select-none scale-105">
                {item.step}
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">{item.title}</h3>
              <p className="text-xs md:text-sm text-gray-400 font-semibold max-w-xs leading-relaxed select-none">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 7. Stats Grid Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mb-16 select-none relative z-10">
        <motion.div
          className="rounded-[32px] p-8 md:p-14 text-white text-center relative overflow-hidden shadow-2xl space-y-8 flex flex-col justify-center border border-gray-800/80"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)' }}
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
        >
          {/* Glowing backdrop circular graphics inside stat container */}
          <div className="absolute top-[-50%] right-[-20%] w-[60%] h-[150%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-50%] left-[-20%] w-[50%] h-[150%] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            <div className="space-y-1">
              <span className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                <CountUp to={10000} suffix="+" duration={2000} />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">TASKS COMPLETED</p>
            </div>
            <div className="space-y-1 border-y md:border-y-0 md:border-x border-gray-800/80 py-6 md:py-0">
              <span className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                <CountUp to={2500} suffix="+" duration={1800} />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">JOBS LANDED</p>
            </div>
            <div className="space-y-1">
              <span className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                <CountUp to={98} suffix="%" duration={1600} />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">CONSISTENCY RATING</p>
            </div>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-gray-200 tracking-tight leading-none select-none pt-4 relative z-10">
            Ready to find your momentum?
          </h3>
        </motion.div>
      </section>

      {/* 8. Testimonials Section */}
      <section id="testimonials" className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 text-center select-none relative z-10">
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

      {/* 9. Pricing Section ("Choose your path") */}
      <section id="pricing" className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 text-center select-none relative z-10">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex p-2 rounded-xl bg-blue-50 text-primary-blue text-xs font-extrabold uppercase tracking-wider select-none border border-blue-100/50">
            Pricing Plans
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-none">
            Choose your path
          </h2>
          <p className="text-sm text-gray-400 font-semibold leading-relaxed">
            Get started for free or upgrade to executive access to unlock advanced AI logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch select-none">

          {/* Card 1 Free */}
          <div className="bg-white/60 dark:bg-slate-950/40 backdrop-blur-sm p-8 flex flex-col justify-between text-left border border-gray-100 dark:border-gray-900 rounded-3xl shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block select-none">Hustle</span>
                <div className="flex items-baseline mt-2.5 gap-1 select-none">
                  <span className="text-4xl font-black text-gray-950 dark:text-white leading-none">$0</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold select-none">/ forever</span>
                </div>
              </div>

              <ul className="space-y-3 pt-6 border-t border-gray-100/80 dark:border-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2.5"><Check size={15} className="text-emerald-500" /> Daily Planner</li>
                <li className="flex items-center gap-2.5"><Check size={15} className="text-emerald-500" /> Basic Habit Tracker</li>
                <li className="flex items-center gap-2.5"><Check size={15} className="text-emerald-500" /> Up to 10 active Job Apps</li>
              </ul>
            </div>

            <Link to="/register" className="mt-8 select-none block">
              <Button variant="outline" fullWidth className="py-3 font-bold border-gray-250 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer rounded-2xl">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Card 2 Pro */}
          <div className="relative group hover:scale-[1.01] transition-transform duration-300">
            {/* Outer border glow line */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-300 -z-10" />

            <div className="bg-white dark:bg-slate-950 p-8 flex flex-col justify-between text-left border border-emerald-500/20 dark:border-emerald-500/30 rounded-3xl shadow-xl h-full relative overflow-hidden">
              {/* Corner radial glow highlight */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />

              <div className="absolute top-4 right-4 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold select-none uppercase tracking-wider border border-emerald-500/20">
                Most Popular
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block select-none">Executive</span>
                  <div className="flex items-baseline mt-2.5 gap-1 select-none">
                    <span className="text-4xl font-black text-gray-950 dark:text-white leading-none">$12</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold select-none">/ month</span>
                  </div>
                </div>

                <ul className="space-y-3 pt-6 border-t border-gray-100/80 dark:border-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2.5"><Check size={15} className="text-emerald-500" /> All Hustle features</li>
                  <li className="flex items-center gap-2.5"><Check size={15} className="text-emerald-500" /> Unlimited Job Pipeline</li>
                  <li className="flex items-center gap-2.5"><Check size={15} className="text-emerald-500" /> AI-powered Analytics & Insights</li>
                  <li className="flex items-center gap-2.5"><Check size={15} className="text-emerald-500" /> Custom Motivation Engine</li>
                </ul>
              </div>

              <Link to="/register" className="mt-8 select-none block">
                <button className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs tracking-wide rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer border border-emerald-500/20">
                  Get Pro Access
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 10. CTA Section Banner */}
      <section className="py-24 mb-12 select-none relative overflow-hidden">
        {/* Soft glowing ambient background radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/5 dark:bg-teal-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center space-y-8 flex flex-col justify-center items-center">
          <div className="inline-flex p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider select-none border border-emerald-100/50 dark:border-emerald-900/30">
            Start Today
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 dark:text-white leading-none max-w-3xl">
            Start building momentum today
          </h2>

          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-semibold max-w-xl leading-relaxed">
            Join 10,000+ developers landing their dream roles with Disciplin's high-performance habit and applications tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link to="/register" className="select-none">
              <button className="bg-primary-blue hover:bg-emerald-600 text-white text-sm font-extrabold px-10 py-4 rounded-full transition-all cursor-pointer shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 duration-200 select-none border border-emerald-500/30">
                Get Started for Free
              </button>
            </Link>

            <a href="#features" className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-primary-blue transition-colors px-6 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
              Explore Features
            </a>
          </div>

          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block select-none">
            No credit card required • Instant setup
          </span>
        </div>
      </section>

      {/* 11. Footer Section */}
      <Footer />

      {/* Go to Top Button */}
      <GoToTop className="bottom-6 right-6" />

    </div>
  );
}
