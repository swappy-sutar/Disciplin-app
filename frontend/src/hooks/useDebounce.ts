import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapidly changing values (e.g. search / filter inputs).
 * Prevents re-filtering and unnecessary network requests on every keystroke.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to wait before updating debounced value (default: 350ms)
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
