"use server";
import { resumenBaseActivaOficial } from "@/lib/services/reportes.service";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function obtenerResumenBaseActiva(input: {
  productoId?: string;
  loteId?: string;
  establecimientoId?: string;
  periodoId?: string;
  fechaCorte?: Date | string;
  fechaDesde?: Date | string;
  fechaHasta?: Date | string;
  soloConStock?: boolean;
}) {
  return resumenBaseActivaOficial(input);
}

export async function obtenerContextoResumenBase() {
  const [productos, lotes, establecimientos, periodos] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, tipoInventario: "BASE_ACTIVA" },
      select: { id: true, codigo: true, descripcion: true },
      orderBy: [{ descripcion: "asc" }, { codigo: "asc" }],
    }),
    prisma.loteBaseActiva.findMany({
      select: { id: true, productoId: true, codigo: true },
      orderBy: { codigo: "asc" },
    }),
    prisma.establecimiento.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.periodo.findMany({
      where: { activo: true },
      select: { id: true, anio: true },
      orderBy: { anio: "desc" },
    }),
  ]);

  return { productos, lotes, establecimientos, periodos };
}
