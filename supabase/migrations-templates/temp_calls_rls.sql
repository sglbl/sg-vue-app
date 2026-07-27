-- RLS policies for temp_calls to allow keep-alive scripts to query, insert and delete
ALTER TABLE public.temp_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert temp_calls" ON public.temp_calls;
CREATE POLICY "Anyone can insert temp_calls"
ON public.temp_calls
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read temp_calls" ON public.temp_calls;
CREATE POLICY "Anyone can read temp_calls"
ON public.temp_calls
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Anyone can delete temp_calls" ON public.temp_calls;
CREATE POLICY "Anyone can delete temp_calls"
ON public.temp_calls
FOR DELETE
TO anon
USING (true);
