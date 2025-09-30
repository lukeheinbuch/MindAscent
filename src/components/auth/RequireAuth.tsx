import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * RequireAuth component - Stable auth guard with no automatic redirects
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  redirectTo = '/login'
}) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);
  const [grace, setGrace] = useState(true);

  // Short grace window to let auth state settle after sign-in
  useEffect(() => {
    if (!grace) return;
    const t = setTimeout(() => setGrace(false), 800);
    return () => clearTimeout(t);
  }, [grace]);
  
  // Auto-redirect if not authenticated once loading and grace are done
  useEffect(() => {
    if (loading || grace) return;
    if (user) return; // do not redirect if authenticated
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    router.replace(redirectTo);
  }, [user, loading, grace, redirectTo, router]);

  // Show loading screen while auth is loading
  if (loading || grace) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading text="Authenticating..." />
      </div>
    );
  }

  // If unauthenticated (after effect triggers), show a brief redirecting state
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading text="Redirecting..." />
      </div>
    );
  }

  // Show error state if needed
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Authentication Error</div>
          <div className="text-gray-400 mb-6">{error}</div>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};
