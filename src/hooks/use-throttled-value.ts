import { useEffect, useRef, useState } from "react";

/**
 * Throttles a rapidly changing value (e.g. the agreement while typing) so the
 * heavy paginated preview only re-renders every `delay` ms at most.
 * `pending` is true while the latest edit has not reached the preview yet.
 */
export function useThrottledValue<T>(value: T, delay = 400): { value: T; pending: boolean } {
  const [throttled, setThrottled] = useState(value);
  const lastRun = useRef(0);

  useEffect(() => {
    if (Object.is(throttled, value)) return;
    const now = Date.now();
    const wait = Math.max(0, delay - (now - lastRun.current));
    const t = window.setTimeout(() => {
      lastRun.current = Date.now();
      setThrottled(value);
    }, wait);
    return () => window.clearTimeout(t);
  }, [value, delay, throttled]);

  return { value: throttled, pending: !Object.is(throttled, value) };
}
