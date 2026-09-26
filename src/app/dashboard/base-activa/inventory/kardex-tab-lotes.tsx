"use client"

type LoteFila = {
  id: string
  codigo: string
  fechaIngreso: Date | null
  almacenamiento: string | null
  movimientos: number
  productoCodigo: string
  productoDescripcion: string
}

export function KardexTabLotes({ lotes }: { lotes: LoteFila[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">Lotes Base Activa</h2>
        <p className="text-xs text-muted-foreground">
          Lotes registrados por producto maestro.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Lote</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Almacenamiento</th>
              <th className="p-3 text-right">Movimientos</th>
            </tr>
          </thead>
          <tbody>
            {lotes.length ? (
              lotes.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="p-3 font-mono text-[12px] font-semibold">{l.codigo}</td>
                  <td className="p-3">
                    {l.productoCodigo} &mdash; {l.productoDescripcion}
                  </td>
                  <td className="p-3">{l.almacenamiento || "-"}</td>
                  <td className="p-3 text-right tabular-nums">{l.movimientos}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">
                  No hay lotes Base Activa registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
