-- (no dependencies for now)

-- Without this, CREATE POLICY statements are stored but never enforced.
-- The table is created with RLS off by default in Postgres.
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anyone can submit a review"
ON public.reviews
FOR INSERT
TO anon
WITH CHECK (true);