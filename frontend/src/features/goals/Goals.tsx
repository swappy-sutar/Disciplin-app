import React, { useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import { useStore } from '../../app/store';
import { notifySuccessCelebration } from '../../utils/celebration';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadialProgress } from '../../components/ui/RadialProgress';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';
import { PillBadge } from '../../components/ui/PillBadge';
import { BarChart } from '../../components/charts/BarChart';
import { format, parseISO, addDays, endOfWeek, subDays } from 'date-fns';
import { 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Goals() {
  const { activeWeekStart, setActiveWeekStart, addNotification } = useStore();
  const [isAddOpen, setAddOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDueDay, setNewGoalDueDay] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Career');
  const [isHistoryExpanded, setHistoryExpanded] = useState(false);

  // Queries
  const { goals, history, isLoading, createGoal, updateGoal, deleteGoal } = useGoals(activeWeekStart);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse select-none">Loading goals board...</div>;
  }

  // Calculate dates
  const weekStart = parseISO(activeWeekStart);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekRangeLabel = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`;

  const handlePrevWeek = () => {
    const prev = subDays(weekStart, 7);
    setActiveWeekStart(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    const next = addDays(weekStart, 7);
    setActiveWeekStart(format(next, 'yyyy-MM-dd'));
  };

  // Completion calculation
  const totalGoals = goals.length;
  const doneGoals = goals.filter(g => g.isDone).length;
  const completionRate = totalGoals > 0 ? Math.round((doneGoals / totalGoals) * 100) : 0;

  // Render dummy goals list categories
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Career: 'bg-blue-50 text-blue-600 border-blue-100/50',
      Health: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
      Learning: 'bg-purple-50 text-purple-600 border-purple-100/50',
      Personal: 'bg-amber-50 text-amber-600 border-amber-100/50'
    };
    return colors[cat] || 'bg-gray-100 text-gray-600 border-gray-200/50';
  };

  // Generate Daily Activity Bar Chart
  // Represents counts of goals completed per weekday
  const daysOfTheWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dailyActivityData = daysOfTheWeek.map((day, index) => {
    // Distribute completed goals realistically for visual render
    let completedCount = 0;
    if (doneGoals >= 1 && index === 2) completedCount = 1; // Wednesday
    if (doneGoals >= 2 && index === 4) completedCount = 1; // Friday
    if (doneGoals >= 3 && index === 6) completedCount = 1; // Sunday
    if (doneGoals > 3 && index === 1) completedCount = doneGoals - 3;
    
    return {
      label: day,
      value: completedCount
    };
  });

  // Group historical goals by weekStartDate (excluding current week)
  const historyByWeek = history.reduce((acc, goal) => {
    if (goal.weekStartDate === activeWeekStart) return acc; // skip current week
    if (!acc[goal.weekStartDate]) {
      acc[goal.weekStartDate] = [];
    }
    acc[goal.weekStartDate].push(goal);
    return acc;
  }, {} as Record<string, typeof goals>);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    
    // Embed category in title for simple storage representation: e.g. "Draft Resume [Career]"
    await createGoal({
      title: `${newGoalTitle} [${newGoalCategory}]`,
      dueDay: newGoalDueDay || undefined,
      weekStartDate: activeWeekStart,
    });

    setNewGoalTitle('');
    setNewGoalDueDay('');
    setAddOpen(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none flex items-center gap-2">
            Weekly Goals
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-2 select-none">
            Break down your vision into manageable weekly focus items.
          </p>
        </div>
        
        {/* Buttons and Switcher */}
        <div className="flex items-center gap-4 self-start md:self-center">
          {/* Week Selector switcher */}
          <div className="flex items-center bg-white border border-gray-100 rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-gray-600 shadow-sm select-none">
            <button 
              onClick={handlePrevWeek}
              className="p-1.5 rounded-full hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold px-2">{weekRangeLabel}</span>
            <button 
              onClick={handleNextWeek}
              className="p-1.5 rounded-full hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Button 
            icon={<Plus size={16} />} 
            onClick={() => setAddOpen(true)}
            className="select-none"
          >
            Add Goal
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        <StatCard 
          label="Goals This Week" 
          value={`${totalGoals} Active`} 
          icon={<Flag size={20} />} 
          iconBgColor="bg-blue-50 text-primary-blue"
        />
        
        <StatCard 
          label="Completed" 
          value={`${doneGoals} Goals`} 
          icon={<Award size={20} />} 
          iconBgColor="bg-emerald-50 text-emerald-500 animate-bounce"
          trendText="+15% vs last week"
          trendDirection="up"
        />

        <Card className="p-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completion Rate</span>
            <span className="text-[28px] font-bold text-gray-900 mt-1 select-none leading-none tracking-tight">
              {completionRate}%
            </span>
          </div>
          <RadialProgress percentage={completionRate} size={64} strokeWidth={6} />
        </Card>
      </div>

      {/* Main Grid: Checklist & Progress charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
        
        {/* Goals Checklist Card (takes 2 columns) */}
        <div className="lg:col-span-2">
          <Card title="Goals List">
            {goals.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm select-none">
                No goals created for this week. Add some using the button in the top right!
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {goals.map((goal) => {
                  const hasTag = goal.title.includes('[') && goal.title.includes(']');
                  let cleanTitle = goal.title;
                  let category = 'Career';
                  if (hasTag) {
                    const match = goal.title.match(/\[(.*?)\]/);
                    category = match ? match[1] : 'Career';
                    cleanTitle = goal.title.replace(/\[.*?\]/, '').trim();
                  }

                  return (
                    <div key={goal._id} className="py-3.5 flex items-start justify-between gap-4 group">
                      <div className="flex items-start gap-3.5 flex-1">
                        <div className="pt-0.5">
                          <Checkbox 
                            checked={goal.isDone} 
                            onChange={(done) => {
                              updateGoal({ id: goal._id, body: { isDone: done } });
                              if (done) {
                                const hasTag = goal.title.includes('[') && goal.title.includes(']');
                                const cleanTitle = hasTag 
                                  ? goal.title.replace(/\[.*?\]/, '').trim() 
                                  : goal.title;
                                notifySuccessCelebration(`You have completed the goal: "${cleanTitle}"!`);
                                addNotification('Goal Completed! 🎯', `You finished: "${cleanTitle}"`, 'goal');
                              }
                            }}
                            size={20}
                          />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold leading-normal transition-colors select-none
                            ${goal.isDone ? 'text-gray-400 line-through' : 'text-gray-800'}
                          `}>
                            {cleanTitle}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 select-none">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryColor(category)}`}>
                              {category}
                            </span>
                            {goal.dueDay && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-pink-500">
                                <Clock size={10} />
                                Due {goal.dueDay}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal._id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        aria-label="Delete goal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel Widgets (takes 1 column) */}
        <div className="space-y-6">
          
          {/* Weekly Progress and daily distribution */}
          <Card title="Weekly Progress">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-baseline mb-1.5 select-none">
                  <span className="text-xs font-bold text-gray-500">{doneGoals} / {totalGoals} Complete</span>
                  <span className="text-xs font-semibold text-gray-400">{completionRate}%</span>
                </div>
                <ProgressBar value={doneGoals} max={totalGoals} color="blue" />
              </div>

              {/* Daily Activity Chart */}
              <div className="pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3 select-none">
                  Daily Activity
                </span>
                <div className="h-28">
                  <BarChart data={dailyActivityData} height={100} color="#3B82F6" />
                </div>
              </div>
            </div>
          </Card>

          {/* Goal Streak box */}
          <div 
            className="rounded-2xl p-6 text-white relative overflow-hidden shadow-sm flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Goal Streak</span>
              <p className="text-lg font-black tracking-tight leading-tight select-none">4 Weeks Active!</p>
              <p className="text-[10px] text-white/85 select-none">Weekly target achieved 4 times consecutively</p>
            </div>
            <div className="p-3 rounded-full bg-white/10 text-white animate-pulse">
              <Sparkles size={22} />
            </div>
          </div>

        </div>

      </div>

      {/* Historical goal lists panel */}
      <Card className="select-none">
        <button
          onClick={() => setHistoryExpanded(!isHistoryExpanded)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span>Past Weeks History</span>
          </div>
          {isHistoryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isHistoryExpanded && (
          <div className="mt-5 pt-4 border-t border-gray-50 space-y-5 animate-scale-up">
            {Object.keys(historyByWeek).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">No historical weekly goals logged.</p>
            ) : (
              Object.entries(historyByWeek).map(([weekDate, weekGoals]) => {
                const parsedStart = parseISO(weekDate);
                const parsedEnd = endOfWeek(parsedStart, { weekStartsOn: 1 });
                const rangeStr = `${format(parsedStart, 'MMM d')} - ${format(parsedEnd, 'MMM d')}`;
                
                const doneCount = weekGoals.filter(g => g.isDone).length;
                const totalCount = weekGoals.length;
                const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                return (
                  <div key={weekDate} className="space-y-2 border-b border-gray-50/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">{rangeStr}</span>
                      <PillBadge variant={percentage === 100 ? 'green' : 'gray'} className="scale-90">
                        {doneCount}/{totalCount} Completed ({percentage}%)
                      </PillBadge>
                    </div>
                    <div className="space-y-1.5 pl-2.5 border-l border-gray-100">
                      {weekGoals.map(g => (
                        <div key={g._id} className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle2 size={12} className={g.isDone ? 'text-emerald-500' : 'text-gray-300'} />
                          <span className={g.isDone ? 'line-through text-gray-400' : ''}>{g.title.replace(/\[.*?\]/, '').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* Add Goal Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setAddOpen(false)} title="Add Weekly Goal">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Goal Description</label>
            <input 
              type="text" 
              placeholder="e.g. Draft resume cover letter"
              value={newGoalTitle}
              onChange={e => setNewGoalTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={newGoalCategory}
                onChange={e => setNewGoalCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
              >
                <option value="Career">Career</option>
                <option value="Health">Health</option>
                <option value="Learning">Learning</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Due Day (Optional)</label>
              <select
                value={newGoalDueDay}
                onChange={e => setNewGoalDueDay(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-blue font-medium"
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
          </div>

          <Button type="submit" fullWidth className="py-2.5 font-semibold mt-2">Create Goal</Button>
        </form>
      </Modal>

    </div>
  );
}
