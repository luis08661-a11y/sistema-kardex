"use server";

import { getResumenProductoTerminado, getContextoResumenPT } from "@/lib/services/resumen-producto-terminado.service";

export async function obtenerResumenPT(input: {
  productoId?: string;
  fechaCorte?: Date | string;
  fechaDesde?: Date | string;
  fechaHasta?: Date | string;
  soloConStock?: boolean;
}) {
  const toFecha = (v: Date | string | undefined) => v instanceof Date ? v : v ? new Date(v) : undefined;
  return getResumenProductoTerminado({
    productoId: input.productoId,
    fechaCorte: toFecha(input.fechaCorte),
    fechaDesde: toFecha(input.fechaDesde),
    fechaHasta: toFecha(input.fechaHasta),
    soloConStock: input.soloConStock,
  });
}

export async function obtenerContextoResumenPT() {
  return getContextoResumenPT();
}
