"use client"

import { CalendarDays, RotateCcw, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { ProductoPT } from "./producto-terminado-types"
import type { useKardexPTFiltros } from "./use-kardex-pt-filtros"

type FiltrosPT = ReturnType<typeof useKardexPTFiltros>

type Props = {
  productos: ProductoPT[]
  filtros: FiltrosPT
}

export function ProductoTerminadoFiltros({ productos, filtros }: Props) {
  const {
    filtroProducto,
    setFiltroProducto,
    filtroTipo,
    setFiltroTipo,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    hayFiltros,
    movimientosFiltrados,
    aplicarHoy,
    limpiar,
  } = filtros

  const etiquetaProducto = (val: string) => {
    if (!val) return "Todos los productos"
    const p = productos.find((x) => x.id === val)
    return p ? `${p.codigo} — ${p.descripcion}` : ""
  }

  return (
    <div className="no-print rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="mb-1 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
            Filtros
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
              <span className="font-bold text-foreground">
                {movimientosFiltrados.length}
              </span>{" "}
              {movimientosFiltrados.length === 1 ? "registro" : "registros"}
            </span>
            {hayFiltros && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiar}
                className="h-6 gap-1 text-[12px] text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-0.5">
            <Label className="text-[12px] font-semibold text-muted-foreground">
              Producto
            </Label>
            <Combobox
              value={filtroProducto === "todos" ? "" : filtroProducto}
              items={productos.map((p) => p.id)}
              onValueChange={(v) => setFiltroProducto(v ?? "todos")}
              itemToStringLabel={etiquetaProducto}>
              <ComboboxInput
                placeholder="Todos los productos..."
                className="h-8 text-[11px]"
              />
              <ComboboxContent>
                <ComboboxList>
                  {productos.map((p) => (
                    <ComboboxItem key={p.id} value={p.id}>
                      {p.codigo} — {p.descripcion}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>No se encontró el producto.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="space-y-0.5">
            <Label className="text-[12px] font-semibold text-muted-foreground">
              Tipo
            </Label>
            <Select
              value={filtroTipo}
              onValueChange={(v) => setFiltroTipo(v ?? "todos")}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="ENTRADA">Entradas</SelectItem>
                <SelectItem value="SALIDA">Salidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-0.5">
            <Label className="text-[12px] font-semibold text-muted-foreground">
              Fecha Desde
            </Label>
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="h-8 text-[11px]"
            />
          </div>

          <div className="space-y-0.5">
            <Label className="text-[12px] font-semibold text-muted-foreground">
              Fecha Hasta
            </Label>
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="h-8 text-[11px]"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={aplicarHoy}
              className="h-8 gap-1.5 border-emerald-300 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
              <CalendarDays className="h-3.5 w-3.5" />
              Hoy
            </Button>
            <Button
              variant="outline"
              onClick={limpiar}
              className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
