import { useMutation } from '@tanstack/react-query';
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
  const mutation = useMutation({
    mutationFn: (params: GenerateCoverLetterParams) => apiClient.ai.generateCoverLetter(params),
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
  const mutation = useMutation({
    mutationFn: (params: GenerateResumeBulletsParams) => apiClient.ai.generateResumeBullets(params),
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
  const mutation = useMutation({
    mutationFn: (params: GenerateStudyPlanParams) => apiClient.ai.generateStudyPlan(params),
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
  const mutation = useMutation({
    mutationFn: (body: { daysPerWeek: number; goal: string; experienceLevel: string }) =>
      apiClient.ai.generateWorkoutSplit(body),
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
  const mutation = useMutation({
    mutationFn: (body: {
      date: string;
      muscleGroup: string;
      equipment: string[];
      fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
      painFlags?: string[];
    }) => apiClient.ai.generateWorkoutSession(body),
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
