import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100 or current count
  max?: number; // if specified, value is divided by max to get percentage
  color?: 'blue' | 'green' | 'pink' | 'orange' | 'custom';
  customColorHex?: string; // used if color === 'custom'
  showLabel?: boolean;
  labelPosition?: 'top' | 'right';
  labelText?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'blue',
  customColorHex,
  showLabel = false,
  labelPosition = 'top',
  labelText,
  className = '',
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, max ? Math.round((value / max) * 100) : value)
  );

  const colors = {
    blue: 'bg-primary-blue',
    green: 'bg-success-green',
    pink: 'bg-attention-pink',
    orange: 'bg-warning-orange',
    custom: '',
  };

  const trackBg = 'bg-gray-100/80 dark:bg-slate-800/80';

  const fillStyle = color === 'custom' && customColorHex 
    ? { backgroundColor: customColorHex, width: `${percentage}%` } 
    : { width: `${percentage}%` };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between items-center mb-1 text-xs text-gray-500 font-medium select-none">
          <span>{labelText || 'Progress'}</span>
          <span>{percentage}%</span>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className={`flex-1 h-2 w-full rounded-full ${trackBg} overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${colors[color]}`}
            style={fillStyle}
          />
        </div>
        
        {showLabel && labelPosition === 'right' && (
          <span className="text-xs font-semibold text-gray-700 min-w-[28px] text-right select-none">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};
