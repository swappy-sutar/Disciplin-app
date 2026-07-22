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

export interface Exercise {
  _id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles?: string[];
  equipment: string;
  imageUrl: string;
  gifUrl?: string;
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  slug: string;
}

export interface WorkoutSplit {
  _id: string;
  userId: string;
  weekMap: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  updatedAt?: string;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  _id?: string;
  userId?: string;
  date: string;
  muscleGroup: string;
  exercises: LoggedExercise[];
  durationMinutes?: number;
  completed: boolean;
  createdAt?: string;
}

export interface WorkoutStreak {
  currentStreak: number;
  longestStreak: number;
}

export interface AppNotification {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type: 'goal' | 'topic' | 'habit' | 'timetable' | 'system';
  isRead: boolean;
  createdAt?: string;
  timestamp?: string;
}
