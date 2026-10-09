# Database setup with Supabase Declarative Schemas

How to wire `ProductDisplayCloud.vue` + `useCloudReviewsStore` to a real Supabase backend, and how to ship migrations between local Docker and your cloud project using Supabase's native declarative schema engine (`pg-delta`).

---

## Part 1 — Supabase project setup

### 1.1 Recommended project settings

When creating the Supabase project (or editing settings later):

| Setting | Value |
|---|---|
| **Enable Data API** | ✅ ON |
| **Automatically expose new tables** | ❌ OFF |
| **Enable automatic RLS** | ✅ ON |

These match what your declarative workflow expects: manual control of access, RLS enabled on all tables.

### 1.2 One-time CLI setup

```bash
brew install supabase/tap/supabase    # if not installed
supabase init                          # creates supabase/ folder
supabase login                         # browser auth
supabase link --project-ref <ref>      # ref is in your project's dashboard URL
supabase start                         # boots local Postgres + Studio on http://127.0.0.1:54323
```

### 1.3 Declarative Schemas (`pg-delta`)

The source of truth for the database lives in `supabase/database/` (configured in `supabase/config.toml` under `[experimental.pgdelta]`).

#### Table Definition
In `supabase/database/schemas/reviews.sql`:

```sql
create table public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  content     text        not null,
  rating      smallint    not null check (rating between 1 and 5),
  created_at  timestamptz not null default now()
);

-- DML grants for anon and authenticated roles
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
```

#### Row Level Security (RLS)
In `supabase/database/rls/reviews_rls.sql`:

```sql
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
```

### 1.4 Generating Migrations

Generate a migration by diffing existing migrations against the declared schemas:

```bash
supabase db schema declarative sync -f create_reviews_table --no-apply
```

This generates a versioned migration file under `supabase/migrations/` in chronological order with all dependencies properly resolved.

### 1.5 Applying Locally

```bash
supabase migration up
```

Alternatively, to verify that migrations replay cleanly from scratch:

```bash
supabase db reset
```

#### When to use `supabase migration up` vs `supabase db reset`

| Command | What it does | When to use |
|---|---|---|
| `supabase migration up` | Applies only pending migrations, preserves existing data | Fast iteration during local dev |
| `supabase db reset` | Drops DB and replays all migrations from scratch | Before pushing to cloud to verify the migration history is reproducible |

### 1.6 Regenerate TypeScript Types

`supabase/database.types.ts` mirrors the database schema. Re-run after applying schema changes:

```bash
npx supabase gen types typescript --local > supabase/database.types.ts
```

For cloud:
```bash
npx supabase gen types typescript --linked > supabase/database.types.ts
```

### 1.7 Push to Cloud

When the local setup is verified:

```bash
supabase db push
```

### 1.8 Summary of Workflow Commands

| Command | Touches | Purpose |
|---|---|---|
| `supabase db schema declarative sync -f <name> --no-apply` | Files only | Generate migration from `supabase/database/` |
| `supabase migration up` | **Local DB** | Apply pending migrations locally |
| `supabase db reset` | **Local DB** | Reset & verify clean replay locally |
| `supabase db push` | **Cloud DB** | Deploy migrations to cloud project |

### 1.9 Frontend Env Vars

Vite uses `--mode dev` and `--mode prod` to switch between local and cloud:

```
# .env.dev        — loaded by `npm run dev`, points at local Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# .env.prod       — loaded by `npm run build` or `npm run dev:prod`, points at cloud Supabase
VITE_SUPABASE_URL=https://rkaqocbrzanvclijijue.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Run against cloud during dev:
```bash
npm run dev:prod
```
