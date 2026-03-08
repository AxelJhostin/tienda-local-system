'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertTriangle,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  History,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  UserRoundCog,
  Users,
  WalletCards,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

type SidebarRole = 'admin' | 'seller'
type SidebarItem = {
  href: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
  comingSoon?: boolean
}

type SidebarSection = {
  title: string
  items: SidebarItem[]
}

const navigationSections: SidebarSection[] = [
  {
    title: 'Principal',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Operacion',
    items: [
      { href: '/inventory', label: 'Inventario', icon: Boxes },
      { href: '/sales', label: 'Ventas', icon: CircleDollarSign },
      { href: '/stock-low', label: 'Stock Bajo', icon: AlertTriangle },
      { href: '/history', label: 'Historial', icon: History },
      { href: '/notifications', label: 'Notificaciones', icon: Bell },
    ],
  },
  {
    title: 'Gestion comercial',
    items: [
      { href: '/reports', label: 'Reportes', icon: ChartNoAxesCombined, adminOnly: true },
      { href: '/customers', label: 'Clientes', icon: Users },
      { href: '/layaway', label: 'Apartados', icon: WalletCards },
      { href: '/warranties', label: 'Garantias', icon: ShieldCheck },
      { href: '/users', label: 'Personal', icon: UserRoundCog, adminOnly: true },
    ],
  },
]

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarLinks({
  pathname,
  items,
  onNavigate,
}: {
  pathname: string
  items: SidebarItem[]
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              active
                ? 'bg-primary text-primary-foreground shadow-[0_6px_20px_-12px_rgba(37,99,235,.95)]'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
            )}
          >
            <Icon className={cn('h-4 w-4', active ? 'opacity-100' : 'opacity-75')} />
            <span className="flex-1">{item.label}</span>
            {item.comingSoon ? (
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full border px-2 py-0 text-[10px] font-semibold uppercase tracking-wide',
                  active
                    ? 'border-primary-foreground/45 text-primary-foreground/85'
                    : 'border-border text-muted-foreground'
                )}
              >
                Prox
              </Badge>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({
  role,
  pathname,
  onNavigate,
}: {
  role: SidebarRole
  pathname: string
  onNavigate?: () => void
}) {
  const sections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || role === 'admin'),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50 to-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary/75">Store OS</p>
        <p className="mt-1 text-lg font-extrabold tracking-tight">InvenTrack POS</p>
        <p className="mt-1 text-xs text-muted-foreground">Operacion comercial e inventario</p>
      </div>

      <div className="mt-6 flex-1 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {section.title}
            </p>
            <SidebarLinks pathname={pathname} items={section.items} onNavigate={onNavigate} />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border/70 bg-card/70 px-3 py-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Rol activo</p>
        <p className="mt-1">{role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
      </div>
    </div>
  )
}

export function AppSidebar({ role }: { role: SidebarRole }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block">
      <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-3xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_42px_-28px_rgba(17,24,39,.45)] backdrop-blur">
        <SidebarContent role={role} pathname={pathname} />
      </div>
    </aside>
  )
}

export function MobileSidebarMenu({ role }: { role: SidebarRole }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] rounded-r-2xl p-4 sm:max-w-xs">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SidebarContent role={role} pathname={pathname} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
