import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

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

  // 2. Play standard success toast (unified under style 2)
  toast.success(`Congratulations! 🎉 ${message}`, {
    duration: 4500,
  });
};
