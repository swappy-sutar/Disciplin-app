import React, { useState } from 'react';
import { useHabits } from '../../hooks/useHabits';
import { useStore } from '../../app/store';
import { notifySuccessCelebration } from '../../utils/celebration';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadialProgress } from '../../components/ui/RadialProgress';
import { Modal } from '../../components/ui/Modal';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { BarChart } from '../../components/charts/BarChart';
import { StepChart } from '../../components/charts/StepChart';
import { format, parseISO, addDays, endOfWeek } from 'date-fns';
import { 
  Flame, 
  CheckSquare, 
  Plus, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export default function Habits() {
  const { activeDate, activeWeekStart, setActiveWeekStart, addNotification } = useStore();
  const [isAddOpen, setAddOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#3B82F6');
  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete' | 'update';
    id: string;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Calculate week start and end range strings
  const weekStart = parseISO(activeWeekStart);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  // Queries
  const { habits, logs, isLoading, createHabit, toggleLog, deleteHabit } = useHabits(weekStartStr, weekEndStr);

  const colorsOption = [
    '#3B82F6', // primary-blue
    '#10B981', // success-green
    '#EC4899', // attention-pink
    '#F59E0B', // warning-orange
    '#8B5CF6', // purple
    '#EF4444', // red
    '#111827'  // dark gray
  ];

  if (isLoading) {
    return <PageSkeleton cards={4} rows={5} />;
  }

  // Calculate days offset list
  const getDays = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(weekStart, i);
      return {
        dateStr: format(d, 'yyyy-MM-dd'),
        label: format(d, 'EEE').toUpperCase().substring(0, 3), // e.g. MON
        labelChar: format(d, 'EEE').substring(0, 1), // e.g. M
        isToday: format(d, 'yyyy-MM-dd') === activeDate
      };
    });
  };
  const weekDays = getDays();

  // Streaks stats
  const activeCount = habits.filter(h => h.isActive).length;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  
  // Calculate Today's completion %
  const todayLogs = logs.filter(l => l.date === activeDate && l.isDone).length;
  const todayProgress = activeCount > 0 ? Math.round((todayLogs / activeCount) * 100) : 0;

  // Calculate Weekly Average Completion
  const totalPossible = activeCount * 7;
  const thisWeekLogs = logs.filter(l => l.isDone).length;
  const weeklyAverage = totalPossible > 0 ? Math.round((thisWeekLogs / totalPossible) * 100) : 0;

  // Calculate Weekly Bar Chart data (habit completion rate % per day)
  const barChartData = weekDays.map(day => {
    const dayLogs = logs.filter(l => l.date === day.dateStr && l.isDone).length;
    const rate = activeCount > 0 ? Math.round((dayLogs / activeCount) * 100) : 0;
    return {
      label: day.labelChar,
      value: rate
    };
  });

  // Habit Breakdown completions rate
  const getHabitBreakdown = () => {
    return habits.map(h => {
      const habitLogs = logs.filter(l => l.habitId === h._id && l.isDone).length;
      const rate = habitLogs > 0 ? Math.min(100, Math.round((habitLogs / 7) * 100)) : 0;
      
      return {
        name: h.name,
        color: h.color,
        value: rate
      };
    }).sort((a, b) => b.value - a.value);
  };
  const habitBreakdown = getHabitBreakdown();

  // Weekly consistency step-trend
  const consistencyTrendData = [
    { label: 'W1', value: 45 },
    { label: 'W2', value: 55 },
    { label: 'W3', value: 65 },
    { label: 'W4', value: 75 },
    { label: 'W5', value: 75 },
    { label: 'W6', value: 85 }
  ];

  const handlePrevWeek = () => {
    const prev = addDays(weekStart, -7);
    setActiveWeekStart(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    const next = addDays(weekStart, 7);
    setActiveWeekStart(format(next, 'yyyy-MM-dd'));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await createHabit({ name: newHabitName, color: newHabitColor });
    setNewHabitName('');
    setAddOpen(false);
  };

  const weekRangeLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
            Habit Tracker
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-2 select-none">
            Track your daily systems and build long-term consistency.
          </p>
        </div>
        <Button 
          icon={<Plus size={16} />} 
          onClick={() => setAddOpen(true)}
          className="md:self-center select-none"
        >
          Add Habit
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 select-none">

        {/* Today's Progress */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border border-emerald-500/20 dark:border-emerald-500/15 shadow-lg shadow-emerald-500/5">
          {/* top color accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl" />
          {/* glow blob */}
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-0.5 relative">
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Today's Progress</span>
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight mt-1">{todayProgress}<span className="text-lg">%</span></span>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">{todayLogs} of {activeCount} done</span>
          </div>
          <div className="absolute bottom-3 right-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full" />
              <RadialProgress percentage={todayProgress} size={46} strokeWidth={5} showLabel={false} color="green" />
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border border-orange-500/20 dark:border-orange-500/15 shadow-lg shadow-orange-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-rose-400 rounded-t-2xl" />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-0.5 relative">
            <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest">Longest Streak</span>
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight mt-1">{longestStreak}<span className="text-base font-bold text-gray-400 dark:text-slate-500 ml-1">Days</span></span>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">Best personal record</span>
          </div>
          <div className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/10 dark:from-orange-500/25 dark:to-rose-500/15 border border-orange-500/15">
            <Flame size={18} fill="currentColor" className="text-orange-500 animate-pulse" />
          </div>
        </div>

        {/* Active Habits */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border border-primary-blue/20 dark:border-primary-blue/15 shadow-lg shadow-primary-blue/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-blue to-indigo-400 rounded-t-2xl" />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary-blue/10 dark:bg-primary-blue/15 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-0.5 relative">
            <span className="text-[9px] font-bold text-primary-blue dark:text-emerald-400 uppercase tracking-widest">Active Habits</span>
            <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight mt-1">{activeCount}<span className="text-base font-bold text-gray-400 dark:text-slate-500 ml-1">Active</span></span>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">Habits in progress</span>
          </div>
          <div className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-gradient-to-br from-primary-blue/20 to-indigo-500/10 dark:from-primary-blue/25 dark:to-indigo-500/15 border border-primary-blue/15">
            <CheckSquare size={18} className="text-primary-blue" />
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border border-violet-500/20 dark:border-violet-500/15 shadow-lg shadow-violet-500/5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 rounded-t-2xl" />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start w-full relative">
            <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">This Week</span>
            <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">{weeklyAverage}%</span>
          </div>
          <div className="w-full mt-2 relative">
            <BarChart data={barChartData} height={54} color="#10B981" showYAxis={false} showXAxis={true} />
          </div>
        </div>

      </div>


      {/* Main Weekly Consistency Card */}
      <Card 
        title="Weekly Consistency"
        headerAction={
          <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-slate-900/60 border border-gray-150/70 dark:border-slate-800 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 dark:text-slate-350 shadow-inner select-none">
            <button 
              onClick={handlePrevWeek}
              className="p-1 rounded-full hover:bg-white dark:hover:bg-slate-850 hover:shadow-sm text-gray-500 dark:text-slate-400 hover:text-emerald-500 transition-all cursor-pointer border-none bg-transparent"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold px-1 text-gray-800 dark:text-slate-200">{weekRangeLabel}</span>
            <button 
              onClick={handleNextWeek}
              className="p-1 rounded-full hover:bg-white dark:hover:bg-slate-850 hover:shadow-sm text-gray-500 dark:text-slate-400 hover:text-emerald-500 transition-all cursor-pointer border-none bg-transparent"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider">
                <th className="pb-3 text-left font-bold text-gray-400 dark:text-slate-500 pl-2">Habit Name</th>
                {weekDays.map((day, idx) => (
                  <th 
                    key={idx} 
                    className={`pb-3 text-center font-bold px-2
                      ${day.isToday 
                        ? 'bg-emerald-500/[0.06] dark:bg-emerald-400/[0.06] border-x border-t border-emerald-500/20 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                        : 'text-gray-400 dark:text-slate-500'
                      }
                    `}
                  >
                    {day.isToday ? (
                      <span className="inline-block py-0.5 px-2 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-wider border border-emerald-500/20 dark:border-emerald-400/20 select-none shadow-sm animate-pulse">
                        {day.label}
                      </span>
                    ) : (
                      day.label
                    )}
                  </th>
                ))}
                <th className="pb-3 text-right font-bold text-gray-400 dark:text-slate-500 pr-2">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400 text-xs select-none font-medium">
                    No habits logged. Click "Add Habit" to get started!
                  </td>
                </tr>
              ) : (
                habits.map((habit, hIdx) => (
                  <tr key={habit._id} className="text-xs text-gray-700 dark:text-slate-350 hover:bg-gray-50/20 dark:hover:bg-slate-800/25 transition-colors group">
                    <td className="py-3.5 font-bold select-none">
                      <div className="flex items-center justify-between group-hover:translate-x-0.5 transition-transform duration-200 pl-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                          <span className="font-bold text-gray-900 dark:text-slate-200">{habit.name}</span>
                        </div>
                        <button 
                          onClick={() => setConfirmModal({
                            type: 'delete',
                            id: habit._id,
                            title: 'Confirm Deletion',
                            message: `Are you sure you want to delete the habit "${habit.name}"? This action cannot be undone.`,
                            onConfirm: () => deleteHabit(habit._id)
                          })}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 cursor-pointer border-none bg-transparent"
                          aria-label={`Delete ${habit.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                    
                    {weekDays.map((day, idx) => {
                      const isLogged = logs.some(l => l.habitId === habit._id && l.date === day.dateStr && l.isDone);
                      const isLastRow = hIdx === habits.length - 1;
                      return (
                        <td 
                          key={idx} 
                          className={`py-3.5 text-center transition-colors duration-200
                            ${day.isToday 
                              ? `bg-emerald-500/[0.06] dark:bg-emerald-400/[0.06] border-x border-emerald-500/20 dark:border-emerald-400/20 px-2 ${isLastRow ? 'border-b border-emerald-500/20 dark:border-emerald-400/20 rounded-b-xl' : ''}` 
                              : ''
                            }
                          `}
                        >
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={isLogged} 
                              color={habit.color}
                              size={20}
                              onChange={(checked) => setConfirmModal({
                                type: 'update',
                                id: `${habit._id}-${day.dateStr}`,
                                title: checked ? 'Complete Habit' : 'Undo Habit Logging',
                                message: `Are you sure you want to mark "${habit.name}" as ${checked ? 'completed' : 'incomplete'} for ${day.label}?`,
                                onConfirm: () => {
                                  toggleLog({ habitId: habit._id, date: day.dateStr, isDone: checked });
                                  if (checked) {
                                    notifySuccessCelebration(`You completed habit: "${habit.name}"!`);
                                    addNotification('Habit Completed! 💪', `Logged: "${habit.name}"`, 'habit');
                                  }
                                }
                              })}
                            />
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3.5 text-right font-bold text-gray-700 dark:text-slate-350 pr-2 select-none flex items-center justify-end gap-2.5">
                      {/* Streak flame count pill badge */}
                      {habit.currentStreak > 0 ? (
                        <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold select-none shadow-sm shrink-0 border border-orange-500/10">
                          <Flame size={11} fill="currentColor" className="animate-pulse" />
                          <span>{habit.currentStreak} d</span>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-gray-300 dark:text-slate-600 select-none mr-2">-</div>
                      )}
                      
                      {/* Mini sparkline indicator */}
                      <svg className="w-12 h-6 text-gray-300 opacity-80" viewBox="0 0 40 16">
                        <path
                          d={habit.currentStreak > 0 
                            ? `M 0 14 Q 10 ${14 - Math.min(12, habit.currentStreak * 2)} 20 ${8 - Math.min(6, habit.currentStreak)} T 40 ${isLoggedToday(logs, habit._id, activeDate) ? 2 : 14}`
                            : `M 0 14 Q 10 14 20 14 T 40 14`
                          }
                          fill="none"
                          stroke={habit.color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 3px ${habit.color}66)` }}
                        />
                      </svg>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grid for habit breakdowns and trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start select-none">
        
        {/* Habit Breakdown list */}
        <Card title="Habit Breakdown" subtitle="Completion rate for current week">
          <div className="space-y-4">
            {habitBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{item.value}%</span>
                </div>
                <ProgressBar value={item.value} color="custom" customColorHex={item.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Consistency trend */}
        <Card title="Consistency Trend" subtitle="Rolling 6 weeks habit completion">
          <div className="pt-2">
            <StepChart data={consistencyTrendData} height={200} color="#8B5CF6" />
          </div>
        </Card>

      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setAddOpen(false)} title="Add New Habit">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Habit Name</label>
            <input 
              type="text" 
              placeholder="e.g. Read 15 pages"
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Accent Color</label>
            <div className="flex items-center gap-2.5 mt-2">
              {colorsOption.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewHabitColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer
                    ${newHabitColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}
                  `}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2">Create Habit</Button>
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

// Sparkline helper
const isLoggedToday = (logs: any[], habitId: string, today: string) => {
  return logs.some(l => l.habitId === habitId && l.date === today && l.isDone);
};

// Trash icon
const Trash2: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);
