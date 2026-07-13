
Our purpose is to use these 3 to complement each other and stay away from manually edited migration files.
- **supabase cli** : install with brew
- **srtd** : postgres functions + rls + extensions (idenpotent) use srtd.config.json  https://github.com/t1mmen/srtd#configuration
- **declaritive schemas** : tables
Read in:
https://supabase.com/features/declarative-schemas
https://supabase.com/docs/guides/local-development/declarative-database-schemas

- Check `.claude` folder for rules and skills related to those.
- Check `docs/` folder for related documentation.

## Frontend
- **Vue 3 + Vite + TypeScript** in `src/`
- **Pinia** for state — Composition API style only (`defineStore('id', () => {...}, { persist })`)
- **@supabase/supabase-js** for the cloud backend (lesson 13+)
- **No Options API anywhere.** Components, stores — all Composition API.
- Stores live in `src/stores/`, components in `src/components/`, views in `src/views/`.