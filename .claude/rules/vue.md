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
