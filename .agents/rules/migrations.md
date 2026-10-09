---
paths:
  - "supabase/migrations/**/*.sql"
---

# Supabase migrations

Files in `supabase/migrations/` are **generated, not authored**. Every migration file is produced by `supabase db schema declarative sync` based on declarative schemas in `supabase/database/`.

## Hard rules

1. **Never hand-write a migration.** If you find yourself typing `CREATE TABLE`, `CREATE POLICY`, `GRANT`, `ALTER TABLE`, or function DDL into a migration file, stop. Update the declarative files under `supabase/database/` instead, then generate the migration:
   ```bash
   supabase db schema declarative sync -f <migration_name> --no-apply
   ```

2. **Source of truth is `supabase/database/`**. `supabase db schema declarative sync` diffs your declarative SQL files against existing migration history. Direct changes in Supabase Studio, SQL Editor, or psql will not be picked up by the diff engine.

3. **Always review generated migrations** before applying them locally with `supabase migration up` or deploying with `supabase db push`.

## When a migration is "stale" or duplicated

If you revert a local migration or need to repair migration history between local and remote environments:

```bash
supabase migration repair --status reverted <old_timestamp>
supabase db push
```

This ensures migration tracking stays in sync.
