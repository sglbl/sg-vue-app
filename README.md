# sg-vue-app

A Vue 3 tutorial app. Walks through Vue basics, components & props, Pinia,
and a Supabase-backed cloud backend — 13 lessons in total.

## Stack

- **Vue 3** (`<script setup lang="ts">`, Composition API only)
- **Vite** with `--mode dev` / `--mode prod` for env-file selection
- **TypeScript** (`vue-tsc` for `.vue` type-checking)
- **Pinia** + `pinia-plugin-persistedstate` (local storage persistence)
- **Vue Router** (history mode, one route per lesson)
- **@supabase/supabase-js** (lesson 13 cloud backend)
- **Supabase CLI** + **srtd** (declarative schemas, migrations, RLS templates)

## Project Setup

```sh
npm install
```

For the cloud-backed lesson 13, also bring up the local Supabase stack
(requires Docker / OrbStack):

```sh
supabase start       # local Postgres + Studio on http://127.0.0.1:54323
srtd init            # only on first run
```

## Database setup

Full walkthrough — declarative schemas, srtd templates, env vars,
`supabase db push` to cloud — lives in [`docs/db-setup.md`](docs/db-setup.md).

## Env files

Two committed env files, picked automatically by Vite mode:

- **`.env.dev`** — local Supabase URL + publishable key (loaded by `npm run dev`)
- **`.env.prod`** — cloud Supabase URL + publishable key (loaded by `npm run build`)

To verify against cloud during dev:

```sh
npm run dev --mode prod
```

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Vite dev server, mode `dev` → loads `.env.dev` |
| `npm run build` | Type-check + production build, mode `prod` → loads `.env.prod` |
| `npm run preview` | Serve the built output locally |

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
