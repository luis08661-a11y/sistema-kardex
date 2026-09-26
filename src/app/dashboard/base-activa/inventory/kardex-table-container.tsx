"use client"

import { useMemo, useState } from "react"
import { Boxes, Layers, Loader2, Scale } from "lucide-react"

import KardexTable from "./kardex-table"
import { InventoryForm } from "./inventoryForms"
import { PaginacionTabla } from "@/components/shared/paginacion-tabla"
import { KardexHeader } from "./kardex-header"
import { KardexFiltros } from "./kardex-filtros"
import { KardexTabLotes } from "./kardex-tab-lotes"
import { KardexTabStock } from "./kardex-tab-stock"
import { DialogoEliminarKardex } from "./dialogo-eliminar-kardex"
import { useKardexDatos } from "./use-kardex-datos"
import { useKardexEdicion } from "./use-kardex-edicion"
import { useLotesAplanados } from "./use-lotes-aplanados"
import { PAGE_SIZES, type KardexTableContainerProps } from "./kardex-types"

export type { ProductoConLotes } from "./kardex-types"

export default function KardexTableContainer({
  resumen: resumenInicial,
  productos,
  contexto,
  stock,
}: KardexTableContainerProps) {
  const [tab, setTab] = useState<"movimientos" | "lotes" | "stock">("movimientos")

  const datos = useKardexDatos({ resumenInicial, productos })
  const edicion = useKardexEdicion({
    productos,
    contexto,
    filtros: {
      filtroProducto: datos.filtroProducto,
      filtroOperacion: datos.filtroOperacion,
      fechaDesde: datos.fechaDesde,
      fechaHasta: datos.fechaHasta,
      busqueda: datos.busqueda,
    },
    sort: datos.sort,
    recargar: datos.recargar,
  })

  const lotes = useLotesAplanados(productos)

  const loteCodigoPorId = useMemo(() => {
    const map = new Map<string, string>()
    productos.forEach((p) =>
      p.lotesBase.forEach((l) => map.set(l.id, l.codigo))
    )
    return map
  }, [productos])

  const totalLotes = productos.reduce((a, p) => a + p.lotesBase.length, 0)
  const stockActualKg = stock.reduce((a, x) => a + Math.max(0, x.stockKg), 0)

  const tabs = [
    { key: "movimientos" as const, label: "Movimientos", icon: <Scale className="h-3.5 w-3.5" /> },
    { key: "lotes" as const, label: "Lotes", icon: <Layers className="h-3.5 w-3.5" /> },
    { key: "stock" as const, label: "Stock por lote", icon: <Boxes className="h-3.5 w-3.5" /> },
  ]

  return (
    <>
      <KardexHeader
        total={datos.resumen.total}
        cargando={datos.cargando}
        totalLotes={totalLotes}
        stockActualKg={stockActualKg}
        onExportarExcel={() => void edicion.exportarExcel()}
        onNuevo={edicion.handleNuevo}
      />

      {/* Pestañas */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${
              tab === t.key
                ? "border-b-2 border-primary font-semibold text-primary"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "movimientos" && (
        <>
          <KardexFiltros
            total={datos.resumen.total}
            hayFiltros={datos.hayFiltros}
            filtroProducto={datos.filtroProducto}
            filtroOperacion={datos.filtroOperacion}
            fechaDesde={datos.fechaDesde}
            fechaHasta={datos.fechaHasta}
            busqueda={datos.busqueda}
            productosDisponibles={datos.productosDisponibles}
            operacionesDisponibles={datos.operacionesDisponibles}
            productoAStringLabel={datos.productoAStringLabel}
            onLimpiar={datos.limpiarFiltros}
            onAplicarHoy={datos.aplicarHoy}
            onProducto={datos.aplicarProducto}
            onOperacion={datos.aplicarOperacion}
            onBusqueda={datos.aplicarBusqueda}
            onFechaDesde={datos.aplicarFechaDesde}
            onFechaHasta={datos.aplicarFechaHasta}
          />

          <div className="relative">
            {datos.cargando && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-center rounded-t-lg bg-muted/50 text-[11px] font-medium text-muted-foreground">
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Cargando...
              </div>
            )}
            <KardexTable
              rows={datos.resumen.rows}
              sort={datos.sort}
              onSort={datos.handleSort}
              totals={datos.resumen.total > 0 ? datos.resumen.totals : undefined}
              onEditar={edicion.handleEditar}
              onEliminar={edicion.setEliminando}
            />
          </div>

          {/* Paginación */}
          {datos.resumen.total > 0 && (
            <PaginacionTabla
              pageIndex={datos.currentPage - 1}
              totalPaginas={datos.maxPage}
              pageSize={datos.pageSize}
              total={datos.resumen.total}
              onPageSizeChange={datos.cambiarPageSize}
              onPrevious={datos.paginaAnterior}
              onNext={datos.paginaSiguiente}
              pageSizes={PAGE_SIZES}
            />
          )}
        </>
      )}

      {tab === "lotes" && <KardexTabLotes lotes={lotes} />}

      {tab === "stock" && (
        <KardexTabStock stock={stock} loteCodigoPorId={loteCodigoPorId} />
      )}

      <InventoryForm
        key={`${edicion.editando?.id ?? "new"}:${edicion.formOpen ? "open" : "closed"}`}
        open={edicion.formOpen}
        onOpenChange={edicion.handleFormClose}
        movimientoId={edicion.editando?.id}
        productos={productos}
        contexto={contexto}
        initialData={edicion.initialData}
        onGuardado={edicion.handleGuardado}
      />

      <DialogoEliminarKardex
        eliminando={edicion.eliminando}
        isDeleting={edicion.isDeleting}
        onCancelar={() => edicion.setEliminando(null)}
        onConfirmar={edicion.confirmarEliminar}
      />
    </>
  )
}
