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
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ dateRangeLabel, align = 'center' }) => {
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

  // Generate calendar days grid
  const getCalendarDays = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start on Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const days = getCalendarDays();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getAlignClass = () => {
    if (align === 'left') return 'left-0';
    if (align === 'right') return 'right-0';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Trigger Capsule */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 min-w-[110px] md:min-w-[140px] justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg py-0.5 transition-colors text-gray-655 dark:text-gray-300 font-semibold"
      >
        <CalendarIcon size={14} className="text-gray-400" />
        <span className="select-none">{dateRangeLabel}</span>
      </div>

      {isOpen && (
        <div className={`absolute mt-2.5 z-[999] w-72 bg-white dark:bg-card-bg border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-4 select-none ${getAlignClass()}`}>
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
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {weekDays.map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = isSameDay(day, parseISO(activeDate));
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative
                    ${isCurrentMonth ? 'text-gray-700 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600 opacity-40'}
                    ${isSelected ? 'bg-primary-blue text-white font-extrabold shadow-sm' : 'hover:bg-gray-55 dark:hover:bg-gray-800'}
                  `}
                >
                  <span>{format(day, 'd')}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary-blue rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
