import { vi } from 'vitest';

export const mockCreateCompletion = vi.fn();

/**
 * Reusable Gemini / OpenAI client mock helper.
 * Standardizes mocking across all AI tests.
 */
export function setupGeminiMock() {
  vi.mock('openai', () => {
    return {
      default: vi.fn().mockImplementation(function () {
        return {
          chat: {
            completions: {
              create: mockCreateCompletion,
            },
          },
        };
      }),
    };
  });
}

/**
 * Mocks a successful Gemini JSON response string.
 */
export function mockGeminiJsonResponse(data: any) {
  mockCreateCompletion.mockResolvedValueOnce({
    choices: [
      {
        message: {
          content: typeof data === 'string' ? data : JSON.stringify(data),
        },
      },
    ],
  });
}

/**
 * Mocks an AI timeout or network error.
 */
export function mockGeminiNetworkError(message: string = 'Gemini API connection timed out') {
  mockCreateCompletion.mockRejectedValueOnce(new Error(message));
}

/**
 * Mocks malformed JSON response to test retry logic.
 */
export function mockGeminiMalformedJson() {
  mockCreateCompletion.mockResolvedValueOnce({
    choices: [
      {
        message: {
          content: '```json\n{ "invalid": json without closing quote \n```',
        },
      },
    ],
  });
}

/**
 * Mocks Gemini Rate Limit error (429 status code).
 */
export function mockGeminiRateLimitError() {
  const err: any = new Error('Resource has been exhausted (e.g. check quota)');
  err.status = 429;
  mockCreateCompletion.mockRejectedValueOnce(err);
}
