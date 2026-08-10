import { useEffect, useRef, useCallback } from 'react';

// Polls `callback` every `intervalMs` while the page is visible, and also reruns
// it when the user returns to / focuses the tab. This keeps the storefront live
// (new products, offers, likes) without a full manual page reload.
export function useAutoRefresh(callback: () => void | Promise<void>, intervalMs = 30000) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const run = useCallback(() => {
    if (!isMounted.current) return;
    const res = cbRef.current();
    if (res && typeof (res as Promise<void>).then === 'function') {
      (res as Promise<void>).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden && isMounted.current) run();
    }, Math.max(intervalMs, 10000));

    function handleVisible() {
      if (!document.hidden && isMounted.current) run();
    }

    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [run, intervalMs]);
}