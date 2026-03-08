# Migrations

This folder is reserved for ordered, executable SQL migrations.

Naming convention (recommended):

- `YYYYMMDDHHMMSS_description.sql`

Current status:

- Base SQL is versioned under `schema/`, `business_rules/`, `security/`, and `seeds/`.
- Future changes (including new RPCs) should be added here as forward-only migrations.
