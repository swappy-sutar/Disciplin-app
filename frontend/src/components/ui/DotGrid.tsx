import React from 'react';
import { motion } from 'framer-motion';

interface DotGridProps {
  value: number; // number of completed actions
  target: number; // target number of actions
  color?: string; // Hex color code or Tailwind color class
}

export const DotGrid: React.FC<DotGridProps> = ({
  value,
  target,
  color = '#3B82F6',
}) => {
  // Ensure we don't render excessive dots, limit to target or a max
  const dotsCount = Math.max(0, target);
  const filledCount = Math.min(value, dotsCount);

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1 select-none">
      {Array.from({ length: dotsCount }).map((_, index) => {
        const isFilled = index < filledCount;
        
        return (
          <motion.div
            key={index}
            initial={{ scale: 0.8 }}
            animate={{ scale: isFilled ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.25, delay: isFilled ? index * 0.03 : 0 }}
            className="w-2.5 h-2.5 rounded-full border transition-all duration-300"
            style={{
              backgroundColor: isFilled ? color : '#E5E7EB',
              borderColor: isFilled ? color : '#E5E7EB',
            }}
          />
        );
      })}
    </div>
  );
};
