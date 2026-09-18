"use server";
import { filtrosReporteSchema, reporteStockPTSchema } from "@/lib/validators/reportes.schema";
import { reporteStockBase, reporteStockPT, reporteMovimientosBase, reporteMovimientosPT, reporteCapasPEPS, reporteStockBaseOficial, reporteStockPTOficial, reporteStockContexto } from "@/lib/services/reportes.service";
import { stockLoteSchema } from "@/lib/validators/stock.schema";

export async function reporteStockBaseAction(input: unknown) { return reporteStockBase(filtrosReporteSchema.parse(input)); }
export async function reporteStockPTAction(input: unknown) { return reporteStockPT(filtrosReporteSchema.parse(input)); }
export async function reporteMovimientosBaseAction(input: unknown) { return reporteMovimientosBase(filtrosReporteSchema.parse(input)); }
export async function reporteMovimientosPTAction(input: unknown) { return reporteMovimientosPT(filtrosReporteSchema.parse(input)); }
export async function reporteCapasPEPSAction(tipo: "BASE" | "PT") { return reporteCapasPEPS(tipo); }

export async function reporteStockBaseOficialAction(input: unknown) {
  const parsed = stockLoteSchema.safeParse(input ?? {});
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  return reporteStockBaseOficial(parsed.data);
}

export async function reporteStockPTOficialAction(input: unknown) {
  const parsed = reporteStockPTSchema.safeParse(input ?? {});
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  return reporteStockPTOficial(parsed.data);
}

export async function reporteStockContextoAction() {
  return reporteStockContexto();
}