import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type AuthState = {
  loading: boolean;
  user: any | null;
  session: any | null;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<{ session: any | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ session: any | null }>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial hydration
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) console.error('getSession error:', error);
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    // Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      sess: Session | null
    ) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => ({
    loading,
    user,
    session,
    error,
    clearError: () => setError(null),
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('signIn error:', error);
        setError(error.message);
        throw error;
      }
      // Returns { user, session }
      return { session: data.session ?? null };
    },
    signUp: async (email, password, metadata) => {
      const emailRedirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/confirm`
        : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo, data: metadata || undefined }
      });
      if (error) {
        console.error('signUp error:', error);
        setError(error.message);
        throw error;
      }
      // If email confirmation is required, session will be null here (expected).
      return { session: data.session ?? null };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  }), [loading, user, session, error]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
