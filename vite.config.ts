import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@':       fileURLToPath(new URL('./src',      import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared',   import.meta.url)),
      '@db':     fileURLToPath(new URL('./supabase', import.meta.url)),
    },
  },
  // Default is ['VITE_']. Adding SUPABASE_ so supabase.ts can read it.
  envPrefix: ['VITE_', 'SUPABASE_'],
})