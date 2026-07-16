# sg-vue-app & sg-nuxt-app

Two apps, one database, one shared component library.

- **`sg-vue-app/`** — Vue 3 + Vite SPA. 13 lessons covering Vue basics,
  components, Pinia, and a Supabase-backed cloud backend.
- **`sg-nuxt-app/`** — Nuxt 4 + Nitro. Same Supabase data, same shared
  components, rendered through Nuxt's SSR pipeline.
- **`shared/`** — assets + presentational components used by both apps.
- **`supabase/`** — schemas, migrations, generated types — single source
  of truth for the database.

## Project structure

**Runtime legend** — read these tags on each folder before anything else:

| Tag | Runtime |
|---|---|
| `# CLIENT` | Browser (or Vue's SSR renderer). Shipped to the client. |
| `# SERVER` | Node.js via Nitro. **Never** shipped to the browser. |
| `# SHARED` | Reachable from both sides via `@shared` / `@db` aliases. |
| `# DATA` | Database artifacts (schemas, migrations, generated types). |
| `# CONFIG` | Build / env configuration. Not part of any runtime. |
| `# META` / `# DOCS` | Project meta — README, package.json, notes. |

```bash
sg-vue-app/
├── README.md                # DOCS — you are here
├── docs/                    # DOCS
│   ├── db-setup.md          #     Supabase + srtd walkthrough
│   └── nuxt-structure.md    #     Nuxt file-by-file deep dive
│
├── shared/                  # SHARED — consumed by BOTH apps (via @shared alias)
│   ├── assets/
│   │   ├── images/
│   │   │   ├── socks_green.jpeg
│   │   │   └── socks_blue.jpeg
│   │   └── main.css         # global styles (body, .cart, .card, .nav-bar, .nav-button)
│   └── components/
│       ├── TopBar.vue       # back button + slot for nav links
│       ├── ReviewList.vue   # takes reviews via prop
│       └── ReviewForm.vue   # emits review-submitted event
│
├── src/                     # CLIENT — Vue 3 app (Vite SPA)
│   ├── components/
│   │   ├── ProductDisplay.vue       # uses useReviewsStore
│   │   └── ProductDisplayCloud.vue  # uses useCloudReviewsStore + supabase
│   ├── views/Lesson*.vue            # one file per lesson
│   ├── stores/                      # Pinia stores (with persistedstate)
│   ├── lib/supabase.ts              # supabase-js client, reads VITE_* env
│   ├── router/, App.vue, main.ts
│   └── types/
│
├── sg-nuxt-app/             # Nuxt 4 app (Nitro + Vue 3 SSR)
│   ├── app/                 # CLIENT — Nuxt UI code shipped to the browser
│   │   ├── app.vue                    # root layout
│   │   ├── components/
│   │   │   └── ProductDisplayCloud.vue  # Nuxt-native (uses useSupabaseClient)
│   │   └── pages/
│   │       ├── index.vue
│   │       └── lesson14.vue
│   ├── server/              # SERVER — Nitro endpoints, never shipped to browser
│   │   └── api/
│   │       └── shipping.post.ts          # POST /api/shipping — rate calculator
│   ├── nuxt.config.ts                  # CONFIG — @shared, @db aliases, components block
│   └── .env                            # CONFIG — SUPABASE_URL + SUPABASE_KEY for the module
│
├── supabase/                # DATA — schemas + migrations + generated types
│   ├── schemas/reviews.sql
│   ├── migrations/*.sql
│   └── database.types.ts              # regenerated via `supabase gen types typescript --local`
│
├── index.html, vite.config.ts, tsconfig.app.json     # CONFIG
├── .env.dev, .env.prod                              # CONFIG — Vite-style VITE_* env vars
└── package.json                                     # META — deps & scripts
```

## Stack

### `sg-vue-app` (root)

- **Vue 3** (`<script setup lang="ts">`, Composition API only)
- **Vite 8** with `--mode dev` / `--mode prod` for env-file selection
- **TypeScript** (`vue-tsc --build` for `.vue` type-checking)
- **Pinia** + `pinia-plugin-persistedstate` (local storage persistence)
- **Vue Router** (history mode, one route per lesson)
- **@supabase/supabase-js** (lesson 13 cloud backend)
- **Supabase CLI** + **srtd** (declarative schemas, migrations, RLS templates)

### `sg-nuxt-app/`

- **Nuxt 4** + Nitro (SSR + static)
- **Vue 3.5** (auto-imported by Nuxt)
- **TypeScript** (extended Nuxt config)
- **@nuxtjs/supabase** module — provides `useSupabaseClient()`,
  env-driven config, typed client
- **@pinia/nuxt** module
- File-based routing via `app/pages/`
- Auto-imports from `app/components/` + `@shared/components/`

## Setup

```sh
# Vue app (root)
npm install

# Nuxt app
cd sg-nuxt-app
npm install
cd ..
```

For the cloud-backed lesson, also bring up the local Supabase stack
(requires Docker / OrbStack):

```sh
supabase start       # local Postgres + Studio on http://127.0.0.1:54323
srtd init            # only on first run
```

## Database setup

Full walkthrough — declarative schemas, srtd templates, env vars,
`supabase db push` to cloud — lives in [`docs/db-setup.md`](docs/db-setup.md).

The `supabase/` folder is shared by both apps via the `@db` alias.
Nuxt reads `supabase/database.types.ts` through the resolved absolute path
in `nuxt.config.ts`; Vite reads it through the same alias.

## Env files

Both apps use the **same env var values** but with **different naming
conventions** — chosen for their native tooling:

| App | Convention | Why |
|---|---|---|
| `sg-vue-app` (Vite) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Vite's default `envPrefix` |
| `sg-nuxt-app` (Nuxt) | `SUPABASE_URL`, `SUPABASE_KEY` | Read by `@nuxtjs/supabase` module |

### Vue app (root)

- **`.env.dev`** — local Supabase (loaded by `npm run dev`)
- **`.env.prod`** — cloud Supabase (loaded by `npm run build`)

To verify the Vue app against cloud during dev:

```sh
npm run dev:prod
```

### Nuxt app (`sg-nuxt-app/.env`)

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=sb_publishable_...
```

The `@nuxtjs/supabase` module reads this automatically — no manual
import in code.

> If you ever want one set of names everywhere, add `SUPABASE_` to Vite's
> `envPrefix` and drop the `VITE_` prefix from the Vue app's files. The
> current setup keeps each app idiomatic to its toolchain.

## Scripts

### `sg-vue-app` (root)

| Script | What |
|---|---|
| `npm run dev` | Vite dev server, mode `dev` → loads `.env.dev` |
| `npm run dev:prod` | Vite dev server, mode `prod` → loads `.env.prod` (cloud) |
| `npm run build` | Type-check + production build, mode `prod` |
| `npm run preview` | Serve the built output locally |

### `sg-nuxt-app/`

| Script | What |
|---|---|
| `npm run dev` | Nuxt dev server (Nitro) — usually `http://localhost:3000` |
| `npm run build` | Production build (`.output/`) |
| `npm run generate` | Static site generation |
| `npm run preview` | Serve the built output |

## Shared code — `shared/`

Three components and the global CSS are shared. Both apps reach them
through two aliases configured in each app's config:

| Alias | Resolves to (Vue) | Resolves to (Nuxt) |
|---|---|---|
| `@shared` | `./shared/` | `../shared/` (one level up from `sg-nuxt-app/`) |
| `@db` | `./supabase/` | `../supabase/` |

`shared/components/TopBar.vue` exposes a slot so each app passes its own
navigation links:

```vue
<!-- sg-nuxt-app/app/app.vue -->
<TopBar :show-back="route.path !== '/'">
  <NuxtLink to="/">Home</NuxtLink>
  <NuxtLink to="/lesson14">Lesson 14</NuxtLink>
</TopBar>
```

```vue
<!-- src/views/Lesson*.vue (Vue app) -->
<TopBar />
```

`shared/assets/main.css` is loaded globally:

- **Vue app** via `import '@shared/assets/main.css'` in `src/main.ts`
- **Nuxt app** via `css: ['../shared/assets/main.css']` in `nuxt.config.ts`

## When something breaks

| Symptom | First check |
|---|---|
| Vue app can't find `@shared/...` | `vite.config.ts` has the `@shared` alias |
| Nuxt app can't find `@shared/...` | `sg-nuxt-app/nuxt.config.ts` has `@shared` resolving to `../shared/` |
| "supabaseUrl is required" (Vue) | `.env.dev` / `.env.prod` use `VITE_*` prefix; `vite.config.ts` `envPrefix` includes `VITE_` |
| "supabaseUrl is required" (Nuxt) | `sg-nuxt-app/.env` has `SUPABASE_URL` and `SUPABASE_KEY` |
| Pinia store "no active Pinia" in Nuxt | Don't share Pinia stores — write per-app equivalents; auto-import from `app/components/` only |
| Borders missing on first load (Nuxt) | Confirm `main.css` is in `nuxt.config.ts`'s `css: []` array, not just imported in `app.vue` |

## References

- [Vue 3 docs](https://vuejs.org/)
- [Vite docs](https://vite.dev/)
- [Nuxt 4 docs](https://nuxt.com/docs)
- [@nuxtjs/supabase docs](https://supabase.nuxtjs.org/)
- [Pinia docs](https://pinia.vuejs.org/)
- [Supabase docs](https://supabase.com/docs)