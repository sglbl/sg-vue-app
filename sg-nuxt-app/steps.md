# Nuxt 4 — `sg-nuxt-app` (shared Supabase + Lesson 13)

Goal: a 2-page Nuxt 4 app that mirrors the Supabase wiring from `../sg-vue-app`,
including the shared `supabase/` folder via symlink. Pages: **Home** + **Lesson 13**.

Do the steps in order — each builds on the last.

---

## Step 1 — Symlink the Supabase folder

Share schemas, migrations, and the generated `database.types.ts` between
the two projects — single source of truth, no duplication.

From inside `sg-nuxt-app/`:

```bash
ln -s ../supabase supabase
ls -la supabase
```

Expected line in the output:

```
supabase -> ../supabase
```

And inside it you should find `schemas/`, `migrations/`, and
`database.types.ts`.

> If `supabase` already exists as a real folder, remove it first:
> `rm -rf supabase && ln -s ../supabase supabase`

---

## Step 2 — Create `.env` with Nuxt-style names

The `@nuxtjs/supabase` module reads `SUPABASE_URL` / `SUPABASE_KEY`,
not the Vite `VITE_*` names.

Create `sg-nuxt-app/.env`:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

Paste your real anon key from `sg-vue-app/.env.dev` if the value above differs.

---

## Step 3 — Install Pinia + the Supabase module

```bash
npm install pinia @pinia/nuxt @nuxtjs/supabase
```

---

## Step 4 — Wire it all up in `nuxt.config.ts`

Replace the file with:

```ts
// sg-nuxt-app/nuxt.config.ts
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],

  // Mirror sg-vue-app's `@db` → supabase/database.types.ts alias
  alias: {
    '@db': resolve(here, 'supabase/database.types.ts'),
  },

  // Don't redirect on auth changes yet — we don't have login
  supabase: {
    // IMPORTANT: use `~~/...` — the module's resolver understands Nuxt aliases.
    // Plain paths (e.g. './supabase/database.types') get resolved against the
    // module's own dist folder and silently fail with "Database = unknown".
    types: '~~/supabase/database.types',
    redirect: false,
  },
})
```

Save — Nuxt hot-reloads.

---

## Step 5 — Replace `app/app.vue` with a shell + nav

```vue
<script setup lang="ts">
// Auto-imports: <NuxtPage />, <NuxtLink />
</script>

<template>
  <main>
    <nav>
      <NuxtLink to="/">Home</NuxtLink>
      |
      <NuxtLink to="/lesson13">Lesson 13</NuxtLink>
    </nav>

    <hr />

    <NuxtPage />
  </main>
</template>

<style>
:root { font-family: system-ui, sans-serif; }
nav a { margin-right: 0.5rem; }
nav a.router-link-active { font-weight: bold; }
</style>
```

---

## Step 6 — Home page: `app/pages/index.vue`

This is your **proof the wiring works**: real data from the shared
`reviews` table.

```vue
<script setup lang="ts">
const supabase = useSupabaseClient()

const { data: reviews } = await useAsyncData('reviews-latest', async () => {
  const { data, error: err } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  if (err) throw err
  return data ?? []
})
</script>

<template>
  <section>
    <h1>Home</h1>
    <p>Mirrors the Supabase setup from <code>sg-vue-app</code>.</p>

    <h2>Latest reviews</h2>
    <ul v-if="reviews && reviews.length">
      <li v-for="r in reviews" :key="r.id">
        <strong>{{ r.name }}</strong> — {{ r.rating }}/5
        <p>{{ r.content }}</p>
      </li>
    </ul>
    <p v-else>No reviews yet.</p>
  </section>
</template>
```

---

## Step 7 — Lesson 13 page: `app/pages/lesson13.vue`

A standalone cart demo. The full `Lesson13.vue` in `sg-vue-app` imports
`TopBar` and `ProductDisplayCloud`; we keep only the cart logic so the
page is self-contained.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface CartItem {
  id:    number
  name:  string
  price: number
}

const products: CartItem[] = [
  { id: 1, name: 'Coffee',   price: 4 },
  { id: 2, name: 'Bagel',    price: 3 },
  { id: 3, name: 'Sandwich', price: 7 },
]

const cart = ref<CartItem[]>([])

const addToCart = (product: CartItem) => {
  cart.value.push(product)
}

const total = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price, 0),
)
</script>

<template>
  <section>
    <h1>Lesson 13 — Cart demo</h1>
    <p>Cart({{ cart.length }}) — Total: ${{ total }}</p>

    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.name }} — ${{ product.price }}
        <button @click="addToCart(product)">Add to cart</button>
      </li>
    </ul>

    <h2 v-if="cart.length">In cart</h2>
    <ul v-if="cart.length">
      <li v-for="(item, i) in cart" :key="i">
        {{ item.name }} — ${{ item.price }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
button { margin-left: 0.5rem; }
</style>
```

---

## Step 8 — Run it

Make sure local Supabase is up (do this from either repo — migrations are
shared via the symlink):

```bash
supabase start
```

Then in `sg-nuxt-app/`:

```bash
npm run dev
```

Open `http://localhost:3000`:

| Route | What you'll see |
|---|---|
| `/` | Home with real reviews from your `reviews` table |
| `/lesson13` | Cart demo — click "Add to cart" |

---

## What's shared vs what changed

| Concern | `sg-vue-app` (Vite) | `sg-nuxt-app` (Nuxt 4) |
|---|---|---|
| `supabase/` folder | real folder | **symlink → `../supabase`** |
| Supabase client | `src/lib/supabase.ts` (manual `createClient`) | `@nuxtjs/supabase` module + `useSupabaseClient()` |
| Env names | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | `SUPABASE_URL`, `SUPABASE_KEY` |
| `@db` → types | Vite alias | Nuxt `alias` config (same target) |
| Routing | `vue-router` config | `app/pages/*` (file-based) |
| Root | `src/App.vue` + `main.ts` | `app/app.vue` |

---

## When you're ready for next

- **Auth**: `@nuxtjs/supabase` gives you `useSupabaseUser()` — add login page
- **Pull in the real Lesson13**: copy `TopBar.vue` + `ProductDisplayCloud.vue`
  + their stores from `sg-vue-app/src/components/`
- **A Pinia store**: cart state lifted out of the page into a store
- **Server route**: e.g. `server/api/reviews.post.ts` for inserts

Tell me which and I'll write the steps.
