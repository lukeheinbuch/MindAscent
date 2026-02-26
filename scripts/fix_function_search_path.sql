-- Fix search_path for function public.handle_updated_at
-- Run in Supabase SQL editor

ALTER FUNCTION public.handle_updated_at()
SET search_path = public;
