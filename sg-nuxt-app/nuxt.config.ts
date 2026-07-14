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

  // Auto-import shared components with no prefix → <TopBar />, <ReviewList />, <ReviewForm />
  components: [
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