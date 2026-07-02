import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { DashboardSummary } from '../types';

export const useDashboardSummary = (date: string) => {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboardSummary', date],
    queryFn: () => apiClient.dashboard.summary(date),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
