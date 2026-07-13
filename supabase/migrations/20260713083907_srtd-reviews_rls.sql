-- Generated with srtd from template: supabase/migrations-templates/reviews_rls.sql
-- You very likely **DO NOT** want to manually edit this generated file.

BEGIN;

-- (no dependencies for now)

-- Without this, CREATE POLICY statements are stored but never enforced.
-- The table is created with RLS off by default in Postgres.
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review"
ON public.reviews
FOR INSERT
TO anon
WITH CHECK (true);

COMMIT;
-- Last built: 20260713075737_srtd-reviews_rls.sql
-- Built with https://github.com/t1mmen/srtd
