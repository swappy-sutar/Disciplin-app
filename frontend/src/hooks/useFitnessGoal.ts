import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type {
  FitnessGoal,
  BodyMetric,
} from '../types';
import toast from 'react-hot-toast';

export const useActiveFitnessGoal = () => {
  return useQuery<FitnessGoal | null>({
    queryKey: ['activeFitnessGoal'],
    queryFn: () => apiClient.fitnessGoals.getActive(),
  });
};

export const useCreateFitnessGoal = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: Omit<FitnessGoal, '_id' | 'userId' | 'isActive' | 'createdAt' | 'updatedAt'>) =>
      apiClient.fitnessGoals.create(body),
    onSuccess: () => {
      toast.success('Fitness goal updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeFitnessGoal'] });
      queryClient.invalidateQueries({ queryKey: ['goalProgress'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to set fitness goal');
    },
  });

  return {
    createGoal: mutation.mutateAsync,
    isCreatingGoal: mutation.isPending,
    error: mutation.error,
  };
};

export const useBodyMetrics = (days: number = 90) => {
  return useQuery<BodyMetric[]>({
    queryKey: ['bodyMetrics', days],
    queryFn: () => apiClient.bodyMetrics.list(days),
  });
};

export const useLogBodyMetric = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: { date: string; weightKg: number; bodyFatPercent?: number }) =>
      apiClient.bodyMetrics.log(body),
    onSuccess: () => {
      toast.success('Weight metric recorded!');
      queryClient.invalidateQueries({ queryKey: ['bodyMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['goalProgress'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to log body metric');
    },
  });

  return {
    logMetric: mutation.mutateAsync,
    isLoggingMetric: mutation.isPending,
    error: mutation.error,
  };
};

export const useGenerateGoalProgram = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: { daysPerWeek: number; experienceLevel: string }) =>
      apiClient.ai.generateGoalProgram(body),
    onSuccess: () => {
      toast.success('Goal-aware workout program generated!');
      queryClient.invalidateQueries({ queryKey: ['workoutSplit'] });
      queryClient.invalidateQueries({ queryKey: ['workoutToday'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate goal program');
    },
  });

  return {
    generateProgram: mutation.mutateAsync,
    isGeneratingProgram: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export const useGoalProgress = () => {
  const mutation = useMutation({
    mutationFn: (days?: number) => apiClient.ai.checkGoalProgress(days),
    onError: (err: any) => {
      toast.error(err.message || 'Failed to analyze goal progress');
    },
  });

  return {
    checkProgress: mutation.mutateAsync,
    isCheckingProgress: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  };
};
