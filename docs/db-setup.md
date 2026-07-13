# Lesson 13 — Database setup with Supabase + srtd

How to wire `ProductDisplayCloud.vue` + `useCloudReviewsStore` to a real Supabase backend, and how to ship migrations between local Docker and your cloud project.

> Status: do this tomorrow. All commands assume you've already created a Supabase project at [supabase.com](https://supabase.com).

---

## Part 1 — Supabase project setup

### 1.1 Recommended project settings

When creating the Supabase project (or editing settings later):

| Setting | Value |
|---|---|
| **Enable Data API** | ✅ ON |
| **Automatically expose new tables** | ❌ OFF |
| **Enable automatic RLS** | ✅ ON |

These match what your [AGENTS.md](../.claude/AGENTS.md) workflow expects: manual control of access, RLS on by default.

### 1.2 One-time CLI setup

```bash
brew install supabase/tap/supabase    # if not installed
supabase init                          # creates supabase/ folder
supabase login                         # browser auth
supabase link --project-ref <ref>      # ref is in your project's dashboard URL
```

```bash
srtd init
supabase start
```

### 1.3 Create the `reviews` table — declarative schema

Create `supabase/schemas/reviews.sql`:

```sql
create table public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  content     text        not null,
  rating      smallint    not null check (rating between 1 and 5),
  created_at  timestamptz not null default now()
);
```

Generate the migration:

```bash
supabase db diff -f create_reviews_table
```

### 1.4 Create RLS policies — srtd template

Create `supabase/migrations-templates/reviews_rls.sql`:

```sql
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
```

The two flows (supabase migrations + srtd templates) **don't auto-coordinate**.
Before `srtd apply` can succeed, the `reviews` table has to already exist
locally. Run them in order, every time you change either side:

```bash
supabase db reset      # drops & replays all of supabase/migrations/*.sql
srtd apply             # now the RLS template finds public.reviews
```

Both must succeed. `supabase db reset` is your canary — if the migration
can't replay from scratch, it won't survive a push to cloud. If `srtd apply`
errors with "table or view does not exist", you skipped the reset.

During development, prefer `srtd watch --json` in the background so the
RLS template re-applies automatically when you save changes.

### 1.5 Bundle + push to remote

Two commands — `srtd build` first, then `supabase db push`. **Don't skip
`srtd build`**: without it, `supabase/migrations/` only has your schema
diff, the cloud DB gets the table but no RLS, and PostgREST returns
401/403 to anon.

```bash
srtd build             # bundles RLS templates into supabase/migrations/*.sql
supabase db push       # pushes ALL pending migrations to cloud
```

Local dev only ever needs `srtd apply` / `srtd watch` — `build` is what
packages templates into migration files for the cloud to consume.

> The "failed to cache migrations catalog / pgdelta-target-ca.crt" warning
> at the end of `supabase db push` is harmless — the push completes. It's
> a known issue with the pg-delta migration cache, not the apply itself.

### 1.6 Verify it worked

In the Supabase dashboard:
- **Table Editor** → `reviews` table exists with the 5 columns
- **Authentication → Policies** → both policies listed
- **SQL Editor** → run `select count(*) from public.reviews;` → returns `0`

From your app (lesson 13 view):
- Submit a review → check Table Editor → row appears
- Refresh page → review still there (came from `select`)
- Open in a different browser/incognito → review still there (cloud, not local)

If the table exists but policies are missing, you skipped `srtd build`
between §1.4 and §1.5 — run it now and `supabase db push` again.

### 1.7 Frontend env vars

Use Vite's mode system so you never have to swap URLs by hand.

Add `--mode dev` and `--mode prod` to [package.json](../package.json):

```json
"scripts": {
  "dev": "vite --mode dev",
  "build": "run-p type-check \"build-only {@}\" --",
  "build-only": "vite build --mode prod",
  ...
}
```

Then create two files in the project root:

```
# .env.dev        — loaded by `npm run dev`, points at local Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# .env.prod       — loaded by `npm run build`, points at cloud Supabase
VITE_SUPABASE_URL=https://rkaqocbrzanvclijijue.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

To verify against cloud during dev without rebuilding:
```bash
npm run dev --mode prod
```

Local values come from `supabase status` (Project URL + Publishable key).
Cloud values come from Dashboard → Settings → API.

Both the URL and the **anon/publishable** key are public-by-design — they're
shipped to the browser either way, so it's fine to commit both files. Never
put the `service_role` key or DB password in a Vite env file.

`import.meta.env.MODE` will return `'dev'` / `'prod'` (not
`'development'` / `'production'`). `import.meta.env.DEV` and `PROD` are
unaffected.

Restart `npm run dev` after creating/changing these files (Vite reads
them on boot).

Update `env.d.ts` so TypeScript knows these vars exist:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  const component: DefineComponent<{}, {}, any>
  export default component
}
```
