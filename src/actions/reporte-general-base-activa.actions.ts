"use server";

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const D = (v: Prisma.Decimal | number | string | null | undefined) =>
  new Prisma.Decimal(v ?? 0);
const n = (v: Prisma.Decimal | null | undefined) => D(v).toNumber();

export type ReporteGeneralItem = {
  id: string;
  fecha: string;
  codigoProducto: string;
  codigoLote: string;
  descripcion: string;
  observacion: string | null;
  responsableRegistro: string | null;
  tipoOperacion: string;
  entradaUnd: number;
  entradaPesoUnitarioKg: number;
  entradaPesoTotalKg: number;
  salidaUnd: number;
  salidaPesoUnitarioKg: number;
  salidaPesoTotalKg: number;
  saldoUnd: number;
  saldoPesoUnitarioKg: number;
  saldoPesoTotalKg: number;
  formulacion: string | null;
  responsableFormulacion: string | null;
  cantidadProductoFormulado: number | null;
  almacenamientoNombre: string | null;
};

export type ReporteGeneralData = {
  empresa: {
    ruc: string;
    razonSocial: string;
    logoUrl?: string | null;
    responsableReporte?: string | null;
    cargoReporte?: string | null;
  };
  establecimiento: string;
  periodo: string;
  fechaDesde: string | null;
  fechaHasta: string;
  productoSeleccionado: {
    codigo: string;
    codigoExistencia: string;
    tipoExistencia: string;
    descripcion: string;
    unidadMedida: string;
    metodoValuacion: string;
  } | null;
  items: ReporteGeneralItem[];
  totalEntradasUnd: number;
  totalEntradasPeso: number;
  totalSalidasUnd: number;
  totalSalidasPeso: number;
  stockFinalPeso: number;
};

export type ReporteGeneralContexto = {
  productos: Array<{
    id: string;
    codigo: string;
    codigoExistencia: string | null;
    descripcion: string;
  }>;
  lotes: Array<{
    id: string;
    productoId: string;
    codigo: string;
  }>;
  establecimientos: Array<{
    id: string;
    nombre: string;
  }>;
};

export async function obtenerContextoReporteGeneral(): Promise<ReporteGeneralContexto> {
  const [productos, lotes, establecimientos] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, tipoInventario: "BASE_ACTIVA" },
      select: {
        id: true,
        codigo: true,
        codigoExistencia: true,
        descripcion: true,
      },
      orderBy: { codigo: "asc" },
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
  ]);

  return { productos, lotes, establecimientos };
}

export async function consultarReporteGeneral(input: {
  productoId?: string;
  loteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<ReporteGeneralData> {
  // 1. Get empresa
  const empresa = await prisma.empresa.findFirst({
    where: { activo: true },
    orderBy: { createdAt: "asc" },
  });
  if (!empresa) throw new Error("No hay empresa configurada.");

  // 2. Parse dates
  const fechaHasta = input.fechaHasta
    ? new Date(input.fechaHasta + "T23:59:59")
    : new Date();
  const fechaDesde = input.fechaDesde
    ? new Date(input.fechaDesde + "T00:00:00")
    : null;

  // Validate dates
  if (fechaDesde && fechaDesde > fechaHasta) {
    throw new Error("La fecha desde no puede ser mayor que la fecha hasta.");
  }

  // 3. Get periodo from fechaHasta
  const periodo = await prisma.periodo.findFirst({
    where: {
      activo: true,
      anio: fechaHasta.getFullYear(),
    },
  });

  // 4. Get primer establecimiento activo
  const establecimiento = await prisma.establecimiento.findFirst({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  // 5. Get product info if selected
  let productoSeleccionado: ReporteGeneralData["productoSeleccionado"] = null;
  if (input.productoId) {
    const prod = await prisma.producto.findUnique({
      where: { id: input.productoId },
      include: {
        tipoExistencia: { select: { codigo: true } },
        unidadMedida: { select: { nombre: true } },
      },
    });
    if (prod && prod.tipoInventario === "BASE_ACTIVA") {
      productoSeleccionado = {
        codigo: prod.codigo,
        codigoExistencia: prod.codigoExistencia ?? "",
        tipoExistencia: prod.tipoExistencia?.codigo ?? "",
        descripcion: prod.descripcion,
        unidadMedida: prod.unidadMedida?.nombre ?? "",
        metodoValuacion: prod.metodoValuacion,
      };
    }
  }

  // 6. Build where clause for movements in the date range
  const whereMovimientos: Prisma.MovimientoBaseActivaWhereInput = {};
  if (input.productoId) whereMovimientos.productoId = input.productoId;
  if (input.loteId) whereMovimientos.loteId = input.loteId;

  // For movements before the range (to calculate starting balance)
  const whereAnteriores: Prisma.MovimientoBaseActivaWhereInput = {
    ...whereMovimientos,
  };
  if (fechaDesde) {
    whereAnteriores.fecha = { lt: fechaDesde };
  }

  // For movements in the range
  const whereRango: Prisma.MovimientoBaseActivaWhereInput = {
    ...whereMovimientos,
  };
  if (fechaDesde || input.fechaHasta) {
    whereRango.fecha = {};
    if (fechaDesde) (whereRango.fecha as any).gte = fechaDesde;
    if (input.fechaHasta) (whereRango.fecha as any).lte = fechaHasta;
  }

  // 7. Get movements in range + earlier movements for balance calculation
  const [movimientosRango, movimientosAnteriores] = await Promise.all([
    prisma.movimientoBaseActiva.findMany({
      where: whereRango,
      orderBy: [{ fecha: "asc" }, { id: "asc" }],
      include: {
        producto: {
          select: {
            codigo: true,
            descripcion: true,
          },
        },
        lote: { select: { codigo: true } },
        tipoOperacion: { select: { nombre: true } },
      },
    }),
    fechaDesde
      ? prisma.movimientoBaseActiva.findMany({
          where: whereAnteriores,
          orderBy: [{ fecha: "asc" }, { id: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  // 8. Calculate starting balance from earlier movements
  let saldoAcumuladoUnd = D(0);
  let saldoAcumuladoPeso = D(0);

  for (const m of movimientosAnteriores) {
    saldoAcumuladoUnd = saldoAcumuladoUnd
      .add(D(m.entradaUnd))
      .sub(D(m.salidaUnd));
    saldoAcumuladoPeso = saldoAcumuladoPeso
      .add(D(m.entradaPesoTotalKg))
      .sub(D(m.salidaPesoTotalKg));
  }

  // 9. Build items with running balance
  const items: ReporteGeneralItem[] = movimientosRango.map((m) => {
    saldoAcumuladoUnd = saldoAcumuladoUnd
      .add(D(m.entradaUnd))
      .sub(D(m.salidaUnd));
    saldoAcumuladoPeso = saldoAcumuladoPeso
      .add(D(m.entradaPesoTotalKg))
      .sub(D(m.salidaPesoTotalKg));

    const saldoUnd = saldoAcumuladoUnd.toNumber();
    const saldoPeso = saldoAcumuladoPeso.toNumber();
    const saldoUnitario =
      saldoUnd > 0 ? saldoPeso / saldoUnd : 0;

    return {
      id: m.id,
      fecha: m.fecha.toISOString(),
      codigoProducto: m.producto.codigo,
      codigoLote: m.lote.codigo,
      descripcion: m.producto.descripcion,
      observacion: m.observacion ?? null,
      responsableRegistro: m.responsableRegistro ?? null,
      tipoOperacion: m.tipoOperacion?.nombre ?? "",
      entradaUnd: n(m.entradaUnd),
      entradaPesoUnitarioKg: n(m.entradaPesoKg),
      entradaPesoTotalKg: n(m.entradaPesoTotalKg),
      salidaUnd: n(m.salidaUnd),
      salidaPesoUnitarioKg: n(m.salidaPesoUnitarioKg),
      salidaPesoTotalKg: n(m.salidaPesoTotalKg),
      saldoUnd,
      saldoPesoUnitarioKg: saldoUnitario,
      saldoPesoTotalKg: saldoPeso,
      formulacion: m.formulacion ?? null,
      responsableFormulacion: m.responsableFormulacion ?? null,
      cantidadProductoFormulado: m.cantidadProductoFormulado
        ? n(m.cantidadProductoFormulado)
        : null,
      almacenamientoNombre: m.almacenamientoNombre ?? null,
    };
  });

  // 10. Calculate totals
  const totalEntradasUnd = items.reduce((a, i) => a + i.entradaUnd, 0);
  const totalEntradasPeso = items.reduce((a, i) => a + i.entradaPesoTotalKg, 0);
  const totalSalidasUnd = items.reduce((a, i) => a + i.salidaUnd, 0);
  const totalSalidasPeso = items.reduce((a, i) => a + i.salidaPesoTotalKg, 0);
  const stockFinalPeso = saldoAcumuladoPeso.toNumber();

  return {
    empresa: {
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      logoUrl: empresa.logoUrl ?? null,
      responsableReporte: empresa.responsableReporte ?? null,
      cargoReporte: empresa.cargoReporte ?? null,
    },
    establecimiento: establecimiento?.nombre ?? "",
    periodo: String(fechaHasta.getFullYear()),
    fechaDesde: fechaDesde
      ? fechaDesde.toISOString().slice(0, 10)
      : null,
    fechaHasta: fechaHasta.toISOString().slice(0, 10),
    productoSeleccionado,
    items,
    totalEntradasUnd,
    totalEntradasPeso,
    totalSalidasUnd,
    totalSalidasPeso,
    stockFinalPeso,
  };
}
