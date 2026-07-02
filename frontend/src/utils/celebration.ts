import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import React from 'react';
import { Sparkles } from 'lucide-react';

export const triggerConfetti = () => {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    // Left side corner blast
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#8B5CF6', '#A78BFA']
    });
    
    // Right side corner blast
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#8B5CF6', '#A78BFA']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const notifySuccessCelebration = (message: string) => {
  // 1. Play paper blaster confetti
  triggerConfetti();

  // 2. Play custom congratulations toast
  toast.custom((t) => React.createElement(
    'div',
    {
      className: `bg-slate-950 border border-gray-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 transition-all duration-300 transform select-none max-w-sm w-full
        ${t.visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
      `
    },
    React.createElement(
      'div',
      { className: 'p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex-shrink-0 animate-bounce' },
      React.createElement(Sparkles, { size: 20 })
    ),
    React.createElement(
      'div',
      { className: 'text-left' },
      React.createElement('h4', { className: 'font-black text-sm text-white leading-tight' }, 'Congratulations! 🎉'),
      React.createElement('p', { className: 'text-xs text-gray-400 font-semibold mt-1 leading-normal' }, message)
    )
  ), { duration: 4000, position: 'top-center' });
};
