import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useStore } from '../../app/store';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../lib/api-client';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { PillBadge } from '../../components/ui/PillBadge';
import { format, parseISO, addDays, subDays, startOfWeek } from 'date-fns';
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
  Bot,
  Send,
  Sparkles,
  Camera,
  AlertTriangle,
  RefreshCw,
  X,
  Target
} from 'lucide-react';
import { FitnessGoalPanel } from './FitnessGoalPanel';
import {
  useGenerateWorkoutSession,
  useCheckPlateau,
  useDetectEquipment,
  useCoachChat,
  useRegenerateSplit
} from '../../hooks/useAI';
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
  const { activeDate, setActiveDate, setActiveWeekStart, addNotification } = useStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'today' | 'split' | 'goal' | 'library' | 'progress' | 'coach'>('today');
  
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
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  useEffect(() => {
    if (!selectedExDetail) {
      setCurrentVideoId(null);
      return;
    }
    
    setIsLoadingVideo(true);
    apiClient.workouts.getExerciseVideo(selectedExDetail.name)
      .then((res) => {
        if (res && res.videoId) {
          setCurrentVideoId(res.videoId);
        } else {
          setCurrentVideoId(null);
        }
      })
      .catch(() => {
        setCurrentVideoId(null);
      })
      .finally(() => {
        setIsLoadingVideo(false);
      });
  }, [selectedExDetail]);

  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);



  // --- WORKOUT AI MODULE: ADVANCED STATES & HOOKS ---
  const token = localStorage.getItem('disciplin_token');
  const isBackendOnline = !!token && typeof window !== 'undefined' && window.navigator.onLine;

  const [painFlags, setPainFlags] = useState<string[]>([]);
  const [currentPainInput, setCurrentPainInput] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Bodyweight']);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [showAiGenModal, setShowAiGenModal] = useState(false);

  // Plateau check result state
  const [plateauResult, setPlateauResult] = useState<any>(null);
  const [showPlateauModal, setShowPlateauModal] = useState(false);

  // Split regeneration preview state
  const [splitRegenPreview, setSplitRegenPreview] = useState<any>(null);

  // Coach Chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Hey there! I am Swappy, your workout coach. Ask me anything about fitness, routines, or form guidance!' }
  ]);
  const [threadId, setThreadId] = useState<string | undefined>(
    () => localStorage.getItem('coach_thread_id') || undefined
  );

  // Auto scroll chat to bottom when messages change
  useEffect(() => {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    const floatingBox = document.getElementById('floating-chat-box');
    if (floatingBox) {
      floatingBox.scrollTop = floatingBox.scrollHeight;
    }
  }, [chatMessages, isFloatingChatOpen]);

  // Hooks Invocations
  const { generateWorkoutSession, isGeneratingWorkoutSession } = useGenerateWorkoutSession();
  const { checkPlateau, isCheckingPlateau } = useCheckPlateau();
  const { detectEquipment, isDetectingEquipment } = useDetectEquipment();
  const { sendMessage, isSendingMessage } = useCoachChat();
  const { regenerateSplit, isRegeneratingSplit } = useRegenerateSplit();

  // Handlers
  const handleAddPainTag = () => {
    const tag = currentPainInput.trim().toLowerCase();
    if (tag && !painFlags.includes(tag)) {
      setPainFlags([...painFlags, tag]);
    }
    setCurrentPainInput('');
  };

  const handleRemovePainTag = (tag: string) => {
    setPainFlags(painFlags.filter(t => t !== tag));
  };

  const handleScanEquipment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await detectEquipment({ image: base64String });
        if (res?.detectedEquipment) {
          setSelectedEquipment(res.detectedEquipment);
        }
      } catch (err) {}
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSession = async (muscleGroup: string) => {
    try {
      const res = await generateWorkoutSession({
        date: targetDateStr,
        muscleGroup,
        equipment: selectedEquipment,
        fitnessLevel,
        painFlags: painFlags.length > 0 ? painFlags : undefined,
      });
      if (res) {
        setSessionDraft(res);
        setShowAiGenModal(false);
      }
    } catch (err) {}
  };

  const handlePlateauCheckClick = async () => {
    try {
      const res = await checkPlateau();
      if (res) {
        setPlateauResult(res);
        setShowPlateauModal(true);
      }
    } catch (err) {}
  };

  const handleLoadDeloadWeek = () => {
    if (plateauResult?.suggestedDeloadWeek) {
      setSessionDraft(plateauResult.suggestedDeloadWeek);
      setShowPlateauModal(false);
      // Switch tab to today's workout to show the deload routine
      setActiveTab('today');
    }
  };

  const handleRegenerateSplitClick = async () => {
    try {
      const res = await regenerateSplit();
      if (res && res.splitRegenerated) {
        setSplitRegenPreview(res);
      }
    } catch (err) {}
  };

  const handleConfirmSplitRegeneration = async () => {
    if (!splitRegenPreview?.newWeekMap) return;
    try {
      await updateSplit(splitRegenPreview.newWeekMap);
      setSplitRegenPreview(null);
    } catch (err) {}
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || isSendingMessage) return;

    // Append user message locally
    const updatedMessages = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(updatedMessages);
    setChatInput('');

    try {
      const res = await sendMessage({ threadId, message: msg });
      if (res) {
        setChatMessages([...updatedMessages, { role: 'assistant', content: res.reply }]);
        if (res.threadId) {
          setThreadId(res.threadId);
          localStorage.setItem('coach_thread_id', res.threadId);
        }
      }
    } catch (err) {
      // Revert user message on error or show error message
      setChatMessages([...updatedMessages, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
  };
  // --------------------------------------------------



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
    toast.success(msg);
  };

  // Templates split appliers
  const applyTemplate = (type: 'ppl' | 'bro' | 'upperlower' | 'fullbody' | 'arnold' | 'upperlower4' | 'pplarnold' | 'conditioning') => {
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
    } else if (type === 'arnold') {
      weekMap = {
        monday: 'Chest',      // Chest/Back
        tuesday: 'Shoulders',  // Shoulders/Arms (using Shoulders)
        wednesday: 'Legs',     // Legs
        thursday: 'Back',      // Chest/Back (using Back)
        friday: 'Biceps',      // Shoulders/Arms (using Biceps)
        saturday: 'Legs',      // Legs
        sunday: 'rest'
      };
    } else if (type === 'upperlower4') {
      weekMap = {
        monday: 'Chest',       // Upper
        tuesday: 'Legs',       // Lower
        wednesday: 'rest',
        thursday: 'Back',      // Upper
        friday: 'Glutes',      // Lower
        saturday: 'rest',
        sunday: 'rest'
      };
    } else if (type === 'pplarnold') {
      weekMap = {
        monday: 'Chest',       // Push
        tuesday: 'Back',       // Pull
        wednesday: 'Legs',      // Legs
        thursday: 'Chest',     // Arnold: Chest/Back (using Chest)
        friday: 'Shoulders',   // Arnold: Shoulders/Arms (using Shoulders)
        saturday: 'Legs',      // Arnold: Legs
        sunday: 'rest'
      };
    } else if (type === 'conditioning') {
      weekMap = {
        monday: 'Cardio',
        tuesday: 'Core',
        wednesday: 'rest',
        thursday: 'Cardio',
        friday: 'Core',
        saturday: 'FullBody',
        sunday: 'rest'
      };
    }

    updateSplit(weekMap);
  };

  // Date shifting handlers for today's view
  const shiftDate = (amount: number) => {
    const curr = parseISO(targetDateStr);
    const shifted = addDays(curr, amount);
    const dateStr = format(shifted, 'yyyy-MM-dd');
    setActiveDate(dateStr);
    const newWeekStart = startOfWeek(shifted, { weekStartsOn: 1 });
    setActiveWeekStart(format(newWeekStart, 'yyyy-MM-dd'));
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
        
        {/* Navigation Tabs & Date Switcher */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3.5 w-full sm:w-auto sm:justify-end">
          <div className="flex flex-row overflow-x-auto items-center gap-1 bg-slate-100/70 dark:bg-slate-900/60 p-1 rounded-2xl w-full sm:w-auto border border-slate-150 dark:border-slate-800/80 shadow-inner [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button 
              onClick={() => setActiveTab('today')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none shrink-0 ${activeTab === 'today' ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/20'}`}
            >
              <Dumbbell size={13} className={activeTab === 'today' ? 'text-emerald-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'} />
              {t.todayWorkout || "Today's Lift"}
            </button>
            <button 
              onClick={() => setActiveTab('split')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none shrink-0 ${activeTab === 'split' ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/20'}`}
            >
              <Calendar size={13} className={activeTab === 'split' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'} />
              {t.workoutSplit || 'Weekly Split'}
            </button>
            <button 
              onClick={() => setActiveTab('goal')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none shrink-0 ${activeTab === 'goal' ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/20'}`}
            >
              <Target size={13} className={activeTab === 'goal' ? 'text-emerald-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'} />
              {'Fitness Goal'}
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none shrink-0 ${activeTab === 'library' ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/20'}`}
            >
              <BookOpen size={13} className={activeTab === 'library' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'} />
              {t.exerciseLibrary || 'Exercise Library'}
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none shrink-0 ${activeTab === 'progress' ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/20'}`}
            >
              <Activity size={13} className={activeTab === 'progress' ? 'text-emerald-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'} />
              {t.workoutAnalytics || 'Analytics'}
            </button>
            <button 
              onClick={() => setActiveTab('coach')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-black rounded-xl cursor-pointer transition-all duration-200 border-none shrink-0 ${activeTab === 'coach' ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/20'}`}
            >
              <Bot size={13} className={activeTab === 'coach' ? 'text-emerald-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'} />
              {'AI Coach'}
            </button>
          </div>
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
          {/* AI Generator Button Strip */}
          <div className="flex justify-between items-center bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-500/15 p-4 rounded-2xl shadow-sm">
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">AI Workout Builder</h4>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 mt-1">Generate a custom routine with injury-awareness and overload autopilot.</p>
            </div>
            <Button 
              onClick={() => setShowAiGenModal(true)}
              disabled={!isBackendOnline}
              title={!isBackendOnline ? 'Connect to backend to use AI features' : 'Open AI workout builder'}
              className={`flex items-center gap-1.5 text-xs font-black py-2 px-3 rounded-xl transition-all border-none ${!isBackendOnline ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'}`}
              icon={<Sparkles size={11} />}
            >
              Generate routine
            </Button>
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
                              {exercise.imageUrl ? (
                              <img 
                                src={exercise.imageUrl || undefined} 
                                alt={exercise.name} 
                                className="w-12 h-12 rounded-xl object-cover border border-gray-150/80 dark:border-gray-850 shrink-0" 
                              />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-gray-150/80 dark:border-gray-850 shrink-0 flex items-center justify-center text-slate-400">
                                  <Dumbbell size={18} />
                                </div>
                              )}
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
          {/* AI Split Regeneration banner */}
          <div className="flex justify-between items-center bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-500/15 p-4 rounded-2xl shadow-sm">
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <RefreshCw size={13} className="text-emerald-500" />
                Adaptive Split Regeneration
              </h4>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 mt-1">Regenerate split day targets based on low session compliance rates ({"< 40%"}) in the past 3 weeks.</p>
            </div>
            <Button 
              onClick={handleRegenerateSplitClick}
              disabled={isRegeneratingSplit || !isBackendOnline}
              title={!isBackendOnline ? 'Connect to backend to use AI features' : 'Adjust split configuration'}
              className={`flex items-center gap-1.5 text-xs font-black py-2 px-3 rounded-xl transition-all border-none ${!isBackendOnline ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'}`}
            >
              {isRegeneratingSplit ? 'Adjusting...' : 'Adjust my split'}
            </Button>
          </div>

          {/* Proposed split comparison diff preview */}
          {splitRegenPreview && (
            <div className="bg-emerald-500/[0.03] dark:bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white leading-none">AI Proposed Weekly Split Adjustments</h4>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-2">{splitRegenPreview.explanation}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                {Object.keys(splitRegenPreview.newWeekMap).map((day) => {
                  const dayKey = day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
                  const oldMuscle = splitRegenPreview.oldWeekMap[dayKey];
                  const newMuscle = splitRegenPreview.newWeekMap[dayKey];
                  const changed = oldMuscle !== newMuscle;

                  return (
                    <div key={day} className={`p-3 rounded-xl border text-center ${changed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-200 dark:border-slate-800'}`}>
                      <span className="text-[9px] font-black uppercase text-gray-400 block">{day}</span>
                      <span className="text-xs font-bold text-gray-400 dark:text-slate-500 line-through block mt-1.5">{oldMuscle}</span>
                      <span className={`text-xs font-extrabold block mt-0.5 ${changed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>{newMuscle}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  onClick={() => setSplitRegenPreview(null)}
                  variant="outline"
                  className="py-1.5 px-4 text-xs font-black"
                >
                  Reject Changes
                </Button>
                <Button 
                  onClick={handleConfirmSplitRegeneration}
                  className="py-1.5 px-6 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                >
                  Approve Split Changes
                </Button>
              </div>
            </div>
          )}
          
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
              <Button 
                onClick={() => applyTemplate('arnold')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                ⭐ Arnold Split (6-Day Arms/Chest/Legs)
              </Button>
              <Button 
                onClick={() => applyTemplate('upperlower4')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                📊 Upper/Lower 4-Day Strength
              </Button>
              <Button 
                onClick={() => applyTemplate('pplarnold')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                🔥 PPL + Arnold 6-Day Hybrid
              </Button>
              <Button 
                onClick={() => applyTemplate('conditioning')}
                variant="outline"
                className="font-bold py-2 text-xs"
              >
                ⚡ Cardio & Core Conditioning
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

      {activeTab === 'goal' && (
        <div className="space-y-6 select-none animate-fade-in">
          <FitnessGoalPanel />
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
                      {ex.imageUrl ? (
                      <img 
                        src={ex.imageUrl || undefined} 
                        alt={ex.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-gray-150/80 dark:border-gray-850 shrink-0" 
                      />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-gray-150/80 dark:border-gray-850 shrink-0 flex items-center justify-center text-slate-400">
                          <Dumbbell size={22} />
                        </div>
                      )}
                      
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
          {/* Plateau check AI banner */}
          <div className="flex justify-between items-center bg-amber-500/[0.04] dark:bg-amber-950/10 border border-amber-500/15 p-4 rounded-2xl shadow-sm">
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <AlertTriangle size={13} className="text-amber-500" />
                AI Plateau & Deload Coach
              </h4>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 mt-1">Run a 6-week progressive volume scan on your exercises to detect plateau traps.</p>
            </div>
            <Button 
              onClick={handlePlateauCheckClick}
              disabled={isCheckingPlateau || !isBackendOnline}
              title={!isBackendOnline ? 'Connect to backend to use AI features' : 'Scan exercise volume trends'}
              className={`flex items-center gap-1.5 text-xs font-black py-2 px-3 rounded-xl transition-all border-none ${!isBackendOnline ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'}`}
            >
              {isCheckingPlateau ? 'Analyzing...' : 'Scan for Plateaus'}
            </Button>
          </div>
          
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

      {activeTab === 'coach' && (
        <div className="space-y-6 select-none animate-fade-in max-w-2xl mx-auto">
          <Card title="AI Workout Coach Chat" subtitle="Chat with your personal fitness coach. Ask about exercise cues, form corrections, or training programs.">
            
            {/* Messages box */}
            <div id="chat-box" className="h-96 overflow-y-auto border border-gray-100 dark:border-gray-800 p-4 rounded-2xl space-y-3 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col">
              {chatMessages.map((m, idx) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div 
                    key={idx} 
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-semibold leading-relaxed
                      ${isAssistant 
                        ? 'bg-white dark:bg-slate-900 border border-gray-150/40 dark:border-gray-800/80 text-gray-800 dark:text-slate-350 self-start' 
                        : 'bg-emerald-500 text-white self-end shadow-sm'
                      }
                    `}
                  >
                    {m.content}
                  </div>
                );
              })}
              {isSendingMessage && (
                <div className="bg-white dark:bg-slate-900 border border-gray-150/40 dark:border-gray-800/80 text-gray-800 dark:text-slate-350 max-w-[85%] p-3 rounded-2xl text-xs font-semibold self-start flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Swappy is typing...</span>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2 mt-4">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={!isBackendOnline ? 'Connect to backend to chat with coach' : 'Ask about form, routines, or cues...'}
                disabled={!isBackendOnline || isSendingMessage}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white placeholder-gray-400"
              />
              <Button 
                type="submit"
                disabled={!isBackendOnline || isSendingMessage || !chatInput.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none py-2.5 px-4 font-black flex items-center justify-center shrink-0 rounded-xl"
              >
                <Send size={14} />
              </Button>
            </form>
          </Card>
        </div>
      )}

      {selectedExDetail && (
        <div 
          onClick={() => setSelectedExDetail(null)}
          className="fixed inset-0 z-50 bg-black/45 dark:bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
          >
            
            {/* Modal Header Image or YouTube Video */}
            <div className="relative h-56 w-full bg-slate-900 shrink-0 select-none overflow-hidden">
              {isLoadingVideo ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-2">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Loading exercise tutorial...
                </div>
              ) : currentVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1`}
                  title={`${selectedExDetail.name} form tutorial`}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <img 
                    src={selectedExDetail.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60'} 
                    alt={selectedExDetail.name} 
                    className="w-full h-full object-cover opacity-60" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </>
              )}
              
              {/* Overlay title and badges when not playing video or while loading */}
              {(!currentVideoId || isLoadingVideo) && (
                <div className="absolute bottom-4 left-5 right-5 pointer-events-none z-10">
                  <h3 className="text-lg font-black text-white leading-tight drop-shadow">
                    {selectedExDetail.name}
                  </h3>
                  <div className="flex gap-1.5 mt-2">
                    <PillBadge variant="green">{selectedExDetail.muscleGroup}</PillBadge>
                    <PillBadge variant="blue">{selectedExDetail.equipment}</PillBadge>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Title & Badges below video player if video is active */}
              {currentVideoId && !isLoadingVideo && (
                <div className="border-b border-gray-150/60 dark:border-slate-800/80 pb-3">
                  <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                    {selectedExDetail.name}
                  </h3>
                  <div className="flex gap-1.5 mt-2">
                    <PillBadge variant="green">{selectedExDetail.muscleGroup}</PillBadge>
                    <PillBadge variant="blue">{selectedExDetail.equipment}</PillBadge>
                    <PillBadge variant="gray">{selectedExDetail.difficulty}</PillBadge>
                  </div>
                </div>
              )}
              
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

      {/* AI WORKOUT BUILDER MODAL */}
      {showAiGenModal && (
        <div className="fixed inset-0 z-50 bg-black/45 dark:bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            <div className="p-6 overflow-y-auto space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                <Sparkles className="text-emerald-500" size={18} />
                AI Workout Routine Generator
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">
                Generate a tailored muscle group routine leveraging Progressive Overload based on your previous logs.
              </p>
              
              {/* Muscle group */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Target Muscle Group</label>
                <select 
                  id="ai-muscle-select"
                  defaultValue={sessionDraft?.muscleGroup || 'Chest'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-950 text-gray-800 dark:text-white focus:outline-none focus:border-primary-accent"
                >
                  {muscleGroups.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Fitness level */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Fitness Level</label>
                <select 
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-950 text-gray-800 dark:text-white focus:outline-none focus:border-primary-accent"
                >
                  <option value="beginner">Beginner (1-3 sets, focus on form)</option>
                  <option value="intermediate">Intermediate (3-4 sets, progressive load)</option>
                  <option value="advanced">Advanced (4-5 sets, high intensity)</option>
                </select>
              </div>

              {/* Equipment checklist + Scanner */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Available Equipment</label>
                  <label className="cursor-pointer flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                    <Camera size={11} />
                    {isDetectingEquipment ? 'Scanning...' : 'Scan Gym space'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleScanEquipment} 
                      disabled={isDetectingEquipment}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  {equipmentTypes.map(eq => {
                    const checked = selectedEquipment.includes(eq);
                    return (
                      <label key={eq} className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-350 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedEquipment(selectedEquipment.filter(e => e !== eq));
                            } else {
                              setSelectedEquipment([...selectedEquipment, eq]);
                            }
                          }}
                          className="rounded text-emerald-500 focus:ring-emerald-400"
                        />
                        {eq}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pain awareness */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Pain or Soreness today?</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. lower back, knee"
                    value={currentPainInput}
                    onChange={(e) => setCurrentPainInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPainTag(); } }}
                    className="flex-1 px-3 py-2 border border-gray-250 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-gray-800 dark:text-white focus:outline-none focus:border-primary-accent"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddPainTag}
                    variant="outline"
                    className="py-2 px-4 text-xs font-bold"
                  >
                    Add
                  </Button>
                </div>
                {painFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {painFlags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-500/10 px-2.5 py-0.5 rounded-lg">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemovePainTag(tag)}
                          className="text-red-500 hover:text-red-700 p-0 border-none bg-transparent cursor-pointer font-bold leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-850 border-t border-gray-150/40 dark:border-gray-800/80 flex justify-end gap-2 shrink-0">
              <Button 
                onClick={() => setShowAiGenModal(false)}
                variant="outline"
                className="py-1.5 px-4 font-black text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const selectEl = document.getElementById('ai-muscle-select') as HTMLSelectElement;
                  const muscle = selectEl ? selectEl.value : 'Chest';
                  handleGenerateSession(muscle);
                }}
                disabled={isGeneratingWorkoutSession || selectedEquipment.length === 0}
                className="py-1.5 px-6 font-black text-xs bg-emerald-500 text-white hover:bg-emerald-600 border-none flex items-center gap-1.5"
              >
                {isGeneratingWorkoutSession ? 'Generating...' : 'Build Workout'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PLATEAU CHECK & DELOAD MODAL */}
      {showPlateauModal && plateauResult && (
        <div className="fixed inset-0 z-50 bg-black/45 dark:bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            <div className="p-6 overflow-y-auto space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                <AlertTriangle className={plateauResult.plateauDetected ? 'text-amber-550' : 'text-emerald-500'} size={20} />
                Plateau & Deload Analysis
              </h3>
              
              {plateauResult.plateauDetected ? (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">Plateau Warning</span>
                    <p className="text-xs font-bold text-gray-700 dark:text-slate-350 mt-1">
                      A plateau was detected on these exercises due to flat/declining volume over the past 3 sessions:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {plateauResult.affectedExercises.map((ex: string) => (
                        <span key={ex} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-extrabold border border-amber-500/20">{ex}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 leading-relaxed">
                    {plateauResult.recommendation}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <Check size={24} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">Routines are on track!</h4>
                  <p className="text-xs font-semibold text-gray-550 dark:text-slate-400 max-w-xs mx-auto">
                    No flat/declining progress detected across 3+ consecutive sessions. Continue pushing progressive overload.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-850 border-t border-gray-150/40 dark:border-gray-800/80 flex justify-end gap-2 shrink-0">
              <Button 
                onClick={() => setShowPlateauModal(false)}
                variant="outline"
                className="py-1.5 px-4 font-black text-xs"
              >
                Close
              </Button>
              {plateauResult.plateauDetected && plateauResult.suggestedDeloadWeek && (
                <Button 
                  onClick={handleLoadDeloadWeek}
                  className="py-1.5 px-6 font-black text-xs bg-amber-500 text-white hover:bg-amber-600 border-none"
                >
                  Load Deload Routine
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button (FAB) & Swappy popover */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end select-none">
        
        {/* Floating Chat Box */}
        {isFloatingChatOpen && (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl shadow-2xl w-[320px] sm:w-[360px] h-[450px] flex flex-col overflow-hidden mb-4 animate-scale-up border-emerald-500/10">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
                    💬
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wide">Swappy AI Assist</h4>
                  <span className="text-[9px] font-semibold text-emerald-100 block">Coach Online</span>
                </div>
              </div>
              <button 
                onClick={() => setIsFloatingChatOpen(false)}
                className="text-white/85 hover:text-white p-1 hover:bg-white/10 rounded-lg cursor-pointer border-none bg-transparent transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/20 flex flex-col" id="floating-chat-box">
              {chatMessages.map((m, idx) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div 
                    key={idx} 
                    className={`max-w-[85%] p-2.5 rounded-2xl text-[11px] font-semibold leading-relaxed
                      ${isAssistant 
                        ? 'bg-white dark:bg-slate-900 border border-gray-150/40 dark:border-gray-800/80 text-gray-800 dark:text-slate-350 self-start' 
                        : 'bg-emerald-500 text-white self-end shadow-sm'
                      }
                    `}
                  >
                    {m.content}
                  </div>
                );
              })}
              {isSendingMessage && (
                <div className="bg-white dark:bg-slate-900 border border-gray-150/40 dark:border-gray-800/80 text-gray-800 dark:text-slate-350 max-w-[85%] p-2.5 rounded-2xl text-[11px] font-semibold self-start flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Swappy is typing...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-2 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex gap-1.5 items-center shrink-0">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={!isBackendOnline ? 'Connect to chat' : 'Ask Swappy...'}
                disabled={!isBackendOnline || isSendingMessage}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white placeholder-gray-400"
              />
              <button 
                type="submit"
                disabled={!isBackendOnline || isSendingMessage || !chatInput.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-xl border-none flex items-center justify-center shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <Send size={12} />
              </button>
            </form>

          </div>
        )}

        {/* FAB Button */}
        <button 
          onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
          title="Chat with Swappy AI"
          className="w-12 h-12 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer transition-all duration-200 active:scale-95 border-none"
        >
          {isFloatingChatOpen ? (
            <X size={22} className="animate-fade-in" />
          ) : (
            <Bot size={22} className="animate-fade-in" />
          )}
        </button>

      </div>

    </div>
  );
}
