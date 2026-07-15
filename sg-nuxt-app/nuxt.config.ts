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