import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Habit, HabitLog } from '../types';
import { useStore } from '../app/store';
import { toast } from 'react-hot-toast';

export const useHabits = (weekStart?: string, weekEnd?: string) => {
  const queryClient = useQueryClient();
  const activeDate = useStore(state => state.activeDate);

  const habitsQuery = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: () => apiClient.habits.list(),
  });

  const logsQuery = useQuery<HabitLog[]>({
    queryKey: ['habitLogs', weekStart, weekEnd],
    queryFn: () => apiClient.habits.getLogs(weekStart!, weekEnd!),
    enabled: !!weekStart && !!weekEnd,
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; color: string }) => apiClient.habits.create(body),
    onSuccess: () => {
      toast.success('Habit created successfully!');
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to create habit');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Habit> }) => apiClient.habits.update(id, body),
    onSuccess: () => {
      toast.success('Habit updated!');
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to update habit');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.habits.delete(id),
    onSuccess: () => {
      toast.success('Habit deleted');
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete habit');
    }
  });

  const toggleLogMutation = useMutation({
    mutationFn: (body: { habitId: string; date: string; isDone: boolean }) => 
      apiClient.habits.toggleLog(body),
    onMutate: async (variables) => {
      // Cancel outstanding refetches
      await queryClient.cancelQueries({ queryKey: ['habitLogs', weekStart, weekEnd] });
      await queryClient.cancelQueries({ queryKey: ['dashboardSummary', activeDate] });
      await queryClient.cancelQueries({ queryKey: ['habits'] });

      const prevLogs = queryClient.getQueryData<HabitLog[]>(['habitLogs', weekStart, weekEnd]);
      const prevSummary = queryClient.getQueryData<any>(['dashboardSummary', activeDate]);
      const prevHabits = queryClient.getQueryData<Habit[]>(['habits']);

      // 1. Update logs cache optimistically
      if (prevLogs && weekStart && weekEnd) {
        queryClient.setQueryData<HabitLog[]>(['habitLogs', weekStart, weekEnd], () => {
          const index = prevLogs.findIndex(l => l.habitId === variables.habitId && l.date === variables.date);
          if (index > -1) {
            if (!variables.isDone) {
              return prevLogs.filter((_, idx) => idx !== index);
            } else {
              return prevLogs.map((item, idx) => idx === index ? { ...item, isDone: true } : item);
            }
          } else {
            return [...prevLogs, { _id: `hl_opt_${Math.random()}`, userId: 'u1', habitId: variables.habitId, date: variables.date, isDone: variables.isDone }];
          }
        });
      }

      // 2. Update dashboardSummary cache optimistically
      if (prevSummary) {
        const summaryLogs = prevSummary.habits.logs || [];
        const index = summaryLogs.findIndex((l: any) => l.habitId === variables.habitId && l.date === variables.date);
        let updatedLogs = [...summaryLogs];
        
        if (index > -1) {
          if (!variables.isDone) {
            updatedLogs = summaryLogs.filter((_: any, idx: number) => idx !== index);
          } else {
            updatedLogs = summaryLogs.map((item: any, idx: number) => idx === index ? { ...item, isDone: true } : item);
          }
        } else {
          updatedLogs.push({ _id: `hl_opt_${Math.random()}`, userId: 'u1', habitId: variables.habitId, date: variables.date, isDone: variables.isDone });
        }

        queryClient.setQueryData(['dashboardSummary', activeDate], {
          ...prevSummary,
          habits: {
            ...prevSummary.habits,
            logs: updatedLogs
          }
        });
      }

      return { prevLogs, prevSummary, prevHabits };
    },
    onSuccess: () => {
      toast.success('Habit status toggled!');
    },
    onError: (_err, _vars, context) => {
      toast.error('Failed to log habit');
      if (context?.prevLogs) {
        queryClient.setQueryData(['habitLogs', weekStart, weekEnd], context.prevLogs);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['dashboardSummary', activeDate], context.prevSummary);
      }
      if (context?.prevHabits) {
        queryClient.setQueryData(['habits'], context.prevHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habitLogs', weekStart, weekEnd] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });

  return {
    habits: habitsQuery.data || [],
    logs: logsQuery.data || [],
    isLoading: habitsQuery.isLoading || (!!weekStart && logsQuery.isLoading),
    isError: habitsQuery.isError || logsQuery.isError,
    createHabit: createMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
    toggleLog: toggleLogMutation.mutateAsync,
  };
};
