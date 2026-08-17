import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { toast } from 'react-hot-toast';

export interface GenerateCoverLetterParams {
  jobDescription: string;
  userProfile?: string;
  company?: string;
  role?: string;
}

export interface GenerateResumeBulletsParams {
  jobDescription: string;
  rawExperience: string;
  company?: string;
  role?: string;
}

export const useGenerateCoverLetter = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: GenerateCoverLetterParams) => {
      const normalizedDesc = (params.jobDescription || '').trim().slice(0, 1500);
      const normalizedCompany = (params.company || '').trim().toLowerCase();
      const normalizedRole = (params.role || '').trim().toLowerCase();
      const cacheKey = ['ai_cover_letter', normalizedDesc, normalizedCompany, normalizedRole];

      const cached = queryClient.getQueryData<{ coverLetter: string }>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiClient.ai.generateCoverLetter({
        ...params,
        jobDescription: normalizedDesc,
      });

      queryClient.setQueryData(cacheKey, result);
      return result;
    },
    onSuccess: () => {
      toast.success('Cover letter generated!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate cover letter');
    },
  });

  return {
    generateCoverLetter: mutation.mutateAsync,
    isGeneratingCoverLetter: mutation.isPending,
    errorCoverLetter: mutation.error,
  };
};

export const useGenerateResumeBullets = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: GenerateResumeBulletsParams) => {
      const normalizedDesc = (params.jobDescription || '').trim().slice(0, 1500);
      const normalizedExp = (params.rawExperience || '').trim().slice(0, 800);
      const normalizedCompany = (params.company || '').trim().toLowerCase();
      const normalizedRole = (params.role || '').trim().toLowerCase();
      const cacheKey = ['ai_resume_bullets', normalizedDesc, normalizedExp, normalizedCompany, normalizedRole];

      const cached = queryClient.getQueryData<{ bullets: string[] }>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiClient.ai.generateResumeBullets({
        ...params,
        jobDescription: normalizedDesc,
        rawExperience: normalizedExp,
      });

      queryClient.setQueryData(cacheKey, result);
      return result;
    },
    onSuccess: () => {
      toast.success('Resume bullets generated!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate resume bullets');
    },
  });

  return {
    generateResumeBullets: mutation.mutateAsync,
    isGeneratingBullets: mutation.isPending,
    errorBullets: mutation.error,
  };
};

export interface GenerateStudyPlanParams {
  topicName: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const useGenerateStudyPlan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: GenerateStudyPlanParams) => {
      const normalizedTopic = (params.topicName || '').trim().slice(0, 100).toLowerCase();
      const cacheKey = ['ai_study_plan', normalizedTopic, params.skillLevel];

      const cached = queryClient.getQueryData<{ subTopics: { title: string }[] }>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiClient.ai.generateStudyPlan({
        ...params,
        topicName: normalizedTopic,
      });

      queryClient.setQueryData(cacheKey, result);
      return result;
    },
    onSuccess: () => {
      toast.success('Curriculum generated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate curriculum');
    },
  });

  return {
    generateStudyPlan: mutation.mutateAsync,
    isGeneratingStudyPlan: mutation.isPending,
    errorStudyPlan: mutation.error,
  };
};

export const useGenerateWorkoutSplit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: { daysPerWeek: number; goal: string; experienceLevel: string }) => {
      const normalizedGoal = (body.goal || '').trim().toLowerCase();
      const normalizedExp = (body.experienceLevel || '').trim().toLowerCase();
      const cacheKey = ['ai_workout_split', body.daysPerWeek, normalizedGoal, normalizedExp];

      const cached = queryClient.getQueryData<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiClient.ai.generateWorkoutSplit(body);
      queryClient.setQueryData(cacheKey, result);
      return result;
    },
    onSuccess: () => {
      toast.success('Workout split generated!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate split');
    }
  });
  return {
    generateWorkoutSplit: mutation.mutateAsync,
    isGeneratingWorkoutSplit: mutation.isPending,
  };
};

export const useGenerateWorkoutSession = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: {
      date: string;
      muscleGroup: string;
      equipment: string[];
      fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
      painFlags?: string[];
    }) => {
      const normalizedMuscle = (body.muscleGroup || '').trim().toLowerCase();
      const normalizedEquip = [...(body.equipment || [])].sort().join(',');
      const normalizedPains = [...(body.painFlags || [])].sort().join(',');
      // Strictly date-scoped cache key to prevent serving stale sessions across dates
      const cacheKey = ['ai_workout_session', body.date, normalizedMuscle, normalizedEquip, body.fitnessLevel, normalizedPains];

      const cached = queryClient.getQueryData<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await apiClient.ai.generateWorkoutSession(body);
      queryClient.setQueryData(cacheKey, result);
      return result;
    },
    onSuccess: () => {
      toast.success('Workout session generated!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate workout session');
    }
  });
  return {
    generateWorkoutSession: mutation.mutateAsync,
    isGeneratingWorkoutSession: mutation.isPending,
  };
};

export const useParseWorkoutLog = () => {
  const mutation = useMutation({
    mutationFn: (body: { rawText: string; date: string }) => apiClient.ai.parseWorkoutLog(body),
    onSuccess: () => {
      toast.success('Workout log parsed successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to parse workout log');
    }
  });
  return {
    parseWorkoutLog: mutation.mutateAsync,
    isParsingWorkoutLog: mutation.isPending,
  };
};

export const useCheckPlateau = () => {
  const mutation = useMutation({
    mutationFn: () => apiClient.ai.checkPlateau(),
    onSuccess: (data) => {
      if (data.plateauDetected) {
        toast.success('Plateau analysis completed. Plateau detected!');
      } else {
        toast.success('Plateau analysis completed. No plateau detected.');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to check plateau');
    }
  });
  return {
    checkPlateau: mutation.mutateAsync,
    isCheckingPlateau: mutation.isPending,
    data: mutation.data,
    error: mutation.error
  };
};

export const useDetectEquipment = () => {
  const mutation = useMutation({
    mutationFn: (body: { image: string }) => apiClient.ai.detectEquipment(body),
    onSuccess: (data) => {
      toast.success(`Equipment scan completed! Detected: ${data.detectedEquipment.join(', ') || 'none'}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to scan equipment');
    }
  });
  return {
    detectEquipment: mutation.mutateAsync,
    isDetectingEquipment: mutation.isPending,
    data: mutation.data,
    error: mutation.error
  };
};

export const useCoachChat = () => {
  const mutation = useMutation({
    mutationFn: (body: { threadId?: string; message: string }) => apiClient.ai.coachChat(body),
    onError: (err: any) => {
      toast.error(err.message || 'Coach chat connection failed');
    }
  });
  return {
    sendMessage: mutation.mutateAsync,
    isSendingMessage: mutation.isPending,
    data: mutation.data,
    error: mutation.error
  };
};

export const useRegenerateSplit = () => {
  const mutation = useMutation({
    mutationFn: () => apiClient.ai.regenerateSplit(),
    onSuccess: (data) => {
      if (data.splitRegenerated) {
        toast.success('Workout split regenerated!');
      } else {
        toast.success(data.message || 'All days have healthy compliance rates.');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to regenerate workout split');
    }
  });
  return {
    regenerateSplit: mutation.mutateAsync,
    isRegeneratingSplit: mutation.isPending,
    data: mutation.data,
    error: mutation.error
  };
};
