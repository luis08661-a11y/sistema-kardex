"use server";

import {
  consultarReporteVentasService,
  obtenerContextoReporteVentasService,
  type ReporteVentasContexto,
  type ReporteVentasData,
  type ReporteVentasFiltros,
  type ReporteVentasFila,
} from "@/lib/services/reporte-ventas.service";

export type { ReporteVentasContexto, ReporteVentasData, ReporteVentasFiltros, ReporteVentasFila };

export async function obtenerContextoReporteVentas(): Promise<ReporteVentasContexto> {
  return obtenerContextoReporteVentasService();
}

export async function consultarReporteVentas(
  filtros: ReporteVentasFiltros = {},
): Promise<ReporteVentasData> {
  return consultarReporteVentasService(filtros);
}