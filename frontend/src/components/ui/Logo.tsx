import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* SVG Icon */}
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradDeep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#3B0F70"/>
          </linearGradient>
          <linearGradient id="logoGradLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#DDD6FE"/>
            <stop offset="1" stopColor="#7C3AED"/>
          </linearGradient>
        </defs>
        <polygon points="30,35 100,100 30,165 58,165 128,100 58,35" fill="url(#logoGradDeep)"/>
        <polygon points="78,50 138,100 78,150 100,150 160,100 100,50" fill="url(#logoGradLight)"/>
        <path 
          d="M100,30 C145,30 178,60 178,100 C178,140 145,170 100,170" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="24" 
          strokeLinecap="round"
          className="text-gray-900 dark:text-white"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none">
          Disciplin
        </span>
      )}
    </div>
  );
};
