import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/**
 * Hook to safely navigate without causing redirect loops
 */
export const useSafeNavigation = () => {
  const router = useRouter();
  const lastNavigationRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const safeNavigate = (path: string) => {
    // Prevent navigating to the same path multiple times
    if (lastNavigationRef.current === path || router.pathname === path) {
      return;
    }

    // Clear any pending navigation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce navigation to prevent rapid redirects
    timeoutRef.current = setTimeout(() => {
      lastNavigationRef.current = path;
      router.replace(path);
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { safeNavigate };
};
