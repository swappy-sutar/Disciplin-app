import React from 'react';

interface RadialProgressProps {
  percentage: number;
  size?: number; // width and height in px
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'pink' | 'orange' | 'custom';
  customColorHex?: string;
  trend?: string; // trend badge or text e.g. "+5% vs yesterday"
  subtext?: string; // label at bottom
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = 'blue',
  customColorHex,
  trend,
  subtext,
}) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  const colorClasses = {
    blue: 'stroke-primary-blue',
    green: 'stroke-success-green',
    pink: 'stroke-attention-pink',
    orange: 'stroke-warning-orange',
    custom: '',
  };

  const ringColor = color === 'custom' && customColorHex ? customColorHex : undefined;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className="stroke-gray-100 fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className={`fill-transparent transition-all duration-700 ease-out ${colorClasses[color]}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={ringColor ? { stroke: ringColor } : undefined}
          />
        </svg>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center p-2">
          <span className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-none">
            {percentage}%
          </span>
          {trend && (
            <span className="text-[10px] md:text-[11px] font-semibold text-emerald-500 flex items-center mt-1">
              {trend}
            </span>
          )}
        </div>
      </div>
      {subtext && (
        <span className="text-xs text-gray-500 mt-2 font-medium">{subtext}</span>
      )}
    </div>
  );
};
