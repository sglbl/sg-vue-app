---
paths:
  - "supabase/schemas/**/*.sql"
---

# Supabase declarative schema

`supabase/schemas/*.sql` is the source of truth for **tables, columns, indexes, GRANTs, CHECK constraints, and `ENABLE ROW LEVEL SECURITY`**.

## What belongs here

- `CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`, etc.
- `CREATE INDEX`
- `CHECK` constraints (inline in `CREATE TABLE` or as separate `ALTER TABLE`)
- `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO anon, authenticated, ...`
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

## What does NOT belong here

- RLS policies → srtd templates (`supabase/migrations-templates/`)
- Functions, views, extensions → srtd templates
- Anything you'd put in a migration file → migrate via `supabase db diff`

## Gotchas

- **`supabase db diff` does not emit DML grants by default.** It only outputs `MAINTAIN`, `REFERENCES`, `TRIGGER`, `TRUNCATE`. Without explicit `SELECT`/`INSERT` grants, anon gets 401 even with valid RLS. Always include `GRANT SELECT, INSERT ON ... TO anon` (and `authenticated` if needed) in the schema.
- **`ENABLE ROW LEVEL SECURITY` is required for policies to take effect.** Postgres creates tables with RLS off by default. Without this line, Studio will show "unrestricted" even though policies exist. Put it in the schema alongside the table definition.
- **Re-run `supabase db diff -f <name>` after every change** to capture the diff as a migration. The schema is the source; the migration is the artifact.
