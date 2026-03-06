'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type SidebarRole = 'admin' | 'seller'

const baseItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/sales', label: 'Sales' },
  { href: '/layaway', label: 'Layaway' },
  { href: '/customers', label: 'Customers' },
  { href: '/warranties', label: 'Warranties' },
  { href: '/reports', label: 'Reports', adminOnly: true },
  { href: '/users', label: 'Users', adminOnly: true },
]

export function AppSidebar({ role }: { role: SidebarRole }) {
  const pathname = usePathname()
  const items = baseItems.filter((item) => !item.adminOnly || role === 'admin')

  return (
    <aside className="hidden border-r bg-background md:block">
      <div className="px-4 py-5">
        <p className="text-lg font-semibold">Tienda POS</p>
        <p className="text-xs text-muted-foreground">Navigation</p>
      </div>
      <nav className="space-y-1 px-2">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors',
                active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

