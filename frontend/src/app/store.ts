import { create } from 'zustand';
import type { User, AppNotification } from '../types';
import { sendSystemNotification } from '../utils/notifications';
import { clearQueryCache } from '../lib/query-client';
import { apiClient } from '../lib/api-client';
import { formatDistanceToNow, parseISO } from 'date-fns';

const formatTimestamp = (dateStr?: string): string => {
  if (!dateStr) return 'Just now';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (err) {
    return 'Just now';
  }
};

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

  // Language state
  language: 'en' | 'hi' | 'mr';
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;

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
  fetchNotifications: () => Promise<void>;
  addNotification: (title: string, message: string, type: AppNotification['type']) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

// Helper to get local date string in YYYY-MM-DD format
const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to calculate Monday of current week
const getMondayStr = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mondayDate = new Date(d.setDate(diff));
  return getLocalDateString(mondayDate);
};

export const useStore = create<UIState>((set) => {
  // Load initial auth state
  const storedUser = localStorage.getItem('disciplin_user');
  const storedToken = localStorage.getItem('disciplin_token');

  return {
    activeDate: getLocalDateString(new Date()),
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
    language: (typeof window !== 'undefined' ? localStorage.getItem('disciplin_language') : 'en') as any || 'en',

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

    setLanguage: (lang) => set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('disciplin_language', lang);
      }
      return { language: lang };
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
      clearQueryCache();
      if (user && token) {
        localStorage.setItem('disciplin_user', JSON.stringify(user));
        localStorage.setItem('disciplin_token', token);
        // Fetch notifications after auth set
        setTimeout(() => {
          useStore.getState().fetchNotifications();
        }, 50);
      } else {
        localStorage.removeItem('disciplin_user');
        localStorage.removeItem('disciplin_token');
      }
      set({ user, token });
    },
    logout: () => {
      clearQueryCache();
      localStorage.removeItem('disciplin_user');
      localStorage.removeItem('disciplin_token');
      set({ user: null, token: null, notifications: [] });
    },
    notifications: [],
    fetchNotifications: async () => {
      try {
        const token = localStorage.getItem('disciplin_token');
        if (!token) return;
        const list = await apiClient.notifications.list();
        const mappedList: AppNotification[] = (list || []).map((item: any) => ({
          _id: item._id,
          id: item._id,
          title: item.title,
          message: item.message,
          type: item.type,
          isRead: item.isRead,
          createdAt: item.createdAt,
          timestamp: formatTimestamp(item.createdAt),
        }));
        set({ notifications: mappedList });
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    },
    addNotification: async (title, message, type) => {
      // Fire native system notification (desktop / mobile notification shade)
      sendSystemNotification(title, message);

      try {
        const token = localStorage.getItem('disciplin_token');
        if (token) {
          const newNotif = await apiClient.notifications.create({ title, message, type });
          const mapped: AppNotification = {
            _id: newNotif._id,
            id: newNotif._id,
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type,
            isRead: newNotif.isRead,
            createdAt: newNotif.createdAt,
            timestamp: formatTimestamp(newNotif.createdAt),
          };
          set((state) => ({ notifications: [mapped, ...state.notifications] }));
          return;
        }
      } catch (err) {
        console.error('Failed to add notification to API:', err);
      }

      // Fallback local memory-only notification if not logged in
      const localNotification: AppNotification = {
        id: `n_${Math.random().toString(36).substr(2, 9)}`,
        title,
        message,
        timestamp: 'Just now',
        isRead: false,
        type,
      };
      set((state) => ({ notifications: [localNotification, ...state.notifications] }));
    },
    markAllAsRead: async () => {
      try {
        const token = localStorage.getItem('disciplin_token');
        if (token) {
          await apiClient.notifications.markAllAsRead();
        }
      } catch (err) {
        console.error('Failed to mark notifications as read on API:', err);
      }
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
      }));
    },
    clearNotifications: async () => {
      try {
        const token = localStorage.getItem('disciplin_token');
        if (token) {
          await apiClient.notifications.clearAll();
        }
      } catch (err) {
        console.error('Failed to clear notifications on API:', err);
      }
      set({ notifications: [] });
    }
  };
});

// Setup event listener to handle external logout
if (typeof window !== 'undefined') {
  window.addEventListener('auth_change', () => {
    clearQueryCache();
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

  // Trigger initial notification fetch if authenticated on startup
  const token = localStorage.getItem('disciplin_token');
  if (token) {
    setTimeout(() => {
      useStore.getState().fetchNotifications();
    }, 150);
  }
}
