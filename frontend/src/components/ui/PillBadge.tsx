import React from 'react';

interface PillBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'pink' | 'orange' | 'gray' | 'neutral';
  trend?: 'up' | 'down' | 'none';
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  children,
  variant,
  trend = 'none',
  className = '',
  ...props
}) => {
  // If trend is provided, set visual presets
  let appliedVariant = variant || 'neutral';
  let prefix = '';

  if (trend === 'up') {
    appliedVariant = 'green';
    prefix = '▲ ';
  } else if (trend === 'down') {
    appliedVariant = 'pink';
    prefix = '▼ ';
  }

  const badgeStyles = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-100/50',
    green: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
    pink: 'bg-pink-50 text-pink-600 border border-pink-100/50',
    orange: 'bg-amber-50 text-amber-600 border border-amber-100/50',
    gray: 'bg-slate-50 text-slate-500 border border-slate-200/40',
    neutral: 'bg-gray-100 text-gray-600 border border-gray-200/50'
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full select-none
        ${badgeStyles[appliedVariant]} ${className}`}
      {...props}
    >
      {prefix}
      {children}
    </span>
  );
};
