# sg-nuxt-app — Structure & Tutorial Notes

A walkthrough of every file in this Nuxt 4 app, plus the conceptual model
behind the **server / client split** that Nuxt 4 introduced.

---

## 1. Directory tree

```
sg-nuxt-app/
├── app/                          ← CLIENT boundary (UI code)
│   ├── app.vue                   ← root shell — <NuxtLayout> + <NuxtPage />
│   ├── components/
│   │   └── ProductDisplayCloud.vue
│   ├── layouts/
│   │   ├── default.vue           ← shell with TopBar + h1 + <hr/>
│   │   └── lesson.vue            ← alternate shell (proves auto-import)
│   └── pages/
│       ├── index.vue             ← /        (uses default layout)
│       └── Lesson14.vue          ← /lesson14 (uses 'lesson' layout)
│
├── nuxt.config.ts                ← Nuxt configuration (aliases, modules, etc.)
├── package.json
├── tsconfig.json
└── (public/, node_modules/, .nuxt/ — generated / static assets, omitted)
```

`server/` does not exist yet. When you create it, it sits **outside `app/`** —
see section 2.

---

## 2. Server vs Client — the Nuxt 4 split

Nuxt 4 introduced the `app/` directory as a **client boundary**: every file
inside `app/` is code that ultimately runs in the browser (or is rendered
server-side but conceptually belongs to the UI layer).

```
sg-nuxt-app/
├── app/                  ← client boundary
├── server/               ← server-only boundary (Node, Nitro)
├── public/               ← static files served as-is
├── shared/               ← cross-app shared code (parent of sg-nuxt-app, via alias)
├── nuxt.config.ts
└── package.json
```

### Why the split matters

| Aspect | `app/` | `server/` |
|---|---|---|
| Runtime | Browser (or Vue SSR) | Node.js via Nitro |
| Bundled to client? | ✅ yes | ❌ never |
| Can import from each other? | can import `shared/`, `vue`, etc. | can import `shared/`, DB drivers, `node:*` |
| Reverse direction? | ❌ cannot import `server/` | ❌ cannot import `app/` |
| Auto-imports | Vue APIs, Nuxt components, your `app/components` and `app/composables` | `defineEventHandler`, `readBody`, `getQuery`, your `server/utils` |

The build **enforces** the boundary. If you try to import `server/` code from
inside `app/`, the build errors out — that's the safety net that keeps
secrets, DB drivers, and Node-only modules from ever leaking into the
client bundle.

### Server subfolders (when you create them)

| Subfolder | File pattern | What it does |
|---|---|---|
| `server/api/` | `products.get.ts` | `GET /api/products` |
| `server/api/` | `products.post.ts` | `POST /api/products` |
| `server/routes/` | `sitemap.xml.ts` | `GET /sitemap.xml` (no `/api` prefix) |
| `server/middleware/` | `auth.ts` | runs on every request |
| `server/utils/` | `db.ts` | helpers, auto-imported server-side |
| `server/plugins/` | `seed.ts` | runs once at server startup |

The `.get` / `.post` suffix on API files is the HTTP method. Omit it and
the route accepts any method.

---

## 3. SSR data flow — why `useFetch` is invisible in DevTools

When a page calls `useFetch('/api/…')`, the browser's **Network tab shows
nothing**. That's not a bug — it's the whole point of Nuxt SSR. The request
runs on the *server*, not the client. Here's what actually happens on a
fresh page load:

```
┌─────────────────────────────────────────────────────┐
│  Server (Nuxt SSR runtime)                          │
│                                                     │
│  1. ProductDisplayCloud.vue setup runs              │
│  2. useFetch('/api/shipping', …) invoked            │
│  3. Server makes internal call to its own handler   │
│     (this is what curl did, but internal)           │
│  4. Response arrives, gets stored in shippingInfo   │
│  5. Vue renders the template with cost: 3           │
│  6. HTML is serialized → response sent to browser   │
└─────────────────────────────────────────────────────┘
                       │
                       │  HTML + embedded payload
                       ▼
┌─────────────────────────────────────────────────────┐
│  Browser                                            │
│                                                     │
│  7. Receives HTML — "Shipping: $3.00 (3 days)"      │
│     already baked in                                │
│  8. Vue hydrates: setup re-runs, useFetch sees      │
│     SSR data already exists → skips the network     │
│     call entirely                                   │
│                                                     │
│  → Network tab: nothing for /api/shipping           │
└─────────────────────────────────────────────────────┘
```

### Why this is a feature, not a footgun

- **Traditional SPA**: page loads empty → JS loads → fetch fires → UI
  updates. Visitor sees a spinner.
- **Nuxt SSR**: server pre-runs the data work, ships a complete page.
  Visitor sees content immediately, no spinner.

The cost of a slow data fetch is paid by the *server* (which is fast and
close to the DB), not by your visitor's network.

### How to verify the data really came from SSR

The data is real — it's just transferred via the HTML payload instead of
via a fetch the browser issues. Three ways to confirm:

**1. View page source.** Right-click → "View Page Source" (Cmd/Ctrl-U).
Search for `estimatedDays` or `cost`. You'll see the rendered string —
`Shipping: $3.00 (3 days)` — written by the *server* into the HTML
before it was sent.

**2. Inspect the Nuxt payload.** In DevTools Console:

```js
useNuxtApp().payload.data
```

You'll see entries like:

```js
{
  'default:POST|/api/shipping:…': { cost: 3, currency: 'EUR', estimatedDays: 3 }
}
```

That's the cached response the browser hydrated from.

**3. Force a client-side fetch.** Change any reactive value that the
`useFetch` body depends on (a prop, a ref) — Vue re-runs the setup,
`useFetch` re-fetches, and *now* the request shows up in the Network
tab. Same endpoint, same body, just initiated from the client.

### Reactive body forms — SSR-safe vs not

When using `useFetch` with a `body` that depends on props/refs, the form
matters:

| Form | SSR-safe? | Reactive? | Notes |
|---|---|---|---|
| `body: { ... }` | ✅ | ❌ | Use when body never changes |
| `body: computed(() => ({ ... }))` | ✅ | ✅ | **Default for reactive bodies** |
| `body: () => ({ ... })` | ⚠️ broken in current Nuxt | (supposed to be ✅) | Avoid — function reference leaks into the SSR request body, causing `Buffer.from` errors on the server |

Always reach for `computed(...)` when the body needs to track reactive
values. This is why `ProductDisplayCloud.vue` uses
`body: computed(() => ({ country: props.country, premium: props.premium, … }))`
rather than a bare arrow function.

---

## 4. File-by-file walkthrough

### `nuxt.config.ts`

Configures the whole project: aliases, modules, auto-import paths, global
CSS, Supabase settings, Vite tweaks.

```ts
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// Project root = parent of sg-nuxt-app (so @shared/ points outside it)
const projectRoot = resolve(here, '..')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],

  alias: {
    '@db':      resolve(projectRoot, 'supabase'),         // directory
    '@shared':  resolve(projectRoot, 'shared'),           // directory
  },

  // Auto-import components from BOTH directories with no prefix:
  //   '~/components'                 → app/components/*.vue     (e.g. <ProductDisplayCloud />)
  //   '@shared/components'           → shared/components/*.vue  (e.g. <TopBar />, <ReviewList />, <ReviewForm />)
  // Passing an array *replaces* the Nuxt default — that's why listing only '@shared/components'
  // made ProductDisplayCloud disappear from auto-imports.
  components: [
    '~/components',
    { path: '@shared/components', pathPrefix: false },
  ],

  // Global CSS — applied to every page
  css: [
    resolve(projectRoot, 'shared/assets/main.css'),
  ],

  supabase: {
    types: resolve(projectRoot, 'supabase/database.types'),
    redirect: false,
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  }

})
```

**Key concepts**

- **`alias`** — extra import paths. `@db` and `@shared` are *not* Nuxt
  built-ins; they're added here so a `shared/` folder that lives outside
  the Nuxt project can still be imported with a short, stable name.
- **`components`** — **a replace, not a merge**. The default value is
  `[{ path: '~/components', pathPrefix: false }]`. The moment you set
  `components: [ … ]`, that default is gone, so you must re-list
  `'~/components'` if you want `app/components/` scanned too.
  - `pathPrefix: false` for `@shared/components` means a file
    `shared/components/ReviewForm.vue` becomes `<ReviewForm />`, not
    `<SharedReviewForm />`.
- **`compatibilityDate`** — pins Nuxt's behavior to a specific date so
  upgrades don't silently change behavior.

---

### `tsconfig.json`

Delegates everything to Nuxt-generated tsconfigs. Each context (app,
server, shared, node tooling) gets its own generated tsconfig with the
right aliases and lib settings.

```json
{
  // https://nuxt.com/docs/guide/concepts/typescript
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

**Key concept** — the four `references` correspond to the four Nuxt
type-contexts. Notice `tsconfig.server.json` exists: types for code
running in Nitro (server) are generated separately from types for code
running in the browser (app). That's the TypeScript side of the same
client/server split from section 2.

---

### `package.json`

```json
{
  "name": "sg-nuxt-app",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "@nuxtjs/supabase": "^2.0.9",
    "@picocss/pico": "github:picocss/pico",
    "@pinia/nuxt": "^0.11.3",
    "nuxt": "^4.4.8",
    "pinia": "^3.0.4",
    "vue": "^3.5.39",
    "vue-router": "^5.1.0"
  }
}
```

**Key concepts**

- `"type": "module"` — ESM by default. `nuxt.config.ts` uses `import`
  instead of `require`.
- `"postinstall": "nuxt prepare"` — runs automatically after
  `npm install`. It regenerates `.nuxt/` types so your IDE autocomplete
  matches the current config. Whenever you change `nuxt.config.ts`, run
  it manually too.

---

### `app/app.vue`

The root shell. Everything page-specific lives in a layout; this file
just mounts the layout+page machinery.

```vue
<script setup lang="ts">
// app.vue is the top-level shell.
// Everything page-specific lives in a layout (app/layouts/*.vue),
// and layouts are auto-imported by Nuxt — no manual import needed.
//
// <NuxtLayout>  picks the layout that the active page requested via
//               `definePageMeta({ layout: 'name' })`, or falls back to
//               layouts/default.vue if no layout is set.
// <NuxtPage />  renders the route-matched page component.
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

**Key concepts**

- Both `<NuxtLayout>` and `<NuxtPage />` are auto-imported — no `import`
  statement needed. Same for `<NuxtLink>`.
- `app.vue` is the *only* place in `app/` where `<NuxtLayout>` is
  meaningful. You don't nest layouts.

---

### `app/layouts/default.vue`

The fallback layout. Every page uses this unless it opts into another
via `definePageMeta({ layout: '…' })`.

```vue
<script setup lang="ts">
// Auto-imports in this file:
//   - <TopBar />   (from @shared/components, pathPrefix: false in nuxt.config)
//   - <NuxtLink /> (Nuxt built-in)
//   - useRoute()   (Nuxt built-in)

const route = useRoute()
</script>

<template>
  <main class="home">
    <h1>Vue 3 - Nuxt 4 Tutorial</h1>

    <TopBar :show-back="route.path !== '/'">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/lesson14">Lesson 14</NuxtLink>
    </TopBar>

    <hr />

    <!-- The page renders here. Every page that uses `definePageMeta({ layout: 'default' })`
         — or no layout at all (default is the fallback) — gets this shell. -->
    <slot />
  </main>
</template>
```

**Key concepts**

- A layout is just a Vue component with a `<slot />`. Whatever a page
  renders goes through that slot.
- `useRoute()` is auto-imported. It returns the current route object;
  here it's used to hide the back button on the homepage.
- `:show-back="route.path !== '/'"` — explicit prop binding. Reading
  `route.path !== '/'` evaluates to a boolean, so this is equivalent to
  `<TopBar :show-back="…">` (always passing the prop). Prefer being
  explicit when the value matters.

---

### `app/layouts/lesson.vue`

A second layout. Its sole purpose is to prove that **any** file under
`app/layouts/` is auto-imported — you don't have to register it
anywhere. The kebab-case filename (without `.vue`) becomes the layout
name you pass to `definePageMeta`.

```vue
<script setup lang="ts">
// This second layout exists purely to show that Nuxt auto-imports ANY file
// under app/layouts/ — not just default.vue.
// A page opts into it with:  definePageMeta({ layout: 'lesson' })
</script>

<template>
  <div class="lesson-shell">
    <TopBar show-back>
      <h2 class="lesson-title">Lesson Mode</h2>
    </TopBar>

    <section class="lesson-body">
      <slot />
    </section>
  </div>
</template>

<style scoped>
.lesson-shell {
  padding: 2rem;
  font-family: sans-serif;
}
.lesson-title {
  margin: 0;
  font-size: 20px;
  color: white;
  font-weight: 600;
}
.lesson-body {
  border: 1px dashed #c9c9c9;
  padding: 1.5rem;
  border-radius: 8px;
  background: #fafafa;
}
</style>
```

**Key concepts**

- `<TopBar>` is the auto-imported component from `shared/components/`.
- `<h2 class="lesson-title">` is passed as **slot content** — it lands
  inside `TopBar`'s `<slot />`, right after the back button.
- `<TopBar show-back>` vs `<TopBar>` — see the table below.

| Usage | `showBack` value | "← Back" button? |
|---|---|---|
| `<TopBar show-back>` | `true` (explicit) | ✅ renders |
| `<TopBar>` | `true` (from default in TopBar) | ✅ renders |

They behave identically here, but `<TopBar show-back>` is explicit at the
call site — it survives a future default change in `TopBar.vue`. **For
props whose value matters to you, set them explicitly.**

---

### `app/pages/index.vue`

The homepage (`/` route). Uses the default layout (no `definePageMeta`
means "use default").

```vue
<script setup lang="ts">
import type { Tables } from '@db/database.types.ts'

// useSupabaseClient() is auto-imported by @nuxtjs/supabase.

const supabase = useSupabaseClient()

const { data: reviews } = await
    useAsyncData('reviews-latest', async () => {
        const { data, error: err } = await
            supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

        if (err) throw err
        return data ?? []
    })
</script>

<template>
    <!-- No layout shell here — layouts/default.vue wraps this with <main>, <h1>, <TopBar/>, <hr/> -->
    <div class="cards">
      <NuxtLink to="/lesson14" class="card">
        <h2>Lesson 14</h2>
        <p>Supabase Store</p>
      </NuxtLink>
    </div>
</template>
```

**Key concepts**

- **Types are not auto-imported.** `Tables` has to be brought in
  explicitly with `import type`. Auto-imports cover runtime values,
  functions, components, and a handful of macros (`definePageMeta`,
  `useAsyncData`) — not type-only imports.
- `useSupabaseClient()` is auto-imported by the `@nuxtjs/supabase`
  module. You didn't write an import for it.
- `useAsyncData` is auto-imported by Nuxt. It runs on the server (during
  SSR) and again on the client; the second run reuses the SSR result
  via the key `'reviews-latest'`.
- The template no longer has its own `<main class="home">` because
  `default.vue` already provides one. Pages supply *content*, layouts
  supply *chrome*.

---

### `app/pages/Lesson14.vue`

The `/lesson14` route. Opts into the `lesson` layout and uses an
auto-imported component from `app/components/`.

```vue
<script setup lang="ts">
// definePageMeta is a Nuxt compiler macro (auto-imported).
// Setting `layout: 'lesson'` tells <NuxtLayout> to use app/layouts/lesson.vue
// instead of default.vue for THIS page only.
//
// Auto-imports in use below:
//   - ref                (Vue)
//   - <ProductDisplayCloud />  (from app/components/, auto by Nuxt)
//   - <TopBar />         (from @shared/components via nuxt.config components[])
//
// Note: no `import TopBar from '@shared/components/TopBar.vue'` needed,
// and no `import ProductDisplayCloud from '@/components/ProductDisplayCloud.vue'`
// needed — both are auto-imported by Nuxt.

definePageMeta({
  layout: 'lesson',
})

const cart = ref<number[]>([])
const premium = ref(true)

const updateCart = (id: number) => {
  cart.value.push(id)
}
</script>

<template>
  <div class="cart">Cart({{ cart.length }})</div>
  <ProductDisplayCloud :premium="premium" :show-reviews="true" @add-to-cart="updateCart" />
</template>
```

**Key concepts**

- `definePageMeta({ layout: 'lesson' })` — page-level metadata. It's a
  compiler macro (auto-imported) that's stripped at build time; it
  doesn't ship in the runtime bundle. Other keys include `middleware`,
  `keepalive`, `auth`, etc.
- `ref` from Vue is auto-imported because Nuxt ships Vue's reactivity
  API in its imports config.
- `<ProductDisplayCloud />` is auto-imported because Nuxt scans
  `app/components/` (now wired via `'~/components'` in `nuxt.config.ts`).

---

### `app/components/ProductDisplayCloud.vue`

The product card. Lives in `app/components/` so it's auto-imported.

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import greenSocksImage from '@shared/assets/images/socks_green.jpeg'
import blueSocksImage  from '@shared/assets/images/socks_blue.jpeg'
import ReviewList from '@shared/components/ReviewList.vue'
import ReviewForm from '@shared/components/ReviewForm.vue'
import type { Tables } from '@db/database.types'

const props = defineProps({
  premium: {
    type: Boolean,
    required: true,
  },
  showReviews: {
    type: Boolean,
    default: false,
  },
})

// Nuxt-native: client from @nuxtjs/supabase module, no shared import, no Pinia
const supabase = useSupabaseClient()
type Review = Tables<'reviews'>

const reviews = ref<Review[]>([])
const loading = ref(false)

async function fetchReviews() {
  loading.value = true
  const { data, error: err } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
  if (!err) reviews.value = (data ?? []) as Review[]
  loading.value = false
}

async function addReview(review: { name: string; content: string; rating: number }) {
  const { error: err } = await supabase.from('reviews').insert(review)
  if (!err) await fetchReviews()
}

onMounted(fetchReviews)

const emit = defineEmits(['add-to-cart'])

const addToCart = () => {
  emit('add-to-cart', variants.value[selectedVariant.value]?.id)
}

const product = ref('Socks')
const brand   = ref('Karbol')

const title = computed(() => brand.value + ' ' + product.value)

const selectedVariant = ref(0)
const alt             = ref('Alternative Message')
const details         = ref(['50% cotton', '30% wool', '20% polyester'])

const variants = ref([
  { id: 2234, color: 'green', image: greenSocksImage, quantity: 50 },
  { id: 2345, color: 'blue',  image: blueSocksImage,  quantity: 0 },
])

const image    = computed(() => variants.value[selectedVariant.value]?.image)
const inStock  = computed(() => (variants.value[selectedVariant.value]?.quantity ?? 0) > 0)
const shipping = computed(() => (props.premium ? 'Free' : 2.99))

const updateVariant = (index: number) => {
  selectedVariant.value = index
}

const activeClassForButton = true
</script>

<template>
  <div class="product-display">
    <div class="product-container">
      <div class="product-image">
        <img
          :class="{ 'out-of-stock-img': !inStock }"
          :src="image"
          :alt="alt"
        >
      </div>

      <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inStock">In Stock</p>
        <p v-else>Out of Stock</p>
        <p>Shipping: {{ shipping }}</p>

        <ul>
          <li v-for="detail in details">{{ detail }}</li>
        </ul>

        <ul>
          <li
            v-for="(variant, index) in variants"
            :key="variant.id"
            class="color-circle"
            :class="{ active: activeClassForButton }"
            :style="{ backgroundColor: variant.color }"
            @mouseover="updateVariant(index)"
          />
        </ul>

        <button
          class="button"
          :class="{ disabledButton: !inStock }"
          :disabled="!inStock"
          @click="addToCart()"
        >
          Add to Cart
        </button>
      </div>
    </div>

    <template v-if="props.showReviews">
      <ReviewList v-if="reviews.length > 0" :reviews="reviews" />
      <ReviewForm @review-submitted="addReview" />
    </template>
  </div>
</template>
```

**Key concepts**

- Even though `<ProductDisplayCloud />` is auto-imported for callers,
  *its own* template uses `<ReviewList />` and `<ReviewForm />` from
  `shared/components/`. Those are also auto-imported here (Nuxt scans
  the shared path too) — but the file uses explicit `import` statements
  for them. Both forms work; explicit imports inside a component often
  read better when you have several imports from one path.
- Props and emits — `defineProps({ premium, showReviews })`,
  `defineEmits(['add-to-cart'])`. Inside the template you reference
  props as `props.premium` (or just `premium`, but using `props.x` is
  explicit). `props.showReviews` is referenced that way in the
  `v-if` for clarity.
- Two `computed`s — `image`, `inStock`, `shipping` — reactively derive
  values from `selectedVariant`, `variants`, and `props.premium`.
- `onMounted(fetchReviews)` — fetches data after the component mounts on
  the client. (SSR wouldn't have a user to interact with yet, so reviews
  load client-side here.)

---

## 5. Auto-imports cheat sheet

| Auto-imported | Where it comes from | Used as |
|---|---|---|
| `<NuxtLayout>`, `<NuxtPage />`, `<NuxtLink>` | Nuxt built-ins | `<NuxtPage />` |
| `useRoute()`, `useAsyncData()`, `definePageMeta()`, etc. | Nuxt built-ins | runtime + macros |
| `ref`, `computed`, `onMounted`, etc. | Vue API (Nuxt configures these) | reactivity |
| `useSupabaseClient()` | `@nuxtjs/supabase` module | Supabase |
| `<ProductDisplayCloud />` | `app/components/*.vue` (via `'~/components'`) | local UI |
| `<TopBar />`, `<ReviewList />`, `<ReviewForm />` | `shared/components/*.vue` (via `'@shared/components'`) | cross-app UI |

**Not auto-imported:** types (`import type { Tables } from …`), CSS
(`import './foo.css'`), images (`import img from './foo.png'`). These
need explicit import statements.

---

## 6. Common pitfalls

1. **`components: [...]` is a replace.** Add `'~/components'` explicitly
   if you also override the default path.
2. **`page` shell duplication.** Don't repeat `<main>`, `<TopBar>`, etc.
   in every page — that belongs in a layout. Pages should contain only
   page-specific content.
3. **Multi-root templates are fine** in Vue 3 (pages can return a
   fragment), but layouts generally want a single root element so
   scoped styles and `<slot />` placement behave predictably.
4. **`server/` goes outside `app/`.** Putting it inside would mix
   runtimes and risk shipping server code to the browser.
5. **Run `nuxt prepare`** after changing `nuxt.config.ts` so IDE
   autocomplete reflects the new auto-import set.
6. **`useFetch` body form.** A bare `body: () => ({ ... })` function
   fails during SSR with `Buffer.from: Received function body`. Use
   `body: computed(() => ({ ... }))` for reactive bodies. See section 3.
