---
paths:
  - "supabase/database/**/*.sql"
---

# Supabase declarative schema

`supabase/database/` is the declarative source of truth for all database schema objects, powered by the `pg-delta` diff engine (`declarative_schema_path = "./database"` in `config.toml`).

## What belongs here

- `CREATE TABLE`, columns, primary keys, and foreign keys
- `CREATE INDEX`
- `CHECK` and `UNIQUE` constraints
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- `CREATE POLICY` (Row Level Security policies)
- `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO anon, authenticated, ...`
- Database functions, triggers, and views

## What does NOT belong here

- **DML statements**: `INSERT`, `UPDATE`, `DELETE` are not declarative schema objects and will cause errors. Put data changes in `supabase/seed.sql` or hand-crafted migrations.
- **Supabase-managed schema objects**: Platform objects in `auth` or `storage` (except RLS policies or triggers defined on them with functions outside managed schemas).
- **Extension-managed internal objects**: Partitions or queues managed dynamically by extensions.

## Workflow

1. Modify or add schema files in `supabase/database/` (organized into subfolders like `schemas/` and `rls/`).
2. Generate migration:
   ```bash
   supabase db schema declarative sync -f <migration_name> --no-apply
   ```
3. Apply locally:
   ```bash
   supabase migration up
   ```
4. Push to remote:
   ```bash
   supabase db push
   ```
