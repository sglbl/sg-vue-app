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
    types: '~~/supabase/database.types',
    redirect: false,
  },
})