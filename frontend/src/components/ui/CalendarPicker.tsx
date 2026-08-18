import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths, 
  isSameDay 
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../app/store';

interface CalendarPickerProps {
  dateRangeLabel: string;
  align?: 'left' | 'right' | 'center';
  compact?: boolean;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ 
  dateRangeLabel, 
  align = 'center',
  compact = false 
}) => {
  const { activeDate, setActiveDate, setActiveWeekStart } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync viewDate when activeDate changes externally or popup opens
  useEffect(() => {
    if (activeDate) {
      setViewDate(parseISO(activeDate));
    }
  }, [activeDate, isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => addMonths(prev, 1));
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setActiveDate(dateStr);
    const newWeekStart = startOfWeek(date, { weekStartsOn: 1 });
    setActiveWeekStart(format(newWeekStart, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  // Generate calendar days grid (Monday to Sunday)
  const getCalendarDays = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const days = getCalendarDays();
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Trigger Capsule */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 justify-center cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800/60 rounded-full transition-all text-slate-700 dark:text-slate-200 font-bold select-none ${
          compact ? 'px-2 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'
        }`}
      >
        <CalendarIcon size={compact ? 12 : 13} className="text-emerald-500 shrink-0" />
        <span className="tracking-tight whitespace-nowrap">{dateRangeLabel}</span>
      </div>

      {isOpen && (
        <div
          className={`fixed top-14 left-1/2 -translate-x-1/2 md:absolute md:top-full md:mt-2.5 z-[999] w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl p-4 select-none transition-all duration-150 ${
            align === 'center'
              ? 'md:left-1/2 md:-translate-x-1/2'
              : align === 'right'
                ? 'md:right-0 md:left-auto md:translate-x-0'
                : 'md:left-0 md:right-auto md:translate-x-0'
          }`}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-450 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-extrabold text-gray-800 dark:text-white">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <button 
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-500 dark:text-gray-450 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold uppercase tracking-wider">
            {weekDays.map(d => (
              <div
                key={d}
                className={`py-1 ${
                  d === 'Su'
                    ? 'text-rose-500 dark:text-rose-400 font-black'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = isSameDay(day, parseISO(activeDate));
              const isToday = isSameDay(day, new Date());
              const isSunday = day.getDay() === 0;

              let styleClass = '';
              if (isSelected) {
                styleClass = isToday 
                  ? 'bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300/40 scale-105'
                  : 'bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-500/25 scale-105';
              } else if (isToday) {
                styleClass = 'border border-emerald-500/60 dark:border-emerald-400/60 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 font-black hover:bg-emerald-500/25 shadow-sm';
              } else if (isCurrentMonth) {
                styleClass = isSunday
                  ? 'text-rose-500 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800';
              } else {
                styleClass = isSunday
                  ? 'text-rose-300 dark:text-rose-900/50 opacity-40 font-normal hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
                  : 'text-slate-300 dark:text-slate-600 opacity-40 font-normal hover:bg-slate-100/50 dark:hover:bg-slate-800/40';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`h-8 w-full rounded-xl text-xs transition-all duration-150 cursor-pointer flex items-center justify-center select-none ${styleClass}`}
                  title={isToday ? 'Today' : undefined}
                >
                  <span>{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>

          {/* Calendar Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Go to Today
            </button>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {format(new Date(), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
