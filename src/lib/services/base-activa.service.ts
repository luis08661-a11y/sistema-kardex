import { prisma } from "@/lib/db/prisma";
import type { LoteBaseInput, MovimientoBaseInput } from "@/lib/validators/base-activa.schema";
import { recalcularSaldosLoteTx } from "@/lib/services/saldo-base.service";

function plainify<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "object" && v !== null && typeof v.toNumber === "function" ? v.toNumber() : v,
    ),
  );
}

const loteInclude = {
  producto: { select: { id: true, codigo: true, descripcion: true } },
  almacenamiento: { select: { id: true, codigo: true, nombre: true } },
  _count: { select: { movimientos: true } },
} as const;

const movimientoInclude = {
  producto: { select: { id: true, codigo: true, descripcion: true } },
  lote: { select: { id: true, codigo: true } },
  periodo: { select: { id: true, anio: true } },
  establecimiento: { select: { id: true, nombre: true } },
  almacenamiento: { select: { id: true, nombre: true } },
  tipoOperacion: { select: { id: true, codigo: true, nombre: true } },
} as const;

export async function obtenerContextoBaseService() {
  const [periodos, establecimientos, productos, almacenamientos, operaciones] = await Promise.all([
    prisma.periodo.findMany({ where: { activo: true }, orderBy: { anio: "desc" } }),
    prisma.establecimiento.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ where: { activo: true, tipoInventario: "BASE_ACTIVA" }, orderBy: { codigo: "asc" }, select: { id: true, codigo: true, descripcion: true } }),
    prisma.almacenamiento.findMany({ where: { activo: true }, include: { establecimiento: { select: { id: true, nombre: true } } }, orderBy: { nombre: "asc" } }),
    prisma.tipoOperacion.findMany({ where: { activo: true }, orderBy: [{ codigo: "asc" }, { nombre: "asc" }] }),
  ]);
  return { periodos, establecimientos, productos, almacenamientos, operaciones };
}

export async function obtenerLotesBaseService(filtro?: string) {
  const q = filtro?.trim();
  return plainify(await prisma.loteBaseActiva.findMany({
    where: q ? { OR: [{ codigo: { contains: q, mode: "insensitive" } }, { producto: { descripcion: { contains: q, mode: "insensitive" } } }] } : undefined,
    include: loteInclude,
    orderBy: [{ codigo: "asc" }],
  }));
}

export async function crearLoteBaseService(input: LoteBaseInput) {
  const producto = await prisma.producto.findFirst({ where: { id: input.productoId, tipoInventario: "BASE_ACTIVA", activo: true }, select: { id: true } });
  if (!producto) throw new Error("El producto no es un producto Base Activa activo.");
  return prisma.loteBaseActiva.create({ data: { productoId: input.productoId, codigo: input.codigo.trim().toUpperCase(), fechaIngreso: input.fechaIngreso, observaciones: input.observaciones?.trim() || null, almacenamientoId: input.almacenamientoId ?? null } });
}

export async function obtenerMovimientosBaseService(filtros?: { productoId?: string; loteId?: string }) {
  return plainify(await prisma.movimientoBaseActiva.findMany({
    where: { productoId: filtros?.productoId || undefined, loteId: filtros?.loteId || undefined },
    include: movimientoInclude,
    orderBy: [{ fecha: "desc" }, { id: "desc" }],
    take: 500,
  }));
}

export async function obtenerStockBaseService() {
  const rows = await prisma.movimientoBaseActiva.groupBy({
    by: ["productoId", "loteId"],
    _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true },
  });
  const ids = [...new Set(rows.map((r) => r.productoId))];
  const productos = await prisma.producto.findMany({ where: { id: { in: ids } }, select: { id: true, codigo: true, descripcion: true } });
  const map = new Map(productos.map((p) => [p.id, p]));
  return plainify(rows.map((r) => ({ ...r, stockKg: Number(r._sum.entradaPesoTotalKg ?? 0) - Number(r._sum.salidaPesoTotalKg ?? 0), producto: map.get(r.productoId) ?? null })));
}

export async function crearMovimientoBaseService(input: MovimientoBaseInput) {
  return prisma.$transaction(async (tx) => {
    const [producto, lote] = await Promise.all([
      tx.producto.findFirst({ where: { id: input.productoId, tipoInventario: "BASE_ACTIVA", activo: true }, select: { id: true } }),
      tx.loteBaseActiva.findFirst({ where: { id: input.loteId, productoId: input.productoId }, select: { id: true } }),
    ]);
    if (!producto) throw new Error("Producto Base Activa inválido.");
    if (!lote) throw new Error("Lote inválido o inactivo.");

    if (input.tipoMovimiento === "SALIDA") {
      const agg = await tx.movimientoBaseActiva.aggregate({
        where: { loteId: input.loteId },
        _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true },
      });
      const stock = Number(agg._sum?.entradaPesoTotalKg ?? 0) - Number(agg._sum?.salidaPesoTotalKg ?? 0);
      if (input.salidaPesoTotalKg > stock + 0.000001) throw new Error(`Stock insuficiente en el lote. Disponible: ${stock.toFixed(6)} Kg.`);
    }

    const mov = await tx.movimientoBaseActiva.create({
      data: {
        periodoId: input.periodoId, establecimientoId: input.establecimientoId, productoId: input.productoId, loteId: input.loteId,
        almacenamientoId: input.almacenamientoId ?? null, tipoOperacionId: input.tipoOperacionId ?? null, fecha: input.fecha,
        tipoMovimiento: input.tipoMovimiento, observacion: input.observacion?.trim() || null,
        responsableRegistro: input.responsableRegistro?.trim() || null,
        entradaUnd: input.tipoMovimiento === "ENTRADA" ? input.entradaUnd : 0,
        entradaPesoKg: input.tipoMovimiento === "ENTRADA" ? input.entradaPesoKg : 0,
        entradaPesoTotalKg: input.tipoMovimiento === "ENTRADA" ? input.entradaPesoTotalKg : 0,
        salidaUnd: input.tipoMovimiento === "SALIDA" ? input.salidaUnd : 0,
        salidaPesoUnitarioKg: input.tipoMovimiento === "SALIDA" ? input.salidaPesoUnitarioKg : 0,
        salidaPesoTotalKg: input.tipoMovimiento === "SALIDA" ? input.salidaPesoTotalKg : 0,
        formulacion: input.formulacion?.trim() || null, responsableFormulacion: input.responsableFormulacion?.trim() || null,
        cantidadProductoFormulado: input.cantidadProductoFormulado ?? null, almacenamientoNombre: input.almacenamientoNombre?.trim() || null,
        costoUnitarioKg: input.costoUnitarioKg ?? null,
        costoTotalEntrada: input.tipoMovimiento === "ENTRADA" && input.costoUnitarioKg != null ? input.costoUnitarioKg * input.entradaPesoTotalKg : null,
        costoTotalSalida: input.tipoMovimiento === "SALIDA" && input.costoUnitarioKg != null ? input.costoUnitarioKg * input.salidaPesoTotalKg : null,
      },
    });

    if (input.tipoMovimiento === "ENTRADA") {
      await tx.capaPEPSBase.create({ data: { productoId: input.productoId, loteId: input.loteId, movimientoEntradaId: mov.id, fechaEntrada: input.fecha, cantidadKgInicial: input.entradaPesoTotalKg, cantidadKgRestante: input.entradaPesoTotalKg, costoUnitarioKg: input.costoUnitarioKg ?? null } });
    }

    await recalcularSaldosLoteTx(tx, input.loteId);

    return mov;
  });
}
