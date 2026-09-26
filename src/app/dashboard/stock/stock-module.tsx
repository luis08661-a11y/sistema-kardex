"use client";

import { Loader2, PackageSearch } from "lucide-react";

import type {
  StockReporteRow,
  TipoStockReporte,
} from "@/actions/stock.actions";
import { StockHeader } from "./stock-header";
import { StockFiltros } from "./stock-filtros";
import { StockTabla } from "./stock-tabla";
import { useStockReporte, etiquetasStock } from "./use-stock-reporte";

/**
 * Módulo Stock (reporte de existencias).
 *
 * Los toggles "Integra un dato" (costo unitario / costo total) son SOLO una vista
 * previa: cambian la presentación de columnas para simular cómo se verán esos campos
 * cuando se integren en el módulo Productos. No persisten ni modifican datos.
 *
 * Integración real pendiente (ver obtenerStockReporteService en stock.service.ts):
 * - Mover costo unitario / costo total (y stock) a la ficha del producto en
 *   productos-module, con permisos por rol.
 * - Sincronizar con el registro de movimientos de BA/PT y descuento de stock del POS.
 * - Decidir si el costo se congela (captura manual) o sigue siendo el promedio
 *   ponderado de las capas PEPS (vista viva).
 * - Migración Prisma + seed y pruebas con datos reales.
 */

export function StockModule({
  tipo,
  inicial,
}: {
  tipo: TipoStockReporte;
  inicial: StockReporteRow[];
}) {
  const reporte = useStockReporte({ tipo, inicial });
  const et = etiquetasStock(tipo);

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
        <div className="space-y-6">
          {/* HEADER */}
          <StockHeader
            titulo={et.titulo}
            subtitulo={et.subtitulo}
            esBA={et.esBA}
            haySimulacion={reporte.haySimulacion}
          />

          {/* FILTROS */}
          <StockFiltros
            filas={reporte.rows.length}
            totalStock={reporte.totalStock}
            hayFiltros={reporte.hayFiltros}
            haySimulacion={reporte.haySimulacion}
            integrarCostoUnitario={reporte.integrarCostoUnitario}
            integrarCostoTotal={reporte.integrarCostoTotal}
            codigo={reporte.codigo}
            producto={reporte.producto}
            stockMin={reporte.stockMin}
            stockMax={reporte.stockMax}
            cargando={reporte.cargando}
            error={reporte.error}
            onCodigo={reporte.setCodigo}
            onProducto={reporte.setProducto}
            onStockMin={reporte.setStockMin}
            onStockMax={reporte.setStockMax}
            onIntegrarCostoUnitario={reporte.setIntegrarCostoUnitario}
            onIntegrarCostoTotal={reporte.setIntegrarCostoTotal}
            onConsultar={() => void reporte.consultar()}
            onLimpiar={reporte.limpiar}
          />

          {reporte.cargando && (
            <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando...
            </div>
          )}

          {!reporte.cargando && reporte.rows.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-12 text-center shadow-sm">
              <PackageSearch className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Sin existencias para los filtros seleccionados.
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                El reporte se construye con las capas PEPS vigentes (saldo restante
                &gt; 0) de {et.zona}.
              </p>
            </div>
          )}

          {!reporte.cargando && reporte.rows.length > 0 && (
            <StockTabla
              rows={reporte.rows}
              esBA={et.esBA}
              unidad={et.unidad}
              stock={et.stock}
              costoUnitario={et.costoUnitario}
              costoTotal={et.costoTotal}
              integrarCostoUnitario={reporte.integrarCostoUnitario}
              integrarCostoTotal={reporte.integrarCostoTotal}
              totalStock={reporte.totalStock}
              totalCosto={reporte.totalCosto}
              costoUnitarioPromedio={reporte.costoUnitarioPromedio}
            />
          )}
        </div>
      </div>
    </div>
  );
}
