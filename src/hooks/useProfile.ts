import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  sport: string | null;
  level: string | null;
  age?: number | null;
  country?: string | null;
  goals?: string[] | null;
  about?: string | null;
  avatar_url: string | null;
  created_at?: string;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      setError(undefined);
      try {
        let resp = await supabase
          .from('profiles')
          .select('id, display_name, username, sport, level, age, country, goals, about, avatar_url, created_at')
          .eq('id', user.id)
          .single();
        if (resp.error) {
          // Fallback if some columns don't exist in schema
          resp = await supabase
            .from('profiles')
            .select('id, display_name, sport, level, avatar_url, created_at')
            .eq('id', user.id)
            .single();
        }
        if (resp.error) throw resp.error;
        if (!cancelled) setProfile(resp.data as Profile);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [user?.id]);

  return { profile, isLoading, error };
}
