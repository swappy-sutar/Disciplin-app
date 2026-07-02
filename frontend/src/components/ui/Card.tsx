import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  showMenu?: boolean;
  onMenuClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  showMenu = false,
  onMenuClick,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100/50 
        transition-all duration-300 ease-out
        ${hoverable ? 'hover:shadow-md hover:-translate-y-[2px] cursor-pointer' : ''} 
        ${className}`}
      {...props}
    >
      {(title || headerAction || showMenu) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-[15px] md:text-[16px] font-semibold text-gray-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            {showMenu && (
              <button 
                onClick={onMenuClick}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
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
