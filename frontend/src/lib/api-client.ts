import type {
  User,
  WeeklyGoal,
  Habit,
  HabitLog,
  Topic,
  Application,
  Quote
} from '../types';

let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Clean up trailing slash
if (apiBase.endsWith('/')) {
  apiBase = apiBase.slice(0, -1);
}

// Append API version prefix if missing in config
if (!apiBase.includes('/api/v1')) {
  apiBase = `${apiBase}/api/v1`;
}

const API_BASE_URL = apiBase;

// Refresh token lock — prevents concurrent refresh races
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];

function processQueue(error: Error | null, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  pendingQueue = [];
}

async function attemptTokenRefresh(): Promise<string> {
  if (isRefreshing) {
    // Another refresh is already in-flight — queue up and wait for it
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!refreshResponse.ok) {
      throw new Error('Refresh failed');
    }

    const refreshJson = await refreshResponse.json();
    const newAccessToken = refreshJson.data?.token || refreshJson.token;

    if (!newAccessToken) {
      throw new Error('No token in refresh response');
    }

    localStorage.setItem('disciplin_token', newAccessToken);

    // Sync Zustand store with the new token
    window.dispatchEvent(new Event('auth_change'));

    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (err: any) {
    processQueue(err, null);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

// Base HTTP requester
async function request<T>(
  method: string,
  path: string,
  body?: any
): Promise<T> {
  const token = localStorage.getItem('disciplin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (
    response.status === 401 &&
    path !== '/auth/refresh' &&
    path !== '/auth/login' &&
    path !== '/auth/register' &&
    path !== '/auth/forgot-password' &&
    path !== '/auth/reset-password' &&
    path !== '/auth/verify-email' &&
    path !== '/auth/resend-verification'
  ) {
    // Only attempt refresh if the user was previously authenticated
    const hadToken = !!token;
    if (!hadToken) {
      throw new Error('Not authorized');
    }

    try {
      const newAccessToken = await attemptTokenRefresh();

      // Retry original request with fresh token
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

      // Retry also failed — fall through to clear auth
      throw new Error('Retry after refresh failed');
    } catch (err) {
      console.error('JWT Auto-refresh failed:', err);
    }

    // Refresh failed — clear session and redirect to login
    localStorage.removeItem('disciplin_token');
    localStorage.removeItem('disciplin_user');
    window.dispatchEvent(new Event('auth_change'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || 'Request failed');
  }

  const resJson = await response.json();
  return resJson.data ?? resJson;
}

// Export API Client interface
export const apiClient = {
  // Config toggle (noop since backend is always used)
  useMockOnly: () => {},
  useBackend: () => {},
  isMockMode: () => false,

  // Auth Operations
  auth: {
    me: () => request<User>('GET', '/auth/me'),
    login: (body: any) => request<any>('POST', '/auth/login', body).then(res => {
      const userRes = res.user || res.data?.user || res.data || res;
      const token = res.token || res.data?.token;
      const user = { id: userRes.id || userRes._id, name: userRes.name, email: userRes.email };
      localStorage.setItem('disciplin_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('disciplin_token', token);
      }
      window.dispatchEvent(new Event('auth_change'));
      return { token, user };
    }),
    register: (body: any) => request<any>('POST', '/auth/register', body),
    logout: async () => {
      try {
        await request<any>('POST', '/auth/logout');
      } catch (e) {
        console.error('Logout error on server', e);
      }
      localStorage.removeItem('disciplin_token');
      localStorage.removeItem('disciplin_user');
      window.dispatchEvent(new Event('auth_change'));
    },
    updateProfile: (body: { name?: string; email?: string; password?: string }) => request<any>('PUT', '/auth/profile', body).then(res => {
      const userRes = res.user || res.data?.user || res.data || res;
      const user = { id: userRes.id || userRes._id, name: userRes.name, email: userRes.email };
      localStorage.setItem('disciplin_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth_change'));
      return user;
    }),
    forgotPassword: (email: string) => request<any>('POST', '/auth/forgot-password', { email }),
    resetPassword: (body: { token: string; password?: string }) => request<any>('POST', '/auth/reset-password', body),
    verifyEmail: (token: string) => request<any>('POST', '/auth/verify-email', { token }),
    resendVerification: (email: string) => request<any>('POST', '/auth/resend-verification', { email }),
  },

  // Timetable Operations
  timetable: {
    list: (date: string) => request<any[]>('GET', `/timetable?date=${date}`).then(res => {
      const listData = Array.isArray(res) ? res : (res as any).data || [];
      return listData.map((b: any) => ({
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
      return request<any>('POST', '/timetable', apiBody).then(b => ({
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
      return request<any>('PATCH', `/timetable/${id}`, apiBody).then(b => ({
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
    delete: (id: string) => request<void>('DELETE', `/timetable/${id}`)
  },

  // Habits Operations
  habits: {
    list: () => request<Habit[]>('GET', '/habits'),
    create: (body: any) => request<Habit>('POST', '/habits', body),
    update: (id: string, body: any) => request<Habit>('PATCH', `/habits/${id}`, body),
    delete: (id: string) => request<void>('DELETE', `/habits/${id}`),
    getLogs: (startDate: string, endDate: string) => request<HabitLog[]>('GET', `/habits/logs?startDate=${startDate}&endDate=${endDate}`),
    toggleLog: (body: { habitId: string; date: string; isDone: boolean }) => request<HabitLog>('POST', '/habits/logs', body)
  },

  // Goals Operations
  goals: {
    list: (week: string) => request<WeeklyGoal[]>('GET', `/goals?week=${week}`),
    create: (body: any) => request<WeeklyGoal>('POST', '/goals', body),
    update: (id: string, body: any) => request<WeeklyGoal>('PATCH', `/goals/${id}`, body),
    delete: (id: string) => request<void>('DELETE', `/goals/${id}`),
    history: () => request<WeeklyGoal[]>('GET', '/goals/history')
  },

  // Topics Operations
  topics: {
    list: () => request<Topic[]>('GET', '/topics'),
    create: (body: any) => request<Topic>('POST', '/topics', body),
    update: (id: string, body: any) => request<Topic>('PATCH', `/topics/${id}`, body),
    delete: (id: string) => request<void>('DELETE', `/topics/${id}`),
    addSubTopic: (topicId: string, body: { title: string }) => request<Topic>('POST', `/topics/${topicId}/subtopics`, body),
    toggleSubTopic: (topicId: string, subTopicId: string, body: { isCompleted: boolean }) =>
      request<Topic>('POST', `/topics/${topicId}/subtopics/${subTopicId}/toggle`, body)
  },

  // Applications Operations
  applications: {
    list: (params?: { date?: string; startDate?: string; endDate?: string }) => {
      let query = '';
      if (params) {
        if (params.date) query = `?date=${params.date}`;
        else if (params.startDate && params.endDate) query = `?startDate=${params.startDate}&endDate=${params.endDate}`;
      }
      return request<Application[]>('GET', `/applications${query}`);
    },
    create: (body: any) => request<Application>('POST', '/applications', body),
    update: (id: string, body: any) => request<Application>('PATCH', `/applications/${id}`, body),
    delete: (id: string) => request<void>('DELETE', `/applications/${id}`)
  },

  // Quotes Operations
  quotes: {
    today: () => request<Quote>('GET', '/quotes/today'),
    favorite: async (quoteText: string, isFavorite: boolean) => {
      const today = await request<any>('GET', '/quotes/today');
      const quote = today.data || today;
      if (quote && quote.text === quoteText && quote._id) {
        return request<Quote>('PATCH', `/quotes/${quote._id}/favorite`, { isFavorite });
      }
      throw new Error('Quote not found');
    },
    create: (body: any) => request<Quote>('POST', '/quotes', body)
  },

  // Dashboard Aggregated Summary
  dashboard: {
    summary: (date: string) => request<any>('GET', `/dashboard/summary?date=${date}`).then((res: any) => {
      const data = res.data || res;
      if (data && data.timetable) {
        data.timetable = data.timetable.map((b: any) => ({
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
      return data;
    })
  }
};
