"use client";

import { ReceiptText } from "lucide-react";

import type { ReporteVentasData } from "@/actions/reporte-ventas.actions";
import { fmt, fmtEntero } from "@/lib/reportes/formatters";

type Props = {
  data: ReporteVentasData | null;
  cargando: boolean;
};

export function ReporteVentasHeader({ data, cargando }: Props) {
  const hayDatos = Boolean(data && !cargando && data.items.length > 0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 text-white shadow-lg shadow-emerald-500/10">
      <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30">
            <ReceiptText className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">REPORTE DE VENTAS</h1>
            <p className="text-[10px] text-slate-400">
              PUNTO DE VENTA &amp; FACTURACIÓN
              <span className="mx-1 text-slate-600">·</span>
              Ventas emitidas, valorizadas y por comprobante.
            </p>
          </div>
        </div>
        {hayDatos && (
          <div className="flex items-center gap-5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-2 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wide text-slate-400">Ventas</div>
              <div className="text-sm font-bold tabular-nums text-white">
                {fmtEntero(data!.resumen.cantidad)}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wide text-slate-400">Total</div>
              <div className="text-sm font-bold tabular-nums text-emerald-400">
                S/ {fmt(data!.resumen.total)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
