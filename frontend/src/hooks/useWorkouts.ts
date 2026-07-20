import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Exercise, WorkoutSplit, WorkoutSession, WorkoutStreak } from '../types';
import { toast } from 'react-hot-toast';

export const useWorkouts = (options?: { date?: string; startDate?: string; endDate?: string }) => {
  const queryClient = useQueryClient();
  const date = options?.date || new Date().toISOString().split('T')[0];
  const startDate = options?.startDate;
  const endDate = options?.endDate;

  // 1. Fetch exercises
  const exercisesQuery = useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: () => apiClient.workouts.getExercises(),
  });

  // 2. Fetch workout split
  const splitQuery = useQuery<WorkoutSplit>({
    queryKey: ['workoutSplit'],
    queryFn: () => apiClient.workouts.getSplit(),
  });

  // 3. Fetch today's session
  const todaySessionQuery = useQuery<WorkoutSession>({
    queryKey: ['workoutToday', date],
    queryFn: () => apiClient.workouts.getTodaySession(date),
    enabled: !!date,
  });

  // 4. Fetch history list
  const historyQuery = useQuery<WorkoutSession[]>({
    queryKey: ['workoutHistory', startDate, endDate],
    queryFn: () => apiClient.workouts.getHistory(startDate!, endDate!),
    enabled: !!startDate && !!endDate,
  });

  // 5. Fetch streaks
  const streakQuery = useQuery<WorkoutStreak>({
    queryKey: ['workoutStreak', date],
    queryFn: () => apiClient.workouts.getStreak(date),
    enabled: !!date,
  });

  // 6. Update split mutation
  const updateSplitMutation = useMutation({
    mutationFn: (weekMap: WorkoutSplit['weekMap']) => apiClient.workouts.updateSplit(weekMap),
    onSuccess: () => {
      toast.success('Workout split updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['workoutSplit'] });
      queryClient.invalidateQueries({ queryKey: ['workoutToday'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update workout split');
    }
  });

  // 7. Save session mutation
  const saveSessionMutation = useMutation({
    mutationFn: (body: WorkoutSession) => {
      // Normalize session payload so backend Zod validation schema passes cleanly
      const cleanedBody = {
        ...body,
        durationMinutes: Math.max(0, Math.round(Number(body.durationMinutes) || 0)),
        completed: Boolean(body.completed),
        exercises: (body.exercises || []).map((ex: any) => ({
          exerciseId: typeof ex.exerciseId === 'object' && ex.exerciseId !== null
            ? (ex.exerciseId._id || ex.exerciseId.id)
            : String(ex.exerciseId || ''),
          notes: String(ex.notes || ''),
          sets: (ex.sets || []).map((s: any, idx: number) => ({
            setNumber: Number(s.setNumber) || (idx + 1),
            reps: Math.max(0, Math.round(Number(s.reps) || 0)),
            weightKg: Math.max(0, Number(s.weightKg) || 0),
            completed: Boolean(s.completed)
          }))
        }))
      };
      return apiClient.workouts.saveSession(cleanedBody as WorkoutSession);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutToday'] });
      queryClient.invalidateQueries({ queryKey: ['workoutHistory'] });
      queryClient.invalidateQueries({ queryKey: ['workoutStreak'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save workout session');
    }
  });

  return {
    exercises: exercisesQuery.data || [],
    split: splitQuery.data,
    todaySession: todaySessionQuery.data,
    history: historyQuery.data || [],
    streak: streakQuery.data,
    
    isLoadingExercises: exercisesQuery.isLoading,
    isLoadingSplit: splitQuery.isLoading,
    isLoadingTodaySession: todaySessionQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isLoadingStreak: streakQuery.isLoading,

    updateSplit: updateSplitMutation.mutateAsync,
    saveSession: saveSessionMutation.mutateAsync,
    isSavingSession: saveSessionMutation.isPending,
    isUpdatingSplit: updateSplitMutation.isPending
  };
};
