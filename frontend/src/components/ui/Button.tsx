import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  pill?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  pill = true,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-primary-blue hover:bg-primary-blue-hover text-white focus:ring-primary-blue shadow-sm shadow-blue-500/10',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300',
    outline: 'border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-gray-250',
    ghost: 'bg-transparent hover:bg-gray-50 text-gray-600 focus:ring-gray-200',
    danger: 'bg-attention-pink hover:bg-attention-pink-hover text-white focus:ring-attention-pink shadow-sm shadow-pink-500/10',
    gradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white focus:ring-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 border-none',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  const radius = pill ? 'rounded-full' : 'rounded-xl';
  const width = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 15 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${radius} ${width} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};
