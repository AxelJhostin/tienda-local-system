-- ============================================================================
-- SCRIPT 3
-- SEGURIDAD / RLS / POLICIES / ACCESO A RPC
-- ============================================================================

-- ============================================================================
-- 0) HELPERS DE AUTORIZACION
-- IMPORTANTE:
-- SECURITY DEFINER para evitar recursion o problemas al consultar staff_profiles
-- ============================================================================

create or replace function public.is_active_staff(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles sp
    where sp.id = p_user_id
      and sp.is_active = true
  );
$$;

create or replace function public.current_staff_role(p_user_id uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select sp.role
  from public.staff_profiles sp
  where sp.id = p_user_id
    and sp.is_active = true
  limit 1;
$$;

create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles sp
    where sp.id = p_user_id
      and sp.is_active = true
      and sp.role = 'admin'
  );
$$;

revoke all on function public.is_active_staff(uuid) from public;
revoke all on function public.current_staff_role(uuid) from public;
revoke all on function public.is_admin(uuid) from public;

-- ============================================================================
-- 1) CONVERTIR RPC CRITICAS A SECURITY DEFINER
-- para que operen de forma transaccional y no dependan de inserts directos
-- ============================================================================

alter function public.create_quantity_sale(uuid, uuid, integer, numeric, uuid, text)
  security definer
  set search_path = public;

alter function public.create_serial_sale(uuid, uuid, uuid, numeric, uuid, text)
  security definer
  set search_path = public;

alter function public.add_layaway_payment(uuid, uuid, numeric, text)
  security definer
  set search_path = public;

alter function public.deliver_quantity_layaway(uuid, uuid)
  security definer
  set search_path = public;

alter function public.deliver_serial_layaway(uuid, uuid, uuid)
  security definer
  set search_path = public;

-- Permitir uso de RPC al personal autenticado
grant execute on function public.create_quantity_sale(uuid, uuid, integer, numeric, uuid, text) to authenticated;
grant execute on function public.create_serial_sale(uuid, uuid, uuid, numeric, uuid, text) to authenticated;
grant execute on function public.add_layaway_payment(uuid, uuid, numeric, text) to authenticated;
grant execute on function public.deliver_quantity_layaway(uuid, uuid) to authenticated;
grant execute on function public.deliver_serial_layaway(uuid, uuid, uuid) to authenticated;

revoke all on function public.create_quantity_sale(uuid, uuid, integer, numeric, uuid, text) from anon;
revoke all on function public.create_serial_sale(uuid, uuid, uuid, numeric, uuid, text) from anon;
revoke all on function public.add_layaway_payment(uuid, uuid, numeric, text) from anon;
revoke all on function public.deliver_quantity_layaway(uuid, uuid) from anon;
revoke all on function public.deliver_serial_layaway(uuid, uuid, uuid) from anon;

-- ============================================================================
-- 2) HABILITAR RLS
-- ============================================================================

alter table public.staff_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.serialized_units enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.layaway_plans enable row level security;
alter table public.layaway_payments enable row level security;
alter table public.warranties enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================================
-- 3) LIMPIAR POLICIES SI YA EXISTIERAN
-- ============================================================================

drop policy if exists "staff_profiles_select_active_staff" on public.staff_profiles;
drop policy if exists "staff_profiles_insert_admin" on public.staff_profiles;
drop policy if exists "staff_profiles_update_admin" on public.staff_profiles;

drop policy if exists "categories_select_active_staff" on public.categories;
drop policy if exists "categories_insert_admin" on public.categories;
drop policy if exists "categories_update_admin" on public.categories;

drop policy if exists "brands_select_active_staff" on public.brands;
drop policy if exists "brands_insert_admin" on public.brands;
drop policy if exists "brands_update_admin" on public.brands;

drop policy if exists "products_select_active_staff" on public.products;
drop policy if exists "products_insert_admin" on public.products;
drop policy if exists "products_update_admin" on public.products;

drop policy if exists "serialized_units_select_active_staff" on public.serialized_units;
drop policy if exists "serialized_units_insert_admin" on public.serialized_units;
drop policy if exists "serialized_units_update_admin" on public.serialized_units;

drop policy if exists "customers_select_active_staff" on public.customers;
drop policy if exists "customers_insert_active_staff" on public.customers;
drop policy if exists "customers_update_active_staff" on public.customers;

drop policy if exists "sales_select_active_staff" on public.sales;
drop policy if exists "sale_items_select_active_staff" on public.sale_items;

drop policy if exists "layaway_plans_select_active_staff" on public.layaway_plans;
drop policy if exists "layaway_plans_insert_active_staff" on public.layaway_plans;
drop policy if exists "layaway_plans_update_admin" on public.layaway_plans;

drop policy if exists "layaway_payments_select_active_staff" on public.layaway_payments;

drop policy if exists "warranties_select_active_staff" on public.warranties;
drop policy if exists "inventory_movements_select_active_staff" on public.inventory_movements;
drop policy if exists "audit_logs_select_admin" on public.audit_logs;

-- ============================================================================
-- 4) POLICIES: staff_profiles
-- lectura para personal activo
-- escritura directa solo admin
-- ============================================================================

create policy "staff_profiles_select_active_staff"
on public.staff_profiles
for select
to authenticated
using (public.is_active_staff());

create policy "staff_profiles_insert_admin"
on public.staff_profiles
for insert
to authenticated
with check (public.is_admin());

create policy "staff_profiles_update_admin"
on public.staff_profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 5) POLICIES: categories
-- ============================================================================

create policy "categories_select_active_staff"
on public.categories
for select
to authenticated
using (public.is_active_staff());

create policy "categories_insert_admin"
on public.categories
for insert
to authenticated
with check (public.is_admin());

create policy "categories_update_admin"
on public.categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 6) POLICIES: brands
-- ============================================================================

create policy "brands_select_active_staff"
on public.brands
for select
to authenticated
using (public.is_active_staff());

create policy "brands_insert_admin"
on public.brands
for insert
to authenticated
with check (public.is_admin());

create policy "brands_update_admin"
on public.brands
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 7) POLICIES: products
-- ============================================================================

create policy "products_select_active_staff"
on public.products
for select
to authenticated
using (public.is_active_staff());

create policy "products_insert_admin"
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy "products_update_admin"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 8) POLICIES: serialized_units
-- ============================================================================

create policy "serialized_units_select_active_staff"
on public.serialized_units
for select
to authenticated
using (public.is_active_staff());

create policy "serialized_units_insert_admin"
on public.serialized_units
for insert
to authenticated
with check (public.is_admin());

create policy "serialized_units_update_admin"
on public.serialized_units
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 9) POLICIES: customers
-- clientes opcionales; tanto admin como seller pueden crear/editar
-- ============================================================================

create policy "customers_select_active_staff"
on public.customers
for select
to authenticated
using (public.is_active_staff());

create policy "customers_insert_active_staff"
on public.customers
for insert
to authenticated
with check (public.is_active_staff());

create policy "customers_update_active_staff"
on public.customers
for update
to authenticated
using (public.is_active_staff())
with check (public.is_active_staff());

-- ============================================================================
-- 10) POLICIES: sales
-- solo lectura directa; escritura via RPC
-- ============================================================================

create policy "sales_select_active_staff"
on public.sales
for select
to authenticated
using (public.is_active_staff());

-- ============================================================================
-- 11) POLICIES: sale_items
-- solo lectura directa; escritura via RPC
-- ============================================================================

create policy "sale_items_select_active_staff"
on public.sale_items
for select
to authenticated
using (public.is_active_staff());

-- ============================================================================
-- 12) POLICIES: layaway_plans
-- lectura para personal activo
-- creacion directa permitida a personal activo
-- actualizacion directa solo admin
-- ============================================================================

create policy "layaway_plans_select_active_staff"
on public.layaway_plans
for select
to authenticated
using (public.is_active_staff());

create policy "layaway_plans_insert_active_staff"
on public.layaway_plans
for insert
to authenticated
with check (
  public.is_active_staff()
  and created_by_profile_id = auth.uid()
);

create policy "layaway_plans_update_admin"
on public.layaway_plans
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================================
-- 13) POLICIES: layaway_payments
-- solo lectura directa; escritura via RPC add_layaway_payment
-- ============================================================================

create policy "layaway_payments_select_active_staff"
on public.layaway_payments
for select
to authenticated
using (public.is_active_staff());

-- ============================================================================
-- 14) POLICIES: warranties
-- solo lectura directa
-- ============================================================================

create policy "warranties_select_active_staff"
on public.warranties
for select
to authenticated
using (public.is_active_staff());

-- ============================================================================
-- 15) POLICIES: inventory_movements
-- solo lectura directa
-- ============================================================================

create policy "inventory_movements_select_active_staff"
on public.inventory_movements
for select
to authenticated
using (public.is_active_staff());

-- ============================================================================
-- 16) POLICIES: audit_logs
-- solo admin puede leer auditoria
-- ============================================================================

create policy "audit_logs_select_admin"
on public.audit_logs
for select
to authenticated
using (public.is_admin());

-- ============================================================================
-- 17) REVOKE EXCESOS A anon
-- RLS ya protege, pero esto ayuda a dejar mas claro el acceso
-- ============================================================================

revoke all on table public.staff_profiles from anon;
revoke all on table public.categories from anon;
revoke all on table public.brands from anon;
revoke all on table public.products from anon;
revoke all on table public.serialized_units from anon;
revoke all on table public.customers from anon;
revoke all on table public.sales from anon;
revoke all on table public.sale_items from anon;
revoke all on table public.layaway_plans from anon;
revoke all on table public.layaway_payments from anon;
revoke all on table public.warranties from anon;
revoke all on table public.inventory_movements from anon;
revoke all on table public.audit_logs from anon;
