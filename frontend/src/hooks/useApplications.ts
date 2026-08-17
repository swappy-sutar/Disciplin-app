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
    onMutate: async ({ id, body }) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      await queryClient.cancelQueries({ queryKey: ['dashboardSummary', activeDate] });

      // 2. Snapshot previous values
      const prevApplications = queryClient.getQueryData<Application[]>(['applications', params]);
      const prevAllApplications = queryClient.getQueryData<Application[]>(['applications']);
      const prevSummary = queryClient.getQueryData<any>(['dashboardSummary', activeDate]);

      // 3. Optimistically update applications list
      const updateItem = (item: Application): Application =>
        item._id === id ? { ...item, ...body } as Application : item;

      if (prevApplications) {
        queryClient.setQueryData<Application[]>(['applications', params], prevApplications.map(updateItem));
      }
      if (prevAllApplications) {
        queryClient.setQueryData<Application[]>(['applications'], prevAllApplications.map(updateItem));
      }

      // 4. Optimistically update dashboardSummary if status changed
      if (prevSummary && prevSummary.applications) {
        const oldApp = (prevApplications || prevAllApplications || []).find(a => a._id === id);
        if (oldApp && body.status && oldApp.status !== body.status) {
          const dist = { ...prevSummary.applications.statusDistribution };
          if (dist[oldApp.status] !== undefined) {
            dist[oldApp.status] = Math.max(0, dist[oldApp.status] - 1);
          }
          if (dist[body.status] !== undefined) {
            dist[body.status] = (dist[body.status] || 0) + 1;
          }
          queryClient.setQueryData(['dashboardSummary', activeDate], {
            ...prevSummary,
            applications: {
              ...prevSummary.applications,
              statusDistribution: dist,
            },
          });
        }
      }

      return { prevApplications, prevAllApplications, prevSummary };
    },
    onSuccess: () => {
      toast.success('Application updated!');
    },
    onError: (e: any, _vars, context) => {
      toast.error(e.message || 'Failed to update application');
      if (context?.prevApplications) {
        queryClient.setQueryData(['applications', params], context.prevApplications);
      }
      if (context?.prevAllApplications) {
        queryClient.setQueryData(['applications'], context.prevAllApplications);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['dashboardSummary', activeDate], context.prevSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.applications.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      await queryClient.cancelQueries({ queryKey: ['dashboardSummary', activeDate] });

      const prevApplications = queryClient.getQueryData<Application[]>(['applications', params]);
      const prevAllApplications = queryClient.getQueryData<Application[]>(['applications']);
      const prevSummary = queryClient.getQueryData<any>(['dashboardSummary', activeDate]);

      const filterItem = (item: Application) => item._id !== id;

      if (prevApplications) {
        queryClient.setQueryData<Application[]>(['applications', params], prevApplications.filter(filterItem));
      }
      if (prevAllApplications) {
        queryClient.setQueryData<Application[]>(['applications'], prevAllApplications.filter(filterItem));
      }

      return { prevApplications, prevAllApplications, prevSummary };
    },
    onSuccess: () => {
      toast.success('Application deleted');
    },
    onError: (e: any, _vars, context) => {
      toast.error(e.message || 'Failed to delete application');
      if (context?.prevApplications) {
        queryClient.setQueryData(['applications', params], context.prevApplications);
      }
      if (context?.prevAllApplications) {
        queryClient.setQueryData(['applications'], context.prevAllApplications);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['dashboardSummary', activeDate], context.prevSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
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
