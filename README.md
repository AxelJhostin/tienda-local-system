# InvenTrack Frontend (Supabase-first)

Aplicacion interna para gestion operativa de tienda (inventario, ventas, reportes y staff), construida sobre Next.js y Supabase con enfoque **Supabase-first**.

## Estado Actual

El proyecto ya cuenta con una base operativa funcional:

- autenticacion con Supabase Auth
- shell privado con sidebar + header
- inventario (productos quantity y serial)
- checkout de ventas atomico multi-item via RPC SQL
- modulo de Stock Bajo (read-first)
- modulo de Historial de ventas (read-first)
- dashboard operativo inicial
- reportes comerciales por rango de fechas (version inicial)
- modulo Personal/Usuarios (listado + activar/desactivar)
- notificaciones visibles (version inicial de UI/data)
- SQL backend versionado dentro del repo en `supabase/`

## Stack Tecnico

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- TanStack Query
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)

## Principios de Arquitectura

- **No backend Node custom**: la fuente de negocio es Supabase.
- **Supabase-first**: datos, seguridad y reglas en Postgres/Supabase.
- **Feature-based frontend**: UI y hooks organizados por dominio en `src/features`.
- **Capa de integracion centralizada**: acceso a datos en `src/lib/services`.
- **Logica critica en SQL/RPC**: validaciones y operaciones transaccionales importantes viven en DB.

## Estructura Principal

```text
src/
  app/
    (auth)/
    (private)/
  components/
    shared/
    ui/
  features/
    auth/
    dashboard/
    inventory/
    notifications/
    reports/
    sales/
    users/
  lib/
    auth/
    constants/
    services/
    supabase/
  types/
    database.ts

supabase/
  schema/
  business_rules/
  security/
  seeds/
  migrations/
```

## Modulos Implementados

- **Dashboard**: resumen diario operativo (ventas del dia, total vendido, items vendidos, stock bajo, ventas recientes).
- **Inventario**: listado de productos, filtros, ajuste quantity, gestion de seriales.
- **Ventas**: checkout multi-item atomico con `create_checkout_sale`.
- **Stock Bajo**: alertas read-first por umbral.
- **Historial**: consulta de ventas por rango y busqueda.
- **Reportes**: resumen comercial por rango (totales, items, mix por inventory_mode, resumen por vendedor).
- **Personal/Usuarios**: listado staff, filtros, activar/desactivar (admin).
- **Notificaciones**: centro inicial visible (stock bajo, aviso operativo, evolucion de modulos).

## Modulos En Progreso / Pendientes

- onboarding seguro de nuevos usuarios (creacion en Auth + perfil)
- notificaciones persistentes con estado de lectura
- reportes avanzados (exportacion, graficos, comparativas)
- flujos comerciales avanzados (segun roadmap)

## SQL Versionado (`supabase/`)

La carpeta `supabase/` contiene el backend SQL real organizado por responsabilidad:

- `schema/`: tablas, constraints, indices, triggers base
- `business_rules/`: funciones de negocio y RPCs
- `security/`: RLS, policies, grants/revokes
- `seeds/`: datos iniciales
- `migrations/`: cambios forward-only

## Ejecucion Local

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno en `.env.local`.

3. Ejecutar en desarrollo:

```bash
npm run dev
```

4. Verificar calidad:

```bash
npm run lint
npm run build
```

## Variables de Entorno

Requeridas:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Estas variables son validadas en `src/lib/supabase/env.ts`.

## Convenciones de Trabajo

- Evitar logica de negocio sensible en componentes React.
- Priorizar servicios tipados en `src/lib/services`.
- Si una regla es critica (atomicidad, precios, stock, seguridad), implementarla en SQL/RPC.
- Mantener cambios incrementales y compatibles con arquitectura actual.
