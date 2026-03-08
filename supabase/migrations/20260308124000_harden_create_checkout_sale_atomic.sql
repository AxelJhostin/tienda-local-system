-- ============================================================================
-- MIGRATION: HARDEN create_checkout_sale (deterministic locking + precise idempotency)
-- ============================================================================

create or replace function public.create_checkout_sale(
  p_items jsonb,
  p_customer_id uuid default null,
  p_notes text default null,
  p_checkout_ref text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_profile_id uuid;
  v_checkout_ref text;

  v_existing_sale_id uuid;
  v_existing_total_amount numeric(12,2);
  v_existing_item_count integer;

  v_sale_id uuid;
  v_sale_item_id uuid;

  v_line_no integer := 0;
  v_item_count integer := 0;
  v_total_amount numeric(12,2) := 0;

  v_item jsonb;
  v_input record;
  v_temp_item record;

  v_product record;
  v_serialized_unit record;

  v_product_id uuid;
  v_serialized_unit_id uuid;
  v_payload_mode text;

  v_quantity integer;
  v_quantity_numeric numeric;
  v_unit_price_sold numeric(12,2);
  v_subtotal numeric(12,2);

  v_pending_quantity integer;
  v_has_duplicate_serial boolean;
  v_is_active_staff boolean;
  v_customer_exists boolean;

  v_product_id_text text;
  v_serialized_unit_id_text text;
  v_unit_price_text text;
  v_quantity_text text;

  v_lock_product_id uuid;
  v_lock_serialized_unit_id uuid;
begin
  v_seller_profile_id := auth.uid();

  if v_seller_profile_id is null then
    raise exception 'No se pudo resolver el usuario autenticado.';
  end if;

  select exists (
    select 1
    from public.staff_profiles sp
    where sp.id = v_seller_profile_id
      and sp.is_active = true
  )
  into v_is_active_staff;

  if not v_is_active_staff then
    raise exception 'El usuario autenticado no pertenece a staff activo.';
  end if;

  if p_customer_id is not null then
    select exists (
      select 1
      from public.customers c
      where c.id = p_customer_id
    )
    into v_customer_exists;

    if not v_customer_exists then
      raise exception 'El cliente % no existe.', p_customer_id;
    end if;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'p_items debe ser un arreglo JSONB no vacio.';
  end if;

  v_checkout_ref := nullif(trim(coalesce(p_checkout_ref, '')), '');

  if v_checkout_ref is not null then
    select s.id, s.total_amount
    into v_existing_sale_id, v_existing_total_amount
    from public.sales s
    where s.checkout_ref = v_checkout_ref
    limit 1;

    if found then
      select count(*)
      into v_existing_item_count
      from public.sale_items si
      where si.sale_id = v_existing_sale_id;

      return jsonb_build_object(
        'sale_id', v_existing_sale_id,
        'total_amount', v_existing_total_amount,
        'item_count', v_existing_item_count,
        'checkout_ref', v_checkout_ref,
        'idempotent_replay', true
      );
    end if;
  end if;

  create temporary table if not exists pg_temp.tmp_checkout_input (
    line_no integer not null,
    product_id uuid not null,
    serialized_unit_id uuid null,
    payload_mode text null,
    quantity_text text null,
    unit_price_sold numeric(12,2) not null
  ) on commit drop;

  create temporary table if not exists pg_temp.tmp_checkout_items (
    line_no integer not null,
    product_id uuid not null,
    inventory_mode text not null,
    serial_kind text null,
    serialized_unit_id uuid null,
    quantity integer not null,
    unit_cost_snapshot numeric(12,2) not null,
    unit_price_sold numeric(12,2) not null,
    subtotal numeric(12,2) not null
  ) on commit drop;

  truncate table pg_temp.tmp_checkout_input;
  truncate table pg_temp.tmp_checkout_items;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_line_no := v_line_no + 1;

    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Item %: cada elemento debe ser un objeto JSON.', v_line_no;
    end if;

    v_product_id_text := coalesce(v_item->>'product_id', v_item->>'productId');
    if coalesce(trim(v_product_id_text), '') = '' then
      raise exception 'Item %: product_id es obligatorio.', v_line_no;
    end if;

    begin
      v_product_id := v_product_id_text::uuid;
    exception
      when others then
        raise exception 'Item %: product_id invalido.', v_line_no;
    end;

    v_unit_price_text := coalesce(v_item->>'unit_price_sold', v_item->>'unitPriceSold');
    if coalesce(trim(v_unit_price_text), '') = '' then
      raise exception 'Item %: unit_price_sold es obligatorio.', v_line_no;
    end if;

    begin
      v_unit_price_sold := round((v_unit_price_text)::numeric, 2);
    exception
      when others then
        raise exception 'Item %: unit_price_sold invalido.', v_line_no;
    end;

    if v_unit_price_sold < 0 then
      raise exception 'Item %: unit_price_sold no puede ser negativo.', v_line_no;
    end if;

    v_serialized_unit_id_text := coalesce(v_item->>'serialized_unit_id', v_item->>'serializedUnitId');
    if coalesce(trim(v_serialized_unit_id_text), '') = '' then
      v_serialized_unit_id := null;
    else
      begin
        v_serialized_unit_id := v_serialized_unit_id_text::uuid;
      exception
        when others then
          raise exception 'Item %: serialized_unit_id invalido.', v_line_no;
      end;
    end if;

    v_payload_mode := nullif(trim(coalesce(v_item->>'mode', '')), '');
    v_quantity_text := nullif(trim(coalesce(v_item->>'quantity', '')), '');

    insert into pg_temp.tmp_checkout_input (
      line_no,
      product_id,
      serialized_unit_id,
      payload_mode,
      quantity_text,
      unit_price_sold
    )
    values (
      v_line_no,
      v_product_id,
      v_serialized_unit_id,
      v_payload_mode,
      v_quantity_text,
      v_unit_price_sold
    );
  end loop;

  -- Locks determinísticos por UUID ascendente para minimizar riesgo de deadlock.
  for v_lock_product_id in
    select distinct i.product_id
    from pg_temp.tmp_checkout_input i
    order by 1
  loop
    perform 1
    from public.products p
    where p.id = v_lock_product_id
    for update;
  end loop;

  for v_lock_serialized_unit_id in
    select distinct i.serialized_unit_id
    from pg_temp.tmp_checkout_input i
    where i.serialized_unit_id is not null
    order by 1
  loop
    perform 1
    from public.serialized_units su
    where su.id = v_lock_serialized_unit_id
    for update;
  end loop;

  for v_input in
    select *
    from pg_temp.tmp_checkout_input
    order by line_no
  loop
    select *
    into v_product
    from public.products p
    where p.id = v_input.product_id;

    if not found then
      raise exception 'Item %: el producto % no existe.', v_input.line_no, v_input.product_id;
    end if;

    if v_product.is_active is false then
      raise exception 'Item %: el producto % esta inactivo.', v_input.line_no, v_input.product_id;
    end if;

    if v_input.unit_price_sold < v_product.minimum_price then
      raise exception 'Item %: unit_price_sold (%) no puede ser menor a minimum_price (%).',
        v_input.line_no, v_input.unit_price_sold, v_product.minimum_price;
    end if;

    if v_input.payload_mode is not null and v_input.payload_mode <> v_product.inventory_mode then
      raise exception 'Item %: mode no coincide con inventory_mode del producto.', v_input.line_no;
    end if;

    if v_product.inventory_mode = 'quantity' then
      if v_input.quantity_text is null then
        raise exception 'Item %: quantity es obligatorio para productos quantity.', v_input.line_no;
      end if;

      begin
        v_quantity_numeric := (v_input.quantity_text)::numeric;
      exception
        when others then
          raise exception 'Item %: quantity invalido.', v_input.line_no;
      end;

      if v_quantity_numeric <= 0 or v_quantity_numeric <> trunc(v_quantity_numeric) then
        raise exception 'Item %: quantity debe ser entero mayor que 0.', v_input.line_no;
      end if;

      v_quantity := v_quantity_numeric::integer;

      if v_input.serialized_unit_id is not null then
        raise exception 'Item %: serialized_unit_id no aplica para productos quantity.', v_input.line_no;
      end if;

      select coalesce(sum(t.quantity), 0)
      into v_pending_quantity
      from pg_temp.tmp_checkout_items t
      where t.product_id = v_input.product_id
        and t.inventory_mode = 'quantity';

      if v_product.simple_stock < (v_pending_quantity + v_quantity) then
        raise exception 'Item %: stock insuficiente para producto %. Disponible: %, solicitado acumulado: %.',
          v_input.line_no,
          v_input.product_id,
          v_product.simple_stock,
          (v_pending_quantity + v_quantity);
      end if;

      v_subtotal := round((v_quantity * v_input.unit_price_sold)::numeric, 2);

      insert into pg_temp.tmp_checkout_items (
        line_no,
        product_id,
        inventory_mode,
        serial_kind,
        serialized_unit_id,
        quantity,
        unit_cost_snapshot,
        unit_price_sold,
        subtotal
      )
      values (
        v_input.line_no,
        v_input.product_id,
        v_product.inventory_mode,
        v_product.serial_kind,
        null,
        v_quantity,
        v_product.reference_cost,
        v_input.unit_price_sold,
        v_subtotal
      );
    else
      if v_input.serialized_unit_id is null then
        raise exception 'Item %: serialized_unit_id es obligatorio para productos serial.', v_input.line_no;
      end if;

      if v_input.quantity_text is not null then
        begin
          v_quantity_numeric := (v_input.quantity_text)::numeric;
        exception
          when others then
            raise exception 'Item %: quantity invalido.', v_input.line_no;
        end;

        if v_quantity_numeric <> 1 then
          raise exception 'Item %: quantity debe ser 1 para productos serial.', v_input.line_no;
        end if;
      end if;

      select exists (
        select 1
        from pg_temp.tmp_checkout_items t
        where t.serialized_unit_id = v_input.serialized_unit_id
      )
      into v_has_duplicate_serial;

      if v_has_duplicate_serial then
        raise exception 'Item %: serialized_unit_id repetido en el payload.', v_input.line_no;
      end if;

      select *
      into v_serialized_unit
      from public.serialized_units su
      where su.id = v_input.serialized_unit_id;

      if not found then
        raise exception 'Item %: la unidad serializada % no existe.', v_input.line_no, v_input.serialized_unit_id;
      end if;

      if v_serialized_unit.product_id <> v_input.product_id then
        raise exception 'Item %: la unidad serializada no pertenece al producto indicado.', v_input.line_no;
      end if;

      if v_serialized_unit.status <> 'available' then
        raise exception 'Item %: la unidad serializada no esta disponible.', v_input.line_no;
      end if;

      v_quantity := 1;
      v_subtotal := round((v_quantity * v_input.unit_price_sold)::numeric, 2);

      insert into pg_temp.tmp_checkout_items (
        line_no,
        product_id,
        inventory_mode,
        serial_kind,
        serialized_unit_id,
        quantity,
        unit_cost_snapshot,
        unit_price_sold,
        subtotal
      )
      values (
        v_input.line_no,
        v_input.product_id,
        v_product.inventory_mode,
        v_product.serial_kind,
        v_input.serialized_unit_id,
        v_quantity,
        v_product.reference_cost,
        v_input.unit_price_sold,
        v_subtotal
      );
    end if;

    v_total_amount := v_total_amount + v_subtotal;
    v_item_count := v_item_count + 1;
  end loop;

  if v_item_count = 0 then
    raise exception 'No se pudieron procesar items para el checkout.';
  end if;

  if v_checkout_ref is not null then
    insert into public.sales (
      seller_profile_id,
      customer_id,
      total_amount,
      notes,
      checkout_ref
    )
    values (
      v_seller_profile_id,
      p_customer_id,
      round(v_total_amount, 2),
      p_notes,
      v_checkout_ref
    )
    on conflict (checkout_ref)
    where checkout_ref is not null
    do nothing
    returning id into v_sale_id;

    if v_sale_id is null then
      select s.id, s.total_amount
      into v_existing_sale_id, v_existing_total_amount
      from public.sales s
      where s.checkout_ref = v_checkout_ref
      limit 1;

      if not found then
        raise exception 'Conflicto de checkout_ref sin venta visible.';
      end if;

      select count(*)
      into v_existing_item_count
      from public.sale_items si
      where si.sale_id = v_existing_sale_id;

      return jsonb_build_object(
        'sale_id', v_existing_sale_id,
        'total_amount', v_existing_total_amount,
        'item_count', v_existing_item_count,
        'checkout_ref', v_checkout_ref,
        'idempotent_replay', true
      );
    end if;
  else
    insert into public.sales (
      seller_profile_id,
      customer_id,
      total_amount,
      notes,
      checkout_ref
    )
    values (
      v_seller_profile_id,
      p_customer_id,
      round(v_total_amount, 2),
      p_notes,
      null
    )
    returning id into v_sale_id;
  end if;

  for v_temp_item in
    select *
    from pg_temp.tmp_checkout_items
    order by line_no
  loop
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
      v_temp_item.product_id,
      v_temp_item.serialized_unit_id,
      v_temp_item.quantity,
      v_temp_item.unit_cost_snapshot,
      v_temp_item.unit_price_sold,
      v_temp_item.subtotal
    )
    returning id into v_sale_item_id;

    if v_temp_item.inventory_mode = 'quantity' then
      update public.products
      set simple_stock = simple_stock - v_temp_item.quantity
      where id = v_temp_item.product_id;

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
        v_temp_item.product_id,
        null,
        'sale_delivery',
        -v_temp_item.quantity,
        'Venta checkout atomico',
        v_seller_profile_id,
        v_sale_item_id
      );
    else
      update public.serialized_units
      set status = 'sold'
      where id = v_temp_item.serialized_unit_id;

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
        v_temp_item.product_id,
        v_temp_item.serialized_unit_id,
        'sale_delivery',
        -1,
        'Venta checkout atomico',
        v_seller_profile_id,
        v_sale_item_id
      );

      if v_temp_item.serial_kind = 'imei' then
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
          v_temp_item.serialized_unit_id,
          p_customer_id,
          current_date,
          (current_date + interval '3 months')::date,
          'Defecto de software por 3 meses',
          'active'
        );
      end if;
    end if;
  end loop;

  perform public.recalculate_sale_total(v_sale_id);

  select s.total_amount
  into v_total_amount
  from public.sales s
  where s.id = v_sale_id;

  return jsonb_build_object(
    'sale_id', v_sale_id,
    'total_amount', v_total_amount,
    'item_count', v_item_count,
    'checkout_ref', v_checkout_ref,
    'idempotent_replay', false
  );
end;
$$;

grant execute on function public.create_checkout_sale(jsonb, uuid, text, text) to authenticated;
revoke all on function public.create_checkout_sale(jsonb, uuid, text, text) from anon;
