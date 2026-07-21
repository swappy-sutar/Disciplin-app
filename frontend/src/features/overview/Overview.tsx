import React, { useState } from 'react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { useTimetable } from '../../hooks/useTimetable';
import { useHabits } from '../../hooks/useHabits';
import { useGoals } from '../../hooks/useGoals';
import { useQuote } from '../../hooks/useQuote';
import { useTopics } from '../../hooks/useTopics';
import { useApplications } from '../../hooks/useApplications';
import { useStore } from '../../app/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadialProgress } from '../../components/ui/RadialProgress';
import { PillBadge } from '../../components/ui/PillBadge';
import { DotGrid } from '../../components/ui/DotGrid';
import { Modal } from '../../components/ui/Modal';
import { OverviewSkeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { CalendarPicker } from '../../components/ui/CalendarPicker';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Heart, 
  Plus, 
  Flame, 
  Trash2, 
  Clock, 
  PlusCircle, 
  Award,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
  Target,
  Activity,
  Briefcase,
  Edit2,
  Check,
  WifiOff,
  RotateCcw
} from 'lucide-react';

const formatTo12Hour = (timeStr?: string): string => {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

const calculateDurationInHours = (start?: string, end?: string): number => {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  if (endMinutes < startMinutes) {
    // If the slot crosses midnight (e.g. sleep 23:30 to 06:30)
    endMinutes += 24 * 60;
  }
  
  return (endMinutes - startMinutes) / 60;
};


export default function Overview() {
  const { 
    activeDate, 
    activeWeekStart, 
    setActiveDate,
    compareMode, 
    setCompareMode,
    addNotification
  } = useStore();

  const { t } = useTranslation();

  const handlePrevDay = () => {
    const prev = subDays(new Date(activeDate), 1);
    setActiveDate(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const next = addDays(new Date(activeDate), 1);
    setActiveDate(format(next, 'yyyy-MM-dd'));
  };
  
  // Queries
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary(activeDate);
  const { toggleLog } = useHabits();
  const { updateGoal, createGoal } = useGoals(activeWeekStart);
  const { updateBlock, createBlock, deleteBlock } = useTimetable(activeDate);
  const { toggleFavorite, addQuote } = useQuote();
  const { createTopic } = useTopics();
  const { createApplication, applications: dailyApps } = useApplications({ date: activeDate });

  // Modals Local State
  const [isTimetableCollapsed, setIsTimetableCollapsed] = useState(true);
  const [isAddTimetableOpen, setAddTimetableOpen] = useState(false);
  const [isAddGoalOpen, setAddGoalOpen] = useState(false);
  const [isAddAppOpen, setAddAppOpen] = useState(false);
  const [isAddTopicOpen, setAddTopicOpen] = useState(false);
  const [isAddQuoteOpen, setAddQuoteOpen] = useState(false);
  const [isFloatMenuOpen, setFloatMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete' | 'update';
    id: string;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form states
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00');
  const [newSlotCategory, setNewSlotCategory] = useState('Work');

  // Edit Timetable states
  const [isEditTimetableOpen, setEditTimetableOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [editSlotTitle, setEditSlotTitle] = useState('');
  const [editSlotStart, setEditSlotStart] = useState('09:00');
  const [editSlotEnd, setEditSlotEnd] = useState('10:00');
  const [editSlotCategory, setEditSlotCategory] = useState('Work');
  const [isUpdatingSlot, setUpdatingSlot] = useState(false);

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDueDay, setNewGoalDueDay] = useState('');

  const [newAppName, setNewAppName] = useState('');
  const [newAppRole, setNewAppRole] = useState('');
  const [newAppStatus, setNewAppStatus] = useState<'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected'>('Applied');
  const [newAppLink, setNewAppLink] = useState('');

  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');
  const [newTopicSubtopics, setNewTopicSubtopics] = useState<string>('');

  const [customQuoteText, setCustomQuoteText] = useState('');
  const [customQuoteAuthor, setCustomQuoteAuthor] = useState('');

  // Form submission loading states
  const [isSubmittingSlot, setSubmittingSlot] = useState(false);
  const [isSubmittingGoal, setSubmittingGoal] = useState(false);
  const [isSubmittingApp, setSubmittingApp] = useState(false);
  const [isSubmittingTopic, setSubmittingTopic] = useState(false);
  const [isSubmittingQuote, setSubmittingQuote] = useState(false);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (isError || !summary) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 md:p-6 select-none my-auto">
        <div className="max-w-md w-full bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl space-y-5 flex flex-col items-center justify-center mx-auto">
          {/* Glowing WifiOff Icon Pill */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <WifiOff size={28} className="animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Unable to Load Dashboard
            </h2>
            <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              We couldn't connect to the server. Please check your network connection and try again.
            </p>
          </div>

          <div className="w-full flex justify-center pt-1">
            <Button 
              onClick={() => refetch()}
              icon={<RotateCcw size={15} />}
              className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 shadow-md shadow-emerald-500/15 hover:scale-[1.02] active:scale-95 transition-all text-xs"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { timetable, progress, habits, weeklyGoals, topics, applications, quote } = summary;

  const focusBlocks = timetable;

  const completedFocusHours = focusBlocks
    .filter(b => b.isDone)
    .reduce((sum, b) => sum + calculateDurationInHours(b.startTime, b.endTime), 0);

  const totalFocusTarget = focusBlocks.reduce((sum, b) => sum + calculateDurationInHours(b.startTime, b.endTime), 0) || 8;

  // Handle Form Submissions
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTitle.trim()) return;
    setSubmittingSlot(true);
    try {
      await createBlock({
        title: `${newSlotTitle} [${newSlotCategory}]`,
        startTime: newSlotStart,
        endTime: newSlotEnd,
        date: activeDate,
      });
      setNewSlotTitle('');
      setAddTimetableOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleEditClick = (block: any) => {
    setEditingBlock(block);
    
    // Parse tag/category and title
    const hasTag = block.title.includes('[') && block.title.includes(']');
    let cleanTitle = block.title;
    let tag = 'Work';
    if (hasTag) {
      const match = block.title.match(/\[(.*?)\]/);
      tag = match ? match[1] : 'Work';
      cleanTitle = block.title.replace(/\[.*?\]/, '').trim();
    }
    
    setEditSlotTitle(cleanTitle);
    setEditSlotStart(block.startTime || '08:00');
    setEditSlotEnd(block.endTime || '09:00');
    setEditSlotCategory(tag);
    setEditTimetableOpen(true);
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock || !editSlotTitle.trim()) return;
    setUpdatingSlot(true);
    try {
      await updateBlock({
        id: editingBlock._id,
        body: {
          title: `${editSlotTitle} [${editSlotCategory}]`,
          startTime: editSlotStart,
          endTime: editSlotEnd,
        }
      });
      setEditTimetableOpen(false);
      setEditingBlock(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSlot(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setSubmittingGoal(true);
    try {
      await createGoal({
        title: newGoalTitle,
        dueDay: newGoalDueDay || undefined,
        weekStartDate: activeWeekStart,
      });
      setNewGoalTitle('');
      setNewGoalDueDay('');
      setAddGoalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppRole.trim()) return;
    setSubmittingApp(true);
    try {
      await createApplication({
        company: newAppName,
        role: newAppRole,
        status: newAppStatus,
        link: newAppLink || undefined,
        dateApplied: activeDate,
      });
      setNewAppName('');
      setNewAppRole('');
      setNewAppLink('');
      setAddAppOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicCategory.trim()) return;
    setSubmittingTopic(true);
    try {
      const subTopics = newTopicSubtopics
        .split('\n')
        .filter(line => line.trim())
        .map(line => ({ title: line.trim() }));
        
      await createTopic({
        title: newTopicTitle,
        category: newTopicCategory,
        subTopics,
      });
      setNewTopicTitle('');
      setNewTopicCategory('');
      setNewTopicSubtopics('');
      setAddTopicOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTopic(false);
    }
  };

  const handleAddCustomQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuoteText.trim()) return;
    setSubmittingQuote(true);
    try {
      await addQuote({
        text: customQuoteText,
        author: customQuoteAuthor || undefined,
      });
      setCustomQuoteText('');
      setCustomQuoteAuthor('');
      setAddQuoteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuote(false);
    }
  };

  // Check off date ranges
  const dateFormatted = format(parseISO(activeDate), 'EEEE, MMMM d, yyyy');

  // Calculate Habit Columns Map
  const weekdayShortNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const getWeekDays = () => {
    const monday = parseISO(activeWeekStart);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(monday, i);
      return format(d, 'yyyy-MM-dd');
    });
  };
  const weekDayDates = getWeekDays();

  return (
    <div className="space-y-6 md:space-y-8 select-none">
           {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {t.todayOverview}
          </h1>
          
          {/* Mobile date switcher pill */}
          <div className="flex items-center gap-1 mt-2.5 text-sm text-gray-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/50 border border-gray-150/50 dark:border-slate-800/50 rounded-xl px-2 py-1 max-w-fit shadow-sm">
            <button 
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer border-none bg-transparent shrink-0"
              aria-label="Previous day"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1.5 px-1.5 font-bold text-gray-800 dark:text-slate-200">
              <Calendar size={13} className="text-emerald-500/70" />
              <CalendarPicker dateRangeLabel={dateFormatted} align="left" />
            </div>
            <button 
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer border-none bg-transparent shrink-0"
              aria-label="Next day"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        
        {/* Toggle Comparison mode */}
        <div className="flex items-center justify-between md:justify-start gap-4 bg-white/60 dark:bg-slate-900/50 border border-gray-150/40 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-sm select-none transition-all duration-200 hover:border-gray-200 dark:hover:border-slate-700 w-full md:w-auto">
          <span className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest leading-none">
            Compare to Yesterday
          </span>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`w-12 h-6.5 rounded-full relative transition-all duration-355 focus:outline-none cursor-pointer select-none shrink-0 border-none
              ${compareMode ? 'bg-primary-blue shadow-sm shadow-emerald-500/20' : 'bg-gray-200 dark:bg-slate-800'}
            `}
          >
            <div 
              className={`w-5 h-5 rounded-full bg-white absolute top-0.75 shadow-sm transition-all duration-355
                ${compareMode ? 'left-6.25' : 'left-0.75'}
              `}
            />
          </button>
        </div>
      </div>

      {/* 3-Column Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        
        {/* ================= COLUMN 1 ================= */}
        <div className="contents md:block md:space-y-5">
          
          {/* Daily Timetable */}
          <Card 
            title={t.dailyTimetable} 
            className="order-1 md:order-none"
            icon={Calendar}
            iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
            showMenu={false} 
            headerAction={
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setAddTimetableOpen(true)}
                  className="p-1 rounded-lg text-primary-blue hover:bg-blue-50/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                  aria-label="Add slot"
                  title="Add new schedule slot"
                >
                  <PlusCircle size={19} />
                </button>
                {timetable.length > 4 && (
                  <button
                    onClick={() => setIsTimetableCollapsed(!isTimetableCollapsed)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label={isTimetableCollapsed ? "Expand schedule" : "Collapse schedule"}
                    title={isTimetableCollapsed ? `Show all ${timetable.length} slots` : "Collapse schedule (show 4)"}
                  >
                    {isTimetableCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                )}
              </div>
            }
          >
            {timetable.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center select-none">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Schedule is empty</span>
                <span className="text-[10px] text-gray-450 dark:text-slate-600 mt-0.5 font-semibold">Use the + button to plan your day</span>
              </div>
            ) : (
              <div>
                <div className="relative border-l border-slate-200 dark:border-slate-800/60 ml-4 pl-5 py-1.5 space-y-3.5">
                  {(isTimetableCollapsed ? timetable.slice(0, 4) : timetable).map((block) => {
                    const hasTag = block.title.includes('[') && block.title.includes(']');
                    let cleanTitle = block.title;
                    let tag = 'General';
                    if (hasTag) {
                      const match = block.title.match(/\[(.*?)\]/);
                      tag = match ? match[1] : 'General';
                      cleanTitle = block.title.replace(/\[.*?\]/, '').trim();
                    }

                    const tagColors: Record<string, string> = {
                      Health: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
                      Work: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
                      Study: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
                      Personal: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    };
                    const colorClass = tagColors[tag] || 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300';

                    return (
                      <div key={block._id} className="relative group flex items-start justify-between gap-2.5 p-1.5 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300">
                        {/* Interactive Timeline Tick Box / Circle Button */}
                        <button 
                          type="button"
                          onClick={() => setConfirmModal({
                            type: 'update',
                            id: block._id,
                            title: block.isDone ? 'Undo Completion' : 'Complete Schedule Block',
                            message: `Are you sure you want to mark the timetable block "${cleanTitle}" as ${!block.isDone ? 'completed' : 'incomplete'}?`,
                            onConfirm: () => {
                              updateBlock({ id: block._id, body: { isDone: !block.isDone } });
                              if (!block.isDone) {
                                toast.success(`You completed schedule block: "${cleanTitle}"!`);
                                addNotification('Schedule Block Completed! ⏰', `You finished: "${cleanTitle}"`, 'timetable');
                              }
                            }
                          })}
                          className={`absolute -left-[28.5px] top-[9px] w-[18px] h-[18px] rounded-full border-2 transition-all duration-300 flex items-center justify-center z-10 cursor-pointer focus:outline-none select-none
                            ${block.isDone 
                              ? 'border-emerald-500 bg-emerald-500 scale-110 shadow-md shadow-emerald-500/30' 
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-400 hover:scale-115 hover:shadow-sm'
                            }
                          `}
                          title={block.isDone ? 'Mark as incomplete' : 'Mark as completed'}
                          aria-label={block.isDone ? 'Mark slot incomplete' : 'Mark slot completed'}
                        >
                          {block.isDone ? (
                            <Check className="w-2.5 h-2.5 text-white stroke-[3.5] animate-scale-up" />
                          ) : (
                            <span className="w-1 h-1 rounded-full bg-transparent group-hover:bg-emerald-500/50 transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 dark:text-slate-400 select-none">
                              {formatTo12Hour(block.startTime)} - {formatTo12Hour(block.endTime)}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${colorClass}`}>
                              {tag}
                            </span>
                          </div>
                          <p className={`text-xs md:text-sm font-bold mt-1 select-none transition-colors truncate
                            ${block.isDone ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-700 dark:text-slate-200'}
                          `}>
                            {cleanTitle}
                          </p>
                        </div>

                        {/* Edit and delete actions */}
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(block)}
                            className="text-gray-400 hover:text-primary-blue dark:text-slate-400 dark:hover:text-primary-blue transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg cursor-pointer"
                            aria-label="Edit slot"
                            title="Edit slot"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmModal({
                              type: 'delete',
                              id: block._id,
                              title: 'Confirm Deletion',
                              message: `Are you sure you want to delete the schedule block "${cleanTitle}"? This action cannot be undone.`,
                              onConfirm: () => deleteBlock(block._id)
                            })}
                            className="text-gray-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50/60 dark:hover:bg-red-950/30 rounded-lg cursor-pointer"
                            aria-label="Delete slot"
                            title="Delete slot"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Show More / Show Less Toggle Button */}
                {timetable.length > 4 && (
                  <button
                    onClick={() => setIsTimetableCollapsed(!isTimetableCollapsed)}
                    className="w-full mt-3 pt-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60 select-none"
                  >
                    {isTimetableCollapsed ? (
                      <>
                        <span>Show {timetable.length - 4} More Slots</span>
                        <ChevronDown size={14} />
                      </>
                    ) : (
                      <>
                        <span>Show Less</span>
                        <ChevronUp size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Topics card */}
          <Card 
            title={t.topicsTitle}
            className="order-5 md:order-none"
            icon={BookOpen}
            iconColor="text-purple-500 bg-purple-500/10 border-purple-500/20"
            headerAction={
              <button 
                onClick={() => setAddTopicOpen(true)}
                className="text-xs font-bold text-primary-blue hover:underline cursor-pointer"
              >
                + Add Topic
              </button>
            }
          >
            {topics.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center select-none">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">No study topics</span>
                <span className="text-[10px] text-gray-450 dark:text-slate-600 mt-0.5 font-semibold">Track your learning in the Topics tab</span>
              </div>
            ) : (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div key={topic._id} className="p-2 -m-2 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all duration-300 space-y-1.5 border-b border-gray-100/50 dark:border-slate-800/30 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-205 truncate select-none">{topic.title}</span>
                      <PillBadge variant="orange" className="text-[10px] select-none uppercase tracking-wider scale-90">
                        {topic.category}
                      </PillBadge>
                    </div>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={topic.progressPercent} color="pink" className="flex-1" />
                      <span className="text-[10px] font-bold text-gray-400 select-none">{topic.progressPercent}%</span>
                    </div>
                  </div>
                ))}
                
                <Link to="/topics" className="block text-center mt-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-900/50 dark:hover:bg-slate-855 text-gray-600 dark:text-slate-300 text-xs font-bold py-2 rounded-xl transition-all border border-gray-100/50 dark:border-slate-800/50 shadow-sm">
                  Manage Topics
                </Link>
              </div>
            )}
          </Card>

          {/* Motivation Quote Card */}
          <div 
            className="order-7 md:order-none rounded-2xl p-6 text-white select-none relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 group"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)' }}
          >
            {/* Absolute vector quote indicator */}
            <div className="absolute right-4 bottom-0 text-white/10 text-[120px] font-bold pointer-events-none font-serif leading-none select-none transition-transform duration-550 group-hover:scale-110 group-hover:rotate-12">
              ”
            </div>
            
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
              Quote of the Day
            </span>
            <p className="text-base font-bold italic mt-3 leading-relaxed drop-shadow-sm select-none">
              "{quote.text}"
            </p>
            <p className="text-xs font-medium text-white/90 mt-2 select-none">
              — {quote.author}
            </p>
            
            <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/20 relative z-10">
              <button
                onClick={() => toggleFavorite({ quoteText: quote.text, isFavorite: !quote.isFavorite })}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Heart size={14} fill={quote.isFavorite ? '#FFFFFF' : 'none'} />
                {quote.isFavorite ? 'Favorited' : 'Favorite'}
              </button>
              
              <button
                onClick={() => setAddQuoteOpen(true)}
                className="text-[11px] font-semibold hover:underline cursor-pointer text-white/90"
              >
                + Add Custom Quote
              </button>
            </div>
          </div>

        </div>

        {/* ================= COLUMN 2 ================= */}
        <div className="contents md:block md:space-y-5">
          
          {/* Habit Tracker */}
          <Card 
            title={t.habitTracker} 
            className="order-3 md:order-none"
            icon={CheckCircle}
            iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            subtitle="Today's habit compliance"
            headerAction={
              <Link to="/habits" className="text-xs font-bold text-primary-blue hover:underline">
                View All Habits
              </Link>
            }
          >
            {/* Streak Indicator */}
            <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between mb-4 border border-emerald-100/30">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500 text-white animate-pulse">
                  <Flame size={16} />
                </div>
                <span className="text-xs font-semibold text-emerald-800 select-none">Weekly Habit Consistency</span>
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Active Run</span>
            </div>

            {habits.list.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center select-none">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">No active habits</span>
                <span className="text-[10px] text-gray-450 dark:text-slate-600 mt-0.5 font-semibold">Build consistency in the Habits tab</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header days */}
                <div className="grid grid-cols-[1fr_repeat(7,30px)] gap-1 text-center font-bold text-[11px] text-gray-400 dark:text-slate-500 border-b border-gray-100/50 dark:border-slate-800/40 pb-2">
                  <div className="text-left font-medium select-none">Habit</div>
                  {weekdayShortNames.map((day, idx) => (
                    <div key={idx}>{day}</div>
                  ))}
                </div>
                
                {/* Habits list */}
                {habits.list.slice(0, 3).map((habit: any) => (
                  <div key={habit._id} className="grid grid-cols-[1fr_repeat(7,30px)] gap-1 items-center p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all duration-300">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300 truncate select-none">{habit.name}</span>
                    {weekDayDates.map((dateStr, idx) => {
                      const isLogged = (habits.logs || []).some(l => l.habitId === habit._id && l.date === dateStr && l.isDone);
                      return (
                        <div key={idx} className="flex justify-center">
                           <Checkbox
                             checked={isLogged}
                             color={habit.color}
                             size={18}
                             onChange={(checked) => setConfirmModal({
                               type: 'update',
                               id: `${habit._id}-${dateStr}`,
                               title: checked ? 'Complete Habit' : 'Undo Habit Logging',
                               message: `Are you sure you want to mark "${habit.name}" as ${checked ? 'completed' : 'incomplete'}?`,
                               onConfirm: () => {
                                 toggleLog({ habitId: habit._id, date: dateStr, isDone: checked });
                                 if (checked) {
                                   toast.success(`You completed habit: "${habit.name}"!`);
                                   addNotification('Habit Completed! 💪', `Logged: "${habit.name}"`, 'habit');
                                 }
                               }
                              })}
                           />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Application Tracker */}
          <Card 
            title={t.applicationsTitle}
            className="order-6 md:order-none"
            icon={Briefcase}
            iconColor="text-gray-600 bg-gray-500/10 border-gray-500/20 dark:text-slate-400 dark:bg-slate-900/30 dark:border-slate-800/80"
            headerAction={
              <button 
                onClick={() => setAddAppOpen(true)}
                className="text-xs font-bold text-primary-blue hover:underline cursor-pointer"
              >
                + Log App
              </button>
            }
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-1 select-none">
                <span className="text-3xl font-black text-gray-900 leading-none">{applications.todayCount}/20</span>
                <span className="text-xs text-gray-400 font-semibold select-none">Applied today</span>
              </div>
              
              <PillBadge trend={applications.todayCount > 0 ? "up" : "none"}>
                {applications.todayCount > 0 ? `+${applications.todayCount} today` : `+${applications.weeklyCount} this week`}
              </PillBadge>
            </div>

            {/* Sequential dot grids */}
            <div className="mb-5 border-b border-gray-50 pb-4">
              <DotGrid value={applications.todayCount} target={applications.todayTarget} />
            </div>

            {/* Micro list applications */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 select-none">
                Recent Applications
              </span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/50 dark:border-slate-800/40 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-1.5 font-semibold">Company</th>
                    <th className="pb-1.5 font-semibold">Role</th>
                    <th className="pb-1.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/30 dark:divide-slate-800/20">
                  {!dailyApps || dailyApps.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5 select-none">
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">No applications logged</span>
                          <span className="text-[10px] text-gray-450 dark:text-slate-600 mt-0.5 font-semibold">Keep record of your job applications</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dailyApps.map((app, idx) => {
                      const statusColorMap: Record<string, string> = {
                        Applied: 'gray',
                        OA: 'orange',
                        Interview: 'blue',
                        Offer: 'green',
                        Rejected: 'red'
                      };
                      const color = statusColorMap[app.status] || 'gray';
                      return (
                        <tr key={app._id || idx} className="text-xs text-gray-750 dark:text-slate-305 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-2.5 font-bold select-none">{app.company}</td>
                          <td className="py-2.5 font-medium text-gray-500 select-none">{app.role}</td>
                          <td className="py-2.5 text-right select-none">
                            <PillBadge variant={color as any}>
                              {app.status}
                            </PillBadge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

        {/* ================= COLUMN 3 ================= */}
        <div className="contents md:block md:space-y-5">
          
          {/* Day Progress Tracker */}
          <Card 
            title={t.completionRate}
            className="order-2 md:order-none"
            icon={Activity}
            iconColor="text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
          >
            <div className="flex flex-col items-center py-2">
              <RadialProgress 
                percentage={progress.todayPercent} 
                trend={progress.delta >= 0 ? `▲ +${progress.delta}%` : `▼ ${progress.delta}%`}
                subtext="Timetable Completion"
              />
              
              <div className="w-full mt-6 pt-5 border-t border-gray-100/50 dark:border-slate-800/40 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-slate-400 font-semibold select-none">
                  <span>Focus Hours</span>
                  <span>{completedFocusHours.toFixed(1)} / {totalFocusTarget.toFixed(1)} hrs</span>
                </div>
                <ProgressBar value={completedFocusHours} max={totalFocusTarget} color="blue" />
              </div>
            </div>
          </Card>

          {/* Weekly Goals */}
          <Card 
            title={t.goalsTitle} 
            className="order-4 md:order-none"
            icon={Target}
            iconColor="text-pink-500 bg-pink-500/10 border-pink-500/20"
            headerAction={
              <button 
                onClick={() => setAddGoalOpen(true)}
                className="text-xs font-bold text-primary-blue hover:underline cursor-pointer"
              >
                + Add Goal
              </button>
            }
          >
            {weeklyGoals.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center select-none">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">No weekly goals</span>
                <span className="text-[10px] text-gray-450 dark:text-slate-600 mt-0.5 font-semibold">Set targets using the Add Goal button</span>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Completed Fraction Badge */}
                <div className="flex justify-between items-center select-none">
                  <span className="text-xs text-gray-400 font-bold">Goal Status</span>
                  <PillBadge variant="blue">
                    {weeklyGoals.filter(g => g.isDone).length}/{weeklyGoals.length} Done
                  </PillBadge>
                </div>
                
                {/* Goals Checklist list */}
                <div className="space-y-3 pt-3 border-t border-gray-100/50 dark:border-slate-800/40">
                  {weeklyGoals.map((goal) => (
                    <div key={goal._id} className="p-2 -m-2 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all duration-300 flex items-start gap-3 justify-between">
                      <div className="flex items-start gap-2.5">
                         <Checkbox 
                           checked={goal.isDone} 
                           onChange={(done) => {
                             updateGoal({ id: goal._id, body: { isDone: done } });
                             if (done) {
                               const hasTag = goal.title.includes('[') && goal.title.includes(']');
                               const cleanTitle = hasTag 
                                 ? goal.title.replace(/\[.*?\]/, '').trim() 
                                 : goal.title;
                               toast.success(`You completed goal: "${cleanTitle}"!`);
                               addNotification('Goal Completed! 🎯', `You finished: "${cleanTitle}"`, 'goal');
                             }
                           }}
                           size={17}
                         />
                        <div>
                          <p className={`text-xs font-bold leading-normal select-none transition-colors
                            ${goal.isDone ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-700 dark:text-slate-200'}
                          `}>
                            {goal.title}
                          </p>
                          {goal.dueDay && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-pink-500 dark:text-pink-400 mt-0.5 block select-none">
                              Due {goal.dueDay}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="pt-4 border-t border-gray-100/50 dark:border-slate-800/40">
                  <ProgressBar 
                    value={weeklyGoals.filter(g => g.isDone).length} 
                    max={weeklyGoals.length} 
                    showLabel 
                    labelText="Overall Progress" 
                    color="blue"
                  />
                </div>

              </div>
            )}
          </Card>

        </div>

      </div>

      {/* Persistent Floating Plus Action Trigger */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40 select-none flex items-center">
        <div className="relative flex items-center">
          {isFloatMenuOpen && (
            <div className="absolute right-full mr-3.5 bottom-0 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 min-w-[200px] flex flex-col gap-1 transition-all duration-300 animate-scale-up z-50">
              <button
                onClick={() => { setAddTimetableOpen(true); setFloatMenuOpen(false); }}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer flex items-center gap-2.5 transition-colors"
              >
                <Clock size={14} className="text-blue-500" />
                Add Timetable Block
              </button>
              <button
                onClick={() => { setAddGoalOpen(true); setFloatMenuOpen(false); }}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer flex items-center gap-2.5 transition-colors"
              >
                <PlusCircle size={14} className="text-emerald-500" />
                Add Weekly Goal
              </button>
              <button
                onClick={() => { setAddAppOpen(true); setFloatMenuOpen(false); }}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer flex items-center gap-2.5 transition-colors"
              >
                <Award size={14} className="text-purple-500" />
                Log Application
              </button>
              <button
                onClick={() => { setAddTopicOpen(true); setFloatMenuOpen(false); }}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer flex items-center gap-2.5 transition-colors"
              >
                <BookOpen size={14} className="text-pink-500" />
                Add Study Topic
              </button>
            </div>
          )}
          <button
            onClick={() => setFloatMenuOpen(!isFloatMenuOpen)}
            className="w-12 h-12 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer transition-transform duration-200 active:scale-95"
            aria-label="Add metric floating menu"
          >
            {isFloatMenuOpen ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>
      </div>

      {/* ================= MODAL CONTROLLERS ================= */}
      
      {/* Add Timetable Modal */}
      <Modal isOpen={isAddTimetableOpen} onClose={() => setAddTimetableOpen(false)} title="Add Timetable Block">
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
            <input 
              type="text" 
              placeholder="e.g. Design Sync"
              value={newSlotTitle}
              onChange={e => setNewSlotTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Time</label>
              <input 
                type="time" 
                value={newSlotStart}
                onChange={e => setNewSlotStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">End Time</label>
              <input 
                type="time" 
                value={newSlotEnd}
                onChange={e => setNewSlotEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={newSlotCategory}
              onChange={e => setNewSlotCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
            >
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2" disabled={isSubmittingSlot}>
            {isSubmittingSlot ? 'Creating...' : 'Add Block'}
          </Button>
        </form>
      </Modal>

      {/* Edit Timetable Modal */}
      <Modal isOpen={isEditTimetableOpen} onClose={() => setEditTimetableOpen(false)} title="Edit Timetable Block">
        <form onSubmit={handleUpdateSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
            <input 
              type="text" 
              placeholder="e.g. Design Sync"
              value={editSlotTitle}
              onChange={e => setEditSlotTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Time</label>
              <input 
                type="time" 
                value={editSlotStart}
                onChange={e => setEditSlotStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">End Time</label>
              <input 
                type="time" 
                value={editSlotEnd}
                onChange={e => setEditSlotEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={editSlotCategory}
              onChange={e => setEditSlotCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-255 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-blue bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
            >
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2" disabled={isUpdatingSlot}>
            {isUpdatingSlot ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
      </Modal>

      {/* Add Goal Modal */}
      <Modal isOpen={isAddGoalOpen} onClose={() => setAddGoalOpen(false)} title="Add Weekly Goal">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goal Description</label>
            <input 
              type="text" 
              placeholder="e.g. Finish portfolio wireframes"
              value={newGoalTitle}
              onChange={e => setNewGoalTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Due Day (Optional)</label>
            <select
              value={newGoalDueDay}
              onChange={e => setNewGoalDueDay(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
            >
              <option value="">No specific day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2" disabled={isSubmittingGoal}>
            {isSubmittingGoal ? 'Adding...' : 'Add Weekly Goal'}
          </Button>
        </form>
      </Modal>

      {/* Log Application Modal */}
      <Modal isOpen={isAddAppOpen} onClose={() => setAddAppOpen(false)} title="Log Job Application">
        <form onSubmit={handleAddApplication} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Company</label>
              <input 
                type="text" 
                placeholder="Google"
                value={newAppName}
                onChange={e => setNewAppName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role</label>
              <input 
                type="text" 
                placeholder="Frontend Dev"
                value={newAppRole}
                onChange={e => setNewAppRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Job Posting URL (Optional)</label>
            <input 
              type="url" 
              placeholder="https://google.com/jobs"
              value={newAppLink}
              onChange={e => setNewAppLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
            <select
              value={newAppStatus}
              onChange={e => setNewAppStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
            >
              <option value="Applied">Applied</option>
              <option value="OA">OA</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2" disabled={isSubmittingApp}>
            {isSubmittingApp ? 'Logging...' : 'Log Application'}
          </Button>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal isOpen={isAddTopicOpen} onClose={() => setAddTopicOpen(false)} title="Add Study Topic">
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Topic Name</label>
              <input 
                type="text" 
                placeholder="e.g. Graph Algorithms"
                value={newTopicTitle}
                onChange={e => setNewTopicTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <input 
                type="text" 
                placeholder="e.g. DSA or Frontend"
                value={newTopicCategory}
                onChange={e => setNewTopicCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sub-topics (One per line)</label>
            <textarea
              placeholder="BFS traversal&#10;DFS traversal&#10;Dijkstra's search"
              rows={4}
              value={newTopicSubtopics}
              onChange={e => setNewTopicSubtopics(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
            />
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2" disabled={isSubmittingTopic}>
            {isSubmittingTopic ? 'Adding...' : 'Add Topic'}
          </Button>
        </form>
      </Modal>

      {/* Add Quote Modal */}
      <Modal isOpen={isAddQuoteOpen} onClose={() => setAddQuoteOpen(false)} title="Add Custom Quote">
        <form onSubmit={handleAddCustomQuote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Quote Text</label>
            <input 
              type="text" 
              placeholder="e.g. Focus is a superpower."
              value={customQuoteText}
              onChange={e => setCustomQuoteText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Author (Optional)</label>
            <input 
              type="text" 
              placeholder="Unknown"
              value={customQuoteAuthor}
              onChange={e => setCustomQuoteAuthor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue"
            />
          </div>
          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2" disabled={isSubmittingQuote}>
            {isSubmittingQuote ? 'Adding...' : 'Add Custom Quote'}
          </Button>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.title || 'Confirm Action'}
      >
        <div className="space-y-5 py-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
            {confirmModal?.message}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmModal(null)}
              className="font-bold border-slate-200 dark:border-slate-800 dark:hover:bg-slate-900 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              className={`font-bold text-white transition-all hover:scale-105 active:scale-95 duration-150 ${
                confirmModal?.type === 'delete' 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-500/10' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/10'
              }`}
              onClick={() => {
                if (confirmModal) {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }
              }}
            >
              {confirmModal?.type === 'delete' ? 'Delete' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
