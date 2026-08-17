import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGenerateStudyPlan, useGenerateCoverLetter } from '../hooks/useAI';
import { apiClient } from '../lib/api-client';

describe('Deterministic React Query AI Caching', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should cache study plan output and avoid secondary network call for identical input', async () => {
    const apiSpy = vi.spyOn(apiClient.ai, 'generateStudyPlan').mockResolvedValue({
      subTopics: [{ title: 'Graph Traversal' }, { title: 'Dijkstra Algorithm' }],
    });

    const { result } = renderHook(() => useGenerateStudyPlan(), { wrapper });

    // First call: calls API
    let res1: any;
    await act(async () => {
      res1 = await result.current.generateStudyPlan({
        topicName: 'Graph Theory',
        skillLevel: 'intermediate',
      });
    });

    expect(apiSpy).toHaveBeenCalledTimes(1);
    expect(res1?.subTopics.length).toBe(2);

    // Second call with same inputs: returns cached data without calling API again
    let res2: any;
    await act(async () => {
      res2 = await result.current.generateStudyPlan({
        topicName: 'Graph Theory',
        skillLevel: 'intermediate',
      });
    });

    expect(apiSpy).toHaveBeenCalledTimes(1); // Still 1!
    expect(res2).toEqual(res1);

    // Third call with DIFFERENT input: triggers new API call
    await act(async () => {
      await result.current.generateStudyPlan({
        topicName: 'Dynamic Programming',
        skillLevel: 'intermediate',
      });
    });

    expect(apiSpy).toHaveBeenCalledTimes(2);
  });

  it('should cache cover letter generation output based on normalized job description', async () => {
    const apiSpy = vi.spyOn(apiClient.ai, 'generateCoverLetter').mockResolvedValue({
      coverLetter: 'Dear Hiring Manager, I am excited to apply for...',
    });

    const { result } = renderHook(() => useGenerateCoverLetter(), { wrapper });

    await act(async () => {
      await result.current.generateCoverLetter({
        jobDescription: 'Senior Software Engineer with Node.js and TypeScript experience.',
        company: 'Stripe',
        role: 'Backend Engineer',
      });
    });

    expect(apiSpy).toHaveBeenCalledTimes(1);

    // Repeat with identical company, role, description
    await act(async () => {
      await result.current.generateCoverLetter({
        jobDescription: 'Senior Software Engineer with Node.js and TypeScript experience.',
        company: 'Stripe',
        role: 'Backend Engineer',
      });
    });

    expect(apiSpy).toHaveBeenCalledTimes(1);
  });
});
