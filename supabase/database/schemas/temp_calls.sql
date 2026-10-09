create table public.temp_calls (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now()
);

-- Grants: `supabase db diff` does NOT emit DML grants by default.
GRANT SELECT, INSERT, DELETE ON public.temp_calls TO anon;
GRANT SELECT, INSERT, DELETE ON public.temp_calls TO authenticated;
