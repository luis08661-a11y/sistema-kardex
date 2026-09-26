"use client"

import { FileSpreadsheet, FlaskConicalIcon, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  total: number
  cargando: boolean
  totalLotes: number
  stockActualKg: number
  onExportarExcel: () => void
  onNuevo: () => void
}

export function KardexHeader({
  total,
  cargando,
  totalLotes,
  stockActualKg,
  onExportarExcel,
  onNuevo,
}: Props) {
  return (
    <>
      <div className="relative overflow-hidden rounded-xl border p-3 text-white shadow-lg shadow-emerald-500/20">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <FlaskConicalIcon className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Kardex Base Activa</h1>
            </div>
            <p className="text-sm text-zinc-200 mt-1">
              Lotes, movimientos e inventario histórico de materia prima.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {total > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportarExcel}
                disabled={total === 0 || cargando}
                className="h-8 gap-1.5 border-emerald-300 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Exportar Excel
              </Button>


            )}
            <Button
              onClick={onNuevo}
              className="h-8 gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
              <Plus className="h-4 w-4" />
              Nuevo Movimiento Base Activa
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores */}
    {/*   <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950/30" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <Layers className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400 text-[10px] font-semibold">
                Reales
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tabular-nums text-foreground">
                {totalLotes.toLocaleString("es-PE")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Lotes Base Activa</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-emerald-950/30" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <PackageCheck className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-semibold">
                Movimientos
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {total.toLocaleString("es-PE")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Movimientos registrados</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-sky-950/30" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                <Warehouse className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400 text-[10px] font-semibold">
                Stock
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
                {stockActualKg.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Stock Base Activa (Kg)</p>
            </div>
          </div>
        </div>
      </div> */}
    </>
  )
}
