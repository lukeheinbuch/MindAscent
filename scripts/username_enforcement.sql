-- MindAscent: Username Uniqueness & Availability
-- Run this in the Supabase SQL editor.

-- 1) Normalize empties to NULL (unique index ignores NULLs)
update public.profiles
set username = null
where username is not null and length(btrim(username)) = 0;

-- 2) (Optional) Inspect duplicates before creating the unique index
--    Manually adjust duplicates in the Table Editor or with updates.
--    This query lists any case-insensitive duplicates.
--    If it returns zero rows, you can proceed to step 3 safely.
--
-- select lower(username) as uname, count(*) as c,
--        string_agg(id::text, ',') as user_ids
-- from public.profiles
-- where username is not null
-- group by 1
-- having count(*) > 1
-- order by c desc;

-- Optionally list the specific rows to fix:
-- select id, email, username
-- from public.profiles
-- where username is not null and lower(username) in (
--   select lower(username)
--   from public.profiles
--   where username is not null
--   group by 1
--   having count(*) > 1
-- )
-- order by lower(username), id;

-- 3) Create a unique, case-insensitive index on username
--    This enforces uniqueness even when RLS prevents the app from seeing other users.
create unique index if not exists profiles_username_lower_unique
  on public.profiles ((lower(username)))
  where username is not null;

-- 4) RPC to check availability (bypasses RLS), used by /api/supabase/check-username
create or replace function public.is_username_available(u text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1
    from public.profiles
    where username is not null
      and lower(username) = lower(u)
  );
$$;

-- Restrict and grant execute
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- Notes:
-- - Step 2 must show no duplicates before step 3 succeeds.
-- - The API already attempts to use this RPC; with it in place, availability checks are accurate.
-- - The /api/supabase/ensure-profile endpoint will also catch DB unique violations and return 409.
