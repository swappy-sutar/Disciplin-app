import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { WeeklyGoal } from '../types';
import { useStore } from '../app/store';
import { toast } from 'react-hot-toast';

export const useGoals = (weekStartDate?: string) => {
  const queryClient = useQueryClient();
  const activeDate = useStore(state => state.activeDate);

  const query = useQuery<WeeklyGoal[]>({
    queryKey: ['goals', weekStartDate],
    queryFn: () => apiClient.goals.list(weekStartDate!),
    enabled: !!weekStartDate,
  });

  const historyQuery = useQuery<WeeklyGoal[]>({
    queryKey: ['goalsHistory'],
    queryFn: () => apiClient.goals.history(),
  });

  const createMutation = useMutation({
    mutationFn: (body: { title: string; dueDay?: string; weekStartDate: string }) => 
      apiClient.goals.create(body),
    onSuccess: () => {
      toast.success('Goal added successfully!');
      queryClient.invalidateQueries({ queryKey: ['goals', weekStartDate] });
      queryClient.invalidateQueries({ queryKey: ['goalsHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to add goal');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<WeeklyGoal> }) => 
      apiClient.goals.update(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: ['goals', weekStartDate] });
      await queryClient.cancelQueries({ queryKey: ['dashboardSummary', activeDate] });

      const prevGoals = queryClient.getQueryData<WeeklyGoal[]>(['goals', weekStartDate]);
      const prevSummary = queryClient.getQueryData<any>(['dashboardSummary', activeDate]);

      // 1. Update goals cache optimistically
      if (prevGoals) {
        queryClient.setQueryData<WeeklyGoal[]>(['goals', weekStartDate], 
          prevGoals.map(item => item._id === id ? { ...item, ...body } as WeeklyGoal : item)
        );
      }

      // 2. Update dashboardSummary cache optimistically
      if (prevSummary) {
        const updatedGoals = prevSummary.weeklyGoals.map((item: any) => 
          item._id === id ? { ...item, ...body } : item
        );
        queryClient.setQueryData(['dashboardSummary', activeDate], {
          ...prevSummary,
          weeklyGoals: updatedGoals
        });
      }

      return { prevGoals, prevSummary };
    },
    onSuccess: (_, variables) => {
      if (!variables.body.isDone) {
        toast.success('Goal updated!');
      }
    },
    onError: (_err, _vars, context) => {
      toast.error('Failed to update goal');
      if (context?.prevGoals) {
        queryClient.setQueryData(['goals', weekStartDate], context.prevGoals);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['dashboardSummary', activeDate], context.prevSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', weekStartDate] });
      queryClient.invalidateQueries({ queryKey: ['goalsHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.goals.delete(id),
    onSuccess: () => {
      toast.success('Goal deleted');
      queryClient.invalidateQueries({ queryKey: ['goals', weekStartDate] });
      queryClient.invalidateQueries({ queryKey: ['goalsHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete goal');
    }
  });

  return {
    goals: query.data || [],
    history: historyQuery.data || [],
    isLoading: query.isLoading || historyQuery.isLoading,
    isError: query.isError || historyQuery.isError,
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
  };
};
