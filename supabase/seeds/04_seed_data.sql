-- ============================================================================
-- SCRIPT 5
-- DATOS INICIALES
-- ============================================================================

-- ============================================================================
-- 1) CATEGORIAS
-- ============================================================================

insert into public.categories (name, icon, is_active)
values
  ('Celulares', '📱', true),
  ('Accesorios', '🔌', true),
  ('Audio', '🔊', true),
  ('Cargadores', '🔋', true),
  ('Protectores', '🛡️', true),
  ('Cables', '🧵', true)
on conflict (name) do nothing;

-- ============================================================================
-- 2) MARCAS
-- ============================================================================

insert into public.brands (name, is_active)
values
  ('Samsung', true),
  ('Apple', true),
  ('Xiaomi', true),
  ('Motorola', true),
  ('JBL', true),
  ('Sony', true),
  ('Logitech', true),
  ('Genérica', true)
on conflict (name) do nothing;

-- ============================================================================
-- 3) PRODUCTOS
-- NOTA:
-- - inventory_mode = 'serial' para celulares
-- - inventory_mode = 'quantity' para accesorios
-- - simple_stock SOLO aplica para quantity
-- ============================================================================

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'CEL-SAM-A54-128-BLK',
  'Samsung Galaxy A54 128GB',
  'Color negro, doble SIM',
  c.id,
  b.id,
  'serial',
  'imei',
  280.00,
  350.00,
  320.00,
  2,
  0,
  true
from public.categories c
join public.brands b on b.name = 'Samsung'
where c.name = 'Celulares'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'CEL-APL-IP14-128-BLK',
  'iPhone 14 128GB',
  'Color negro, desbloqueado',
  c.id,
  b.id,
  'serial',
  'imei',
  700.00,
  950.00,
  900.00,
  1,
  0,
  true
from public.categories c
join public.brands b on b.name = 'Apple'
where c.name = 'Celulares'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'CEL-XIA-REDMI13C-128',
  'Xiaomi Redmi 13C 128GB',
  'Equipo libre',
  c.id,
  b.id,
  'serial',
  'imei',
  170.00,
  220.00,
  200.00,
  2,
  0,
  true
from public.categories c
join public.brands b on b.name = 'Xiaomi'
where c.name = 'Celulares'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'AUD-JBL-FLIP6',
  'JBL Flip 6',
  'Parlante bluetooth portátil',
  c.id,
  b.id,
  'quantity',
  null,
  55.00,
  89.00,
  75.00,
  3,
  8,
  true
from public.categories c
join public.brands b on b.name = 'JBL'
where c.name = 'Audio'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'ACC-CARG-SAM-25W',
  'Cargador Samsung 25W',
  'Carga rápida USB-C',
  c.id,
  b.id,
  'quantity',
  null,
  8.00,
  15.00,
  12.00,
  5,
  20,
  true
from public.categories c
join public.brands b on b.name = 'Samsung'
where c.name = 'Cargadores'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'ACC-CARG-GEN-20W',
  'Cargador Genérico 20W',
  'Adaptador de corriente universal',
  c.id,
  b.id,
  'quantity',
  null,
  4.00,
  8.00,
  6.00,
  8,
  30,
  true
from public.categories c
join public.brands b on b.name = 'Genérica'
where c.name = 'Cargadores'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'PROT-IP14-NEG',
  'Protector iPhone 14 Negro',
  'Protector de silicona',
  c.id,
  b.id,
  'quantity',
  null,
  2.50,
  6.00,
  5.00,
  10,
  25,
  true
from public.categories c
join public.brands b on b.name = 'Genérica'
where c.name = 'Protectores'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'PROT-A54-NEG',
  'Protector Samsung A54 Negro',
  'Protector de silicona',
  c.id,
  b.id,
  'quantity',
  null,
  2.50,
  6.00,
  5.00,
  10,
  18,
  true
from public.categories c
join public.brands b on b.name = 'Genérica'
where c.name = 'Protectores'
on conflict (internal_code) do nothing;

insert into public.products (
  internal_code,
  name,
  description,
  category_id,
  brand_id,
  inventory_mode,
  serial_kind,
  reference_cost,
  suggested_price,
  minimum_price,
  low_stock_threshold,
  simple_stock,
  is_active
)
select
  'CAB-USB-C-1M',
  'Cable USB-C 1 metro',
  'Cable de carga y datos',
  c.id,
  b.id,
  'quantity',
  null,
  1.50,
  4.00,
  3.00,
  10,
  40,
  true
from public.categories c
join public.brands b on b.name = 'Genérica'
where c.name = 'Cables'
on conflict (internal_code) do nothing;

-- ============================================================================
-- 4) CLIENTES DE PRUEBA
-- ============================================================================

insert into public.customers (
  full_name,
  phone,
  national_id,
  notes
)
values
  ('Carlos Mendoza', '0991111111', '1310000001', 'Cliente frecuente'),
  ('María Zambrano', '0982222222', '1310000002', 'Consulta equipos Apple'),
  ('José Alcívar', '0973333333', null, 'Posible plan acumulativo'),
  ('Andrea Moreira', null, null, 'Cliente ocasional')
on conflict do nothing;
