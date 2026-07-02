import type { 
  User, 
  TimetableBlock, 
  WeeklyGoal, 
  Habit, 
  HabitLog, 
  Topic, 
  Application, 
  Quote,
  ApplicationStatus
} from '../types';

// Detect if we should use mock database or try backend.
// By default, we will check if backend is running. If not, fallback to local storage database.
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Seed initial data helper
const seedLocalStorage = () => {
  if (!localStorage.getItem('mom_user')) {
    localStorage.setItem('mom_user', JSON.stringify({ id: 'u1', email: 'user@momentum.com', name: 'Vaishnavi' }));
    localStorage.setItem('mom_token', 'mock_jwt_token_123');
  }

  if (!localStorage.getItem('mom_timetable')) {
    localStorage.setItem('mom_timetable', JSON.stringify([]));
  }

  if (!localStorage.getItem('mom_habits')) {
    localStorage.setItem('mom_habits', JSON.stringify([]));
  }

  if (!localStorage.getItem('mom_habit_logs')) {
    localStorage.setItem('mom_habit_logs', JSON.stringify([]));
  }

  if (!localStorage.getItem('mom_goals')) {
    localStorage.setItem('mom_goals', JSON.stringify([]));
  }

  if (!localStorage.getItem('mom_topics')) {
    localStorage.setItem('mom_topics', JSON.stringify([]));
  }

  if (!localStorage.getItem('mom_applications')) {
    localStorage.setItem('mom_applications', JSON.stringify([]));
  }

  if (!localStorage.getItem('mom_quotes')) {
    localStorage.setItem('mom_quotes', JSON.stringify([]));
  }
};

// Perform seeding
seedLocalStorage();

// Simple in-memory flag for backend health check
let isBackendAvailable = false;

// Async health check at boot
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, { method: 'GET' });
    if (response.ok) {
      isBackendAvailable = true;
      console.log('Backend detected! Running against live API.');
    }
  } catch (e) {
    isBackendAvailable = false;
    console.log('Backend offline. Falling back to local storage mock database.');
  }
};
checkBackendHealth();

// Local DB Mock service helper functions
const getLocal = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

// Base HTTP requester
async function request<T>(
  method: string, 
  path: string, 
  body?: any, 
  mockFallbackHandler?: () => any
): Promise<T> {
  const token = localStorage.getItem('mom_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isBackendAvailable) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      if (response.status === 401 && path !== '/auth/refresh') {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            const refreshJson = await refreshResponse.json();
            const newAccessToken = refreshJson.data?.token || refreshJson.token;
            if (newAccessToken) {
              localStorage.setItem('mom_token', newAccessToken);
              const retryHeaders = { ...headers, 'Authorization': `Bearer ${newAccessToken}` };
              const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
                method,
                headers: retryHeaders,
                body: body ? JSON.stringify(body) : undefined,
                credentials: 'include',
              });
              if (retryResponse.ok) {
                const retryJson = await retryResponse.json();
                return retryJson.data ?? retryJson;
              }
            }
          }
        } catch (err) {
          console.error('JWT Auto-refresh failed:', err);
        }

        // Refresh failed, logout user
        localStorage.removeItem('mom_token');
        localStorage.removeItem('mom_user');
        window.dispatchEvent(new Event('auth_change'));
        throw new Error('Session expired. Please log in again.');
      } else if (response.status === 401) {
        localStorage.removeItem('mom_token');
        localStorage.removeItem('mom_user');
        window.dispatchEvent(new Event('auth_change'));
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Request failed');
      }

      const resJson = await response.json();
      return resJson.data ?? resJson;
    } catch (e: any) {
      console.warn(`Live API Call failed: ${e.message}. Using Mock database.`);
      // If server failed unexpectedly, slide into mock fallback
    }
  }

  // Local storage mock fallbacks
  if (mockFallbackHandler) {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 150));
    return mockFallbackHandler();
  }

  throw new Error('API connection unavailable and no mock handler defined.');
}

// Export API Client interface
export const apiClient = {
  // Config toggle
  useMockOnly: () => {
    isBackendAvailable = false;
  },
  useBackend: () => {
    isBackendAvailable = true;
  },
  isMockMode: () => !isBackendAvailable,

  // Auth Operations
  auth: {
    me: () => request<User>('GET', '/auth/me', undefined, () => {
      const user = localStorage.getItem('mom_user');
      if (!user) throw new Error('Unauthenticated');
      return JSON.parse(user);
    }),
    login: (body: any) => request<any>('POST', '/auth/login', body, () => {
      const user = { id: 'u1', email: body.email, name: body.email.split('@')[0] };
      localStorage.setItem('mom_user', JSON.stringify(user));
      localStorage.setItem('mom_token', 'mock_token_123');
      window.dispatchEvent(new Event('auth_change'));
      return { token: 'mock_token_123', user };
    }).then(res => {
      if (res.user) return res;
      return {
        token: res.token,
        user: { id: res.id || res._id, name: res.name, email: res.email }
      };
    }),
    register: (body: any) => request<any>('POST', '/auth/register', body, () => {
      const user = { id: 'u1', email: body.email, name: body.name || body.email.split('@')[0] };
      localStorage.setItem('mom_user', JSON.stringify(user));
      localStorage.setItem('mom_token', 'mock_token_123');
      window.dispatchEvent(new Event('auth_change'));
      return { token: 'mock_token_123', user };
    }).then(res => {
      if (res.user) return res;
      return {
        token: res.token,
        user: { id: res.id || res._id, name: res.name, email: res.email }
      };
    }),
    logout: () => {
      localStorage.removeItem('mom_token');
      localStorage.removeItem('mom_user');
      window.dispatchEvent(new Event('auth_change'));
      return Promise.resolve();
    },
    updateProfile: (body: { name?: string; email?: string; password?: string }) => request<any>('PUT', '/auth/profile', body, () => {
      const stored = localStorage.getItem('mom_user');
      if (!stored) throw new Error('Unauthenticated');
      const user = JSON.parse(stored);
      if (body.name) user.name = body.name;
      if (body.email) user.email = body.email;
      localStorage.setItem('mom_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth_change'));
      return user;
    }).then(res => {
      const user = { id: res.id || res._id, name: res.name, email: res.email };
      localStorage.setItem('mom_user', JSON.stringify(user));
      return user;
    }),
    forgotPassword: (email: string) => request<any>('POST', '/auth/forgot-password', { email }, () => {
      console.log(`✉️ Mock forgot password sent for: ${email}`);
      return { success: true, message: 'Password reset link sent to your email' };
    }),
    resetPassword: (body: { token: string; password?: string }) => request<any>('POST', '/auth/reset-password', body, () => {
      console.log(`🔑 Mock reset password processed for token: ${body.token}`);
      return { success: true, message: 'Password updated successfully' };
    }),
    verifyEmail: (token: string) => request<any>('POST', '/auth/verify-email', { token }, () => {
      console.log(`✉️ Mock email verified for token: ${token}`);
      return { success: true, message: 'Email verified successfully! You can now log in.' };
    })
  },

  // Timetable Operations
  timetable: {
    list: (date: string) => request<any[]>('GET', `/timetable?date=${date}`, undefined, () => {
      const blocks = getLocal<any>('mom_timetable');
      return blocks.filter((b: any) => b.date === date).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    }).then(res => {
      return res.map((b: any) => ({
        _id: b._id,
        userId: b.userId,
        title: b.title || b.label,
        startTime: b.startTime,
        endTime: b.endTime,
        isDone: b.isDone,
        order: b.order,
        date: b.date
      }));
    }),
    create: (body: any) => {
      const apiBody = {
        title: body.title,
        label: body.title,
        startTime: body.startTime,
        endTime: body.endTime,
        date: body.date,
        tag: body.tag || 'Personal',
        order: body.order || 0
      };
      return request<any>('POST', '/timetable', apiBody, () => {
        const blocks = getLocal<any>('mom_timetable');
        const newBlock: any = {
          _id: `tb_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'u1',
          title: body.title,
          label: body.title,
          startTime: body.startTime,
          endTime: body.endTime,
          isDone: false,
          order: blocks.length + 1,
          date: body.date || new Date().toISOString().split('T')[0]
        };
        blocks.push(newBlock);
        setLocal('mom_timetable', blocks);
        return newBlock;
      }).then(b => ({
        _id: b._id,
        userId: b.userId,
        title: b.title || b.label,
        startTime: b.startTime,
        endTime: b.endTime,
        isDone: b.isDone,
        order: b.order,
        date: b.date
      }));
    },
    update: (id: string, body: any) => {
      const apiBody = { ...body };
      if (body.title) {
        apiBody.label = body.title;
      }
      return request<any>('PATCH', `/timetable/${id}`, apiBody, () => {
        const blocks = getLocal<any>('mom_timetable');
        const idx = blocks.findIndex((b: any) => b._id === id);
        if (idx !== -1) {
          blocks[idx] = { ...blocks[idx], ...body };
          setLocal('mom_timetable', blocks);
          return blocks[idx];
        }
        throw new Error('Not found');
      }).then(b => ({
        _id: b._id,
        userId: b.userId,
        title: b.title || b.label,
        startTime: b.startTime,
        endTime: b.endTime,
        isDone: b.isDone,
        order: b.order,
        date: b.date
      }));
    },
    delete: (id: string) => request<void>('DELETE', `/timetable/${id}`, undefined, () => {
      const blocks = getLocal<any>('mom_timetable');
      setLocal('mom_timetable', blocks.filter((b: any) => b._id !== id));
    })
  },

  // Habits Operations
  habits: {
    list: () => request<Habit[]>('GET', '/habits', undefined, () => {
      return getLocal<Habit>('mom_habits');
    }),
    create: (body: any) => request<Habit>('POST', '/habits', body, () => {
      const habits = getLocal<Habit>('mom_habits');
      const newHabit: Habit = {
        _id: `h_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'u1',
        name: body.name,
        color: body.color || '#3B82F6',
        order: habits.length + 1,
        isActive: true,
        currentStreak: 0,
        longestStreak: 0,
        activeWeeks: 1
      };
      habits.push(newHabit);
      setLocal('mom_habits', habits);
      return newHabit;
    }),
    update: (id: string, body: any) => request<Habit>('PATCH', `/habits/${id}`, body, () => {
      const habits = getLocal<Habit>('mom_habits');
      const idx = habits.findIndex(h => h._id === id);
      if (idx === -1) throw new Error('Not found');
      habits[idx] = { ...habits[idx], ...body };
      setLocal('mom_habits', habits);
      return habits[idx];
    }),
    delete: (id: string) => request<void>('DELETE', `/habits/${id}`, undefined, () => {
      const habits = getLocal<Habit>('mom_habits');
      setLocal('mom_habits', habits.filter(h => h._id !== id));
      
      const logs = getLocal<HabitLog>('mom_habit_logs');
      setLocal('mom_habit_logs', logs.filter(l => l.habitId !== id));
    }),
    getLogs: (startDate: string, endDate: string) => request<HabitLog[]>('GET', `/habits/logs?startDate=${startDate}&endDate=${endDate}`, undefined, () => {
      const logs = getLocal<HabitLog>('mom_habit_logs');
      return logs.filter(l => l.date >= startDate && l.date <= endDate);
    }),
    toggleLog: (body: { habitId: string; date: string; isDone: boolean }) => request<HabitLog>('POST', '/habits/logs', body, () => {
      const logs = getLocal<HabitLog>('mom_habit_logs');
      const idx = logs.findIndex(l => l.habitId === body.habitId && l.date === body.date);
      
      if (idx > -1) {
        if (!body.isDone) {
          // delete
          const res = logs[idx];
          logs.splice(idx, 1);
          setLocal('mom_habit_logs', logs);
          recalculateStreaks();
          return res;
        } else {
          logs[idx].isDone = true;
          setLocal('mom_habit_logs', logs);
          recalculateStreaks();
          return logs[idx];
        }
      } else {
        const newLog: HabitLog = {
          _id: `hl_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'u1',
          habitId: body.habitId,
          date: body.date,
          isDone: body.isDone
        };
        logs.push(newLog);
        setLocal('mom_habit_logs', logs);
        recalculateStreaks();
        return newLog;
      }
    })
  },

  // Goals Operations
  goals: {
    list: (week: string) => request<WeeklyGoal[]>('GET', `/goals?week=${week}`, undefined, () => {
      const goals = getLocal<WeeklyGoal>('mom_goals');
      return goals.filter(g => g.weekStartDate === week);
    }),
    create: (body: any) => request<WeeklyGoal>('POST', '/goals', body, () => {
      const goals = getLocal<WeeklyGoal>('mom_goals');
      const newGoal: WeeklyGoal = {
        _id: `g_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'u1',
        weekStartDate: body.weekStartDate,
        title: body.title,
        dueDay: body.dueDay,
        isDone: false
      };
      goals.push(newGoal);
      setLocal('mom_goals', goals);
      return newGoal;
    }),
    update: (id: string, body: any) => request<WeeklyGoal>('PATCH', `/goals/${id}`, body, () => {
      const goals = getLocal<WeeklyGoal>('mom_goals');
      const idx = goals.findIndex(g => g._id === id);
      if (idx === -1) throw new Error('Not found');
      goals[idx] = { ...goals[idx], ...body };
      setLocal('mom_goals', goals);
      return goals[idx];
    }),
    delete: (id: string) => request<void>('DELETE', `/goals/${id}`, undefined, () => {
      const goals = getLocal<WeeklyGoal>('mom_goals');
      setLocal('mom_goals', goals.filter(g => g._id !== id));
    }),
    // History
    history: () => request<WeeklyGoal[]>('GET', '/goals/history', undefined, () => {
      // Return all goals
      return getLocal<WeeklyGoal>('mom_goals');
    })
  },

  // Topics Operations
  topics: {
    list: () => request<Topic[]>('GET', '/topics', undefined, () => {
      return getLocal<Topic>('mom_topics');
    }),
    create: (body: any) => request<Topic>('POST', '/topics', body, () => {
      const topics = getLocal<Topic>('mom_topics');
      const newTopic: Topic = {
        _id: `t_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'u1',
        title: body.title,
        category: body.category,
        progressPercent: 0,
        subTopics: body.subTopics ? body.subTopics.map((s: any) => ({ title: s.title, isDone: false })) : []
      };
      topics.push(newTopic);
      setLocal('mom_topics', topics);
      return newTopic;
    }),
    update: (id: string, body: any) => request<Topic>('PATCH', `/topics/${id}`, body, () => {
      const topics = getLocal<Topic>('mom_topics');
      const idx = topics.findIndex(t => t._id === id);
      if (idx === -1) throw new Error('Not found');
      
      // Calculate progress if subtopics were updated
      let progressPercent = topics[idx].progressPercent;
      if (body.subTopics) {
        const completed = body.subTopics.filter((s: any) => s.isDone).length;
        progressPercent = body.subTopics.length > 0 ? Math.round((completed / body.subTopics.length) * 100) : 100;
      }
      
      topics[idx] = { 
        ...topics[idx], 
        ...body,
        progressPercent: body.progressPercent !== undefined ? body.progressPercent : progressPercent
      };
      setLocal('mom_topics', topics);
      return topics[idx];
    }),
    delete: (id: string) => request<void>('DELETE', `/topics/${id}`, undefined, () => {
      const topics = getLocal<Topic>('mom_topics');
      setLocal('mom_topics', topics.filter(t => t._id !== id));
    })
  },

  // Applications Operations
  applications: {
    list: (params?: { date?: string; startDate?: string; endDate?: string }) => request<Application[]>('GET', '/applications', undefined, () => {
      const apps = getLocal<Application>('mom_applications');
      if (params) {
        if (params.date) {
          return apps.filter(a => a.dateApplied === params.date);
        }
        const { startDate, endDate } = params;
        if (startDate && endDate) {
          return apps.filter(a => a.dateApplied >= startDate && a.dateApplied <= endDate);
        }
      }
      return apps;
    }),
    create: (body: any) => request<Application>('POST', '/applications', body, () => {
      const apps = getLocal<Application>('mom_applications');
      const newApp: Application = {
        _id: `a_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'u1',
        company: body.company,
        role: body.role,
        dateApplied: body.dateApplied || new Date().toISOString().split('T')[0],
        status: body.status || 'Applied',
        link: body.link,
        notes: body.notes
      };
      apps.unshift(newApp); // Keep it sorted descending
      setLocal('mom_applications', apps);
      return newApp;
    }),
    update: (id: string, body: any) => request<Application>('PATCH', `/applications/${id}`, body, () => {
      const apps = getLocal<Application>('mom_applications');
      const idx = apps.findIndex(a => a._id === id);
      if (idx === -1) throw new Error('Not found');
      apps[idx] = { ...apps[idx], ...body };
      setLocal('mom_applications', apps);
      return apps[idx];
    }),
    delete: (id: string) => request<void>('DELETE', `/applications/${id}`, undefined, () => {
      const apps = getLocal<Application>('mom_applications');
      setLocal('mom_applications', apps.filter(a => a._id !== id));
    })
  },

  // Quotes Operations
  quotes: {
    today: () => request<Quote>('GET', '/quotes/today', undefined, () => {
      const quotes = getLocal<Quote>('mom_quotes');
      // Simple hash index based on current day of month
      const day = new Date().getDate();
      const idx = day % quotes.length;
      return quotes[idx];
    }),
    favorite: (quoteText: string, isFavorite: boolean) => request<Quote>('POST', '/quotes/favorite', { quoteText, isFavorite }, () => {
      const quotes = getLocal<Quote>('mom_quotes');
      const idx = quotes.findIndex(q => q.text === quoteText);
      if (idx > -1) {
        quotes[idx].isFavorite = isFavorite;
        setLocal('mom_quotes', quotes);
        return quotes[idx];
      }
      throw new Error('Not found');
    }),
    create: (body: any) => request<Quote>('POST', '/quotes', body, () => {
      const quotes = getLocal<Quote>('mom_quotes');
      const newQuote: Quote = {
        text: body.text,
        author: body.author || 'Me',
        isFavorite: false,
        isCustom: true
      };
      quotes.push(newQuote);
      setLocal('mom_quotes', quotes);
      return newQuote;
    })
  },

  // Dashboard Aggregated Summary
  dashboard: {
    summary: (date: string) => request<any>('GET', `/dashboard/summary?date=${date}`, undefined, () => {
      const yesterdayDate = new Date(date);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

      // Calculate Monday and Sunday of selected date
      const curr = new Date(date);
      const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
      const monday = new Date(curr.setDate(first));
      const weekStartStr = monday.toISOString().split('T')[0];
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const weekEndStr = sunday.toISOString().split('T')[0];

      // 1. Timetable for selected day
      const timetable = getLocal<TimetableBlock>('mom_timetable').filter(b => b.date === date);
      const totalToday = timetable.length;
      const doneToday = timetable.filter(b => b.isDone).length;
      const todayPercent = totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0;

      const yesterdayTimetable = getLocal<TimetableBlock>('mom_timetable').filter(b => b.date === yesterdayStr);
      const totalYesterday = yesterdayTimetable.length;
      const doneYesterday = yesterdayTimetable.filter(b => b.isDone).length;
      const yesterdayPercent = totalYesterday > 0 ? Math.round((doneYesterday / totalYesterday) * 100) : 0;

      // 3. Habits & Logs for the week
      const habits = getLocal<Habit>('mom_habits');
      const logs = getLocal<HabitLog>('mom_habit_logs').filter(l => l.date >= weekStartStr && l.date <= weekEndStr);

      // 4. Weekly Goals for current week
      const weeklyGoals = getLocal<WeeklyGoal>('mom_goals').filter(g => g.weekStartDate === weekStartStr);

      // 5. Top 3 incomplete topics
      const topics = getLocal<Topic>('mom_topics')
        .filter(t => t.progressPercent < 100)
        .slice(0, 3);

      // 6. Job Applications
      const apps = getLocal<Application>('mom_applications');
      const todayApps = apps.filter(a => a.dateApplied === date);
      const weekApps = apps.filter(a => a.dateApplied >= weekStartStr && a.dateApplied <= weekEndStr);
      
      const statusDistribution: Record<ApplicationStatus, number> = {
        Applied: 0,
        OA: 0,
        Interview: 0,
        Offer: 0,
        Rejected: 0
      };
      apps.forEach(a => {
        if (a.status in statusDistribution) {
          statusDistribution[a.status]++;
        }
      });

      // 7. Today's Quote
      const quotes = getLocal<Quote>('mom_quotes');
      const hash = Math.abs(date.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      const quote = quotes[hash % quotes.length] || { text: 'Carpe Diem', author: 'Horace', isFavorite: false, isCustom: false };

      return {
        timetable,
        progress: {
          todayPercent,
          yesterdayPercent,
          delta: todayPercent - yesterdayPercent
        },
        habits: {
          list: habits,
          logs
        },
        weeklyGoals,
        topics,
        applications: {
          todayCount: todayApps.length,
          todayTarget: 20,
          weeklyCount: weekApps.length,
          statusDistribution
        },
        quote
      };
    }).then((res: any) => {
      if (res && res.timetable) {
        res.timetable = res.timetable.map((b: any) => ({
          _id: b._id,
          userId: b.userId,
          title: b.title || b.label,
          startTime: b.startTime,
          endTime: b.endTime,
          isDone: b.isDone,
          order: b.order,
          date: b.date
        }));
      }
      return res;
    })
  }
};

// Helper: recalculate streaks based on logs
const recalculateStreaks = () => {
  const habits = getLocal<Habit>('mom_habits');
  const logs = getLocal<HabitLog>('mom_habit_logs').filter(l => l.isDone);
  
  const updatedHabits = habits.map(h => {
    const habitLogs = logs
      .filter(l => l.habitId === h._id)
      .map(l => l.date)
      .sort((a, b) => b.localeCompare(a)); // Descending order (newest first)
      
    if (habitLogs.length === 0) {
      return { ...h, currentStreak: 0 };
    }

    let currentStreak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if logged today or yesterday to continue streak
    let lastLog = habitLogs[0];
    if (lastLog !== todayStr && lastLog !== yesterdayStr) {
      // Streak broken
      currentStreak = 0;
    } else {
      // Count backward
      currentStreak = 1;
      let checkDate = new Date(lastLog);
      
      for (let i = 1; i < habitLogs.length; i++) {
        const nextLogDate = new Date(habitLogs[i]);
        // Difference in days
        const diffTime = Math.abs(checkDate.getTime() - nextLogDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          checkDate = nextLogDate;
        } else if (diffDays > 1) {
          // Gap detected, streak ends
          break;
        }
      }
    }

    const longestStreak = Math.max(h.longestStreak, currentStreak);
    return { ...h, currentStreak, longestStreak };
  });

  setLocal('mom_habits', updatedHabits);
};
