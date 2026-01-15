-- Add source_id column and unique constraint for idempotent XP ledger writes
DO $$
BEGIN
  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xp_ledger' AND column_name = 'source_id'
  ) THEN
    ALTER TABLE public.xp_ledger ADD COLUMN source_id text;
  END IF;

  -- Create unique index on (user_id, source, source_id) to prevent duplicates
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'uniq_xp_ledger_user_source_sourceid' AND n.nspname = 'public'
  ) THEN
    CREATE UNIQUE INDEX uniq_xp_ledger_user_source_sourceid
      ON public.xp_ledger (user_id, source, source_id);
  END IF;
END$$;