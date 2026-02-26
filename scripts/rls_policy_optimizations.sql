-- MindAscent: RLS policy initplan optimizations + duplicate cleanup
-- Run this in the Supabase SQL editor.

-- 1) Preview current policies on affected tables
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'check_ins', 'xp_ledger', 'streaks', 'photos')
order by tablename, policyname;

-- 2) Optimize policies by wrapping auth.*() and current_setting() calls
--    to avoid per-row re-evaluation.
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'check_ins', 'xp_ledger', 'streaks', 'photos')
  LOOP
    new_qual := r.qual;
    new_check := r.with_check;

    IF new_qual IS NOT NULL THEN
      new_qual := regexp_replace(new_qual, 'auth\.([a-zA-Z_][a-zA-Z0-9_]*)\(\)', '(select auth.\1())', 'g');
      new_qual := regexp_replace(new_qual, 'current_setting\(([^)]*)\)', '(select current_setting(\1))', 'g');
    END IF;

    IF new_check IS NOT NULL THEN
      new_check := regexp_replace(new_check, 'auth\.([a-zA-Z_][a-zA-Z0-9_]*)\(\)', '(select auth.\1())', 'g');
      new_check := regexp_replace(new_check, 'current_setting\(([^)]*)\)', '(select current_setting(\1))', 'g');
    END IF;

    IF new_qual IS DISTINCT FROM r.qual OR new_check IS DISTINCT FROM r.with_check THEN
      IF new_qual IS NULL AND new_check IS NULL THEN
        -- No-op
        NULL;
      ELSIF new_qual IS NULL THEN
        EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (%s)', r.policyname, r.schemaname, r.tablename, new_check);
      ELSIF new_check IS NULL THEN
        EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)', r.policyname, r.schemaname, r.tablename, new_qual);
      ELSE
        EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s) WITH CHECK (%s)', r.policyname, r.schemaname, r.tablename, new_qual, new_check);
      END IF;
    END IF;
  END LOOP;
END $$;

-- 3) Remove duplicate permissive policies (case-variant duplicates)
DROP POLICY IF EXISTS "Profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;

-- 4) Remove duplicate index (keep profiles_username_lower_unique)
DROP INDEX IF EXISTS public.unique_username_lower;
