import { create } from 'zustand';
import type { User } from '../types';
import { sendSystemNotification } from '../utils/notifications';

export const colorsMap = {
  blue: { primary: '#3B82F6', hover: '#2563EB' },
  indigo: { primary: '#6366F1', hover: '#4F46E5' },
  emerald: { primary: '#10B981', hover: '#059669' },
  amber: { primary: '#F59E0B', hover: '#D97706' },
  rose: { primary: '#EC4899', hover: '#DB2777' },
};

export const applyAccentColor = (color: keyof typeof colorsMap) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const values = colorsMap[color] || colorsMap.blue;
  root.style.setProperty('--primary-accent', values.primary);
  root.style.setProperty('--primary-accent-hover', values.hover);
};

interface UIState {
  activeDate: string; // YYYY-MM-DD
  activeWeekStart: string; // YYYY-MM-DD
  compareMode: boolean; // true = compare to yesterday, false = compare to last period
  isAddGoalOpen: boolean;
  isAddHabitOpen: boolean;
  isAddApplicationOpen: boolean;
  isAddTopicOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Auth state
  user: User | null;
  token: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  accentColor: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
  setAccentColor: (color: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose') => void;
  
  // Actions
  setActiveDate: (date: string) => void;
  setActiveWeekStart: (weekStart: string) => void;
  setCompareMode: (compareMode: boolean) => void;
  setAddGoalOpen: (open: boolean) => void;
  setAddHabitOpen: (open: boolean) => void;
  setAddApplicationOpen: (open: boolean) => void;
  setAddTopicOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Auth Actions
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;

  // Notifications State & Actions
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'goal' | 'topic' | 'habit' | 'timetable' | 'system';
}

// Helper to calculate Monday of current week
const getMondayStr = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

export const useStore = create<UIState>((set) => {
  // Load initial auth state
  const storedUser = localStorage.getItem('disciplin_user');
  const storedToken = localStorage.getItem('disciplin_token');
  
  return {
    activeDate: new Date().toISOString().split('T')[0],
    activeWeekStart: getMondayStr(new Date()),
    compareMode: true,
    isAddGoalOpen: false,
    isAddHabitOpen: false,
    isAddApplicationOpen: false,
    isAddTopicOpen: false,
    isMobileMenuOpen: false,
    
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    theme: (typeof window !== 'undefined' ? localStorage.getItem('disciplin_theme') : 'light') as 'light' | 'dark' || 'light',
    accentColor: (typeof window !== 'undefined' ? localStorage.getItem('disciplin_accent_color') : 'emerald') as any || 'emerald',
    
    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('disciplin_theme', nextTheme);
        
        // Add temporary transition class for full dissolve color fade
        document.documentElement.classList.add('theme-transitioning');
        
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning');
        }, 550);
      }
      return { theme: nextTheme };
    }),
    
    setAccentColor: (color) => set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('disciplin_accent_color', color);
        applyAccentColor(color);
      }
      return { accentColor: color };
    }),
    
    setActiveDate: (date) => set({ activeDate: date }),
    setActiveWeekStart: (weekStart) => set({ activeWeekStart: weekStart }),
    setCompareMode: (compareMode) => set({ compareMode }),
    setAddGoalOpen: (open) => set({ isAddGoalOpen: open }),
    setAddHabitOpen: (open) => set({ isAddHabitOpen: open }),
    setAddApplicationOpen: (open) => set({ isAddApplicationOpen: open }),
    setAddTopicOpen: (open) => set({ isAddTopicOpen: open }),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    
    setAuth: (user, token) => {
      if (user && token) {
        localStorage.setItem('disciplin_user', JSON.stringify(user));
        localStorage.setItem('disciplin_token', token);
      } else {
        localStorage.removeItem('disciplin_user');
        localStorage.removeItem('disciplin_token');
      }
      set({ user, token });
    },
    logout: () => {
      localStorage.removeItem('disciplin_user');
      localStorage.removeItem('disciplin_token');
      set({ user: null, token: null });
    },
    notifications: [
      {
        id: 'n1',
        title: 'Welcome to Disciplin! 🚀',
        message: 'Track habits and schedule blocks to build high-performance momentum.',
        timestamp: '2 hours ago',
        isRead: false,
        type: 'system',
      },
      {
        id: 'n2',
        title: 'Weekly Goals Set 🎯',
        message: 'Add focused goals for the week to keep your career tracker active.',
        timestamp: '4 hours ago',
        isRead: false,
        type: 'goal',
      },
      {
        id: 'n3',
        title: 'Curriculum Ready 📚',
        message: 'Complete study items in graphs to prepare for System Design.',
        timestamp: 'Yesterday',
        isRead: true,
        type: 'topic',
      },
    ],
    addNotification: (title, message, type) => set((state) => {
      const newNotification: AppNotification = {
        id: `n_${Math.random().toString(36).substr(2, 9)}`,
        title,
        message,
        timestamp: 'Just now',
        isRead: false,
        type,
      };
      
      // Fire native system notification (desktop / mobile notification shade)
      sendSystemNotification(title, message);

      return { notifications: [newNotification, ...state.notifications] };
    }),
    markAllAsRead: () => set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
    })),
    clearNotifications: () => set({ notifications: [] })
  };
});

// Setup event listener to handle external logout
if (typeof window !== 'undefined') {
  window.addEventListener('auth_change', () => {
    const user = localStorage.getItem('disciplin_user');
    const token = localStorage.getItem('disciplin_token');
    useStore.setState({ 
      user: user ? JSON.parse(user) : null, 
      token: token || null 
    });
  });
}

if (typeof window !== 'undefined') {
  // Clear obsolete mock database keys from local storage
  const obsoleteKeys = [
    'disciplin_timetable',
    'disciplin_habits',
    'disciplin_habit_logs',
    'disciplin_goals',
    'disciplin_topics',
    'disciplin_applications',
    'disciplin_quotes'
  ];
  obsoleteKeys.forEach(key => localStorage.removeItem(key));

  const storedTheme = localStorage.getItem('disciplin_theme') || 'light';
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  const storedAccent = localStorage.getItem('disciplin_accent_color') as any || 'emerald';
  applyAccentColor(storedAccent);
}
