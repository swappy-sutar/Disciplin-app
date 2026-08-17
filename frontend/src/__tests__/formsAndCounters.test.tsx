import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('Frontend Form Inputs & Debounce Hooks', () => {
  it('should debounce rapidly changing values by the specified delay', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'init' },
    });

    expect(result.current).toBe('init');

    // Rapid typing
    rerender({ val: 'G' });
    rerender({ val: 'Go' });
    rerender({ val: 'Goo' });
    rerender({ val: 'Google' });

    // Immediately still 'init'
    expect(result.current).toBe('init');

    // Advance timer 299ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('init');

    // Advance past 300ms
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(result.current).toBe('Google');

    vi.useRealTimers();
  });
});
