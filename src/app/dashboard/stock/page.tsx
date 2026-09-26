import Link from "next/link";
import { Warehouse, Boxes, ArrowRight } from "lucide-react";

export default function StockLandingPage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl border p-5 text-white shadow-lg shadow-emerald-500/20">
            <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative">
              <h1 className="text-lg font-bold tracking-tight">MÓDULO STOCK</h1>
              <p className="mt-1 text-xs text-zinc-200">
                Reportes de existencias valorizadas · selecciona el reporte a consultar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/stock/base-activa"
              className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                <Warehouse className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-semibold">Stock Base Activa</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Existencias de materia prima (kg) valorizadas por capas PEPS vigentes.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 group-hover:underline">
                Ir al reporte <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/dashboard/stock/producto-terminado"
              className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                <Boxes className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-semibold">Stock Producto Terminado</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Existencias de producto terminado (und) por presentación, valorizadas por
                capas PEPS vigentes.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 group-hover:underline">
                Ir al reporte <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}