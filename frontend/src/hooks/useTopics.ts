import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Topic } from '../types';
import { useStore } from '../app/store';
import { toast } from 'react-hot-toast';

export const useTopics = () => {
  const queryClient = useQueryClient();
  const activeDate = useStore(state => state.activeDate);

  const query = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: () => apiClient.topics.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: { title: string; category: string; subTopics?: { title: string }[] }) => 
      apiClient.topics.create(body),
    onSuccess: () => {
      toast.success('Topic added successfully!');
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to add topic');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Topic> }) => 
      apiClient.topics.update(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: ['topics'] });
      await queryClient.cancelQueries({ queryKey: ['dashboardSummary', activeDate] });

      const prevTopics = queryClient.getQueryData<Topic[]>(['topics']);
      const prevSummary = queryClient.getQueryData<any>(['dashboardSummary', activeDate]);

      // Calculate progress if subTopics was supplied
      let progressPercent: number | undefined = undefined;
      if (body.subTopics) {
        const completed = body.subTopics.filter(s => s.isDone).length;
        progressPercent = body.subTopics.length > 0 ? Math.round((completed / body.subTopics.length) * 100) : 100;
      }

      const getUpdatedItem = (item: Topic) => {
        if (item._id !== id) return item;
        const nextProgress = body.progressPercent !== undefined 
          ? body.progressPercent 
          : (progressPercent !== undefined ? progressPercent : item.progressPercent);
        return {
          ...item,
          ...body,
          progressPercent: nextProgress
        };
      };

      // 1. Optimistic update topics list
      if (prevTopics) {
        queryClient.setQueryData<Topic[]>(['topics'], 
          prevTopics.map(getUpdatedItem)
        );
      }

      // 2. Optimistic update dashboardSummary (if visible in top 3)
      if (prevSummary) {
        const updatedTopics = prevSummary.topics.map((t: Topic) => getUpdatedItem(t));
        queryClient.setQueryData(['dashboardSummary', activeDate], {
          ...prevSummary,
          topics: updatedTopics
        });
      }

      return { prevTopics, prevSummary };
    },
    onSuccess: () => {
      toast.success('Topic updated!');
    },
    onError: (_err, _vars, context) => {
      toast.error('Failed to update topic');
      if (context?.prevTopics) {
        queryClient.setQueryData(['topics'], context.prevTopics);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['dashboardSummary', activeDate], context.prevSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.topics.delete(id),
    onSuccess: () => {
      toast.success('Topic deleted');
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete topic');
    }
  });

  return {
    topics: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createTopic: createMutation.mutateAsync,
    updateTopic: updateMutation.mutateAsync,
    deleteTopic: deleteMutation.mutateAsync,
  };
};
