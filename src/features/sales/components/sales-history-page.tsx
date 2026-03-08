'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSalesHistory } from '@/features/sales/hooks/use-sales'
import { SalesHistoryTable } from '@/features/sales/components/sales-history-table'

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMoney(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

export function SalesHistoryPageContent() {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState(() => {
    const value = new Date()
    value.setDate(value.getDate() - 30)
    return toDateInputValue(value)
  })
  const [dateTo, setDateTo] = useState(() => toDateInputValue(new Date()))

  const historyQuery = useSalesHistory({
    dateFrom,
    dateTo,
    limit: 300,
  })

  const filteredSales = useMemo(() => {
    const rows = historyQuery.data ?? []
    const term = search.trim().toLowerCase()
    if (!term) return rows

    return rows.filter((sale) => {
      const target = [
        sale.id,
        sale.checkout_ref ?? '',
        sale.seller_name ?? '',
        sale.customer_name ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return target.includes(term)
    })
  }, [historyQuery.data, search])

  const totalAmount = useMemo(
    () => filteredSales.reduce((acc, sale) => acc + sale.total_amount, 0),
    [filteredSales]
  )

  return (
    <div className="grid gap-4">
      <Card className="border-border/80 bg-white/90">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="historySearch">Buscar</Label>
            <Input
              id="historySearch"
              placeholder="Venta, checkout_ref, vendedor o cliente"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="historyDateFrom">Desde</Label>
            <Input
              id="historyDateFrom"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="historyDateTo">Hasta</Label>
            <Input
              id="historyDateTo"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ventas encontradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{filteredSales.length}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total acumulado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold tracking-tight">{formatMoney(totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      <SalesHistoryTable sales={filteredSales} isLoading={historyQuery.isLoading} />
    </div>
  )
}
