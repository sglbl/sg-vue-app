# Lesson 13 — Cloud reviews with Supabase

How to wire `ProductDisplayCloud.vue` + `useCloudReviewsStore` to a real Supabase backend, and how to start practicing the `.claude/` documentation pattern on this small project.

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

### 1.5 Push to remote

```bash
supabase db push
```

### 1.6 Verify it worked

In the Supabase dashboard:
- **Table Editor** → `reviews` table exists with the 5 columns
- **Authentication → Policies** → both policies listed
- **SQL Editor** → run `select count(*) from public.reviews;` → returns `0`

From your app (lesson 13 view):
- Submit a review → check Table Editor → row appears
- Refresh page → review still there (came from `select`)
- Open in a different browser/incognito → review still there (cloud, not local)

### 1.7 Frontend env vars

Use Vite's mode system so you never have to swap URLs by hand.

Create two files in the project root (both safe to commit — see below):

```
# .env.development  — loaded by `npm run dev`, points at local Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# .env.production   — loaded by `npm run build`, points at cloud Supabase
VITE_SUPABASE_URL=https://rkaqocbrzanvclijijue.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Local values come from `supabase status` (Project URL + Publishable key).
Cloud values come from Dashboard → Settings → API.

To verify against cloud during dev without rebuilding:
```bash
npm run dev --mode production
```

Both the URL and the **anon/publishable** key are public-by-design — they're
shipped to the browser either way, so it's fine to commit both files. Never
put the `service_role` key or DB password in a Vite env file.

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
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

---

## Part 2 — Document this in `.claude/`

You're already using the `.claude/` tier system well. Add three small files to round it out.

### 2.1 Expand [AGENTS.md](../.claude/AGENTS.md)

Add a frontend section alongside the existing supabase/srtd/declarative-schemas note:

```markdown
## Frontend
- **Vue 3 + Vite + TypeScript** in `src/`
- **Pinia** for state — Composition API style only (`defineStore('id', () => {...}, { persist })`)
- **@supabase/supabase-js** for the cloud backend (lesson 13+)
- **No Options API anywhere.** Components, stores — all Composition API.
- Stores live in `src/stores/`, components in `src/components/`, views in `src/views/`.
```

### 2.2 New [rules/vue.md](../.claude/rules/vue.md)

Conditional rule that auto-loads when you touch Vue/TS files:

```markdown
---
paths:
  - "src/**/*.vue"
  - "src/**/*.ts"
---

# Vue / Frontend rules

- Always `<script setup lang="ts">` — never plain `<script>`.
- Composition API only — never Options API.
- Pinia stores: Composition API style (`defineStore('id', setupFn, options)`).
- For Supabase: alias destructured errors (`const { error: err } = ...`) to avoid shadowing refs.
- Persist flag goes in the 3rd arg of `defineStore`, not inside the setup function.
```

### 2.3 New [skills/review-feature/SKILL.md](../.claude/skills/review-feature/SKILL.md)

Invokable skill for anything review-related:

```markdown
---
name: review-feature
description: This skill should be used when the user asks about reviews, the review form, ReviewList/ReviewForm components, the reviews store, or persisting reviews (localStorage or Supabase). Triggers on "review", "reviews", "ReviewForm", "ReviewList", "review persistence".
---

# Review feature context

Two backends coexist in this tutorial:
- **Lessons 11–12**: Pinia store `useReviewsStore` + `persist: true` → localStorage
- **Lesson 13**: Pinia store `useCloudReviewsStore` → Supabase `reviews` table

Components:
- `src/components/ReviewForm.vue` — emits `review-submitted`
- `src/components/ReviewList.vue` — takes `reviews` prop
- `src/components/ProductDisplay.vue` — localStorage variant (lessons 11–12)
- `src/components/ProductDisplayCloud.vue` — Supabase variant (lesson 13)

Type: `src/types/Review.ts`
```

---

## Quick reference — what each tier is for

| File | Tier | Loads when |
|---|---|---|
| `.claude/AGENTS.md` | Project rules | Every session |
| `.claude/rules/*.md` | Conditional rules | When the `paths:` glob matches the file being edited |
| `.claude/skills/*/SKILL.md` | Invokable skills | Triggered by name or by the `description:` matching your request |
| `.claude/settings.json` | Permissions | Always (tool allowlist) |

---

## Tomorrow's checklist

Run top to bottom, in order — don't skip the reset:

- [ ] §1.2 — CLI setup (`supabase init`, `supabase login`, `supabase link`, `srtd init`, `supabase start`)
- [ ] §1.3 — `reviews` table via declarative schema, then `supabase db diff -f create_reviews_table`
- [ ] §1.4 — RLS template, then **`supabase db reset`** then `srtd apply` (or `srtd watch`)
- [ ] §1.5 — `supabase db push` (only after reset + apply are both clean locally)
- [ ] §1.6 — verify from dashboard + app
- [ ] §1.7 — `.env.development` (local) + `.env.production` (cloud) + `env.d.ts`
- [ ] §2.1 — update AGENTS.md
- [ ] §2.2 — add rules/vue.md
- [ ] §2.3 — add skills/review-feature/SKILL.md