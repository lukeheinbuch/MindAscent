import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface RequireGuestProps {
  children: React.ReactNode;
  // redirectTo kept for backward-compatibility, but ignored now to allow access
  redirectTo?: string;
}

/**
 * RequireGuest component - Stable guest guard with no automatic redirects
 */
export const RequireGuest: React.FC<RequireGuestProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading only during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading text="Loading..." />
      </div>
    );
  }

  // IMPORTANT: Do not redirect if authenticated. Allow user to access login/signup intentionally.
  // You may optionally show a notice in the page components if user is already signed in.
  return <>{children}</>;
};
