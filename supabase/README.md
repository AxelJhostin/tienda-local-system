# Supabase SQL Backend

This folder contains the real SQL backend organized by responsibility.

## Structure

- `schema/01_base_schema.sql`
  extensions, `set_updated_at`, tables, constraints, indexes, structural triggers
- `business_rules/02_business_rules.sql`
  validations, recalculation functions, transactional/operational RPCs
- `security/03_security_rls.sql`
  authorization helpers, `security definer`, grants/revokes, RLS and policies
- `seeds/04_seed_data.sql`
  initial data for categories, brands, products, and test customers
- `migrations/`
  reserved for forward-only migration files

## Notes

- Architecture remains Supabase-first.
- No Node backend was added.
- `create_checkout_sale` is intentionally not included yet.
