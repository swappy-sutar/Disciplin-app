import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Quote } from '../types';
import { useStore } from '../app/store';

export const useQuote = () => {
  const queryClient = useQueryClient();
  const activeDate = useStore(state => state.activeDate);

  const query = useQuery<Quote>({
    queryKey: ['quote'],
    queryFn: () => apiClient.quotes.today(),
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ quoteText, isFavorite }: { quoteText: string; isFavorite: boolean }) => 
      apiClient.quotes.favorite(quoteText, isFavorite),
    onMutate: async ({ quoteText, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['quote'] });
      await queryClient.cancelQueries({ queryKey: ['dashboardSummary', activeDate] });

      const prevQuote = queryClient.getQueryData<Quote>(['quote']);
      const prevSummary = queryClient.getQueryData<any>(['dashboardSummary', activeDate]);

      // 1. Update quote cache optimistically
      if (prevQuote && prevQuote.text === quoteText) {
        queryClient.setQueryData<Quote>(['quote'], {
          ...prevQuote,
          isFavorite
        });
      }

      // 2. Update dashboardSummary quote cache optimistically
      if (prevSummary && prevSummary.quote && prevSummary.quote.text === quoteText) {
        queryClient.setQueryData(['dashboardSummary', activeDate], {
          ...prevSummary,
          quote: {
            ...prevSummary.quote,
            isFavorite
          }
        });
      }

      return { prevQuote, prevSummary };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevQuote) {
        queryClient.setQueryData(['quote'], context.prevQuote);
      }
      if (context?.prevSummary) {
        queryClient.setQueryData(['dashboardSummary', activeDate], context.prevSummary);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quote'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    }
  });

  const addQuoteMutation = useMutation({
    mutationFn: (body: { text: string; author?: string }) => apiClient.quotes.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary', activeDate] });
    }
  });

  return {
    quote: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    toggleFavorite: favoriteMutation.mutateAsync,
    addQuote: addQuoteMutation.mutateAsync,
  };
};
