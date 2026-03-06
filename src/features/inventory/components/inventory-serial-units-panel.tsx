'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { InventorySerialUnitsPanelProps } from '@/features/inventory/types/inventory.types'

export function InventorySerialUnitsPanel({
  serialValue,
  onSerialValueChange,
  onAddSerializedUnit,
  isAdding,
  deactivateReason,
  onDeactivateReasonChange,
  serializedUnits,
  isLoading,
  onDeactivateSerializedUnit,
  isDeactivating,
}: InventorySerialUnitsPanelProps) {
  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">IMEI / seriales</p>
      <div className="space-y-2">
        <Label htmlFor="serialValue">Nuevo IMEI/serial</Label>
        <Input
          id="serialValue"
          placeholder="Ej: 356789123456789"
          value={serialValue}
          onChange={(event) => onSerialValueChange(event.target.value)}
        />
      </div>
      <Button className="w-full" onClick={onAddSerializedUnit} disabled={isAdding}>
        {isAdding ? 'Agregando...' : 'Agregar unidad'}
      </Button>

      <div className="space-y-2">
        <Label htmlFor="deactivateReason">Motivo desactivacion</Label>
        <Input
          id="deactivateReason"
          placeholder="Ej: dano fisico o error de carga"
          value={deactivateReason}
          onChange={(event) => onDeactivateReasonChange(event.target.value)}
        />
      </div>

      <div className="max-h-72 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {serializedUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-mono text-xs">{unit.serial_value}</TableCell>
                <TableCell>
                  <Badge variant={unit.status === 'available' ? 'default' : 'secondary'}>
                    {unit.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {unit.status === 'available' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeactivateSerializedUnit(unit.id)}
                      disabled={isDeactivating}
                    >
                      Desactivar
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Cargando seriales...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && serializedUnits.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No hay seriales registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

