import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  showMenu?: boolean;
  onMenuClick?: () => void;
  hoverable?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  iconColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  showMenu = false,
  onMenuClick,
  hoverable = false,
  icon: Icon,
  iconColor = '',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100/50 dark:border-slate-800/80 
        transition-all duration-300 ease-out
        ${hoverable ? 'hover:shadow-md hover:-translate-y-[2px] cursor-pointer' : ''} 
        ${className}`}
      {...props}
    >
      {(title || headerAction || showMenu) && (
        <div className="flex items-center justify-between mb-5 gap-3 border-b border-gray-100 dark:border-slate-850/60 pb-3.5 select-none">
          {Icon ? (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl border shrink-0 ${iconColor || 'text-gray-500 bg-gray-50 border-gray-100'}`}>
                <Icon size={18} />
              </div>
              <div>
                {title && <h3 className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h3>}
                {subtitle && <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
          ) : (
            <div>
              {title && <h3 className="text-[15px] md:text-[16px] font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            {headerAction}
            {showMenu && (
              <button 
                onClick={onMenuClick}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-gray-50/50 transition-all cursor-pointer"
                aria-label="Card options"
              >
                <MoreHorizontal size={18} />
              </button>
            )}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
