CREATE TABLE public.reviews (id uuid DEFAULT gen_random_uuid() NOT NULL, name text NOT NULL, content text NOT NULL, rating smallint NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.reviews TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.reviews TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.reviews TO service_role;
