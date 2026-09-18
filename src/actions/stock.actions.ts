"use server";

import {
  obtenerStockReporteService,
  type StockReporteFiltros,
  type StockReporteRow,
  type TipoStockReporte,
} from "@/lib/services/stock.service";

export type { StockReporteFiltros, StockReporteRow, TipoStockReporte };

export async function consultarStockReporte(
  tipo: TipoStockReporte,
  filtros: StockReporteFiltros = {},
): Promise<StockReporteRow[]> {
  return obtenerStockReporteService(tipo, filtros);
}