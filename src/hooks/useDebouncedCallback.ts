import { useCallback, useEffect, useMemo, useRef } from 'react';

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => clearTimeout(timerRef.current), []);

  useEffect(() => cancel, [cancel]);

  return useMemo(() => {
    const run = (...args: Args) => {
      cancel();
      timerRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    };
    return Object.assign(run, { cancel });
  }, [cancel, delayMs]);
}
