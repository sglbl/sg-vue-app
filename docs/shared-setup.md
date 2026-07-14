# Sharing code — `shared/` sibling setup

Goal: stop duplicating components, stores, and lib code between the
Vue 3 app (`sg-vue-app/` files at repo root) and the Nuxt 4 app
(`sg-nuxt-app/`). One source of truth, two consumers.

This doc follows **Option B** from the discussion: a `shared/`
sibling folder + alias-based imports in both apps.

---

## Current structure (what you have now)

```
/codes/sg-vue-app/
├── index.html                ┐
├── package.json              │
├── vite.config.ts            │ Vue 3 + Vite (lives at root)
├── src/                      │
│   ├── App.vue               │
│   ├── components/           │
│   ├── views/                │
│   ├── stores/               │
│   └── lib/                  ┘
│
├── sg-nuxt-app/                ← Nuxt 4
│   ├── app/
│   ├── nuxt.config.ts
│   └── (supabase → ../supabase symlink)
│
├── supabase/                   ← schemas, migrations, types
└── docs/
    └── db-setup.md
```

The Vue app doesn't have its own folder — its files are at the repo root.
That makes renaming it non-trivial; see the optional **Step 9** at the end.

---

## Target structure (where we're heading)

```
/codes/sg-vue-app/
├── shared/                    ← NEW — sibling of both apps
│   ├── components/
│   ├── stores/
│   ├── lib/
│   ├── assets/
│   └── README.md
│
├── (Vue 3 files at root)       ← unchanged for now
│
├── sg-nuxt-app/
│
├── supabase/
└── docs/
```

---

## Step 1 — Create `shared/`

From `/codes/sg-vue-app/`:

```bash
mkdir -p shared/{components,stores,lib,assets}
```

Verify:

```bash
ls shared/
# components  stores  lib  assets
```

---

## Step 2 — Move components into `shared/`

```bash
# Move (don't copy yet — keep git history clean)
git mv src/components/* shared/components/
git mv src/views/Lesson12.vue shared/components/  # if Lesson12 becomes LessonLayout
# git add to track moves
```

What goes into `shared/components/`:

| From `src/components/` | Into `shared/components/` |
|---|---|
| `TopBar.vue` | ✓ move |
| `ProductDisplayCloud.vue` | ✓ move |
| Anything else Vue-specific | ✓ move |
| Vue primitives that Nuxt can't use (uses `<router-link>` without fallback) | ✗ keep in app |

After the move, `src/components/` is empty — fine to delete the folder:
`rmdir src/components` (if empty, otherwise delete `src/components/` after cleaning).

---

## Step 3 — Move stores into `shared/`

```bash
git mv src/stores/* shared/stores/
rmdir src/stores
```

---

## Step 4 — Move `lib/supabase.ts` (recommended)

Your current `src/lib/supabase.ts` creates the supabase client with the
`Database` type. Lift it into `shared/` so both apps use the same file:

```bash
git mv src/lib/supabase.ts shared/lib/supabase.ts
rmdir src/lib
```

Then add a small JSDoc note at the top of `shared/lib/supabase.ts`:

```ts
/**
 * Shared between sg-classic-vue-app (Vite) and sg-nuxt-app (Nuxt).
 * Vite reads `import.meta.env.VITE_*`; Nuxt reads from runtimeConfig via
 * `useRuntimeConfig()` — see each app's wrapper before reusing directly.
 */
```

> Note: this isn't *required*. The `supabase/` symlink already shares
> schemas/migrations/types. Moving `supabase.ts` is about sharing the
> client-creation logic so you don't maintain two copies that drift.

---

## Step 5 — Add an `@shared` alias in the Vue app

Edit `vite.config.ts`:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
})
```

Add the matching TS path in `tsconfig.app.json` (or wherever your
`paths` block lives):

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*":      ["./src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

After this, in `src/views/Lesson*.vue`:

```ts
// Before
import TopBar from '@/components/TopBar.vue'

// After
import TopBar from '@shared/components/TopBar.vue'
```

A one-shot search-and-replace:

```bash
# Find every `@/components/` import so you can fix them
grep -rEn "from '@?/?(components|stores|lib)" src/
```

---

## Step 6 — Add an `@shared` alias in the Nuxt app

Edit `sg-nuxt-app/nuxt.config.ts` — extend the existing `alias` block:

```ts
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// Project root = parent of sg-nuxt-app
const projectRoot = resolve(here, '..')

export default defineNuxtConfig({
  // ...existing config...

  alias: {
    '@db':      resolve(here,     'supabase/database.types.ts'),
    '@shared':  resolve(projectRoot, 'shared'),
  },

  components: [
    { path: '~/components', pathPrefix: false },     // local app components
    { path: '@shared/components', pathPrefix: false }, // shared, no prefix
  ],

  supabase: {
    types: '~~/supabase/database.types',
    redirect: false,
  },
})
```

Two things to notice:

1. `@shared` points **outside** `sg-nuxt-app/`, into the parent's `shared/`.
2. The `components` block registers `shared/components` for **auto-import**
   with no prefix — so `<TopBar />` works anywhere in the Nuxt app without
   writing `import`.

Same search-and-replace pattern inside `sg-nuxt-app/`:

```bash
grep -rEn "from '@?/?(components|stores|lib)" sg-nuxt-app/app/
```

---

## Step 7 — Re-wire the existing imports

Both apps now reference `shared/` instead of their own `components/`,
`stores/`, `lib/`. Three approaches — pick one:

### Approach A — explicit alias imports (recommended)

```ts
// in either app
import TopBar from '@shared/components/TopBar.vue'
import { useCartStore } from '@shared/stores/cart'
```

Pros: search-and-replace friendly, explicit, fails loudly if file moves.
Cons: more typing.

### Approach B — Nuxt auto-import only

In Nuxt: `<TopBar />` just works thanks to step 6's `components` config.
No imports needed.

In Vue (Vite): no auto-import out of the box — you'd need
`unplugin-vue-components` installed. Skip unless you really want this.

### Approach C — barrel files

Create one re-export file per shared folder:

```ts
// shared/components/index.ts
export { default as TopBar }              from './TopBar.vue'
export { default as ProductDisplayCloud } from './ProductDisplayCloud.vue'
```

Then `import { TopBar } from '@shared/components'`. Slightly cleaner.

**I recommend approach A in Nuxt too** — the auto-import in Nuxt is great
for app-local components but tracking cross-app imports makes debugging
easier.

---

## Step 8 — Verify

```bash
# Vue app (from /codes/sg-vue-app)
npm run dev

# Nuxt app (from /codes/sg-vue-app/sg-nuxt-app)
npm run dev
```

Both should boot and render the moved components identically. Smoke tests:

- [ ] Lesson12 in Vue app shows the TopBar (now from `shared/`)
- [ ] Lesson13 in Nuxt app renders `<TopBar />` with the same styling
- [ ] Edit `shared/components/TopBar.vue` once — both apps hot-reload
- [ ] Edit a shared store value → both apps reflect the change

If something doesn't render in Nuxt, check `~/components` registration
in step 6 is present and restart `nuxt dev`.

---

## Step 9 — Optional: rename to `sg-classic-vue-app/`

Only do this if you want the Vue project to live in a *named* folder like
the Nuxt one does. It's a fairly invasive move — do it once, commit.

```bash
# From /codes/sg-vue-app/

# 1. Make the new folder
mkdir sg-classic-vue-app

# 2. Move every Vue-specific file/folder at repo root into it
git mv index.html        sg-classic-vue-app/
git mv package.json     sg-classic-vue-app/
git mv package-lock.json sg-classic-vue-app/
git mv vite.config.ts   sg-classic-vue-app/
git mv tsconfig*.json   sg-classic-vue-app/
git mv env.d.ts         sg-classic-vue-app/
git mv public           sg-classic-vue-app/ 2>/dev/null || true
git mv src              sg-classic-vue-app/
git mv dist             sg-classic-vue-app/ 2>/dev/null || true   # if not gitignored
# node_modules, .gitignore, .git, README.md STAY at the root.

# 3. Move .env files (NEVER commit them — these are just for your local dev)
mv .env.dev  sg-classic-vue-app/.env.dev   2>/dev/null || true
mv .env.prod sg-classic-vue-app/.env.prod 2>/dev/null || true
```

Then update `sg-classic-vue-app/vite.config.ts` — the alias path
flips from `./shared` to `../shared`:

```ts
'@shared': fileURLToPath(new URL('../shared', import.meta.url)),
```

And update `tsconfig.app.json` similarly.

The sg-nuxt-app alias for `@shared` flips from `../../shared` to `../shared`:

```ts
const projectRoot = resolve(here, '..')   // same as before; sg-nuxt-app's parent is the monorepo root
alias: {
  '@shared': resolve(here, '../shared'),  // = /codes/sg-vue-app/shared  ✓
}
```

> Watch out for the **Supabase symlink in `sg-nuxt-app/`**. It was
> `ln -s ../supabase supabase` pointing at the parent. After the
> restructure:
> - **Before rename**: `../supabase` → `/codes/sg-vue-app/supabase` ✓
> - **After rename**: parent still has `supabase/`, so still works ✓
>
> (Supabase lives at the monorepo root, not inside any app folder — leave it where it is.)

---

## What you get at the end

| Benefit | How |
|---|---|
| One TopBar for both apps | `shared/components/TopBar.vue` |
| One cart store for both apps | `shared/stores/cart.ts` |
| One Supabase client config | `shared/lib/supabase.ts` |
| Nuxt auto-imports shared components | `components:` block in `nuxt.config.ts` |
| Adding a third app (mobile, docs) is trivial | point its alias at the same `shared/` |

---

## When you want next

- **Convert Lesson12.vue → LessonLayout.vue** in `shared/components/` so Lesson 1–13 can all wrap their content in the same chrome (the "Question 1" plan).
- **Promote to a pnpm workspace** if you add a third app — `shared/` becomes `packages/ui/`, `packages/stores/`, `packages/lib/`. The git history carries over because the files already live in their own folder.
- **Move `supabase.ts` to `shared/lib/`** if both apps need the same client-creation logic (currently they don't — Nuxt has its own `useSupabaseClient`).

Tell me which (or ask for an explanation of any step).
