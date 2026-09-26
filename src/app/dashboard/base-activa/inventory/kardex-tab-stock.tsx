"use client"

import type { StockBaseRow } from "./kardex-types"

export function KardexTabStock({
  stock,
  loteCodigoPorId,
}: {
  stock: StockBaseRow[]
  loteCodigoPorId: Map<string, string>
}) {
  const stockOrdenado = [...stock].sort((a, b) => b.stockKg - a.stockKg)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">Stock derivado de movimientos</h2>
        <p className="text-xs text-muted-foreground">
          El stock no se captura manualmente: Entradas Kg − Salidas Kg por lote, en orden cronológico.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Producto</th>
              <th className="p-3">Lote</th>
              <th className="p-3 text-right">Entradas</th>
              <th className="p-3 text-right">Salidas</th>
              <th className="p-3 text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {stockOrdenado.length ? (
              stockOrdenado.map((x) => (
                <tr key={`${x.productoId}-${x.loteId}`} className="border-b">
                  <td className="p-3">
                    {x.producto?.codigo ?? "—"} — {x.producto?.descripcion ?? ""}
                  </td>
                  <td className="p-3 font-mono font-semibold">
                    {loteCodigoPorId.get(x.loteId) ?? x.loteId}
                  </td>
                  <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {(Number(x._sum.entradaPesoTotalKg ?? 0)).toFixed(2)} Kg
                  </td>
                  <td className="p-3 text-right text-red-500 tabular-nums">
                    {(Number(x._sum.salidaPesoTotalKg ?? 0)).toFixed(2)} Kg
                  </td>
                  <td className="p-3 text-right font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                    {x.stockKg.toFixed(2)} Kg
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                  No hay stock disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
