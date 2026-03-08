-- ============================================================================
-- EXTENSIONES
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- FUNCION GENERICA updated_at
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLA: staff_profiles
-- Perfil del personal. Vinculada a auth.users de Supabase.
-- ============================================================================

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null,
  username text not null,
  role text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint staff_profiles_username_unique unique (username),
  constraint staff_profiles_role_check
    check (role in ('admin', 'seller')),
  constraint staff_profiles_full_name_not_blank
    check (length(trim(full_name)) > 0),
  constraint staff_profiles_username_not_blank
    check (length(trim(username)) > 0)
);

create index if not exists idx_staff_profiles_role
  on public.staff_profiles(role);

create index if not exists idx_staff_profiles_is_active
  on public.staff_profiles(is_active);

create trigger trg_staff_profiles_updated_at
before update on public.staff_profiles
for each row
execute function public.set_updated_at();

-- ============================================================================
-- TABLA: categories
-- ============================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_name_unique unique (name),
  constraint categories_name_not_blank
    check (length(trim(name)) > 0)
);

create index if not exists idx_categories_is_active
  on public.categories(is_active);

create trigger trg_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

-- ============================================================================
-- TABLA: brands
-- Marca separada de categoría para evitar duplicaciones futuras.
-- ============================================================================

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint brands_name_unique unique (name),
  constraint brands_name_not_blank
    check (length(trim(name)) > 0)
);

create index if not exists idx_brands_is_active
  on public.brands(is_active);

create trigger trg_brands_updated_at
before update on public.brands
for each row
execute function public.set_updated_at();

-- ============================================================================
-- TABLA: products
-- Catalogo maestro
-- inventory_mode:
--   serial   -> inventario por unidades serializadas
--   quantity -> inventario por cantidad simple
-- serial_kind:
--   imei | serial_number | null
-- ============================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  internal_code text not null,
  name text not null,
  description text null,
  category_id uuid not null references public.categories(id) on delete restrict,
  brand_id uuid null references public.brands(id) on delete restrict,
  inventory_mode text not null,
  serial_kind text null,
  reference_cost numeric(12,2) not null default 0,
  suggested_price numeric(12,2) not null default 0,
  minimum_price numeric(12,2) not null default 0,
  low_stock_threshold integer not null default 0,
  simple_stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_internal_code_unique unique (internal_code),
  constraint products_name_not_blank
    check (length(trim(name)) > 0),
  constraint products_internal_code_not_blank
    check (length(trim(internal_code)) > 0),
  constraint products_inventory_mode_check
    check (inventory_mode in ('serial', 'quantity')),
  constraint products_serial_kind_check
    check (serial_kind in ('imei', 'serial_number') or serial_kind is null),
  constraint products_reference_cost_check
    check (reference_cost >= 0),
  constraint products_suggested_price_check
    check (suggested_price >= 0),
  constraint products_minimum_price_check
    check (minimum_price >= 0),
  constraint products_low_stock_threshold_check
    check (low_stock_threshold >= 0),
  constraint products_simple_stock_check
    check (simple_stock >= 0),
  constraint products_minimum_le_suggested_check
    check (minimum_price <= suggested_price),
  constraint products_serial_mode_consistency_check
    check (
      (inventory_mode = 'serial' and serial_kind is not null and simple_stock = 0)
      or
      (inventory_mode = 'quantity' and serial_kind is null)
    )
);

create index if not exists idx_products_category_id
  on public.products(category_id);

create index if not exists idx_products_brand_id
  on public.products(brand_id);

create index if not exists idx_products_inventory_mode
  on public.products(inventory_mode);

create index if not exists idx_products_is_active
  on public.products(is_active);

create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- ============================================================================
-- TABLA: serialized_units
-- Unidades fisicas para celulares u otros productos serializados
-- ============================================================================

create table if not exists public.serialized_units (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  serial_value text not null,
  status text not null default 'available',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint serialized_units_product_serial_unique
    unique (product_id, serial_value),
  constraint serialized_units_status_check
    check (status in ('available', 'sold', 'inactive')),
  constraint serialized_units_serial_value_not_blank
    check (length(trim(serial_value)) > 0)
);

create index if not exists idx_serialized_units_product_id
  on public.serialized_units(product_id);

create index if not exists idx_serialized_units_status
  on public.serialized_units(status);

create trigger trg_serialized_units_updated_at
before update on public.serialized_units
for each row
execute function public.set_updated_at();

-- ============================================================================
-- TABLA: customers
-- Clientes opcionales, sin login
-- ============================================================================

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text null,
  national_id text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customers_full_name_not_blank
    check (length(trim(full_name)) > 0)
);

create index if not exists idx_customers_phone
  on public.customers(phone);

create index if not exists idx_customers_national_id
  on public.customers(national_id);

create trigger trg_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

-- ============================================================================
-- TABLA: sales
-- Cabecera de venta
-- ============================================================================

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  sold_at timestamptz not null default now(),
  seller_profile_id uuid not null references public.staff_profiles(id) on delete restrict,
  customer_id uuid null references public.customers(id) on delete set null,
  total_amount numeric(12,2) not null default 0,
  notes text null,
  created_at timestamptz not null default now(),

  constraint sales_total_amount_check
    check (total_amount >= 0)
);

create index if not exists idx_sales_sold_at
  on public.sales(sold_at);

create index if not exists idx_sales_seller_profile_id
  on public.sales(seller_profile_id);

create index if not exists idx_sales_customer_id
  on public.sales(customer_id);

-- ============================================================================
-- TABLA: sale_items
-- Detalle de venta
-- ============================================================================

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  serialized_unit_id uuid null references public.serialized_units(id) on delete restrict,
  quantity integer not null default 1,
  unit_cost_snapshot numeric(12,2) not null,
  unit_price_sold numeric(12,2) not null,
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now(),

  constraint sale_items_quantity_check
    check (quantity > 0),
  constraint sale_items_unit_cost_snapshot_check
    check (unit_cost_snapshot >= 0),
  constraint sale_items_unit_price_sold_check
    check (unit_price_sold >= 0),
  constraint sale_items_subtotal_check
    check (subtotal >= 0)
);

create index if not exists idx_sale_items_sale_id
  on public.sale_items(sale_id);

create index if not exists idx_sale_items_product_id
  on public.sale_items(product_id);

create index if not exists idx_sale_items_serialized_unit_id
  on public.sale_items(serialized_unit_id);

-- ============================================================================
-- TABLA: layaway_plans
-- Plan acumulativo
-- Regla del negocio: NO baja stock hasta la entrega final
-- ============================================================================

create table if not exists public.layaway_plans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid null references public.customers(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  agreed_total numeric(12,2) not null,
  amount_paid numeric(12,2) not null default 0,
  remaining_balance numeric(12,2) not null,
  status text not null default 'active',
  notes text null,
  created_by_profile_id uuid not null references public.staff_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  paid_at timestamptz null,
  delivered_at timestamptz null,
  final_sale_id uuid null references public.sales(id) on delete set null,

  constraint layaway_plans_status_check
    check (status in ('active', 'paid', 'delivered', 'cancelled')),
  constraint layaway_plans_agreed_total_check
    check (agreed_total > 0),
  constraint layaway_plans_amount_paid_check
    check (amount_paid >= 0),
  constraint layaway_plans_remaining_balance_check
    check (remaining_balance >= 0),
  constraint layaway_plans_amount_paid_le_agreed_total_check
    check (amount_paid <= agreed_total)
);

create index if not exists idx_layaway_plans_status
  on public.layaway_plans(status);

create index if not exists idx_layaway_plans_product_id
  on public.layaway_plans(product_id);

create index if not exists idx_layaway_plans_customer_id
  on public.layaway_plans(customer_id);

create index if not exists idx_layaway_plans_created_at
  on public.layaway_plans(created_at);

-- ============================================================================
-- TABLA: layaway_payments
-- Abonos del plan acumulativo
-- ============================================================================

create table if not exists public.layaway_payments (
  id uuid primary key default gen_random_uuid(),
  layaway_plan_id uuid not null references public.layaway_plans(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_at timestamptz not null default now(),
  received_by_profile_id uuid not null references public.staff_profiles(id) on delete restrict,
  notes text null,

  constraint layaway_payments_amount_check
    check (amount > 0)
);

create index if not exists idx_layaway_payments_layaway_plan_id
  on public.layaway_payments(layaway_plan_id);

create index if not exists idx_layaway_payments_paid_at
  on public.layaway_payments(paid_at);

create index if not exists idx_layaway_payments_received_by_profile_id
  on public.layaway_payments(received_by_profile_id);

-- ============================================================================
-- TABLA: warranties
-- Garantias
-- ============================================================================

create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  sale_item_id uuid not null references public.sale_items(id) on delete restrict,
  serialized_unit_id uuid not null references public.serialized_units(id) on delete restrict,
  customer_id uuid null references public.customers(id) on delete set null,
  starts_at date not null,
  ends_at date not null,
  coverage text not null,
  status text not null default 'active',
  notes text null,
  created_at timestamptz not null default now(),

  constraint warranties_status_check
    check (status in ('active', 'expired', 'void')),
  constraint warranties_date_range_check
    check (ends_at >= starts_at),
  constraint warranties_coverage_not_blank
    check (length(trim(coverage)) > 0)
);

create index if not exists idx_warranties_serialized_unit_id
  on public.warranties(serialized_unit_id);

create index if not exists idx_warranties_sale_item_id
  on public.warranties(sale_item_id);

create index if not exists idx_warranties_customer_id
  on public.warranties(customer_id);

create index if not exists idx_warranties_ends_at
  on public.warranties(ends_at);

-- ============================================================================
-- TABLA: inventory_movements
-- Trazabilidad del inventario
-- quantity:
--   puede ser positivo o negativo, pero nunca 0
-- ============================================================================

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  serialized_unit_id uuid null references public.serialized_units(id) on delete restrict,
  movement_type text not null,
  quantity integer not null,
  reason text not null,
  performed_by_profile_id uuid not null references public.staff_profiles(id) on delete restrict,
  sale_item_id uuid null references public.sale_items(id) on delete set null,
  layaway_plan_id uuid null references public.layaway_plans(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint inventory_movements_type_check
    check (
      movement_type in (
        'stock_entry',
        'stock_adjustment_increase',
        'stock_adjustment_decrease',
        'sale_delivery',
        'warranty_out',
        'warranty_return',
        'manual_correction'
      )
    ),
  constraint inventory_movements_quantity_non_zero_check
    check (quantity <> 0),
  constraint inventory_movements_reason_not_blank
    check (length(trim(reason)) > 0)
);

create index if not exists idx_inventory_movements_product_id
  on public.inventory_movements(product_id);

create index if not exists idx_inventory_movements_serialized_unit_id
  on public.inventory_movements(serialized_unit_id);

create index if not exists idx_inventory_movements_type
  on public.inventory_movements(movement_type);

create index if not exists idx_inventory_movements_created_at
  on public.inventory_movements(created_at);

-- ============================================================================
-- TABLA: audit_logs
-- Bitacora de auditoria
-- ============================================================================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  performed_by_profile_id uuid null references public.staff_profiles(id) on delete set null,
  entity_name text not null,
  entity_id uuid not null,
  action text not null,
  old_values jsonb null,
  new_values jsonb null,
  created_at timestamptz not null default now(),

  constraint audit_logs_entity_name_not_blank
    check (length(trim(entity_name)) > 0),
  constraint audit_logs_action_not_blank
    check (length(trim(action)) > 0)
);

create index if not exists idx_audit_logs_entity_name
  on public.audit_logs(entity_name);

create index if not exists idx_audit_logs_entity_id
  on public.audit_logs(entity_id);

create index if not exists idx_audit_logs_performed_by_profile_id
  on public.audit_logs(performed_by_profile_id);

create index if not exists idx_audit_logs_created_at
  on public.audit_logs(created_at);
