import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface RequireGuestProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * RequireGuest component - Stable guest guard with no automatic redirects
 */
export const RequireGuest: React.FC<RequireGuestProps> = ({ 
  children, 
  redirectTo = '/dashboard'
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);
  const [grace, setGrace] = React.useState(true);

  // brief grace to avoid double-renders fighting navigation
  React.useEffect(() => {
    if (!grace) return;
    const t = setTimeout(() => setGrace(false), 300);
    return () => clearTimeout(t);
  }, [grace]);

  // Auto-redirect once user and profile are ready after signup
  useEffect(() => {
    if (loading || grace) return;
    if (!user) return;
    if (redirectedRef.current) return;

    redirectedRef.current = true;
    router.replace(redirectTo);
  }, [user, loading, grace, redirectTo, router]);

  // Show loading only during initial auth check
  if (loading || grace) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading text="Loading..." />
      </div>
    );
  }

  // If user is authenticated, redirect effect will run; show a brief redirecting state
  if (user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading text="Redirecting..." />
      </div>
    );
  }

  return <>{children}</>;
};
