import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** Single shimmer skeleton block */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800/60 ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent" />
  </div>
);

/** Stat card skeleton (title label + big number + sub-label) */
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-card-bg border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-md flex items-center justify-between gap-4">
    <div className="flex flex-col gap-2 flex-1">
      <Skeleton className="h-2.5 w-20 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-xl" />
      <Skeleton className="h-2.5 w-24 rounded-full" />
    </div>
    <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
  </div>
);

/** Full page skeleton for Habits / Goals pages */
export const PageSkeleton: React.FC<{ cards?: number; rows?: number }> = ({
  cards = 3,
  rows = 4,
}) => (
  <div className="space-y-6 select-none animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52 rounded-2xl" />
        <Skeleton className="h-3.5 w-72 rounded-full" />
      </div>
      <Skeleton className="h-10 w-32 rounded-2xl" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Main card body */}
    <div className="bg-white dark:bg-card-bg border border-gray-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-md space-y-4">
      <Skeleton className="h-5 w-40 rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4 rounded-full" />
            <Skeleton className="h-2.5 w-1/2 rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

/** Overview / Dashboard skeleton */
export const OverviewSkeleton: React.FC = () => (
  <div className="space-y-6 select-none animate-in fade-in duration-300">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-2xl" />
        <Skeleton className="h-3.5 w-64 rounded-full" />
      </div>
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>

    {/* 3-column grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, col) => (
        <div key={col} className="space-y-5">
          {Array.from({ length: 2 }).map((_, row) => (
            <div
              key={row}
              className="bg-white dark:bg-card-bg border border-gray-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-md space-y-3"
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
