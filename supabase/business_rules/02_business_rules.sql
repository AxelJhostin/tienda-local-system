-- ============================================================================
-- SCRIPT 2
-- REGLAS DE NEGOCIO / VALIDACIONES / FUNCIONES TRANSACCIONALES
-- ============================================================================

-- ============================================================================
-- 1) VALIDACION DE sale_items
-- ============================================================================

create or replace function public.validate_sale_item_consistency()
returns trigger
language plpgsql
as $$
declare
  v_inventory_mode text;
  v_serial_kind text;
  v_unit_product_id uuid;
begin
  select p.inventory_mode, p.serial_kind
  into v_inventory_mode, v_serial_kind
  from public.products p
  where p.id = new.product_id;

  if not found then
    raise exception 'El producto % no existe.', new.product_id;
  end if;

  if v_inventory_mode = 'serial' then
    if new.quantity <> 1 then
      raise exception 'Los productos serializados deben tener quantity = 1.';
    end if;

    if new.serialized_unit_id is null then
      raise exception 'Los productos serializados requieren serialized_unit_id.';
    end if;

    select su.product_id
    into v_unit_product_id
    from public.serialized_units su
    where su.id = new.serialized_unit_id;

    if not found then
      raise exception 'La unidad serializada % no existe.', new.serialized_unit_id;
    end if;

    if v_unit_product_id <> new.product_id then
      raise exception 'La unidad serializada no pertenece al producto indicado.';
    end if;
  else
    if new.serialized_unit_id is not null then
      raise exception 'Los productos por cantidad no deben tener serialized_unit_id.';
    end if;
  end if;

  if new.subtotal <> round((new.quantity * new.unit_price_sold)::numeric, 2) then
    raise exception 'subtotal debe ser igual a quantity * unit_price_sold.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_sale_item_consistency on public.sale_items;

create trigger trg_validate_sale_item_consistency
before insert or update on public.sale_items
for each row
execute function public.validate_sale_item_consistency();

-- ============================================================================
-- 2) RECALCULO AUTOMATICO DE sales.total_amount
-- ============================================================================

create or replace function public.recalculate_sale_total(p_sale_id uuid)
returns void
language plpgsql
as $$
begin
  update public.sales s
  set total_amount = coalesce((
    select sum(si.subtotal)
    from public.sale_items si
    where si.sale_id = p_sale_id
  ), 0)
  where s.id = p_sale_id;
end;
$$;

create or replace function public.trg_sale_items_recalculate_sale_total()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_sale_total(old.sale_id);
    return old;
  else
    perform public.recalculate_sale_total(new.sale_id);
    return new;
  end if;
end;
$$;

drop trigger if exists trg_sale_items_recalculate_sale_total on public.sale_items;

create trigger trg_sale_items_recalculate_sale_total
after insert or update or delete on public.sale_items
for each row
execute function public.trg_sale_items_recalculate_sale_total();

-- ============================================================================
-- 3) RECALCULO AUTOMATICO DE PLAN ACUMULATIVO
-- ============================================================================

create or replace function public.recalculate_layaway_plan(p_layaway_plan_id uuid)
returns void
language plpgsql
as $$
declare
  v_agreed_total numeric(12,2);
  v_amount_paid numeric(12,2);
  v_current_status text;
begin
  select lp.agreed_total, lp.status
  into v_agreed_total, v_current_status
  from public.layaway_plans lp
  where lp.id = p_layaway_plan_id
  for update;

  if not found then
    raise exception 'El plan acumulativo % no existe.', p_layaway_plan_id;
  end if;

  select coalesce(sum(lpay.amount), 0)
  into v_amount_paid
  from public.layaway_payments lpay
  where lpay.layaway_plan_id = p_layaway_plan_id;

  update public.layaway_plans lp
  set
    amount_paid = v_amount_paid,
    remaining_balance = round((v_agreed_total - v_amount_paid)::numeric, 2),
    status = case
      when lp.status = 'delivered' then 'delivered'
      when lp.status = 'cancelled' then 'cancelled'
      when v_amount_paid >= v_agreed_total then 'paid'
      else 'active'
    end,
    paid_at = case
      when lp.status = 'delivered' then lp.paid_at
      when lp.status = 'cancelled' then lp.paid_at
      when v_amount_paid >= v_agreed_total then coalesce(lp.paid_at, now())
      else null
    end
  where lp.id = p_layaway_plan_id;
end;
$$;

create or replace function public.trg_layaway_payments_recalculate_plan()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_layaway_plan(old.layaway_plan_id);
    return old;
  else
    perform public.recalculate_layaway_plan(new.layaway_plan_id);
    return new;
  end if;
end;
$$;

drop trigger if exists trg_layaway_payments_recalculate_plan on public.layaway_payments;

create trigger trg_layaway_payments_recalculate_plan
after insert or update or delete on public.layaway_payments
for each row
execute function public.trg_layaway_payments_recalculate_plan();

-- ============================================================================
-- 4) FUNCION: REGISTRAR VENTA DE PRODUCTO POR CANTIDAD
-- ============================================================================

create or replace function public.create_quantity_sale(
  p_seller_profile_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_unit_price_sold numeric(12,2),
  p_customer_id uuid default null,
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_sale_id uuid;
  v_sale_item_id uuid;
  v_product record;
  v_subtotal numeric(12,2);
begin
  if p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor que 0.';
  end if;

  if p_unit_price_sold < 0 then
    raise exception 'El precio de venta no puede ser negativo.';
  end if;

  select *
  into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'El producto % no existe.', p_product_id;
  end if;

  if v_product.inventory_mode <> 'quantity' then
    raise exception 'El producto % no es de tipo quantity.', p_product_id;
  end if;

  if v_product.is_active is false then
    raise exception 'El producto está inactivo.';
  end if;

  if v_product.simple_stock < p_quantity then
    raise exception 'Stock insuficiente. Disponible: %, solicitado: %.',
      v_product.simple_stock, p_quantity;
  end if;

  v_subtotal := round((p_quantity * p_unit_price_sold)::numeric, 2);

  insert into public.sales (
    seller_profile_id,
    customer_id,
    notes
  )
  values (
    p_seller_profile_id,
    p_customer_id,
    p_notes
  )
  returning id into v_sale_id;

  insert into public.sale_items (
    sale_id,
    product_id,
    serialized_unit_id,
    quantity,
    unit_cost_snapshot,
    unit_price_sold,
    subtotal
  )
  values (
    v_sale_id,
    p_product_id,
    null,
    p_quantity,
    v_product.reference_cost,
    p_unit_price_sold,
    v_subtotal
  )
  returning id into v_sale_item_id;

  update public.products
  set simple_stock = simple_stock - p_quantity
  where id = p_product_id;

  insert into public.inventory_movements (
    product_id,
    serialized_unit_id,
    movement_type,
    quantity,
    reason,
    performed_by_profile_id,
    sale_item_id
  )
  values (
    p_product_id,
    null,
    'sale_delivery',
    -p_quantity,
    'Venta directa',
    p_seller_profile_id,
    v_sale_item_id
  );

  perform public.recalculate_sale_total(v_sale_id);

  return v_sale_id;
end;
$$;

-- ============================================================================
-- 5) FUNCION: REGISTRAR VENTA DE PRODUCTO SERIALIZADO
-- Crea garantia si el producto usa serial_kind = 'imei'
-- ============================================================================

create or replace function public.create_serial_sale(
  p_seller_profile_id uuid,
  p_product_id uuid,
  p_serialized_unit_id uuid,
  p_unit_price_sold numeric(12,2),
  p_customer_id uuid default null,
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_sale_id uuid;
  v_sale_item_id uuid;
  v_product record;
  v_serialized_unit record;
begin
  if p_unit_price_sold < 0 then
    raise exception 'El precio de venta no puede ser negativo.';
  end if;

  select *
  into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'El producto % no existe.', p_product_id;
  end if;

  if v_product.inventory_mode <> 'serial' then
    raise exception 'El producto % no es de tipo serial.', p_product_id;
  end if;

  if v_product.is_active is false then
    raise exception 'El producto está inactivo.';
  end if;

  select *
  into v_serialized_unit
  from public.serialized_units
  where id = p_serialized_unit_id
  for update;

  if not found then
    raise exception 'La unidad serializada % no existe.', p_serialized_unit_id;
  end if;

  if v_serialized_unit.product_id <> p_product_id then
    raise exception 'La unidad serializada no pertenece al producto indicado.';
  end if;

  if v_serialized_unit.status <> 'available' then
    raise exception 'La unidad serializada no está disponible.';
  end if;

  insert into public.sales (
    seller_profile_id,
    customer_id,
    notes
  )
  values (
    p_seller_profile_id,
    p_customer_id,
    p_notes
  )
  returning id into v_sale_id;

  insert into public.sale_items (
    sale_id,
    product_id,
    serialized_unit_id,
    quantity,
    unit_cost_snapshot,
    unit_price_sold,
    subtotal
  )
  values (
    v_sale_id,
    p_product_id,
    p_serialized_unit_id,
    1,
    v_product.reference_cost,
    p_unit_price_sold,
    round((1 * p_unit_price_sold)::numeric, 2)
  )
  returning id into v_sale_item_id;

  update public.serialized_units
  set status = 'sold'
  where id = p_serialized_unit_id;

  insert into public.inventory_movements (
    product_id,
    serialized_unit_id,
    movement_type,
    quantity,
    reason,
    performed_by_profile_id,
    sale_item_id
  )
  values (
    p_product_id,
    p_serialized_unit_id,
    'sale_delivery',
    -1,
    'Venta directa',
    p_seller_profile_id,
    v_sale_item_id
  );

  -- Garantia automatica para productos tipo IMEI
  if v_product.serial_kind = 'imei' then
    insert into public.warranties (
      sale_item_id,
      serialized_unit_id,
      customer_id,
      starts_at,
      ends_at,
      coverage,
      status
    )
    values (
      v_sale_item_id,
      p_serialized_unit_id,
      p_customer_id,
      current_date,
      (current_date + interval '3 months')::date,
      'Defecto de software por 3 meses',
      'active'
    );
  end if;

  perform public.recalculate_sale_total(v_sale_id);

  return v_sale_id;
end;
$$;

-- ============================================================================
-- 6) FUNCION: REGISTRAR ABONO DE PLAN ACUMULATIVO
-- ============================================================================

create or replace function public.add_layaway_payment(
  p_layaway_plan_id uuid,
  p_received_by_profile_id uuid,
  p_amount numeric(12,2),
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_payment_id uuid;
  v_plan record;
begin
  if p_amount <= 0 then
    raise exception 'El monto del abono debe ser mayor que 0.';
  end if;

  select *
  into v_plan
  from public.layaway_plans
  where id = p_layaway_plan_id
  for update;

  if not found then
    raise exception 'El plan acumulativo % no existe.', p_layaway_plan_id;
  end if;

  if v_plan.status in ('delivered', 'cancelled') then
    raise exception 'No se pueden registrar abonos en un plan %.', v_plan.status;
  end if;

  if (v_plan.amount_paid + p_amount) > v_plan.agreed_total then
    raise exception 'El abono excede el total acordado. Pendiente actual: %.',
      v_plan.remaining_balance;
  end if;

  insert into public.layaway_payments (
    layaway_plan_id,
    amount,
    received_by_profile_id,
    notes
  )
  values (
    p_layaway_plan_id,
    p_amount,
    p_received_by_profile_id,
    p_notes
  )
  returning id into v_payment_id;

  perform public.recalculate_layaway_plan(p_layaway_plan_id);

  return v_payment_id;
end;
$$;

-- ============================================================================
-- 7) FUNCION: ENTREGAR PLAN ACUMULATIVO DE PRODUCTO POR CANTIDAD
-- Regla del negocio: el stock solo baja al entregar
-- ============================================================================

create or replace function public.deliver_quantity_layaway(
  p_layaway_plan_id uuid,
  p_seller_profile_id uuid
)
returns uuid
language plpgsql
as $$
declare
  v_plan record;
  v_product record;
  v_sale_id uuid;
  v_sale_item_id uuid;
begin
  select *
  into v_plan
  from public.layaway_plans
  where id = p_layaway_plan_id
  for update;

  if not found then
    raise exception 'El plan acumulativo % no existe.', p_layaway_plan_id;
  end if;

  if v_plan.status <> 'paid' then
    raise exception 'Solo se pueden entregar planes con estado paid.';
  end if;

  if v_plan.delivered_at is not null then
    raise exception 'El plan ya fue entregado.';
  end if;

  select *
  into v_product
  from public.products
  where id = v_plan.product_id
  for update;

  if not found then
    raise exception 'El producto asociado al plan no existe.';
  end if;

  if v_product.inventory_mode <> 'quantity' then
    raise exception 'El producto del plan no es de tipo quantity.';
  end if;

  if v_product.simple_stock < 1 then
    raise exception 'No hay stock disponible para entregar el producto.';
  end if;

  insert into public.sales (
    seller_profile_id,
    customer_id,
    notes
  )
  values (
    p_seller_profile_id,
    v_plan.customer_id,
    'Entrega final de plan acumulativo'
  )
  returning id into v_sale_id;

  insert into public.sale_items (
    sale_id,
    product_id,
    serialized_unit_id,
    quantity,
    unit_cost_snapshot,
    unit_price_sold,
    subtotal
  )
  values (
    v_sale_id,
    v_plan.product_id,
    null,
    1,
    v_product.reference_cost,
    v_plan.agreed_total,
    v_plan.agreed_total
  )
  returning id into v_sale_item_id;

  update public.products
  set simple_stock = simple_stock - 1
  where id = v_plan.product_id;

  insert into public.inventory_movements (
    product_id,
    serialized_unit_id,
    movement_type,
    quantity,
    reason,
    performed_by_profile_id,
    sale_item_id,
    layaway_plan_id
  )
  values (
    v_plan.product_id,
    null,
    'sale_delivery',
    -1,
    'Entrega final de plan acumulativo',
    p_seller_profile_id,
    v_sale_item_id,
    v_plan.id
  );

  update public.layaway_plans
  set
    status = 'delivered',
    delivered_at = now(),
    final_sale_id = v_sale_id
  where id = v_plan.id;

  perform public.recalculate_sale_total(v_sale_id);

  return v_sale_id;
end;
$$;

-- ============================================================================
-- 8) FUNCION: ENTREGAR PLAN ACUMULATIVO DE PRODUCTO SERIALIZADO
-- Regla del negocio: el IMEI se elige al momento de entregar
-- ============================================================================

create or replace function public.deliver_serial_layaway(
  p_layaway_plan_id uuid,
  p_seller_profile_id uuid,
  p_serialized_unit_id uuid
)
returns uuid
language plpgsql
as $$
declare
  v_plan record;
  v_product record;
  v_serialized_unit record;
  v_sale_id uuid;
  v_sale_item_id uuid;
begin
  select *
  into v_plan
  from public.layaway_plans
  where id = p_layaway_plan_id
  for update;

  if not found then
    raise exception 'El plan acumulativo % no existe.', p_layaway_plan_id;
  end if;

  if v_plan.status <> 'paid' then
    raise exception 'Solo se pueden entregar planes con estado paid.';
  end if;

  if v_plan.delivered_at is not null then
    raise exception 'El plan ya fue entregado.';
  end if;

  select *
  into v_product
  from public.products
  where id = v_plan.product_id
  for update;

  if not found then
    raise exception 'El producto asociado al plan no existe.';
  end if;

  if v_product.inventory_mode <> 'serial' then
    raise exception 'El producto del plan no es de tipo serial.';
  end if;

  select *
  into v_serialized_unit
  from public.serialized_units
  where id = p_serialized_unit_id
  for update;

  if not found then
    raise exception 'La unidad serializada seleccionada no existe.';
  end if;

  if v_serialized_unit.product_id <> v_plan.product_id then
    raise exception 'La unidad serializada no pertenece al producto del plan.';
  end if;

  if v_serialized_unit.status <> 'available' then
    raise exception 'La unidad serializada no está disponible.';
  end if;

  insert into public.sales (
    seller_profile_id,
    customer_id,
    notes
  )
  values (
    p_seller_profile_id,
    v_plan.customer_id,
    'Entrega final de plan acumulativo'
  )
  returning id into v_sale_id;

  insert into public.sale_items (
    sale_id,
    product_id,
    serialized_unit_id,
    quantity,
    unit_cost_snapshot,
    unit_price_sold,
    subtotal
  )
  values (
    v_sale_id,
    v_plan.product_id,
    p_serialized_unit_id,
    1,
    v_product.reference_cost,
    v_plan.agreed_total,
    v_plan.agreed_total
  )
  returning id into v_sale_item_id;

  update public.serialized_units
  set status = 'sold'
  where id = p_serialized_unit_id;

  insert into public.inventory_movements (
    product_id,
    serialized_unit_id,
    movement_type,
    quantity,
    reason,
    performed_by_profile_id,
    sale_item_id,
    layaway_plan_id
  )
  values (
    v_plan.product_id,
    p_serialized_unit_id,
    'sale_delivery',
    -1,
    'Entrega final de plan acumulativo',
    p_seller_profile_id,
    v_sale_item_id,
    v_plan.id
  );

  if v_product.serial_kind = 'imei' then
    insert into public.warranties (
      sale_item_id,
      serialized_unit_id,
      customer_id,
      starts_at,
      ends_at,
      coverage,
      status
    )
    values (
      v_sale_item_id,
      p_serialized_unit_id,
      v_plan.customer_id,
      current_date,
      (current_date + interval '3 months')::date,
      'Defecto de software por 3 meses',
      'active'
    );
  end if;

  update public.layaway_plans
  set
    status = 'delivered',
    delivered_at = now(),
    final_sale_id = v_sale_id
  where id = v_plan.id;

  perform public.recalculate_sale_total(v_sale_id);

  return v_sale_id;
end;
$$;

-- ============================================================================
-- SCRIPT 4
-- RPC FALTANTES DE OPERACION
-- ============================================================================

-- ============================================================================
-- 1) CREAR PLAN ACUMULATIVO
-- No baja stock. Solo registra el acuerdo.
-- ============================================================================

create or replace function public.create_layaway_plan(
  p_created_by_profile_id uuid,
  p_product_id uuid,
  p_agreed_total numeric(12,2),
  p_customer_id uuid default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_product record;
begin
  if p_agreed_total <= 0 then
    raise exception 'El total acordado debe ser mayor que 0.';
  end if;

  select *
  into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'El producto % no existe.', p_product_id;
  end if;

  if v_product.is_active is false then
    raise exception 'No se puede crear plan acumulativo para un producto inactivo.';
  end if;

  insert into public.layaway_plans (
    customer_id,
    product_id,
    agreed_total,
    amount_paid,
    remaining_balance,
    status,
    notes,
    created_by_profile_id
  )
  values (
    p_customer_id,
    p_product_id,
    round(p_agreed_total, 2),
    0,
    round(p_agreed_total, 2),
    'active',
    p_notes,
    p_created_by_profile_id
  )
  returning id into v_plan_id;

  return v_plan_id;
end;
$$;

grant execute on function public.create_layaway_plan(uuid, uuid, numeric, uuid, text) to authenticated;
revoke all on function public.create_layaway_plan(uuid, uuid, numeric, uuid, text) from anon;

-- ============================================================================
-- 2) CANCELAR PLAN ACUMULATIVO
-- Solo si no ha sido entregado.
-- ============================================================================

create or replace function public.cancel_layaway_plan(
  p_layaway_plan_id uuid,
  p_cancelled_by_profile_id uuid,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan record;
begin
  select *
  into v_plan
  from public.layaway_plans
  where id = p_layaway_plan_id
  for update;

  if not found then
    raise exception 'El plan acumulativo % no existe.', p_layaway_plan_id;
  end if;

  if v_plan.status = 'delivered' then
    raise exception 'No se puede cancelar un plan ya entregado.';
  end if;

  if v_plan.status = 'cancelled' then
    raise exception 'El plan ya está cancelado.';
  end if;

  update public.layaway_plans
  set
    status = 'cancelled',
    notes = case
      when coalesce(trim(p_reason), '') = '' then notes
      when notes is null or trim(notes) = '' then 'Cancelado: ' || p_reason
      else notes || E'\nCancelado: ' || p_reason
    end
  where id = p_layaway_plan_id;

  insert into public.audit_logs (
    performed_by_profile_id,
    entity_name,
    entity_id,
    action,
    old_values,
    new_values
  )
  values (
    p_cancelled_by_profile_id,
    'layaway_plans',
    p_layaway_plan_id,
    'cancel',
    jsonb_build_object(
      'previous_status', v_plan.status
    ),
    jsonb_build_object(
      'new_status', 'cancelled',
      'reason', p_reason
    )
  );

  return p_layaway_plan_id;
end;
$$;

grant execute on function public.cancel_layaway_plan(uuid, uuid, text) to authenticated;
revoke all on function public.cancel_layaway_plan(uuid, uuid, text) from anon;

-- ============================================================================
-- 3) AJUSTAR STOCK MANUAL DE PRODUCTO POR CANTIDAD
-- p_delta puede ser positivo o negativo, pero no 0.
-- ============================================================================

create or replace function public.adjust_quantity_stock(
  p_product_id uuid,
  p_performed_by_profile_id uuid,
  p_delta integer,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product record;
  v_movement_id uuid;
  v_new_stock integer;
  v_movement_type text;
begin
  if p_delta = 0 then
    raise exception 'El ajuste no puede ser 0.';
  end if;

  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Debes indicar una razón para el ajuste.';
  end if;

  select *
  into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'El producto % no existe.', p_product_id;
  end if;

  if v_product.inventory_mode <> 'quantity' then
    raise exception 'Solo se puede ajustar stock simple en productos de tipo quantity.';
  end if;

  v_new_stock := v_product.simple_stock + p_delta;

  if v_new_stock < 0 then
    raise exception 'El ajuste dejaría stock negativo. Stock actual: %, ajuste: %.',
      v_product.simple_stock, p_delta;
  end if;

  update public.products
  set simple_stock = v_new_stock
  where id = p_product_id;

  v_movement_type := case
    when p_delta > 0 then 'stock_adjustment_increase'
    else 'stock_adjustment_decrease'
  end;

  insert into public.inventory_movements (
    product_id,
    serialized_unit_id,
    movement_type,
    quantity,
    reason,
    performed_by_profile_id
  )
  values (
    p_product_id,
    null,
    v_movement_type,
    p_delta,
    p_reason,
    p_performed_by_profile_id
  )
  returning id into v_movement_id;

  insert into public.audit_logs (
    performed_by_profile_id,
    entity_name,
    entity_id,
    action,
    old_values,
    new_values
  )
  values (
    p_performed_by_profile_id,
    'products',
    p_product_id,
    'stock_adjustment',
    jsonb_build_object(
      'previous_stock', v_product.simple_stock
    ),
    jsonb_build_object(
      'new_stock', v_new_stock,
      'delta', p_delta,
      'reason', p_reason
    )
  );

  return v_movement_id;
end;
$$;

grant execute on function public.adjust_quantity_stock(uuid, uuid, integer, text) to authenticated;
revoke all on function public.adjust_quantity_stock(uuid, uuid, integer, text) from anon;

-- ============================================================================
-- 4) AGREGAR UNIDAD SERIALIZADA
-- Para celulares u otros productos serializados.
-- ============================================================================

create or replace function public.add_serialized_unit(
  p_product_id uuid,
  p_serial_value text,
  p_performed_by_profile_id uuid,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product record;
  v_serialized_unit_id uuid;
begin
  if coalesce(trim(p_serial_value), '') = '' then
    raise exception 'El serial/IMEI no puede estar vacío.';
  end if;

  select *
  into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'El producto % no existe.', p_product_id;
  end if;

  if v_product.inventory_mode <> 'serial' then
    raise exception 'Solo se pueden agregar unidades a productos serializados.';
  end if;

  insert into public.serialized_units (
    product_id,
    serial_value,
    status,
    notes
  )
  values (
    p_product_id,
    trim(p_serial_value),
    'available',
    p_notes
  )
  returning id into v_serialized_unit_id;

  insert into public.inventory_movements (
    product_id,
    serialized_unit_id,
    movement_type,
    quantity,
    reason,
    performed_by_profile_id
  )
  values (
    p_product_id,
    v_serialized_unit_id,
    'stock_entry',
    1,
    'Ingreso de unidad serializada',
    p_performed_by_profile_id
  );

  insert into public.audit_logs (
    performed_by_profile_id,
    entity_name,
    entity_id,
    action,
    old_values,
    new_values
  )
  values (
    p_performed_by_profile_id,
    'serialized_units',
    v_serialized_unit_id,
    'create',
    null,
    jsonb_build_object(
      'product_id', p_product_id,
      'serial_value', trim(p_serial_value),
      'status', 'available'
    )
  );

  return v_serialized_unit_id;
end;
$$;

grant execute on function public.add_serialized_unit(uuid, text, uuid, text) to authenticated;
revoke all on function public.add_serialized_unit(uuid, text, uuid, text) from anon;

-- ============================================================================
-- 5) DESACTIVAR UNIDAD SERIALIZADA
-- Solo si está disponible. No borra la unidad.
-- ============================================================================

create or replace function public.deactivate_serialized_unit(
  p_serialized_unit_id uuid,
  p_performed_by_profile_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit record;
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Debes indicar la razón de la desactivación.';
  end if;

  select *
  into v_unit
  from public.serialized_units
  where id = p_serialized_unit_id
  for update;

  if not found then
    raise exception 'La unidad serializada % no existe.', p_serialized_unit_id;
  end if;

  if v_unit.status = 'sold' then
    raise exception 'No se puede desactivar una unidad ya vendida.';
  end if;

  if v_unit.status = 'inactive' then
    raise exception 'La unidad ya está inactiva.';
  end if;

  update public.serialized_units
  set
    status = 'inactive',
    notes = case
      when notes is null or trim(notes) = '' then 'Desactivada: ' || p_reason
      else notes || E'\nDesactivada: ' || p_reason
    end
  where id = p_serialized_unit_id;

  insert into public.inventory_movements (
    product_id,
    serialized_unit_id,
    movement_type,
    quantity,
    reason,
    performed_by_profile_id
  )
  values (
    v_unit.product_id,
    p_serialized_unit_id,
    'manual_correction',
    -1,
    p_reason,
    p_performed_by_profile_id
  );

  insert into public.audit_logs (
    performed_by_profile_id,
    entity_name,
    entity_id,
    action,
    old_values,
    new_values
  )
  values (
    p_performed_by_profile_id,
    'serialized_units',
    p_serialized_unit_id,
    'deactivate',
    jsonb_build_object(
      'previous_status', v_unit.status
    ),
    jsonb_build_object(
      'new_status', 'inactive',
      'reason', p_reason
    )
  );

  return p_serialized_unit_id;
end;
$$;

grant execute on function public.deactivate_serialized_unit(uuid, uuid, text) to authenticated;
revoke all on function public.deactivate_serialized_unit(uuid, uuid, text) from anon;
