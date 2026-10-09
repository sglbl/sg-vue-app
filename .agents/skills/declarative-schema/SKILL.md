---
name: declarative-schema
description: Manage database schemas declaratively using Supabase CLI and the pg-delta diff engine. Use when creating or modifying database tables, columns, indexes, RLS policies, views, functions, triggers, and generating versioned migrations via supabase db schema declarative sync.
---

# Declarative Database Schemas (pg-delta)

Manage database schemas declaratively in one place and generate versioned migrations automatically using the Supabase CLI and `pg-delta` diff engine.

## Overview

With declarative schemas, you declare the desired final state of your database in SQL files instead of writing imperative migration scripts.
The schema files in `supabase/database/` (configured via `experimental.pgdelta.declarative_schema_path = "./database"` in `config.toml`) are the single source of truth.

`supabase db schema declarative sync` diffs your declarative files against your migration history (not the live database) and generates clean, ordered migrations.

## Workflow

### 1. Declaring Schema Objects

Define schema objects (tables, RLS, functions, views, triggers, grants) inside `supabase/database/`.
You can organize files into subdirectories (e.g. `supabase/database/schemas/` and `supabase/database/rls/`) for readability. `pg-delta` analyzes statement dependencies automatically, so file ordering and naming do not constrain execution order.

Example table definition:
```sql
-- supabase/database/schemas/employees.sql
create table public.employees (
  id integer generated always as identity primary key,
  name text not null,
  age smallint
);

grant select, insert on public.employees to anon;
grant select, insert, update, delete on public.employees to authenticated;
```

Example RLS policy:
```sql
-- supabase/database/rls/employees_rls.sql
alter table public.employees enable row level security;

create policy "Anyone can read employees"
on public.employees
for select
to anon
using (true);
```

### 2. Generating Migrations

Generate a migration by diffing existing migrations against the declared schemas:

```bash
# Generate migration file without applying immediately
supabase db schema declarative sync -f <migration_name> --no-apply

# Or generate and automatically apply to local DB:
supabase db schema declarative sync -f <migration_name> --apply
```

### 3. Applying Migrations Locally

```bash
supabase migration up
```

### 4. Deploying to Remote

```bash
supabase db push
```

## Advanced Operations

### In-Place Editing (Views, Functions, RLS)
Entities like views, functions, and RLS policies can be edited directly in-place in their declarative files. The engine generates the appropriate `CREATE OR REPLACE`, `DROP ... CREATE`, or `ALTER` statements automatically in the generated migration.

### Pulling from Remote
To export an existing schema to declarative files:
```bash
supabase db schema declarative generate --linked
```
To refresh declarative schema files from a remote project without creating a migration:
```bash
supabase db pull --declarative
```

### Resetting / Rolling Back Local Schema
```bash
supabase db reset
# Or reset to a specific migration timestamp:
supabase db reset --version <timestamp>
```

## Important Caveats

1. **Schema files are the source of truth**: Changes made directly in Supabase Studio, SQL Editor, or psql will NOT be picked up by `declarative sync` because it diffs files against migration history.
2. **No DML in declarative files**: `INSERT`, `UPDATE`, and `DELETE` statements are not schema objects. Store seed data in `supabase/seed.sql` or write a custom versioned migration.
3. **Managed schemas**: Supabase-managed platform objects (`auth.*`, `storage.*`) are excluded from diffs, although custom RLS policies and triggers on managed tables are tracked.
4. **Extension objects**: Objects owned by Postgres extensions are managed via extension APIs, not raw DDL.
