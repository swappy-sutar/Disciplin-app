import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** Core shimmer block */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800/70 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/6 to-transparent" />
  </div>
);

/** A premium stat card skeleton matching the colored-border cards */
const CARD_ACCENTS = [
  { border: 'border-emerald-500/20 dark:border-emerald-500/15', bar: 'from-emerald-400 to-teal-400', glow: 'bg-emerald-500/10' },
  { border: 'border-orange-500/20 dark:border-orange-500/15', bar: 'from-orange-400 to-rose-400', glow: 'bg-orange-500/10' },
  { border: 'border-blue-500/20 dark:border-blue-500/15', bar: 'from-blue-400 to-indigo-400', glow: 'bg-blue-500/10' },
  { border: 'border-violet-500/20 dark:border-violet-500/15', bar: 'from-violet-400 to-purple-400', glow: 'bg-violet-500/10' },
];

export const StatCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-slate-900/80 border ${accent.border} shadow-lg`}>
      {/* Color accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.bar} rounded-t-2xl`} />
      {/* Glow blob */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${accent.glow} dark:opacity-70 blur-2xl pointer-events-none`} />

      <div className="flex flex-col gap-2 relative">
        <Skeleton className="h-2 w-16 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-xl" />
        <Skeleton className="h-2 w-20 rounded-full" />
      </div>

      {/* Icon placeholder */}
      <div className="absolute bottom-3 right-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
};

/** Full page skeleton for Habits / Goals / Applications / Topics */
export const PageSkeleton: React.FC<{ cards?: number; rows?: number }> = ({
  cards = 3,
  rows = 4,
}) => (
  <div className="space-y-6 select-none animate-in fade-in duration-300">
    {/* Page header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52 rounded-2xl" />
        <Skeleton className="h-3 w-72 rounded-full" />
      </div>
      <Skeleton className="h-10 w-32 rounded-2xl self-start md:self-center" />
    </div>

    {/* Stat cards */}
    <div className={`grid grid-cols-2 lg:grid-cols-${cards > 3 ? '4' : '3'} gap-3 md:gap-4`}>
      {Array.from({ length: cards }).map((_, i) => (
        <StatCardSkeleton key={i} index={i} />
      ))}
    </div>

    {/* Main list card */}
    <div className="bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800/70 rounded-2xl p-5 shadow-md space-y-4">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded-xl" />
        <Skeleton className="h-7 w-7 rounded-xl" />
      </div>
      {/* List rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-0.5">
          <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4 rounded-full" />
            <Skeleton className="h-2 w-1/2 rounded-full" />
          </div>
          <Skeleton className="h-6 w-14 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

/** Overview / Dashboard skeleton — 3-column layout */
export const OverviewSkeleton: React.FC = () => (
  <div className="space-y-6 select-none animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-2xl" />
        <Skeleton className="h-3 w-64 rounded-full" />
      </div>
      <Skeleton className="h-9 w-40 rounded-full self-start md:self-center" />
    </div>

    {/* 3-column grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, col) => (
        <div key={col} className="space-y-5">
          {Array.from({ length: col === 0 ? 2 : 3 }).map((_, row) => (
            <div
              key={row}
              className="bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800/70 rounded-2xl p-5 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded-xl" />
                <Skeleton className="h-7 w-7 rounded-xl" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-2.5 w-3/4 rounded-full" />
                    <Skeleton className="h-2 w-1/2 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
