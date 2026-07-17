import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckSquare, 
  Target, 
  BookOpen, 
  Briefcase, 
  Shield, 
  Sparkles, 
  Heart, 
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Card } from '../../components/ui/Card';

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

  const pillars = [
    {
      icon: Calendar,
      title: 'Daily Timetable',
      desc: 'Time-block your hours for focused coding and study slots.',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/15',
      hoverBg: 'group-hover/pillar:bg-blue-500/5 group-hover/pillar:border-blue-500/25'
    },
    {
      icon: CheckSquare,
      title: 'Habit Tracker',
      desc: 'Form continuous routines with weekly streak check-ins.',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15',
      hoverBg: 'group-hover/pillar:bg-emerald-500/5 group-hover/pillar:border-emerald-500/25'
    },
    {
      icon: Target,
      title: 'Weekly Goals',
      desc: 'Clear targets with automatic Monday resets to stay aligned.',
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/15',
      hoverBg: 'group-hover/pillar:bg-pink-500/5 group-hover/pillar:border-pink-500/25'
    },
    {
      icon: BookOpen,
      title: 'Study Planner',
      desc: 'Deconstruct complex technical topics and track syllabus completion.',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/15',
      hoverBg: 'group-hover/pillar:bg-purple-500/5 group-hover/pillar:border-purple-500/25'
    },
    {
      icon: Briefcase,
      title: 'Job Tracker',
      desc: 'A unified board to manage job applications, stages, and follow-ups.',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/15',
      hoverBg: 'group-hover/pillar:bg-amber-500/5 group-hover/pillar:border-amber-500/25'
    }
  ];

  const values = [
    {
      icon: Sparkles,
      title: 'Consistency over Chaos',
      desc: 'We believe that massive career goals are achieved through small, compounding daily actions. Our cockpit visualizes streaks to reinforce habits.',
      accent: 'border-t-4 border-t-emerald-500',
      hoverGlow: 'hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 hover:border-emerald-500/30',
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15',
      glowColor: 'bg-emerald-500/10'
    },
    {
      icon: Shield,
      title: 'Privacy First Architecture',
      desc: 'Your plans, code journals, habits, and application pipelines are strictly confidential. We encrypt critical data and never share your logs.',
      accent: 'border-t-4 border-t-blue-500',
      hoverGlow: 'hover:bg-blue-500/5 dark:hover:bg-blue-500/10 hover:border-blue-500/30',
      iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/15',
      glowColor: 'bg-blue-500/10'
    },
    {
      icon: Heart,
      title: 'Built by & for Builders',
      desc: 'We build for engineers, designers, and creators who need clean, rapid user interfaces with zero clutter. Designed to help you find your momentum.',
      accent: 'border-t-4 border-t-pink-500',
      hoverGlow: 'hover:bg-pink-500/5 dark:hover:bg-pink-500/10 hover:border-pink-500/30',
      iconColor: 'text-pink-500 bg-pink-500/10 border-pink-500/15',
      glowColor: 'bg-pink-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col justify-between select-none relative overflow-hidden">
      <Navbar />

      {/* Decorative dot-mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] dark:bg-[radial-gradient(#27314A_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10 w-full flex-grow flex flex-col justify-center gap-16 md:gap-24">
        
        {/* 1. Hero Block */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15 dark:border-emerald-500/30 shadow-sm inline-flex select-none animate-pulse"
          >
            About Us
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-950 dark:text-white tracking-tight leading-tight"
          >
            Empowering Developers to Find Their <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">Momentum</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-slate-450 dark:text-slate-500 font-semibold leading-relaxed max-w-xl mx-auto"
          >
            Disciplin is a unified, high-performance cockpit built to systematically organize your daily schedule, habits, goals, learning, and job search.
          </motion.p>
        </section>

        {/* 2. Story and Pillars Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-500">The Problem we solved</span>
              <h2 className="text-2xl md:text-3.5xl font-black text-gray-905 dark:text-white leading-tight tracking-tight">
                Ditch the spreadsheet chaos. Unify your cockpit.
              </h2>
            </div>
            
            <p className="text-sm text-slate-550 dark:text-slate-400 font-medium leading-relaxed">
              Before building Disciplin, we managed our daily learning syllabus in one app, tracked job applications in a spreadsheet, kept daily habits on a notepad, and time-blocked schedules on a calendar.
            </p>
            <p className="text-sm text-slate-550 dark:text-slate-400 font-medium leading-relaxed">
              Juggling five disjointed tools creates cognitive load and breaks consistency. That is why we built Disciplin—a single high-performance interface where you can keep checking off checkboxes, monitoring streaks, and visualizing progress pipelines.
            </p>
            <p className="text-sm text-emerald-500 dark:text-emerald-450 font-extrabold leading-relaxed">
              No bloating. No complex configurations. Just execution.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 bg-white/70 dark:bg-slate-950/45 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-850/80 shadow-lg text-left"
          >
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-6 tracking-wide uppercase text-[12px]">
              The 5 Cockpit Pillars
            </h3>
            
            <div className="space-y-4">
              {pillars.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start select-none group/pillar p-2.5 rounded-xl border border-transparent transition-all duration-300 hover:shadow-sm hover:bg-white dark:hover:bg-slate-900/40 hover:border-slate-100 dark:hover:border-slate-850/50">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 border ${item.color} group-hover/pillar:scale-105 transition-transform duration-200`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white leading-none mb-1 group-hover/pillar:text-emerald-500 dark:group-hover/pillar:text-emerald-450 transition-colors duration-200">{item.title}</h4>
                    <p className="text-[11.5px] font-semibold text-slate-400 dark:text-slate-500 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 3. Core Values Grid */}
        <section className="space-y-10 text-center">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-500">Our Pillars</span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              What guides our design philosophy
            </h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            {values.map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="h-full">
                <Card className={`p-6 sm:p-8 flex flex-col gap-4 bg-white/90 dark:bg-card-bg/95 backdrop-blur-md border border-slate-150 dark:border-slate-850/80 hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden group ${item.accent} ${item.hoverGlow}`}>
                  {/* Glowing background mesh inside card */}
                  <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${item.glowColor}`} />

                  <div className={`p-3 rounded-2xl w-fit ${item.iconColor} group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <item.icon size={20} />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-none relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm font-semibold text-slate-450 dark:text-slate-500 leading-relaxed relative z-10">
                    {item.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 4. Team Spotlight */}
        <section className="max-w-4xl mx-auto w-full select-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-850/80 mb-12">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">THE TEAM</span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">The Architects</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">The engineering minds designing and driving the Disciplin platform.</p>
            </div>
            <button className="px-5 py-2 text-xs font-extrabold text-slate-700 dark:text-slate-350 hover:text-emerald-500 dark:hover:text-emerald-450 border border-slate-200 dark:border-slate-800 rounded-full hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all select-none">
              Join the Team
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-slate-50/70 dark:bg-[#0c0e1a]/60 rounded-3xl border border-slate-200/50 dark:border-slate-850/80 shadow-lg select-none flex flex-col md:flex-row group"
          >
            {/* Left side: Image with soft gradient shadow overlay */}
            <div className="w-full md:w-[40%] h-[320px] md:h-auto flex-shrink-0 relative overflow-hidden">
              <img 
                src="/my_pic.jpg"
                alt="Swapnil Sutar"
                className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 dark:to-slate-950/20" />
            </div>

            {/* Right side: Details */}
            <div className="w-full md:w-[60%] p-6 sm:p-8 flex flex-col justify-between text-left relative">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 dark:border-emerald-500/30 shadow-sm w-fit select-none mb-4 animate-pulse">
                  LEAD ARCHITECT & CREATOR
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Swapnil Sutar</h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 select-none">
                  Full Stack Engineer // Creator
                </p>
                
                <p className="text-xs md:text-sm font-semibold text-slate-455 dark:text-slate-400 leading-relaxed mt-4">
                  Obsessed with creating high-performance developer ecosystems, clean code structures, and beautiful visual experiences. Creator of Disciplin, designed to elevate routine scheduling and career tracking to premium-tier execution.
                </p>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2 mt-6 select-none relative z-10">
                {['React', 'NodeJS', 'NestJS', 'PostgreSQL', 'Redis', 'Docker', 'Typescript'].map((skill) => (
                  <span key={skill} className="px-2.5 py-1 text-[10px] font-extrabold text-slate-655 dark:text-slate-350 bg-slate-100/60 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-md shadow-sm hover:border-emerald-500/20 dark:hover:border-emerald-500/20 hover:scale-105 transition-all duration-200">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-200/60 dark:border-slate-900/60 relative z-10">
                <a 
                  href="https://github.com/swappy-sutar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-400 hover:text-gray-955 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center cursor-pointer hover:scale-110"
                  aria-label="GitHub Profile"
                >
                  <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M18 9a9 9 0 0 1-9 9" />
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/swappy-sutar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-455 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center cursor-pointer hover:scale-110"
                  aria-label="LinkedIn Profile"
                >
                  <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a 
                  href="mailto:sutarswapnil322@gmail.com" 
                  className="p-2.5 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center cursor-pointer hover:scale-110"
                  aria-label="Email Address"
                >
                  <svg className="w-[18px] h-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 5. Bottom CTA Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 dark:from-[#0a1510] dark:via-[#05110c] dark:to-[#020705] text-white p-10 md:p-16 text-center max-w-4xl mx-auto shadow-2xl border border-emerald-500/15 select-none group w-full">
          {/* Subtle mesh background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
          
          {/* Glowing colorful ambient orbs */}
          <div className="absolute top-[-30%] left-[-20%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700 animate-pulse" />
          <div className="absolute bottom-[-30%] right-[-20%] w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700 animate-pulse" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6 flex flex-col items-center">
            <div className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm select-none">
              Start Today
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to take control of your developer routine?
            </h2>
            
            <p className="text-xs md:text-sm font-semibold text-slate-350 leading-relaxed max-w-xl">
              Join thousands of builders using Disciplin to log schedules, maintain daily habits, track syllabi, and organize job applications.
            </p>
            
            <div className="pt-4">
              <Link 
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs md:text-sm font-black text-slate-950 bg-white hover:bg-emerald-50 rounded-full transition-all duration-300 shadow-xl shadow-emerald-950/20 hover:scale-[1.03] active:scale-[0.97] group/btn"
              >
                <span>Get Started for Free</span>
                <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
