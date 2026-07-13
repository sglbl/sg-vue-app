create table public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  content     text        not null,
  rating      smallint    not null check (rating between 1 and 5),
  created_at  timestamptz not null default now()
);

-- Grants: `supabase db diff` does NOT emit DML grants (SELECT/INSERT/UPDATE/DELETE)
-- by default — only MAINTAIN/REFERENCES/TRIGGER/TRUNCATE. Without these, anon
-- gets 401 even with valid RLS policies. RLS (defined in the srtd template) still
-- gates row-level access; these GRANTs restore the base privilege to reach it.
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;