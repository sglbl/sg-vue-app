# Database setup with Supabase + srtd

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

> ⚠️ **`supabase db diff` does not emit DML grants.** The generated migration
> will only grant `MAINTAIN`, `REFERENCES`, `TRIGGER`, `TRUNCATE` to each role —
> no `SELECT` or `INSERT`. Without explicit DML grants, anon gets 401 even
> with valid RLS policies. The fix is to **declare them in the schema** so the
> next `db diff` picks them up:
>
> ```sql
> GRANT SELECT, INSERT ON public.reviews TO anon;
> GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
> ```
>
> Then `supabase db diff -f fix_reviews_grants` regenerates the migration
> with proper GRANTs. **Never** hand-write a migration — see [.claude/AGENTS.md](../.claude/AGENTS.md) for the source-of-truth rules.
>
> The diff will also emit false-positive `DROP POLICY` statements (it doesn't
> know policies are srtd-owned). Remove those lines from the generated file
> with a comment — they're tool output, not source-of-truth edits.

### 1.4 Create RLS policies — srtd template

Create `supabase/migrations-templates/reviews_rls.sql`:

```sql
-- (no dependencies for now)

-- Without this, CREATE POLICY statements are stored but never enforced.
-- Postgres creates tables with RLS off by default — Studio will show
-- "unrestricted" even though policies exist.
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

### 1.5 Apply locally

After the schema and srtd templates are in place, generate migrations
and replay them on the **local DB**:

```bash
srtd build                     # bundles RLS templates into supabase/migrations/*.sql
supabase db reset              # drops & replays all of supabase/migrations/*.sql locally
```

`supabase db reset` is **local only** — it does not touch cloud. It replays
every migration in order (including the bundled RLS from `srtd build`), so
after a reset your local DB has tables + RLS + GRANTs in sync with the
schema and templates.

#### When to use `supabase migration up` instead

| Command | What it does | Use when |
|---|---|---|
| `supabase db reset` | Drops DB, replays every migration from scratch | **Before pushing to cloud** — verifies the whole chain is replayable |
| `supabase migration up` | Applies only the pending migrations, keeps existing data | Mid-dev iteration when you've added one new migration and don't want to wipe local data |
| `supabase start` | First boot — auto-runs `migration up` for you | First time, after `supabase init` |

If you only run `supabase migration up`, you skip the canary check. Use it
for fast iteration; switch to `db reset` before any push.

#### Rolling back

To rewind local to a specific migration:

```bash
supabase db reset --version <timestamp>
```

This drops + replays everything up to and including that timestamp. Useful
when a migration is broken mid-dev. **Never** roll back a version that's
already deployed to cloud — instead, write a forward migration that reverts
the change.

During development, prefer `srtd watch --json` in the background so the
RLS template re-applies automatically when you save changes.

### 1.6 Push to cloud

When the local setup is verified, ship the same migrations to **cloud**:

```bash
supabase db push               # pushes ALL pending migrations to cloud
```

`supabase db push` is **cloud only** — it does not touch local. After a
push, your local DB is still in its pre-push state. Run `supabase db reset`
to mirror cloud locally.

> The "failed to cache migrations catalog / pgdelta-target-ca.crt" warning
> at the end of `supabase db push` is harmless — the push completes. It's
> a known issue with the pg-delta migration cache, not the apply itself.

### 1.7 Local vs cloud at a glance

The two databases are **independent**. Both `supabase db reset` and
`supabase db push` read from the same `supabase/migrations/` folder, but
write to different DBs.

| Command | Touches | When to run |
|---|---|---|
| `supabase db diff -f <name>` | None (generates files) | After `supabase/schemas/*.sql` changes |
| `srtd build` | None (generates files) | After `supabase/migrations-templates/*.sql` changes |
| `supabase db reset` | **Local DB** | After any new migration lands — verifies clean replay |
| `supabase db push` | **Cloud DB** | When ready to ship verified migrations |
| `srtd apply` | **Local DB** | Fast-apply during dev (skips the full reset) |
| `srtd watch --json` | **Local DB** | Live reload RLS changes during dev |

Typical loop after a schema or template change:

```bash
supabase db reset     # local: replay + verify
supabase db push      # cloud: ship the same migrations
```

- If you only run `supabase db push`, **cloud** updates but **local** stays stale.
- If you only run `supabase db reset`, **local** updates but **cloud** stays stale.

**The two commands do not touch each other.** After any change to `supabase/migrations/`, run both to keep them in sync.

### 1.8 Verify both

**Local DB** — Supabase Studio at `http://127.0.0.1:54323`:
- **Table Editor** → `reviews` table exists with the 5 columns
- **Authentication → Policies** → both policies listed
- **SQL Editor** → run `select count(*) from public.reviews;` → returns `0`

**Cloud DB** — Dashboard at `https://supabase.com/dashboard/project/<ref>`:
- Same three checks as local

From your app:
- `npm run dev` → submits/reviews hit **local**
- `npm run dev:prod` → submits/reviews hit **cloud**
- Submit a review → row appears in the matching DB

If the table exists on cloud but policies are missing, you skipped
`srtd build` between §1.4 and §1.6 — run it now and `supabase db push` again.

If `npm run dev` returns 401 from local PostgREST but `npm run dev:prod`
works against cloud, your local DB is stale — run `supabase db reset`.

### 1.9 Frontend env vars

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
npm run dev:prod
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

---

## Appendix — what declarative schemas DON'T capture

The `supabase db diff` generator has known blind spots. Schema files don't
describe these — they're managed through other tools or hand-written
migrations:

| Not captured | Owned by |
|---|---|
| DML (`INSERT`, `UPDATE`, `DELETE`) | hand-written migrations, never schemas |
| RLS policies (only `CREATE POLICY`; `ALTER POLICY` not tracked) | **srtd templates** — that's why we have the split |
| View ownership / grants, `security invoker`, materialized views | hand-written migrations |
| Column-level privileges | hand-written migrations |
| Comments (`COMMENT ON ...`) | hand-written migrations |
| Partitioned tables (`PARTITION BY`) | hand-written migrations |
| `ALTER PUBLICATION ... ADD TABLE ...` | hand-written migrations |
| `CREATE DOMAIN` | hand-written migrations |

If you find yourself needing one of these, **don't** try to coerce it into
`supabase/schemas/*.sql` — put it where the corresponding tool can own it,
or write a hand-written migration for it (and update
[.claude/rules/migrations.md](../.claude/rules/migrations.md) if the
exception is intentional).
