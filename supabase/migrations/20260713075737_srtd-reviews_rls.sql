-- Generated with srtd from template: supabase/migrations-templates/reviews_rls.sql
-- You very likely **DO NOT** want to manually edit this generated file.

BEGIN;

-- (no dependencies for now)

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
-- Last built: Never
-- Built with https://github.com/t1mmen/srtd
