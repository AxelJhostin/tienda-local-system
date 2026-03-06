'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { InventoryFiltersProps } from '@/features/inventory/types/inventory.types'

export function InventoryFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
}: InventoryFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar por nombre o codigo</Label>
          <Input
            id="search"
            placeholder="Ej: iPhone o 100023"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select
            value={categoryId || 'all'}
            onValueChange={(value) => onCategoryChange(value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ''}
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

