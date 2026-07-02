import React from 'react';
import { Card } from './Card';
import { PillBadge } from './PillBadge';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBgColor?: string; // background color for the icon container
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'none';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBgColor = 'bg-blue-50 text-primary-blue',
  trendText,
  trendDirection = 'none',
  onClick,
  className = '',
}) => {
  return (
    <Card 
      onClick={onClick}
      hoverable={!!onClick}
      className={`p-5 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider select-none">{label}</span>
          <span className="text-[28px] md:text-[32px] font-bold text-gray-900 mt-1 select-none leading-none tracking-tight">
            {value}
          </span>
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl flex items-center justify-center ${iconBgColor}`}>
            {icon}
          </div>
        )}
      </div>
      
      {trendText && (
        <div className="mt-3 flex items-center">
          <PillBadge trend={trendDirection} className="mr-2">
            {trendText}
          </PillBadge>
        </div>
      )}
    </Card>
  );
};
