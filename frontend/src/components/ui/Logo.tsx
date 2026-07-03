import React from 'react';
import { useStore } from '../../app/store';

interface LogoProps {
  className?: string;
  showText?: boolean;
  forceDark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, forceDark = false }) => {
  const theme = useStore(state => state.theme);
  const isDark = forceDark || theme === 'dark';

  if (showText) {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <img 
          src={isDark ? "/disciplin-logo.svg" : "/disciplin-logo-light.svg"} 
          alt="Disciplin Logo" 
          className="h-10 md:h-12 w-auto object-contain" 
        />
      </div>
    );
  }

  // If showText is false, render just the inline monogram icon (so we don't have text or tags)
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg 
        width="36" 
        height="36" 
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
    </div>
  );
};
