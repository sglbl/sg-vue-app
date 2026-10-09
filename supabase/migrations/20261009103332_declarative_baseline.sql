CREATE TABLE "public"."reviews" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "content"    text                     NOT NULL,
  "rating"     smallint                 NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "reviews_pkey" PRIMARY KEY (id),
  CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);

ALTER TABLE "public"."reviews"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."temp_calls" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "temp_calls_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."temp_calls"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON "public"."reviews"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "Anyone can submit a review" ON "public"."reviews"
  FOR INSERT
  TO "anon"
  WITH CHECK (true);

CREATE POLICY "Anyone can delete temp_calls" ON "public"."temp_calls"
  FOR DELETE
  TO "anon"
  USING (true);

CREATE POLICY "Anyone can insert temp_calls" ON "public"."temp_calls"
  FOR INSERT
  TO "anon"
  WITH CHECK (true);

CREATE POLICY "Anyone can read temp_calls" ON "public"."temp_calls"
  FOR SELECT
  TO "anon"
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reviews" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."reviews" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reviews" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reviews" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."temp_calls" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."temp_calls" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."temp_calls" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."temp_calls" TO "service_role";
