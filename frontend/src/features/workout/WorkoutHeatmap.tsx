import React, { useState, useMemo } from 'react';
import {
  format,
  subDays,
  startOfWeek,
  addDays,
  isToday,
  isFuture
} from 'date-fns';
import {
  Flame,
  Trophy,
  Dumbbell,
  TrendingUp,
  Calendar as CalendarIcon,
  Sparkles,
  ChevronRight,
  PieChart,
  Zap
} from 'lucide-react';
import type { WorkoutSession, WorkoutStreak } from '../../types';

interface WorkoutHeatmapProps {
  history: WorkoutSession[];
  streak?: WorkoutStreak;
  onSelectDate?: (dateStr: string) => void;
  selectedDate?: string;
}

type TimeRangeWeeks = 12 | 26 | 52;

interface DayCellData {
  date: Date;
  dateStr: string;
  isCurrentDay: boolean;
  isFutureDay: boolean;
  session?: WorkoutSession;
  completed: boolean;
  totalVolume: number;
  totalSets: number;
  intensityLevel: 0 | 1 | 2 | 3;
}

export const WorkoutHeatmap: React.FC<WorkoutHeatmapProps> = ({
  history = [],
  streak,
  onSelectDate,
  selectedDate: _selectedDate,
}) => {
  // Default to 52 weeks (1 full year) to use full desktop width
  const [selectedRange, setSelectedRange] = useState<TimeRangeWeeks>(52);
  const [activeCell, setActiveCell] = useState<DayCellData | null>(null);

  // Map of sessions indexed by 'yyyy-MM-dd'
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession>();
    history.forEach((session) => {
      if (session.date) {
        const existing = map.get(session.date);
        if (!existing || session.completed) {
          map.set(session.date, session);
        }
      }
    });
    return map;
  }, [history]);

  // Compute total volume for a session
  const getSessionVolume = (session: WorkoutSession): number => {
    let volume = 0;
    (session.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((set) => {
        if (set.completed) {
          volume += (Number(set.reps) || 0) * (Number(set.weightKg) || 0);
        }
      });
    });
    return volume;
  };

  // Compute total completed sets for a session
  const getSessionSetsCount = (session: WorkoutSession): number => {
    let sets = 0;
    (session.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((set) => {
        if (set.completed) sets++;
      });
    });
    return sets;
  };

  // Build grid columns (weeks) and rows (7 days: Monday -> Sunday)
  const { weeksGrid, monthHeaders, rangeStats, muscleGroupDistribution, dayOfWeekFrequency } = useMemo(() => {
    const today = new Date();
    const totalDays = selectedRange * 7;
    // Align end date to the end of the current week (Sunday)
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const gridEnd = addDays(currentWeekStart, 6);
    const gridStart = subDays(gridEnd, totalDays - 1);

    const weeks: DayCellData[][] = [];

    let currentWeek: DayCellData[] = [];

    let totalCompletedInPeriod = 0;
    let totalVolumeInPeriod = 0;
    const muscleCounts: Record<string, number> = {};
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon (0) to Sun (6)

    for (let i = 0; i < totalDays; i++) {
      const dayDate = addDays(gridStart, i);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const session = sessionsByDate.get(dateStr);
      const completed = Boolean(session?.completed);
      const isCurrentDay = isToday(dayDate);
      const isFutureDay = isFuture(dayDate) && !isCurrentDay;

      let volume = 0;
      let setsCount = 0;
      let intensity: 0 | 1 | 2 | 3 = 0;

      if (completed && session) {
        volume = getSessionVolume(session);
        setsCount = getSessionSetsCount(session);
        totalCompletedInPeriod++;
        totalVolumeInPeriod += volume;

        const muscle = session.muscleGroup || 'General';
        muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;

        const dayIdx = (dayDate.getDay() + 6) % 7; // Convert 0(Sun)->6, 1(Mon)->0
        dayCounts[dayIdx] = (dayCounts[dayIdx] || 0) + 1;

        if (volume >= 6000 || setsCount >= 12) {
          intensity = 3;
        } else if (volume >= 2500 || setsCount >= 6) {
          intensity = 2;
        } else {
          intensity = 1;
        }
      }

      const cellData: DayCellData = {
        date: dayDate,
        dateStr,
        isCurrentDay,
        isFutureDay,
        session,
        completed,
        totalVolume: volume,
        totalSets: setsCount,
        intensityLevel: intensity,
      };

      currentWeek.push(cellData);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Compute month headers (e.g. Sep, Oct, Nov ... Jul, Aug)
    const months: { label: string; colIndex: number }[] = [];
    let lastSeenMonth = '';

    weeks.forEach((week, colIdx) => {
      const weekMonth = format(week[0].date, 'MMM');
      if (weekMonth !== lastSeenMonth) {
        // Count how many consecutive weeks belong to this month starting at colIdx
        let consecutiveWeeks = 0;
        for (let j = colIdx; j < weeks.length; j++) {
          if (format(weeks[j][0].date, 'MMM') === weekMonth) {
            consecutiveWeeks++;
          } else {
            break;
          }
        }

        // If at the very first column (colIdx 0), only label it if it has at least 3 weeks.
        // Otherwise, skip the partial trailing tail so month labels start cleanly with the next full month (e.g. SEP).
        if (colIdx > 0 || consecutiveWeeks >= 3) {
          months.push({ label: weekMonth, colIndex: colIdx });
        }
        lastSeenMonth = weekMonth;
      }
    });

    const consistencyRate = Math.round(
      (totalCompletedInPeriod / Math.max(1, totalDays)) * 100
    );

    const avgVolumePerSession = totalCompletedInPeriod > 0
      ? Math.round(totalVolumeInPeriod / totalCompletedInPeriod)
      : 0;

    // Muscle distribution sorted by count
    const muscleDistribution = Object.entries(muscleCounts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / Math.max(1, totalCompletedInPeriod)) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Most active day calculation
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let mostActiveDayIndex = 0;
    let maxDayCount = 0;
    dayCounts.forEach((count, idx) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        mostActiveDayIndex = idx;
      }
    });

    return {
      weeksGrid: weeks,
      monthHeaders: months,
      muscleGroupDistribution: muscleDistribution,
      dayOfWeekFrequency: dayNames[mostActiveDayIndex],
      rangeStats: {
        totalCompleted: totalCompletedInPeriod,
        totalVolume: totalVolumeInPeriod,
        consistencyRate,
        totalDays,
        avgVolumePerSession,
      },
    };
  }, [selectedRange, sessionsByDate]);

  // Default active cell to today or the latest day in the grid (called unconditionally)
  const defaultCell = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    for (const week of weeksGrid) {
      for (const day of week) {
        if (day.dateStr === todayStr) return day;
      }
    }
    return weeksGrid[weeksGrid.length - 1]?.[6] || null;
  }, [weeksGrid]);

  const effectiveActiveCell = activeCell || defaultCell;

  const getCellColorClass = (cell: DayCellData) => {
    if (cell.isFutureDay) {
      return 'bg-slate-100/30 dark:bg-slate-900/20 border-transparent opacity-30 cursor-not-allowed';
    }
    if (!cell.completed) {
      return 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200/50 dark:border-slate-800';
    }
    switch (cell.intensityLevel) {
      case 1:
        return 'bg-emerald-400/90 dark:bg-emerald-500/80 text-white shadow-xs border-emerald-500/30 hover:scale-125';
      case 2:
        return 'bg-emerald-500 dark:bg-emerald-500 text-white shadow-sm border-emerald-600/40 hover:scale-125 shadow-emerald-500/25';
      case 3:
        return 'bg-emerald-600 dark:bg-emerald-400 text-white shadow-md border-emerald-400/50 hover:scale-125 shadow-emerald-500/40 ring-1 ring-emerald-400/40';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 md:p-9 lg:px-10 shadow-sm border border-slate-100/90 dark:border-slate-800/80 transition-all duration-300 space-y-7">
      
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Workout Activity Heatmap
              </h3>
              <span className="text-[11px] font-black py-0.5 px-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {rangeStats.totalCompleted} Sessions Logged
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Comprehensive yearly log of training frequency, volume accumulation, and consistency
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl self-start md:self-auto border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
          {([
            { label: '3 Months (12w)', val: 12 },
            { label: '6 Months (26w)', val: 26 },
            { label: '1 Year (52w)', val: 52 },
          ] as { label: string; val: TimeRangeWeeks }[]).map((tab) => (
            <button
              key={tab.val}
              onClick={() => setSelectedRange(tab.val)}
              className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all border-none cursor-pointer ${
                selectedRange === tab.val
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Consistency Highlights Grid - Full Width */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Current Streak */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.07] to-orange-500/[0.03] dark:from-amber-950/30 dark:to-orange-950/15 border border-amber-500/20 dark:border-amber-500/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Current Streak
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {streak?.currentStreak || 0}
              </span>
              <span className="text-xs font-bold text-slate-400">days</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
            <Flame size={20} className={streak?.currentStreak ? 'animate-pulse' : ''} />
          </div>
        </div>

        {/* Best Streak */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/[0.07] to-indigo-500/[0.03] dark:from-purple-950/30 dark:to-indigo-950/15 border border-purple-500/20 dark:border-purple-500/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
              Best Streak
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {streak?.longestStreak || 0}
              </span>
              <span className="text-xs font-bold text-slate-400">days</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-500">
            <Trophy size={20} />
          </div>
        </div>

        {/* Total Lift Volume */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/[0.07] to-cyan-500/[0.03] dark:from-blue-950/30 dark:to-cyan-950/15 border border-blue-500/20 dark:border-blue-500/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Total Volume Lifted
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {rangeStats.totalVolume >= 1000
                  ? `${(rangeStats.totalVolume / 1000).toFixed(1)}k`
                  : rangeStats.totalVolume}
              </span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
            <Dumbbell size={20} />
          </div>
        </div>

        {/* Consistency */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/[0.03] dark:from-emerald-950/30 dark:to-teal-950/15 border border-emerald-500/20 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Consistency Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {rangeStats.consistencyRate}%
              </span>
              <span className="text-xs font-bold text-slate-400">active</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Main Heatmap Container - Stretches Full Width with Side Spacing */}
      <div className="w-full bg-slate-50/80 dark:bg-slate-950/40 p-5 sm:p-7 md:p-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/80">
        
        {/* Heatmap Grid with Responsive Scroll / Full Stretch & Inner Padding */}
        <div className="w-full overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:thin]">
          <div className="w-full min-w-[700px] flex flex-col gap-2.5 px-3 sm:px-5 py-2">
            
            {/* Month Labels Header - Exact Column Alignment with Grid */}
            <div className="w-full flex gap-3 pr-4">
              {/* Spacer matching Day Labels Column (w-7) */}
              <div className="w-7 shrink-0 select-none" />

              {/* Columns Header matching week columns */}
              <div className="w-full flex justify-between gap-1 sm:gap-1.5 relative h-4 select-none">
                {weeksGrid.map((_, colIdx) => {
                  const month = monthHeaders.find((m) => m.colIndex === colIdx);
                  return (
                    <div key={colIdx} className="flex-1 relative">
                      {month && (
                        <span className="absolute left-0 top-0 text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap pointer-events-none">
                          {month.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Heatmap Grid with End Margin */}
            <div className="w-full flex gap-3 pr-4">
              {/* Day Labels Column */}
              <div className="flex flex-col justify-between py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 w-7 select-none shrink-0">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Weeks Columns Spanning Full Width */}
              <div className="w-full flex justify-between gap-1 sm:gap-1.5">
                {weeksGrid.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex-1 flex flex-col gap-1 sm:gap-1.5">
                    {week.map((day) => {
                      const isActiveInspected = effectiveActiveCell?.dateStr === day.dateStr;

                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          disabled={day.isFutureDay}
                          onClick={() => {
                            setActiveCell(day);
                            if (onSelectDate) onSelectDate(day.dateStr);
                          }}
                          onMouseEnter={() => setActiveCell(day)}
                          className={`
                            relative w-full aspect-square min-w-[11px] max-w-[22px] rounded-[4px] sm:rounded-md border 
                            transition-all duration-150 cursor-pointer flex items-center justify-center
                            ${getCellColorClass(day)}
                            ${
                              day.isCurrentDay
                                ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900 z-10'
                                : ''
                            }
                            ${
                              isActiveInspected
                                ? 'scale-125 z-20 shadow-md ring-2 ring-slate-900 dark:ring-white'
                                : ''
                            }
                          `}
                          title={`${day.dateStr}: ${
                            day.completed
                              ? `${day.session?.muscleGroup || 'Workout'} (${day.totalVolume} kg)`
                              : 'No workout logged'
                          }`}
                        >
                          {day.isCurrentDay && !day.completed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend & Hint */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-400 font-bold select-none">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <Sparkles size={13} className="text-emerald-500" />
            <span>Hover or tap any day square to inspect session breakdown</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-[3px] bg-slate-200 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700" title="Rest / No log" />
              <div className="w-3 h-3 rounded-[3px] bg-emerald-400/90 dark:bg-emerald-500/80" title="Light session (< 2.5k kg)" />
              <div className="w-3 h-3 rounded-[3px] bg-emerald-500" title="Moderate session (2.5k - 6k kg)" />
              <div className="w-3 h-3 rounded-[3px] bg-emerald-600 dark:bg-emerald-400 shadow-sm" title="Intense session (> 6k kg)" />
            </div>
            <span className="text-[11px]">More</span>
          </div>
        </div>
      </div>

      {/* Bottom Multi-Column Intelligence Hub - Uses 100% of Space */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Column 1: Active Inspected Day Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Selected Day Inspector
              </span>
              {effectiveActiveCell?.isCurrentDay && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Today
                </span>
              )}
            </div>

            <div className="flex items-start gap-3.5 mt-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  effectiveActiveCell?.completed
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                <Dumbbell size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {effectiveActiveCell
                    ? format(effectiveActiveCell.date, 'EEEE, MMMM d, yyyy')
                    : 'Select a day'}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
                  {effectiveActiveCell?.completed ? (
                    <>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {effectiveActiveCell.session?.muscleGroup || 'Workout Complete'}
                      </span>
                      <span>•</span>
                      <span>{effectiveActiveCell.totalSets} completed sets</span>
                      {effectiveActiveCell.totalVolume > 0 && (
                        <>
                          <span>•</span>
                          <span>{effectiveActiveCell.totalVolume.toLocaleString()} kg lifted</span>
                        </>
                      )}
                      {effectiveActiveCell.session?.durationMinutes ? (
                        <>
                          <span>•</span>
                          <span>{effectiveActiveCell.session.durationMinutes} min</span>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-slate-400">Rest Day • No session recorded for this date</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {onSelectDate && effectiveActiveCell && (
            <div className="flex items-center justify-end pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
              <button
                onClick={() => onSelectDate(effectiveActiveCell.dateStr)}
                className="flex items-center justify-center gap-2 text-xs font-black py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>
                  {effectiveActiveCell.completed
                    ? 'Open & Edit This Workout'
                    : 'Log Workout for This Date'}
                </span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Column 2: Muscle Distribution & Consistency Insights */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <PieChart size={12} className="text-emerald-500" />
                Training Focus Split
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Top Groups
              </span>
            </div>

            {/* Muscle Breakdown Bars */}
            <div className="space-y-2 mt-3">
              {muscleGroupDistribution.length > 0 ? (
                muscleGroupDistribution.slice(0, 4).map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{group.name}</span>
                      <span className="text-slate-400">{group.count} sessions ({group.percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${group.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  Log your first session to see muscle split breakdown!
                </div>
              )}
            </div>
          </div>

          {/* Quick Consistency Fact */}
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Zap size={13} className="text-amber-500" />
              Most Active Day:
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-black">
              {dayOfWeekFrequency}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
