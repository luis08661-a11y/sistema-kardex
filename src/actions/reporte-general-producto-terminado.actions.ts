"use server";

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const D = (v: Prisma.Decimal | number | string | null | undefined) =>
  new Prisma.Decimal(v ?? 0);
const n = (v: Prisma.Decimal | null | undefined) => D(v).toNumber();

export type ReporteGeneralPTItem = {
  id: string;
  fecha: string;
  codigoProducto: string;
  descripcion: string;
  presentacion: string;
  tipoOperacion: string;
  documentoTraslado: string;
  serie: string;
  numero: string;
  entradaCan: number;
  entradaCostoUnitario: number;
  entradaCostoTotal: number;
  salidaCan: number;
  salidaCostoUnitario: number;
  salidaCostoTotal: number;
  saldoCan: number;
  saldoCostoUnitario: number;
  saldoCostoTotal: number;
  motivo: string;
  facturaGuia: string;
  empresaDestino: string;
  ingCampo: string;
  observacion: string;
  responsableDespacho: string;
};

export type ReporteGeneralProductoTerminadoData = {
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
    presentacion: string;
    unidadMedida: string;
    metodoValuacion: string;
  } | null;
  items: ReporteGeneralPTItem[];
  totalEntradasCan: number;
  totalEntradasCostoTotal: number;
  totalSalidasCan: number;
  totalSalidasCostoTotal: number;
  stockFinalCan: number;
  stockFinalCostoTotal: number;
};

export type ReporteGeneralPTContexto = {
  productos: Array<{
    id: string;
    codigo: string;
    codigoExistencia: string | null;
    descripcion: string;
    presentacion: string;
  }>;
};

export async function obtenerContextoReporteGeneralProductoTerminado(): Promise<ReporteGeneralPTContexto> {
  const productos = await prisma.producto.findMany({
    where: { activo: true, tipoInventario: "PRODUCTO_TERMINADO" },
    select: {
      id: true,
      codigo: true,
      codigoExistencia: true,
      descripcion: true,
      presentacion: { select: { nombre: true } },
    },
    orderBy: { codigo: "asc" },
  });

  return {
    productos: productos.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      codigoExistencia: p.codigoExistencia,
      descripcion: p.descripcion,
      presentacion: p.presentacion?.nombre ?? "SIN PRESENTACIÓN",
    })),
  };
}

export async function consultarReporteGeneralProductoTerminado(input: {
  productoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<ReporteGeneralProductoTerminadoData> {
  // 1. Empresa activa
  const empresa = await prisma.empresa.findFirst({
    where: { activo: true },
    orderBy: { createdAt: "asc" },
  });
  if (!empresa) throw new Error("No hay empresa configurada.");

  // 2. Fechas
  const fechaHasta = input.fechaHasta
    ? new Date(input.fechaHasta + "T23:59:59")
    : new Date();
  const fechaDesde = input.fechaDesde
    ? new Date(input.fechaDesde + "T00:00:00")
    : null;

  if (fechaDesde && fechaDesde > fechaHasta) {
    throw new Error("La fecha desde no puede ser mayor que la fecha hasta.");
  }

  // 4. Establecimiento activo
  const establecimiento = await prisma.establecimiento.findFirst({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  // 5. Producto seleccionado (datos del encabezado oficial)
  let productoSeleccionado: ReporteGeneralProductoTerminadoData["productoSeleccionado"] = null;
  if (input.productoId) {
    const prod = await prisma.producto.findUnique({
      where: { id: input.productoId },
      include: {
        tipoExistencia: { select: { codigo: true } },
        unidadMedida: { select: { nombre: true } },
        presentacion: { select: { nombre: true } },
      },
    });
    if (prod && prod.tipoInventario === "PRODUCTO_TERMINADO") {
      productoSeleccionado = {
        codigo: prod.codigo,
        codigoExistencia: prod.codigoExistencia ?? "",
        tipoExistencia: prod.tipoExistencia?.codigo ?? "",
        descripcion: prod.descripcion,
        presentacion: prod.presentacion?.nombre ?? "SIN PRESENTACIÓN",
        unidadMedida: prod.unidadMedida?.nombre ?? "",
        metodoValuacion: prod.metodoValuacion,
      };
    }
  }

  // 6. Filtros de producto (apply to both ranges)
  const filtroProducto: Prisma.MovimientoProductoTerminadoWhereInput = {};
  if (input.productoId) filtroProducto.productoId = input.productoId;

  const whereAnteriores: Prisma.MovimientoProductoTerminadoWhereInput = {
    ...filtroProducto,
  };
  if (fechaDesde) whereAnteriores.fecha = { lt: fechaDesde };

  const whereRango: Prisma.MovimientoProductoTerminadoWhereInput = {
    ...filtroProducto,
  };
  if (fechaDesde || input.fechaHasta) {
    whereRango.fecha = {};
    if (fechaDesde) (whereRango.fecha as any).gte = fechaDesde;
    if (input.fechaHasta) (whereRango.fecha as any).lte = fechaHasta;
  }

  // 7. Movimientos anteriores (saldo inicial PEPS) y del rango
  const [movimientosAnteriores, movimientosRango] = await Promise.all([
    fechaDesde
      ? prisma.movimientoProductoTerminado.findMany({
          where: whereAnteriores,
          orderBy: [{ fecha: "asc" }, { id: "asc" }],
        })
      : Promise.resolve([]),
    prisma.movimientoProductoTerminado.findMany({
      where: whereRango,
      orderBy: [{ fecha: "asc" }, { id: "asc" }],
      include: {
        producto: { select: { codigo: true, descripcion: true } },
        presentacion: { select: { nombre: true } },
        tipoOperacion: { select: { nombre: true } },
      },
    }),
  ]);

  // 8. Saldo inicial PEPS = acumulado de entradaCan/CostoTotal - salidaCan/CostoTotal
  //    (los costos de salida ya fueron valorizados con la lógica PEPS existente)
  let saldoAcumuladoCan = D(0);
  let saldoAcumuladoCosto = D(0);

  for (const m of movimientosAnteriores) {
    saldoAcumuladoCan = saldoAcumuladoCan.add(D(m.entradaCan)).sub(D(m.salidaCan));
    saldoAcumuladoCosto = saldoAcumuladoCosto
      .add(D(m.entradaCostoTotal))
      .sub(D(m.salidaCostoTotal));
  }

  // 9. Items con saldo corrido PEPS
  const items: ReporteGeneralPTItem[] = movimientosRango.map((m) => {
    saldoAcumuladoCan = saldoAcumuladoCan
      .add(D(m.entradaCan))
      .sub(D(m.salidaCan));
    saldoAcumuladoCosto = saldoAcumuladoCosto
      .add(D(m.entradaCostoTotal))
      .sub(D(m.salidaCostoTotal));

    const saldoCan = saldoAcumuladoCan.toNumber();
    const saldoCostoTotal = saldoAcumuladoCosto.toNumber();
    const saldoCostoUnitario = saldoCan > 0 ? saldoCostoTotal / saldoCan : 0;

    return {
      id: m.id,
      fecha: m.fecha.toISOString(),
      codigoProducto: m.producto.codigo,
      descripcion: m.producto.descripcion,
      presentacion: m.presentacion?.nombre ?? "SIN PRESENTACIÓN",
      tipoOperacion: m.tipoOperacion?.nombre ?? "",
      documentoTraslado: m.documentoTraslado ?? "",
      serie: m.serie ?? "",
      numero: m.numero ?? "",
      entradaCan: n(m.entradaCan),
      entradaCostoUnitario: n(m.entradaCostoUnitario),
      entradaCostoTotal: n(m.entradaCostoTotal),
      salidaCan: n(m.salidaCan),
      salidaCostoUnitario: n(m.salidaCostoUnitario),
      salidaCostoTotal: n(m.salidaCostoTotal),
      saldoCan,
      saldoCostoUnitario,
      saldoCostoTotal,
      motivo: m.motivo ?? "",
      facturaGuia: m.facturaGuia ?? "",
      empresaDestino: m.empresaDestino ?? "",
      ingCampo: m.ingCampo ?? "",
      observacion: m.observacion ?? "",
      responsableDespacho: m.responsableDespacho ?? "",
    };
  });

  // 10. Totales dinámicos
  const totalEntradasCan = items.reduce((a, i) => a + i.entradaCan, 0);
  const totalEntradasCostoTotal = items.reduce((a, i) => a + i.entradaCostoTotal, 0);
  const totalSalidasCan = items.reduce((a, i) => a + i.salidaCan, 0);
  const totalSalidasCostoTotal = items.reduce((a, i) => a + i.salidaCostoTotal, 0);
  const stockFinalCan = saldoAcumuladoCan.toNumber();
  const stockFinalCostoTotal = saldoAcumuladoCosto.toNumber();

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
    fechaDesde: fechaDesde ? fechaDesde.toISOString().slice(0, 10) : null,
    fechaHasta: fechaHasta.toISOString().slice(0, 10),
    productoSeleccionado,
    items,
    totalEntradasCan,
    totalEntradasCostoTotal,
    totalSalidasCan,
    totalSalidasCostoTotal,
    stockFinalCan,
    stockFinalCostoTotal,
  };
}
