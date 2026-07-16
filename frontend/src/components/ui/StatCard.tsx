import React from 'react';
import { PillBadge } from './PillBadge';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBgColor?: string;
  accentColor?: string; // border + glow color key
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'none';
  onClick?: () => void;
  className?: string;
}

const ACCENT_MAP: Record<string, { border: string; bar: string; glow: string; label: string }> = {
  blue:   { border: 'border-blue-500/20 dark:border-blue-500/15',   bar: 'from-blue-400 to-indigo-400',   glow: 'bg-blue-500/10 dark:bg-blue-500/15',   label: 'text-blue-500 dark:text-blue-400'   },
  green:  { border: 'border-emerald-500/20 dark:border-emerald-500/15', bar: 'from-emerald-400 to-teal-400', glow: 'bg-emerald-500/10 dark:bg-emerald-500/15', label: 'text-emerald-600 dark:text-emerald-400' },
  violet: { border: 'border-violet-500/20 dark:border-violet-500/15', bar: 'from-violet-400 to-purple-400', glow: 'bg-violet-500/10 dark:bg-violet-500/15', label: 'text-violet-500 dark:text-violet-400' },
  orange: { border: 'border-orange-500/20 dark:border-orange-500/15', bar: 'from-orange-400 to-rose-400',   glow: 'bg-orange-500/10 dark:bg-orange-500/15', label: 'text-orange-500 dark:text-orange-400' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBgColor = 'bg-blue-50/80 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30',
  accentColor = 'blue',
  trendText,
  trendDirection = 'none',
  onClick,
  className = '',
}) => {
  const accent = ACCENT_MAP[accentColor] ?? ACCENT_MAP.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border ${accent.border} shadow-lg ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} transition-transform duration-150 ${className}`}
    >
      {/* Accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.bar} rounded-t-2xl`} />
      {/* Glow blob */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${accent.glow} blur-2xl pointer-events-none`} />

      <div className="flex items-start justify-between relative">
        <div className="flex flex-col flex-1 min-w-0 pr-2">
          <span className={`text-[9px] font-bold uppercase tracking-widest select-none ${accent.label}`}>{label}</span>
          <span className="text-2xl md:text-[28px] font-black text-gray-900 dark:text-white mt-1 select-none leading-none tracking-tight truncate">
            {value}
          </span>
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
            {icon}
          </div>
        )}
      </div>

      {trendText && (
        <div className="mt-3 flex items-center relative">
          <PillBadge trend={trendDirection} className="mr-2">
            {trendText}
          </PillBadge>
        </div>
      )}
    </div>
  );
};
