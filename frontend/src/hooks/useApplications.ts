import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Application, ApplicationStatus } from '../types';
import { useStore } from '../app/store';
import { toast } from 'react-hot-toast';

export const useApplications = (params?: { date?: string; startDate?: string; endDate?: string }) => {
  const queryClient = useQueryClient();
  const activeDate = useStore(state => state.activeDate);

  const query = useQuery<Application[]>({
    queryKey: ['applications', params],
    queryFn: () => apiClient.applications.list(params),
  });

  const createMutation = useMutation({
    mutationFn: (body: { company: string; role: string; dateApplied?: string; status?: ApplicationStatus; link?: string; notes?: string; aiCoverLetter?: string; aiResumeBullets?: string[] }) => 
      apiClient.applications.create(body),
    onSuccess: () => {
      toast.success('Job application logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to log application');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Application> }) => 
      apiClient.applications.update(id, body),
    onSuccess: () => {
      toast.success('Application updated!');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to update application');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.applications.delete(id),
    onSuccess: () => {
      toast.success('Application deleted');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete application');
    }
  });

  return {
    applications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createApplication: createMutation.mutateAsync,
    updateApplication: updateMutation.mutateAsync,
    deleteApplication: deleteMutation.mutateAsync,
  };
};
