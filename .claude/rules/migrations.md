---
paths:
  - "supabase/migrations/**/*.sql"
---

# Supabase migrations

Files in `supabase/migrations/` are **generated, not authored**. Every file there came from either `supabase db diff` (schema changes) or `srtd build` (RLS / functions / views). The team's whole workflow is built on this split — don't break it.

## Hard rules

1. **Never hand-write a migration.** If you find yourself typing `CREATE TABLE`, `CREATE POLICY`, `GRANT`, or `ALTER TABLE` into a migration file, stop. Update the source of truth instead:
   - Table-level changes → `supabase/schemas/*.sql`, then `supabase db diff -f <name>`
   - RLS / functions / views → `supabase/migrations-templates/*.sql`, then `srtd build`

2. **The only safe edit is removing false-positive `DROP POLICY` lines** emitted by `supabase db diff`. The CLI doesn't know policies are srtd-owned and treats them as schema drift. Trim those lines with a comment explaining why — never ADD content by hand.

3. **Each migration has a single owner.** The timestamp prefix tells you which tool produced it:
   - Plain timestamp + name → `supabase db diff`
   - Timestamp + `srtd-*` prefix → `srtd build`

## When a migration is "stale" or duplicated

If you regenerate a migration locally with a new timestamp (e.g. after editing the srtd template and running `srtd build`), but cloud's history still references the old timestamp, repair cloud's history before pushing:

```bash
supabase migration repair --status reverted <old_timestamp>
supabase db push
```

This tells cloud the old timestamp is no longer expected, so the new one can apply cleanly.
