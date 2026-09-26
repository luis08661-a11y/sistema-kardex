"use client"

import { CalendarDays, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"

type Props = {
  total: number
  hayFiltros: boolean
  filtroProducto: string
  filtroOperacion: string
  fechaDesde: string
  fechaHasta: string
  busqueda: string
  productosDisponibles: { label: string; value: string }[]
  operacionesDisponibles: { label: string; value: string }[]
  productoAStringLabel: (value: string) => string
  onLimpiar: () => void
  onAplicarHoy: () => void
  onProducto: (v: string) => void
  onOperacion: (v: string) => void
  onBusqueda: (v: string) => void
  onFechaDesde: (v: string) => void
  onFechaHasta: (v: string) => void
}

export function KardexFiltros({
  total,
  hayFiltros,
  filtroProducto,
  filtroOperacion,
  fechaDesde,
  fechaHasta,
  busqueda,
  productosDisponibles,
  operacionesDisponibles,
  productoAStringLabel,
  onLimpiar,
  onAplicarHoy,
  onProducto,
  onOperacion,
  onBusqueda,
  onFechaDesde,
  onFechaHasta,
}: Props) {
  if (!(total > 0 || hayFiltros)) return null

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Búsqueda y Filtros
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
              <span className="font-bold text-foreground">{total}</span>{" "}
              {total === 1 ? "registro" : "registros"}
            </span>
            {hayFiltros && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLimpiar}
                className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
        {/* <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => onBusqueda(e.target.value)}
              placeholder="Buscar por lote, producto, observación o responsable..."
              className="h-8 pl-8 text-[11px]"
            />
          </div>
        </div> */}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Producto Maestro
            </Label>
            <Combobox
              value={filtroProducto}
              onValueChange={(v) => onProducto(v ?? "")}
              itemToStringLabel={productoAStringLabel}>
              <ComboboxInput
                placeholder="Todos los Productos Maestros..."
                className="h-8 text-[11px]"
              />
              <ComboboxContent>
                <ComboboxList>
                  {productosDisponibles.map((p) => (
                    <ComboboxItem key={p.value} value={p.value}>
                      {p.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>No se encontró el producto.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Tipo de Operación
            </Label>
            <Select
              value={filtroOperacion}
              onValueChange={(v) => onOperacion(v ?? "")}>
              <SelectTrigger className="h-8 w-full text-[11px]">
                <SelectValue placeholder="Todas las operaciones..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {operacionesDisponibles.map((op) => (
                    <SelectItem key={op.value} value={op.value} className="text-[11px]">
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Fecha Desde
            </Label>
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesde(e.target.value)}
              className="h-8 text-[11px]"
            />
          </div>

          <div className="space-y-0.5">
            <Label className="text-[10px] font-semibold text-muted-foreground">
              Fecha Hasta
            </Label>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHasta(e.target.value)}
              className="h-8 text-[11px]"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onAplicarHoy}
              className="h-8 gap-1.5 border-emerald-300 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
              <CalendarDays className="h-3.5 w-3.5" />
              Hoy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
