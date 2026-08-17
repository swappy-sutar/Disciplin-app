import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useApplications } from '../hooks/useApplications';
import { useHabits } from '../hooks/useHabits';
import { apiClient } from '../lib/api-client';
import type { Application } from '../types';

describe('Optimistic Updates & Instant Rollback on Error', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should optimistically update job application status and roll back on network failure', async () => {
    const initialApps: Application[] = [
      {
        _id: 'app_1',
        company: 'Google',
        role: 'Software Engineer',
        dateApplied: '2026-08-17',
        status: 'Applied',
      },
    ];

    // Seed query cache
    queryClient.setQueryData(['applications', undefined], initialApps);
    queryClient.setQueryData(['applications'], initialApps);

    // Mock update failure
    vi.spyOn(apiClient.applications, 'update').mockRejectedValueOnce(new Error('Network disconnected'));

    const { result } = renderHook(() => useApplications(), { wrapper });

    // Attempt mutation
    try {
      await act(async () => {
        await result.current.updateApplication({
          id: 'app_1',
          body: { status: 'Interview' },
        });
      });
    } catch (e) {
      // Expected rejection
    }

    // Verify cache has rolled back to original 'Applied' status
    const cachedApps = queryClient.getQueryData<Application[]>(['applications', undefined]);
    expect(cachedApps?.[0].status).toBe('Applied');
  });

  it('should optimistically update habit toggle and roll back on failure', async () => {
    const initialLogs: any[] = [
      {
        _id: 'log_1',
        habitId: 'habit_1',
        date: '2026-08-17',
        isDone: false,
      },
    ];

    queryClient.setQueryData(['habitLogs', '2026-08-17', '2026-08-23'], initialLogs);

    vi.spyOn(apiClient.habits, 'toggleLog').mockRejectedValueOnce(new Error('Server Error'));

    const { result } = renderHook(() => useHabits('2026-08-17', '2026-08-23'), { wrapper });

    try {
      await act(async () => {
        await result.current.toggleLog({ habitId: 'habit_1', date: '2026-08-17', isDone: true });
      });
    } catch (e) {
      // Expected
    }

    // Verify rollback to original initial logs
    const cached = queryClient.getQueryData<any[]>(['habitLogs', '2026-08-17', '2026-08-23']);
    expect(cached?.[0].isDone).toBe(false);
  });
});
