"use client"

import { Boxes, Check, Warehouse } from "lucide-react"

type Props = {
  titulo: string
  subtitulo: string
  esBA: boolean
  haySimulacion: boolean
}

export function StockHeader({ titulo, subtitulo, esBA, haySimulacion }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
      <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            {esBA ? <Warehouse className="h-5 w-5" /> : <Boxes className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight md:text-lg">{titulo}</h1>
            <p className="text-xs text-zinc-200">
              {subtitulo}
              <span className="mx-1.5 text-white/40">&middot;</span>
              Reporte de existencias valorizado (capas PEPS vigentes).
            </p>
          </div>
        </div>
        {haySimulacion && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            <Check className="h-3 w-3" />
            Vista previa de integraci&oacute;n a Productos
          </span>
        )}
      </div>
    </div>
  )
}
