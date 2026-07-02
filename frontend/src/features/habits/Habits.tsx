import React, { useState } from 'react';
import { useHabits } from '../../hooks/useHabits';
import { useStore } from '../../app/store';
import { notifySuccessCelebration } from '../../utils/celebration';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadialProgress } from '../../components/ui/RadialProgress';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';
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
    return <div className="p-8 text-center text-gray-500 select-none animate-pulse">Loading habits tracker...</div>;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        
        {/* Today's Progress Radial */}
        <Card className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Progress</span>
            <span className="text-[28px] font-bold text-gray-900 mt-1 select-none leading-none tracking-tight">{todayProgress}%</span>
          </div>
          <RadialProgress percentage={todayProgress} size={64} strokeWidth={6} />
        </Card>

        {/* Longest streak */}
        <StatCard 
          label="Longest Streak" 
          value={`${longestStreak} Days`} 
          icon={<Flame size={20} />} 
          iconBgColor="bg-orange-50 text-orange-500 animate-pulse"
        />

        {/* Active tracking */}
        <StatCard 
          label="Active Habits" 
          value={`${activeCount} Tracker`} 
          icon={<CheckSquare size={20} />} 
          iconBgColor="bg-blue-50 text-primary-blue"
        />

        {/* Weekly Bar Chart Mini */}
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">This Week</span>
          <div className="h-10 w-full">
            <BarChart data={barChartData} height={50} color="#3B82F6" />
          </div>
        </Card>

      </div>

      {/* Main Weekly Consistency Card */}
      <Card 
        title="Weekly Consistency"
        headerAction={
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-full px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-slate-350 shadow-sm select-none">
            <button 
              onClick={handlePrevWeek}
              className="p-1 rounded-full hover:bg-white dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-semibold px-1">{weekRangeLabel}</span>
            <button 
              onClick={handleNextWeek}
              className="p-1 rounded-full hover:bg-white dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800/80 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-3 text-left font-semibold">Habit Name</th>
                {weekDays.map((day, idx) => (
                  <th 
                    key={idx} 
                    className={`pb-3 text-center font-semibold 
                      ${day.isToday ? 'bg-emerald-500/5 dark:bg-emerald-500/10 rounded-t-2xl text-emerald-600 dark:text-emerald-400 font-bold px-2' : ''}
                    `}
                  >
                    {day.label}
                  </th>
                ))}
                <th className="pb-3 text-right font-semibold pr-2">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400 text-xs select-none">
                    No habits logged. Click "Add Habit" to get started!
                  </td>
                </tr>
              ) : (
                habits.map((habit, hIdx) => (
                  <tr key={habit._id} className="text-xs text-gray-700 dark:text-slate-350 hover:bg-gray-50/20 dark:hover:bg-slate-800/25 transition-colors group">
                    <td className="py-3.5 font-bold flex items-center justify-between select-none">
                      <span>{habit.name}</span>
                      <button 
                        onClick={() => setConfirmModal({
                          type: 'delete',
                          id: habit._id,
                          title: 'Confirm Deletion',
                          message: `Are you sure you want to delete the habit "${habit.name}"? This action cannot be undone.`,
                          onConfirm: () => deleteHabit(habit._id)
                        })}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        aria-label={`Delete ${habit.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                    
                    {weekDays.map((day, idx) => {
                      const isLogged = logs.some(l => l.habitId === habit._id && l.date === day.dateStr && l.isDone);
                      const isLastRow = hIdx === habits.length - 1;
                      return (
                        <td 
                          key={idx} 
                          className={`py-3.5 text-center 
                            ${day.isToday ? `bg-emerald-500/5 dark:bg-emerald-500/10 px-2 ${isLastRow ? 'rounded-b-2xl' : ''}` : ''}
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

                    <td className={`py-3.5 text-right font-bold text-gray-700 dark:text-slate-350 pr-2 select-none flex items-center justify-end gap-1.5`}>
                      {/* Streak flame count */}
                      {habit.currentStreak > 0 && (
                        <div className="flex items-center text-orange-500 gap-0.5 scale-90">
                          <Flame size={14} fill="#F59E0B" />
                          <span>{habit.currentStreak}</span>
                        </div>
                      )}
                      
                      {/* Mini sparkline indicator */}
                      <svg className="w-10 h-4 text-gray-300" viewBox="0 0 40 16">
                        <path
                          d={`M 0 ${16 - habit.currentStreak * 0.5} Q 10 ${10 - habit.currentStreak} 20 8 T 40 ${16 - (isLoggedToday(logs, habit._id, activeDate) ? 14 : 2)}`}
                          fill="none"
                          stroke={habit.color}
                          strokeWidth="1.5"
                          strokeLinecap="round"
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
        <Card title="Habit Breakdown">
          <div className="space-y-4">
            {habitBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <ProgressBar value={item.value} color="custom" customColorHex={item.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Consistency trend */}
        <Card title="Consistency Trend" subtitle="Rolling 6 weeks habit completion">
          <div className="pt-2">
            <StepChart data={consistencyTrendData} height={200} color="#3B82F6" />
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
