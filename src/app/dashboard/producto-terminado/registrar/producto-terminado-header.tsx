"use client"

import { ClipboardList, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ProductoTerminadoData } from "./producto-terminado-types"

type ResumenPT = ProductoTerminadoData["resumen"]

type Props = {
  resumen: ResumenPT
  onNuevo: () => void
}

export function ProductoTerminadoHeader({ resumen, onNuevo }: Props) {
  return (
    <>
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight md:text-lg">
                KARDEX DE PRODUCTO TERMINADO
              </h1>
              <p className="text-xs text-zinc-200">
                PRODUCTO TERMINADO
                <span className="mx-1.5 text-white/40">·</span>
                Registro de producción, ventas y ensayos - Método PEPS
              </p>
            </div>
          </div>
          <Button
            onClick={onNuevo}
            className="w-fit gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
            <Plus className="h-4 w-4" />
            Registrar Movimiento
          </Button>
        </div>
      </div>

      {/* INDICADORES */}
      {/* <div className="no-print grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:hover:border-emerald-800">
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 text-[12px] font-semibold">
                Entradas
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {resumen.totalEntradas.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Total entradas (UND)</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-red-200 hover:shadow-md dark:hover:border-red-800">
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
                <TrendingDown className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300 text-[12px] font-semibold">
                Salidas
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                {resumen.totalSalidas.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Total salidas (UND)</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md dark:hover:border-sky-800">
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                <PackageSearch className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400 text-[12px] font-semibold">
                Stock Actual
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
                {resumen.stockActual.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Stock saldo actual (UND)</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md dark:hover:border-violet-800">
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                <Coins className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300 text-[12px] font-semibold">
                Costo Total
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
                S/ {resumen.costoValorizadoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Costo valorizado total</p>
            </div>
          </div>
        </div>
      </div> */}
    </>
  )
}
