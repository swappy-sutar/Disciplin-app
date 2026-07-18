import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { TimetableBlock } from '../types';
import { toast } from 'react-hot-toast';

export const useTimetable = (date: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<TimetableBlock[]>({
    queryKey: ['timetable', date],
    queryFn: () => apiClient.timetable.list(date),
  });

  const createMutation = useMutation({
    mutationFn: (body: { title: string; startTime: string; endTime: string; date: string }) => 
      apiClient.timetable.create(body),
    onSuccess: () => {
      toast.success('Event scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['timetable', date] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', date] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to schedule event');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TimetableBlock> }) => 
      apiClient.timetable.update(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: ['timetable', date] });
      await queryClient.cancelQueries({ queryKey: ['dashboardSummary', date] });

      const prevTimetable = queryClient.getQueryData<TimetableBlock[]>(['timetable', date]);
      const prevSummary = queryClient.getQueryData<any>(['dashboardSummary', date]);

      // Optimistically update timetable cache
      if (prevTimetable) {
        queryClient.setQueryData<TimetableBlock[]>(['timetable', date], 
          prevTimetable.map(item => item._id === id ? { ...item, ...body } as TimetableBlock : item)
        );
      }

      // Optimistically update dashboardSummary cache
      if (prevSummary) {
        const updatedTimetable = prevSummary.timetable.map((item: any) => 
          item._id === id ? { ...item, ...body } : item
        );
        const total = updatedTimetable.length;
        const done = updatedTimetable.filter((t: any) => t.isDone).length;
        const todayPercent = total > 0 ? Math.round((done / total) * 100) : 0;
        
        queryClient.setQueryData(['dashboardSummary', date], {
          ...prevSummary,
          timetable: updatedTimetable,
          progress: {
            ...prevSummary.progress,
            todayPercent,
            delta: todayPercent - prevSummary.progress.yesterdayPercent
          }
        });
      }

      return { prevTimetable, prevSummary };
    },
    onSuccess: (_, variables) => {
      if (!variables.body.isDone) {
        toast.success('Event updated!');
      }
    },
    onError: (_err, _vars, context) => {
      toast.error('Failed to update event');
      if (context?.prevTimetable) {
        queryClient.setQueryData(['timetable', date], context.prevTimetable);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['dashboardSummary', date], context.prevSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable', date] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', date] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.timetable.delete(id),
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['timetable', date] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', date] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete event');
    }
  });

  return {
    blocks: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createBlock: createMutation.mutateAsync,
    updateBlock: updateMutation.mutateAsync,
    deleteBlock: deleteMutation.mutateAsync,
  };
};
