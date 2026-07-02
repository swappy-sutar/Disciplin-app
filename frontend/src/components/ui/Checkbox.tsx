import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string; // Hex color code e.g. '#3B82F6'
  size?: number; // Size in pixels
  ariaLabel?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  color = '#3B82F6',
  size = 22,
  ariaLabel = 'Checkbox',
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative flex items-center justify-center rounded-full border-2 transition-colors duration-200 outline-none
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        width: size,
        height: size,
        borderColor: checked ? color : '#E5E7EB',
        backgroundColor: checked ? color : 'transparent',
      }}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          className="text-white flex items-center justify-center"
        >
          <Check size={size * 0.65} strokeWidth={3} />
        </motion.div>
      )}
    </div>
  );
};
