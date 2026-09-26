import { prisma } from "@/lib/db/prisma";
import { Prisma, TipoMovimiento } from "@prisma/client";

const D = (value: Prisma.Decimal | number | string | null | undefined) => new Prisma.Decimal(value ?? 0);
const n = (value: Prisma.Decimal | null | undefined) => D(value).toString();

export async function obtenerResumenStockBase(filters: {
  productoId?: string;
  periodoId?: string;
  establecimientoId?: string;
}) {
  const rows = await prisma.movimientoBaseActiva.groupBy({
    by: ["productoId"],
    where: {
      ...(filters.productoId ? { productoId: filters.productoId } : {}),
      ...(filters.periodoId ? { periodoId: filters.periodoId } : {}),
      ...(filters.establecimientoId ? { establecimientoId: filters.establecimientoId } : {}),
    },
    _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true, costoTotalEntrada: true, costoTotalSalida: true },
  });
  const ids = rows.map((r) => r.productoId);
  const products = await prisma.producto.findMany({ where: { id: { in: ids } }, select: { id: true, codigo: true, descripcion: true, unidadMedida: { select: { nombre: true } } } });
  const map = new Map(products.map((p) => [p.id, p]));
  return rows.map((r) => ({
    productoId: r.productoId,
    codigo: map.get(r.productoId)?.codigo ?? "",
    descripcion: map.get(r.productoId)?.descripcion ?? "",
    unidad: map.get(r.productoId)?.unidadMedida.nombre ?? "",
    entradasKg: n(r._sum?.entradaPesoTotalKg),
    salidasKg: n(r._sum?.salidaPesoTotalKg),
    stockKg: D(r._sum?.entradaPesoTotalKg).sub(D(r._sum?.salidaPesoTotalKg)).toString(),
    costoEntradas: n(r._sum?.costoTotalEntrada),
    costoSalidas: n(r._sum?.costoTotalSalida),
  }));
}

export async function obtenerResumenStockPT(filters: {
  productoId?: string;
  periodoId?: string;
  establecimientoId?: string;
}) {
  const rows = await prisma.movimientoProductoTerminado.groupBy({
    by: ["productoId", "presentacionId"],
    where: {
      ...(filters.productoId ? { productoId: filters.productoId } : {}),
      ...(filters.periodoId ? { periodoId: filters.periodoId } : {}),
      ...(filters.establecimientoId ? { establecimientoId: filters.establecimientoId } : {}),
    },
    _sum: { entradaCan: true, salidaCan: true, entradaCostoTotal: true, salidaCostoTotal: true },
  });
  const productIds = [...new Set(rows.map((r) => r.productoId))];
  const [products, presentations] = await Promise.all([
    prisma.producto.findMany({ where: { id: { in: productIds } }, select: { id: true, codigo: true, descripcion: true } }),
    prisma.presentacion.findMany({ where: { id: { in: rows.flatMap((r) => r.presentacionId ? [r.presentacionId] : []) } }, select: { id: true, nombre: true } }),
  ]);
  const pm = new Map(products.map((p) => [p.id, p]));
  const sm = new Map(presentations.map((p) => [p.id, p]));
  return rows.map((r) => ({
    productoId: r.productoId,
    presentacionId: r.presentacionId,
    codigo: pm.get(r.productoId)?.codigo ?? "",
    descripcion: pm.get(r.productoId)?.descripcion ?? "",
    presentacion: r.presentacionId ? sm.get(r.presentacionId)?.nombre ?? "" : "SIN PRESENTACIÓN",
    entradas: n(r._sum?.entradaCan),
    salidas: n(r._sum?.salidaCan),
    stock: D(r._sum?.entradaCan).sub(D(r._sum?.salidaCan)).toString(),
    costoEntradas: n(r._sum?.entradaCostoTotal),
    costoSalidas: n(r._sum?.salidaCostoTotal),
  }));
}

export async function obtenerKardexBase(input: { productoId: string; periodoId?: string; establecimientoId?: string }) {
  const movements = await prisma.movimientoBaseActiva.findMany({
    where: { productoId: input.productoId, ...(input.periodoId ? { periodoId: input.periodoId } : {}), ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}) },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
    include: { lote: { select: { codigo: true } }, tipoOperacion: { select: { codigo: true, nombre: true } }, almacenamiento: { select: { nombre: true } } },
  });
  let saldo = D(0);
  return movements.map((m) => {
    const entrada = D(m.entradaPesoTotalKg);
    const salida = D(m.salidaPesoTotalKg);
    saldo = saldo.add(entrada).sub(salida);
    return {
      id: m.id, fecha: m.fecha.toISOString(), lote: m.lote.codigo, operacion: m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "",
      almacenamiento: m.almacenamiento?.nombre ?? m.almacenamientoNombre ?? "", observacion: m.observacion ?? "",
      entradaKg: entrada.toString(), salidaKg: salida.toString(), saldoKg: saldo.toString(), costoSalida: n(m.costoTotalSalida),
    };
  });
}

export async function obtenerKardexPT(input: { productoId: string; presentacionId?: string; periodoId?: string; establecimientoId?: string }) {
  const movements = await prisma.movimientoProductoTerminado.findMany({
    where: { productoId: input.productoId, ...(input.presentacionId ? { presentacionId: input.presentacionId } : {}), ...(input.periodoId ? { periodoId: input.periodoId } : {}), ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}) },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
    include: { presentacion: { select: { nombre: true } }, tipoOperacion: { select: { codigo: true, nombre: true } } },
  });
  let saldo = D(0);
  return movements.map((m) => {
    const entrada = D(m.entradaCan); const salida = D(m.salidaCan); saldo = saldo.add(entrada).sub(salida);
    return { id: m.id, fecha: m.fecha.toISOString(), presentacion: m.presentacion?.nombre ?? "SIN PRESENTACIÓN", operacion: m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "", documento: [m.serie, m.numero].filter(Boolean).join("-"), motivo: m.motivo ?? "", observacion: m.observacion ?? "", entrada: entrada.toString(), salida: salida.toString(), saldo: saldo.toString(), costoSalida: n(m.salidaCostoTotal) };
  });
}

export async function obtenerCapasDisponiblesBase(productoId?: string) {
  const layers = await prisma.capaPEPSBase.findMany({ where: { ...(productoId ? { productoId } : {}), cantidadKgRestante: { gt: 0 } }, orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }], include: { producto: { select: { codigo: true, descripcion: true } }, lote: { select: { codigo: true } } } });
  return layers.map((l) => ({ id: l.id, productoId: l.productoId, codigo: l.producto.codigo, descripcion: l.producto.descripcion, lote: l.lote.codigo, fechaEntrada: l.fechaEntrada.toISOString(), cantidadInicial: n(l.cantidadKgInicial), cantidadRestante: n(l.cantidadKgRestante), costoUnitario: n(l.costoUnitarioKg) }));
}

export async function obtenerCapasDisponiblesPT(productoId?: string) {
  const layers = await prisma.capaPEPSPT.findMany({ where: { ...(productoId ? { productoId } : {}), cantidadRestante: { gt: 0 } }, orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }], include: { producto: { select: { codigo: true, descripcion: true } }, presentacion: { select: { nombre: true } } } });
  return layers.map((l) => ({ id: l.id, productoId: l.productoId, codigo: l.producto.codigo, descripcion: l.producto.descripcion, presentacion: l.presentacion?.nombre ?? "SIN PRESENTACIÓN", fechaEntrada: l.fechaEntrada.toISOString(), cantidadInicial: n(l.cantidadInicial), cantidadRestante: n(l.cantidadRestante), costoUnitario: n(l.costoUnitario) }));
}

export async function obtenerStockPorLoteBase(filters: {
  productoId?: string;
  loteId?: string;
  establecimientoId?: string;
  periodoId?: string;
  soloConStock?: boolean;
}) {
  const lotes = await prisma.loteBaseActiva.findMany({
    where: {
      ...(filters.productoId ? { productoId: filters.productoId } : {}),
      ...(filters.loteId ? { id: filters.loteId } : {}),
    },
    include: {
      producto: { select: { id: true, codigo: true, codigoExistencia: true, descripcion: true, activo: true, unidadMedida: { select: { nombre: true } } } },
      almacenamiento: { select: { nombre: true } },
    },
    orderBy: [{ producto: { codigo: "asc" } }, { codigo: "asc" }],
  });

  const loteIds = lotes.map((l) => l.id);
  const movs = await prisma.movimientoBaseActiva.groupBy({
    by: ["loteId"],
    where: {
      loteId: { in: loteIds },
      ...(filters.establecimientoId ? { establecimientoId: filters.establecimientoId } : {}),
      ...(filters.periodoId ? { periodoId: filters.periodoId } : {}),
    },
    _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true, entradaUnd: true, salidaUnd: true },
  });
  const map = new Map(movs.map((m) => [m.loteId, m]));

  const rows = lotes.map((l) => {
    const s = map.get(l.id);
    const stockKg = D(s?._sum?.entradaPesoTotalKg).sub(D(s?._sum?.salidaPesoTotalKg));
    const und = D(s?._sum?.entradaUnd).sub(D(s?._sum?.salidaUnd));
    return {
      loteId: l.id,
      productoId: l.producto.id,
      codigo: l.producto.codigo,
      codigoExistencia: l.producto.codigoExistencia ?? "",
      descripcion: l.producto.descripcion,
      unidad: l.producto.unidadMedida.nombre ?? "KG",
      lote: l.codigo,
      unidades: und.toString(),
      stockKg: stockKg.toString(),
      ubicacion: l.almacenamiento?.nombre ?? "",
      observacion: l.observaciones ?? "",
      estado: l.producto.activo ? "ACTIVO" : "INACTIVO",
    };
  });

  const filtrados = filters.soloConStock ? rows.filter((r) => D(r.stockKg).greaterThan(0)) : rows;
  const totalKg = filtrados.reduce((acc, r) => acc.add(D(r.stockKg)), D(0));
  return { rows: filtrados, totalKg: totalKg.toString(), totalLotes: filtrados.length };
}

export type TipoStockReporte = "BASE_ACTIVA" | "PRODUCTO_TERMINADO";

export interface StockReporteFiltros {
  codigo?: string;
  producto?: string;
}

export interface StockReporteRow {
  productoId: string;
  presentacionId?: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  presentacion?: string;
  stock: number;
  costoTotal: number;
  costoUnitario: number;
}

const FILTROS_PRODUCTO = (filtros: StockReporteFiltros) => {
  const codigo = filtros.codigo?.trim();
  const producto = filtros.producto?.trim();
  return {
    activo: true,
    ...(codigo ? { codigo: { contains: codigo, mode: "insensitive" as const } } : {}),
    ...(producto ? { descripcion: { contains: producto, mode: "insensitive" as const } } : {}),
  };
};

/**
 * Reporte de stock valorizado (módulo Stock).
 *
 * Fuente de datos: capas PEPS vigentes (solo saldos restantes > 0), agrupadas por
 * producto (Base Activa) o por producto + presentación (Producto Terminado).
 * El "costo unitario" se calcula como promedio ponderado por las capas disponibles,
 * y el "costo total" es la valorización de las capas restantes.
 *
 * NOTA DE INTEGRACIÓN PENDIENTE (módulo Productos):
 * - Actualmente "costo unitario" y "costo total" se derivan de las capas PEPS y NO
 *   son campos del maestro Producto. El toggle "Integra un dato" del módulo solo
 *   previsualiza cómo se verían esos campos si se incorporaran a la ficha del producto.
 * - Para integrarlos de verdad haría falta:
 *   1) Agregar `costoUnitario` / `costoTotal` (y/o `stock`) al modelo Producto + UI en
 *      productos-module (ficha de producto) con permisos por rol.
 *   2) Mantenerlos sincronizados al registrar movimientos de BA/PT (crear/consumir
 *      capas PEPS) y al registrar ventas en el POS (descuento de stock).
 *   3) Definir si el costo unitario se congela al incorporarse (captura en la ficha)
 *      o sigue siendo el promedio ponderado de capas (vista viva). Decidir con el usuario.
 *   4) Migración Prisma + seed de datos de prueba.
 */
export async function obtenerStockReporteService(
  tipo: TipoStockReporte,
  filtros: StockReporteFiltros = {},
): Promise<StockReporteRow[]> {
  if (tipo === "BASE_ACTIVA") {
    const capas = await prisma.capaPEPSBase.findMany({
      where: {
        cantidadKgRestante: { gt: 0 },
        producto: { is: FILTROS_PRODUCTO(filtros) },
      },
      orderBy: [{ producto: { codigo: "asc" } }, { fechaEntrada: "asc" }],
      select: {
        productoId: true,
        cantidadKgRestante: true,
        costoUnitarioKg: true,
        producto: {
          select: {
            codigo: true,
            descripcion: true,
            unidadMedida: { select: { nombre: true } },
          },
        },
      },
    });

    const grupos = new Map<string, { stock: Prisma.Decimal; valor: Prisma.Decimal; row: Omit<StockReporteRow, "stock" | "costoUnitario" | "costoTotal"> }>();
    for (const c of capas) {
      const g = grupos.get(c.productoId) ?? {
        stock: D(0),
        valor: D(0),
        row: {
          productoId: c.productoId,
          codigo: c.producto.codigo,
          descripcion: c.producto.descripcion,
          unidad: c.producto.unidadMedida?.nombre ?? "KG",
        },
      };
      g.stock = g.stock.add(c.cantidadKgRestante);
      if (c.costoUnitarioKg) g.valor = g.valor.add(D(c.costoUnitarioKg).mul(c.cantidadKgRestante));
      grupos.set(c.productoId, g);
    }

    return [...grupos.values()]
      .map((g) => {
        const stock = Number(g.stock);
        const costoTotal = Number(g.valor);
        return {
          ...g.row,
          stock,
          costoTotal,
          costoUnitario: stock > 0 ? costoTotal / stock : 0,
        };
      })
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  }

  const capas = await prisma.capaPEPSPT.findMany({
    where: {
      cantidadRestante: { gt: 0 },
      producto: { is: FILTROS_PRODUCTO(filtros) },
    },
    orderBy: [{ producto: { codigo: "asc" } }, { fechaEntrada: "asc" }],
    select: {
      productoId: true,
      presentacionId: true,
      cantidadRestante: true,
      costoUnitario: true,
      producto: {
        select: {
          codigo: true,
          descripcion: true,
          unidadMedida: { select: { nombre: true } },
        },
      },
      presentacion: { select: { nombre: true } },
    },
  });

  const grupos = new Map<string, { stock: Prisma.Decimal; valor: Prisma.Decimal; row: Omit<StockReporteRow, "stock" | "costoUnitario" | "costoTotal"> }>();
  for (const c of capas) {
    const key = c.presentacionId ? `${c.productoId}|${c.presentacionId}` : c.productoId;
    const g = grupos.get(key) ?? {
      stock: D(0),
      valor: D(0),
      row: {
        productoId: c.productoId,
        presentacionId: c.presentacionId ?? undefined,
        codigo: c.producto.codigo,
        descripcion: c.producto.descripcion,
        unidad: c.producto.unidadMedida?.nombre ?? "UND",
        presentacion: c.presentacion?.nombre ?? "SIN PRESENTACIÓN",
      },
    };
    g.stock = g.stock.add(c.cantidadRestante);
    g.valor = g.valor.add(D(c.costoUnitario).mul(c.cantidadRestante));
    grupos.set(key, g);
  }

  return [...grupos.values()]
    .map((g) => {
      const stock = Number(g.stock);
      const costoTotal = Number(g.valor);
      return {
        ...g.row,
        stock,
        costoTotal,
        costoUnitario: stock > 0 ? costoTotal / stock : 0,
      };
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export async function obtenerContextoStockService() {
  const [productos, lotes, establecimientos, periodos] = await Promise.all([
    prisma.producto.findMany({ where: { activo: true, tipoInventario: "BASE_ACTIVA" }, orderBy: { codigo: "asc" }, select: { id: true, codigo: true, descripcion: true, codigoExistencia: true } }),
    prisma.loteBaseActiva.findMany({ orderBy: { codigo: "asc" }, select: { id: true, productoId: true, codigo: true } }),
    prisma.establecimiento.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    prisma.periodo.findMany({ where: { activo: true }, orderBy: { anio: "desc" }, select: { id: true, anio: true } }),
  ]);
  return { productos, lotes, establecimientos, periodos };
}
