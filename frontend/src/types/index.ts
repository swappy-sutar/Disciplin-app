export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'moderator' | 'user' | 'premium';
}

export interface TimetableBlock {
  _id: string;
  userId: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  isDone: boolean;
  order: number;
  date: string;      // "YYYY-MM-DD"
  createdAt?: string;
  updatedAt?: string;
}

export interface WeeklyGoal {
  _id: string;
  userId: string;
  weekStartDate: string; // "YYYY-MM-DD" (usually Monday)
  title: string;
  dueDay?: string;       // e.g. "Monday", "Tuesday", etc.
  isDone: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  color: string; // hex color e.g. "#3B82F6"
  order: number;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  activeWeeks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitLog {
  _id: string;
  userId: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  isDone: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubTopic {
  _id?: string;
  title: string;
  isDone: boolean;
}

export interface Topic {
  _id: string;
  userId: string;
  title: string;
  category: string;
  progressPercent: number; // 0 to 100
  subTopics: SubTopic[];
  createdAt?: string;
  updatedAt?: string;
}

export type ApplicationStatus = 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected';

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  dateApplied: string; // "YYYY-MM-DD"
  status: ApplicationStatus;
  link?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quote {
  text: string;
  author: string;
  isFavorite: boolean;
  isCustom: boolean;
}

export interface DashboardSummary {
  timetable: TimetableBlock[];
  progress: {
    todayPercent: number;
    yesterdayPercent: number;
    delta: number;
  };
  habits: {
    list: Habit[];
    logs: HabitLog[];
  };
  weeklyGoals: WeeklyGoal[];
  topics: Topic[];
  applications: {
    todayCount: number;
    todayTarget: number;
    weeklyCount: number;
    statusDistribution: Record<ApplicationStatus, number>;
  };
  quote: Quote;
}
