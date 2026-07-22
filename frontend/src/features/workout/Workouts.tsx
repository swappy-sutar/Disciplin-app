import { useState, useEffect } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useStore } from '../../app/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { PillBadge } from '../../components/ui/PillBadge';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Dumbbell, 
  Calendar, 
  Check, 
  Plus, 
  Trash2, 
  Award, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Activity, 
  RefreshCw 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

export default function Workouts() {
  const { activeDate, addNotification } = useStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'today' | 'split' | 'library' | 'progress'>('today');
  
  // Custom Date Tracking for Today's tab
  const [targetDateStr, setTargetDateStr] = useState(activeDate);

  // Sync with global activeDate when it changes
  useEffect(() => {
    setTargetDateStr(activeDate);
  }, [activeDate]);

  // Hook data loading
  const startDay = format(subDays(parseISO(targetDateStr), 30), 'yyyy-MM-dd');
  const endDay = format(addDays(parseISO(targetDateStr), 30), 'yyyy-MM-dd');
  
  const { 
    exercises, 
    split, 
    todaySession, 
    history, 
    streak, 
    isLoadingExercises,
    isLoadingSplit,
    isLoadingTodaySession,
    updateSplit, 
    saveSession 
  } = useWorkouts({ 
    date: targetDateStr, 
    startDate: startDay, 
    endDate: endDay 
  });

  // State for active session draft (to handle logging in UI before saving)
  const [sessionDraft, setSessionDraft] = useState<any>(null);
  
  // Library search state
  const [libSearch, setLibSearch] = useState('');
  const [libMuscle, setLibMuscle] = useState<string>('All');
  const [libEquipment, setLibEquipment] = useState<string>('All');
  const [selectedExDetail, setSelectedExDetail] = useState<any>(null);



  // Sync draft when todaySession arrives
  useEffect(() => {
    if (todaySession) {
      setSessionDraft(JSON.parse(JSON.stringify(todaySession)));
    }
  }, [todaySession]);

  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Cardio', 'FullBody'];
  const equipmentTypes = ['Dumbbell', 'Barbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Bands'];

  // Handle Set Value Changes
  const handleSetChange = (exIdx: number, setIdx: number, field: 'reps' | 'weightKg' | 'completed', value: any) => {
    if (!sessionDraft) return;
    const updated = { ...sessionDraft };
    updated.exercises[exIdx].sets[setIdx][field] = value;
    
    // Auto calculate if the whole session is completed
    let allCompleted = true;
    let loggedAnySet = false;
    
    updated.exercises.forEach((ex: any) => {
      ex.sets.forEach((set: any) => {
        if (set.reps > 0 || set.weightKg > 0) {
          loggedAnySet = true;
        }
        if (!set.completed) {
          allCompleted = false;
        }
      });
    });

    updated.completed = loggedAnySet && allCompleted;
    setSessionDraft(updated);
    
    // Auto save to database
    saveSession(updated);
  };

  // Add Set
  const addSet = (exIdx: number) => {
    if (!sessionDraft) return;
    const updated = { ...sessionDraft };
    const sets = updated.exercises[exIdx].sets;
    const newNum = sets.length + 1;
    const lastSet = sets[sets.length - 1] || { reps: 8, weightKg: 10 };
    
    sets.push({
      setNumber: newNum,
      reps: lastSet.reps,
      weightKg: lastSet.weightKg,
      completed: false
    });
    setSessionDraft(updated);
    saveSession(updated);
  };

  // Remove Set
  const removeSet = (exIdx: number, setIdx: number) => {
    if (!sessionDraft) return;
    const updated = { ...sessionDraft };
    updated.exercises[exIdx].sets.splice(setIdx, 1);
    
    // Renumber sets
    updated.exercises[exIdx].sets.forEach((set: any, idx: number) => {
      set.setNumber = idx + 1;
    });
    
    setSessionDraft(updated);
    saveSession(updated);
  };

  // Override rest day or start custom session
  const handleStartCustomSession = (muscle: string) => {
    if (!muscle) return;
    // Find matching exercises
    const matching = exercises.filter(ex => ex.muscleGroup === muscle);
    const selectedExercises = matching.length > 0 ? matching.slice(0, 4) : exercises.slice(0, 3);
    const exercisesTemplate = selectedExercises.map(ex => ({
      exerciseId: ex,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 15, completed: false },
        { setNumber: 2, reps: 8, weightKg: 20, completed: false },
        { setNumber: 3, reps: 8, weightKg: 20, completed: false }
      ],
      notes: ''
    }));

    const customSession = {
      date: targetDateStr,
      muscleGroup: muscle,
      exercises: exercisesTemplate,
      completed: false,
      durationMinutes: 45
    };
    setSessionDraft(customSession);
    saveSession(customSession);
  };

  // Complete workout button
  const handleCompleteWorkout = async () => {
    if (!sessionDraft) return;
    const finalSession = { ...sessionDraft, completed: true };
    
    // Mark all sets completed if they aren't
    finalSession.exercises.forEach((ex: any) => {
      ex.sets.forEach((set: any) => {
        set.completed = true;
      });
    });

    setSessionDraft(finalSession);
    await saveSession(finalSession);

    // Confetti celebration!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    toastSuccess('Workout Session Completed! 🏆');
    addNotification('Workout Logged! 🏋️', `Completed: ${finalSession.muscleGroup} Day`, 'system');
  };

  const toastSuccess = (msg: string) => {
    // Standard react-hot-toast fallback inside components
    import('react-hot-toast').then(m => m.toast.success(msg));
  };

  // Templates split appliers
  const applyTemplate = (type: 'ppl' | 'bro' | 'upperlower' | 'fullbody') => {
    let weekMap = {
      monday: 'rest',
      tuesday: 'rest',
      wednesday: 'rest',
      thursday: 'rest',
      friday: 'rest',
      saturday: 'rest',
      sunday: 'rest'
    };

    if (type === 'bro') {
      weekMap = {
        monday: 'Chest',
        tuesday: 'Back',
        wednesday: 'Shoulders',
        thursday: 'Legs',
        friday: 'Biceps',
        saturday: 'Triceps',
        sunday: 'rest'
      };
    } else if (type === 'ppl') {
      weekMap = {
        monday: 'Chest', // Push
        tuesday: 'Back',  // Pull
        wednesday: 'Legs',  // Legs
        thursday: 'rest',
        friday: 'Chest', // Push
        saturday: 'Back',  // Pull
        sunday: 'Legs'   // Legs
      };
    } else if (type === 'upperlower') {
      weekMap = {
        monday: 'Chest',     // Upper
        tuesday: 'Legs',      // Lower
        wednesday: 'rest',
        thursday: 'Back',     // Upper
        friday: 'Glutes',     // Lower
        saturday: 'Cardio',
        sunday: 'rest'
      };
    } else if (type === 'fullbody') {
      weekMap = {
        monday: 'FullBody',
        tuesday: 'rest',
        wednesday: 'FullBody',
        thursday: 'rest',
        friday: 'FullBody',
        saturday: 'Cardio',
        sunday: 'rest'
      };
    }

    updateSplit(weekMap);
  };

  // Date shifting handlers for today's view
  const shiftDate = (amount: number) => {
    const curr = parseISO(targetDateStr);
    const shifted = addDays(curr, amount);
    setTargetDateStr(format(shifted, 'yyyy-MM-dd'));
  };

  // Recharts Stats Calculations
  const getVolumeData = () => {
    if (!history || history.length === 0) return [];
    return history.slice(0, 8).reverse().map(session => {
      let totalVolume = 0;
      session.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed) {
            totalVolume += set.reps * set.weightKg;
          }
        });
      });
      return {
        date: format(parseISO(session.date), 'MMM d'),
        volume: totalVolume
      };
    });
  };

  const getFrequencyData = () => {
    if (!history) return [];
    const counts: Record<string, number> = {};
    history.forEach(session => {
      if (session.completed) {
        counts[session.muscleGroup] = (counts[session.muscleGroup] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }));
  };

  // Generate 56 days contribution heatmap grid
  const getHeatmapDays = () => {
    const days = [];
    const today = new Date();
    // Start from 7 weeks ago (56 days)
    for (let i = 55; i >= 0; i--) {
      const d = subDays(today, i);
      const str = format(d, 'yyyy-MM-dd');
      const hasCompleted = history.some(s => s.date === str && s.completed);
      days.push({
        dateStr: str,
        dayLabel: format(d, 'd'),
        completed: hasCompleted
      });
    }
    return days;
  };

  return (
    <div className="space-y-6 md:space-y-8 select-none pb-24 animate-fade-in">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {t.workout || 'Workout'}
          </h1>
          <p className="text-sm font-medium text-gray-400 dark:text-slate-400 mt-2">
            Build athletic power, track weekly splits, and log lift volumes.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1.5 bg-gray-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl w-full sm:w-auto border border-gray-150/40 dark:border-slate-800/80">
          <button 
            onClick={() => setActiveTab('today')}
            className={`py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none text-center ${activeTab === 'today' ? 'bg-white dark:bg-slate-800 text-primary-accent shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/30'}`}
          >
            {t.todayWorkout || "Today's Lift"}
          </button>
          <button 
            onClick={() => setActiveTab('split')}
            className={`py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none text-center ${activeTab === 'split' ? 'bg-white dark:bg-slate-800 text-primary-accent shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/30'}`}
          >
            {t.workoutSplit || 'Weekly Split'}
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none text-center ${activeTab === 'library' ? 'bg-white dark:bg-slate-800 text-primary-accent shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/30'}`}
          >
            {t.exerciseLibrary || 'Exercise Library'}
          </button>
          <button 
            onClick={() => setActiveTab('progress')}
            className={`py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none text-center ${activeTab === 'progress' ? 'bg-white dark:bg-slate-800 text-primary-accent shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/30'}`}
          >
            {t.workoutAnalytics || 'Analytics'}
          </button>
        </div>
      </div>

      {/* Stats Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 select-none">
        
        {/* Current Workout Streak */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/60 border border-gray-150/40 dark:border-slate-800/80 shadow-sm transition-all duration-255 hover:shadow-md hover:shadow-orange-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Active Streak</span>
              <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight block mt-1">
                {streak?.currentStreak || 0}
                <span className="text-xs font-bold text-gray-450 dark:text-slate-500 ml-1">Days</span>
              </span>
            </div>
            <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/10 shrink-0">
              <Flame size={16} fill="currentColor" className="text-orange-500 animate-pulse" />
            </div>
          </div>
          <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-3 select-none leading-none">Consecutive workout days</p>
        </div>

        {/* Longest Streak */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/60 border border-gray-150/40 dark:border-slate-800/80 shadow-sm transition-all duration-255 hover:shadow-md hover:shadow-emerald-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Longest Streak</span>
              <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight block mt-1">
                {streak?.longestStreak || 0}
                <span className="text-xs font-bold text-gray-450 dark:text-slate-500 ml-1">Days</span>
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/10 shrink-0">
              <Award size={16} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-3 select-none leading-none">Best personal record</p>
        </div>

        {/* Today's Target Muscle */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/60 border border-gray-150/40 dark:border-slate-800/80 shadow-sm transition-all duration-255 hover:shadow-md hover:shadow-blue-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Today's Target</span>
              <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight block mt-1 truncate">
                {sessionDraft?.muscleGroup || 'Loading...'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/10 shrink-0 ml-2">
              <Dumbbell size={16} className="text-blue-500" />
            </div>
          </div>
          <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-3 select-none leading-none">Via weekly split builder</p>
        </div>

        {/* Monthly Workouts Logged */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/60 border border-gray-150/40 dark:border-slate-800/80 shadow-sm transition-all duration-255 hover:shadow-md hover:shadow-purple-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Total Logs</span>
              <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight block mt-1">
                {history?.filter(s => s.completed).length || 0}
                <span className="text-xs font-bold text-gray-450 dark:text-slate-500 ml-1">Workouts</span>
              </span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/10 shrink-0">
              <Activity size={16} className="text-purple-500" />
            </div>
          </div>
          <p className="text-[9px] font-semibold text-gray-400 dark:text-slate-500 mt-3 select-none leading-none">Recorded in past 30 days</p>
        </div>

      </div>

      {/* Main Tab Renderings */}
      {activeTab === 'today' && (
        <div className="space-y-6 select-none animate-fade-in">
          
          {/* Day selection header */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border border-gray-150/40 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => shiftDate(-1)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-xl transition-all cursor-pointer border-none bg-transparent text-gray-500 dark:text-slate-400"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="text-center">
                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block leading-none">
                  {format(parseISO(targetDateStr), 'EEEE')}
                </span>
                <span className="text-sm font-black text-gray-900 dark:text-white mt-1.5 block">
                  {format(parseISO(targetDateStr), 'MMM d, yyyy')}
                </span>
              </div>
              
              <button 
                onClick={() => shiftDate(1)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-xl transition-all cursor-pointer border-none bg-transparent text-gray-500 dark:text-slate-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            {/* Show Quick Reset back to today */}
            {targetDateStr !== activeDate && (
              <Button 
                onClick={() => setTargetDateStr(activeDate)}
                variant="outline"
                className="py-1 px-3 text-[10px] uppercase font-black ml-4"
                icon={<RefreshCw size={10} />}
              >
                Go to Today
              </Button>
            )}
          </div>

          {/* If Loading today's session */}
          {isLoadingTodaySession && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Today Session Loaded view */}
          {!isLoadingTodaySession && sessionDraft && (
            <>
              {sessionDraft.muscleGroup === 'rest' ? (
                /* Rest Day Card */
                <Card className="text-center py-12 md:py-16 max-w-lg mx-auto bg-gradient-to-br from-emerald-500/[0.04] to-teal-500/[0.02] dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-500/15">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Calendar size={28} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    Today is scheduled as a Rest Day!
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-3 max-w-xs mx-auto">
                    Muscles grow when you rest. Recover well, stay hydrated, and focus on clean nutrition today.
                  </p>
                  
                  <div className="mt-8 border-t border-gray-200/60 dark:border-slate-800 pt-6">
                    <span className="text-[10px] font-black tracking-widest text-gray-400 dark:text-slate-500 uppercase">Or lift anyway:</span>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                      {muscleGroups.map(muscle => (
                        <button
                          key={muscle}
                          onClick={() => handleStartCustomSession(muscle)}
                          className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
                        >
                          {muscle}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : (
                /* Active Workout Routine View */
                <div className="space-y-6">
                  
                  {/* Top Header Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-900 text-white rounded-2xl p-6 shadow-md shadow-emerald-600/15">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 dark:text-emerald-200">Today's Target Routine</span>
                      <h2 className="text-2xl font-black tracking-tight leading-none mt-1 text-white">
                        {sessionDraft.muscleGroup} Split
                      </h2>
                      <p className="text-xs font-medium text-emerald-100 dark:text-emerald-200 mt-2">
                        {sessionDraft.exercises.length} exercises matched from your reference library.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleCompleteWorkout}
                        disabled={sessionDraft.completed}
                        className={`font-black select-none text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                          sessionDraft.completed 
                            ? 'bg-emerald-800/50 text-emerald-200 cursor-not-allowed border border-emerald-500/30' 
                            : 'bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 border-none'
                        }`}
                      >
                        {sessionDraft.completed ? <Check size={14} /> : <Dumbbell size={14} />}
                        <span>{sessionDraft.completed ? 'Workout Logged' : 'Finish Workout'}</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Exercises Cards */}
                  <div className="space-y-6">
                    {sessionDraft.exercises.map((ex: any, exIdx: number) => {
                      const exercise = ex.exerciseId;
                      if (!exercise) return null;
                      
                      return (
                        <Card 
                          key={ex._id || exIdx}
                          className={`relative transition-all duration-300 ${ex.sets.every((s: any) => s.completed) && ex.sets.length > 0 ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-gray-150/80 dark:border-gray-800'}`}
                        >
                          {/* Top exercise info row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150/40 dark:border-gray-850 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail preview */}
                              <img 
                                src={exercise.imageUrl} 
                                alt={exercise.name} 
                                className="w-12 h-12 rounded-xl object-cover border border-gray-150/80 dark:border-gray-850 shrink-0" 
                              />
                              <div>
                                <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                                  {exercise.name}
                                  {ex.sets.every((s: any) => s.completed) && ex.sets.length > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/10 shrink-0">
                                      <Check size={8} strokeWidth={4} /> Done
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <PillBadge variant="blue">{exercise.equipment}</PillBadge>
                                  <PillBadge variant="gray">{exercise.difficulty}</PillBadge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Buttons */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center">
                              <Button 
                                onClick={() => setSelectedExDetail(exercise)}
                                variant="outline"
                                className="py-1 px-3 text-[10px] font-bold"
                                icon={<BookOpen size={10} />}
                              >
                                Instructions
                              </Button>
                              <Button 
                                onClick={() => addSet(exIdx)}
                                variant="outline"
                                className="py-1 px-3 text-[10px] font-bold border-primary-accent/30 text-primary-accent hover:bg-primary-accent/5"
                                icon={<Plus size={10} />}
                              >
                                Add Set
                              </Button>
                            </div>
                          </div>
                          {/* Sets logging list */}
                          <div className="space-y-2 mt-3 select-none">
                            {/* Column Headers */}
                            {ex.sets.length > 0 && (
                              <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2rem] gap-2 sm:gap-4 px-2 sm:px-3 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center">
                                <div>Set</div>
                                <div className="text-left">Weight (kg)</div>
                                <div className="text-left">Reps</div>
                                <div>Done</div>
                                <div></div>
                              </div>
                            )}

                            {ex.sets.map((set: any, setIdx: number) => {
                              const isSetDone = set.completed;
                              return (
                                <div 
                                  key={setIdx} 
                                  className={`grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2rem] items-center gap-2 sm:gap-4 px-2 sm:px-3 py-1.5 rounded-2xl border transition-all duration-300
                                    ${isSetDone 
                                      ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] border-emerald-500/20 shadow-sm shadow-emerald-500/[0.01]' 
                                      : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/70 hover:border-slate-200/80 dark:hover:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60'
                                    }
                                  `}
                                >
                                  {/* Set Number Badge */}
                                  <div className="flex justify-center">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all duration-300
                                      ${isSetDone
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                                      }
                                    `}>
                                      {set.setNumber}
                                    </span>
                                  </div>

                                  {/* Weight Input */}
                                  <div>
                                    <input 
                                      type="number"
                                      value={set.weightKg === 0 ? '' : set.weightKg}
                                      onChange={(e) => handleSetChange(exIdx, setIdx, 'weightKg', Number(e.target.value))}
                                      placeholder="0"
                                      disabled={sessionDraft.completed}
                                      className={`w-full max-w-[120px] px-2 py-1.5 rounded-xl border text-center font-black text-xs text-gray-800 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent
                                        ${isSetDone
                                          ? 'bg-emerald-500/[0.01] border-emerald-500/10 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80'
                                        }
                                      `}
                                    />
                                  </div>

                                  {/* Reps Input */}
                                  <div>
                                    <input 
                                      type="number"
                                      value={set.reps === 0 ? '' : set.reps}
                                      onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', Number(e.target.value))}
                                      placeholder="0"
                                      disabled={sessionDraft.completed}
                                      className={`w-full max-w-[120px] px-2 py-1.5 rounded-xl border text-center font-black text-xs text-gray-800 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent
                                        ${isSetDone
                                          ? 'bg-emerald-500/[0.01] border-emerald-500/10 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80'
                                        }
                                      `}
                                    />
                                  </div>

                                  {/* Done Toggle */}
                                  <div className="flex justify-center">
                                    <Checkbox 
                                      checked={set.completed}
                                      disabled={sessionDraft.completed}
                                      onChange={(checked) => handleSetChange(exIdx, setIdx, 'completed', checked)}
                                      color="#10B981"
                                      size={18}
                                    />
                                  </div>

                                  {/* Remove Set Button */}
                                  <div className="flex justify-center">
                                    <button 
                                      onClick={() => removeSet(exIdx, setIdx)}
                                      disabled={sessionDraft.completed}
                                      className="text-gray-300 hover:text-red-500 dark:text-slate-650 dark:hover:text-red-400 p-1.5 cursor-pointer transition-all border-none bg-transparent disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg"
                                      title="Delete set"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'split' && (
        <div className="space-y-6 select-none animate-fade-in">
          
          {/* Template Preset bar */}
          <Card title="Quick Split Setup Templates" subtitle="Apply standard fitness layouts directly">
            <div className="flex flex-wrap gap-2.5">
              <Button 
                onClick={() => applyTemplate('bro')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                💪 Bro Split (5-Day Bodypart)
              </Button>
              <Button 
                onClick={() => applyTemplate('ppl')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                🏋️ Push/Pull/Legs (6-Day Cyclic)
              </Button>
              <Button 
                onClick={() => applyTemplate('upperlower')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                📈 Upper/Lower Strength split
              </Button>
              <Button 
                onClick={() => applyTemplate('fullbody')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                🏃 Full Body x3 Cardio split
              </Button>
            </div>
          </Card>

          {/* Weekly Dropdowns Grid */}
          {isLoadingSplit && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoadingSplit && split && (
            <Card title="Weekly Target Setup" subtitle="Assign targeted muscle groups for each day of the week">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.keys(split.weekMap).map((day) => {
                  const dayKey = day as keyof typeof split.weekMap;
                  const currentMuscle = split.weekMap[dayKey];
                  
                  return (
                    <div key={day} className="flex flex-col gap-1.5 p-3.5 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-150/40 dark:border-gray-800/50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                        {day}
                      </span>
                      
                      <select 
                        value={currentMuscle}
                        onChange={(e) => {
                          const updatedMap = { ...split.weekMap, [dayKey]: e.target.value };
                          updateSplit(updatedMap);
                        }}
                        className="w-full px-2.5 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-lg text-xs font-extrabold text-gray-800 dark:text-slate-350 focus:outline-none focus:border-primary-accent"
                      >
                        <option value="rest">☕ Rest Day</option>
                        {muscleGroups.map(muscle => (
                          <option key={muscle} value={muscle}>{muscle}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </div>
      )}

      {activeTab === 'library' && (
        <div className="space-y-6 select-none animate-fade-in">
          
          {/* Filters strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-150/80 dark:border-gray-800 shadow-sm">
            
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-850 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-primary-accent placeholder-gray-400"
              />
              <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
            </div>

            {/* Muscle Filter */}
            <div>
              <select 
                value={libMuscle}
                onChange={(e) => setLibMuscle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-850 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-primary-accent"
              >
                <option value="All">Target Muscle: All</option>
                {muscleGroups.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Equipment Filter */}
            <div>
              <select 
                value={libEquipment}
                onChange={(e) => setLibEquipment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-850 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-primary-accent"
              >
                <option value="All">Equipment: All</option>
                {equipmentTypes.map(eq => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Exercises Library Grid */}
          {isLoadingExercises && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoadingExercises && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises
                .filter(ex => {
                  const matchSearch = ex.name.toLowerCase().includes(libSearch.toLowerCase());
                  const matchMuscle = libMuscle === 'All' || ex.muscleGroup === libMuscle;
                  const matchEquip = libEquipment === 'All' || ex.equipment === libEquipment;
                  return matchSearch && matchMuscle && matchEquip;
                })
                .map(ex => (
                  <Card key={ex._id} className="group hover:border-primary-accent/40 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-4">
                      {/* Image Thumbnail */}
                      <img 
                        src={ex.imageUrl} 
                        alt={ex.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-gray-150/80 dark:border-gray-850 shrink-0" 
                      />
                      
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {ex.name}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 uppercase select-none shrink-0">
                            {ex.muscleGroup}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 uppercase select-none shrink-0">
                            {ex.equipment}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedExDetail(ex)}
                          className="text-[10px] font-black text-primary-accent hover:underline border-none bg-transparent cursor-pointer p-0 block"
                        >
                          View cues & guide →
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}

        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6 select-none animate-fade-in">
          
          {/* Heatmap Contribution Card */}
          <Card title="Workout Log Heatmap" subtitle="Active logs over the past 8 weeks">
            <div className="flex justify-center md:justify-start">
              <div className="grid grid-flow-col grid-rows-7 gap-1 bg-gray-50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-150/40 dark:border-gray-800/80">
                {getHeatmapDays().map((day, idx) => (
                  <div 
                    key={idx}
                    title={`${day.dateStr}: ${day.completed ? 'Workout Logged 💪' : 'No workout'}`}
                    className={`w-3.5 h-3.5 rounded-sm transition-all shadow-sm ${day.completed ? 'bg-primary-accent border border-primary-accent-hover/30 hover:scale-110 shadow-emerald-500/10' : 'bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 text-[10px] text-gray-400 font-bold select-none justify-end">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-accent" />
              <span>More</span>
            </div>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
            
            {/* Volume Chart */}
            <Card title="Total Lifted Volume (kg)" subtitle="Aggregated sets volume (weight × reps × completed sets)">
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getVolumeData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-accent)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--primary-accent)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} fontWeight={600} />
                    <YAxis stroke="#94A3B8" fontSize={9} fontWeight={600} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'var(--card-bg, #FFFFFF)', 
                        border: '1.5px solid var(--border-main, #E5E7EB)', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 650
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="var(--primary-accent)" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#volGlow)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Split Frequency Distribution */}
            <Card title="Frequency distribution" subtitle="Count of logged sessions per muscle group">
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getFrequencyData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight={600} />
                    <YAxis stroke="#94A3B8" fontSize={9} fontWeight={600} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'var(--card-bg, #FFFFFF)', 
                        border: '1.5px solid var(--border-main, #E5E7EB)', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 650
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="var(--primary-accent)" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>

        </div>
      )}

      {/* Instructions Detail Modal */}
      {selectedExDetail && (
        <div className="fixed inset-0 z-50 bg-black/45 dark:bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            
            {/* Modal Header Image */}
            <div className="relative h-48 w-full bg-slate-100 shrink-0">
              <img 
                src={selectedExDetail.imageUrl} 
                alt={selectedExDetail.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="text-lg font-black text-white leading-tight">
                  {selectedExDetail.name}
                </h3>
                <div className="flex gap-1.5 mt-2">
                  <PillBadge variant="green">{selectedExDetail.muscleGroup}</PillBadge>
                  <PillBadge variant="blue">{selectedExDetail.equipment}</PillBadge>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Cues List */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                  Execution Instructions
                </h5>
                <ol className="list-decimal pl-4.5 space-y-2 text-xs font-semibold text-gray-650 dark:text-slate-350 leading-relaxed">
                  {selectedExDetail.instructions.map((inst: string, idx: number) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-850 pt-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Difficulty</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-350 block capitalize mt-1">
                    {selectedExDetail.difficulty}
                  </span>
                </div>
                {selectedExDetail.secondaryMuscles && selectedExDetail.secondaryMuscles.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assisting Muscles</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-350 block mt-1">
                      {selectedExDetail.secondaryMuscles.join(', ')}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-850 border-t border-gray-150/40 dark:border-gray-800/80 flex justify-end shrink-0">
              <Button 
                onClick={() => setSelectedExDetail(null)}
                variant="primary"
                className="py-1.5 px-6 font-black text-xs"
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
