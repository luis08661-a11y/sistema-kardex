import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const D = (v: Prisma.Decimal | number | string | null | undefined) => new Prisma.Decimal(v ?? 0);
const s = (v: Prisma.Decimal | null | undefined) => D(v).toString();

export async function reporteStockBaseOficial(input: { productoId?: string; loteId?: string; establecimientoId?: string; periodoId?: string; soloConStock?: boolean }) {
  const [empresa, periodo, establecimiento] = await Promise.all([
    prisma.empresa.findFirst({ where: { activo: true }, orderBy: { createdAt: "asc" } }),
    input.periodoId ? prisma.periodo.findUnique({ where: { id: input.periodoId } }) : Promise.resolve(undefined),
    input.establecimientoId ? prisma.establecimiento.findUnique({ where: { id: input.establecimientoId } }) : (await prisma.establecimiento.findFirst({ where: { activo: true }, orderBy: { nombre: "asc" } })),
  ]);

  if (!empresa) throw new Error("No hay una empresa activa configurada. Configúrela en Configuración.");

  const lotes = await prisma.loteBaseActiva.findMany({
    where: {
      ...(input.productoId ? { productoId: input.productoId } : {}),
      ...(input.loteId ? { id: input.loteId } : {}),
    },
    include: {
      producto: { select: { id: true, codigo: true, codigoExistencia: true, descripcion: true, tipoExistencia: { select: { codigo: true, nombre: true } }, unidadMedida: { select: { codigo: true, nombre: true } }, metodoValuacion: true, observaciones: true } },
      almacenamiento: { select: { nombre: true } },
    },
    orderBy: [{ producto: { codigo: "asc" } }, { codigo: "asc" }],
  });

  const loteIds = lotes.map((l) => l.id);
  const movs = await prisma.movimientoBaseActiva.groupBy({
    by: ["loteId", "productoId"],
    where: {
      loteId: { in: loteIds },
      ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}),
      ...(input.periodoId ? { periodoId: input.periodoId } : {}),
    },
    _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true },
  });
  const movMap = new Map(movs.map((m) => [`${m.productoId}::${m.loteId}`, m]));

  const agrupado = new Map<string, { productoId: string; descripcion: string; codigo: string; codigoExistencia: string; tipoExistencia: string; unidadMedida: string; metodoValuacion: string; lotes: Array<{ lote: string; stockKg: number; ubicacion?: string | null; observacion?: string | null }>; totalKg: number }>();
  for (const l of lotes) {
    const row = movMap.get(`${l.productoId}::${l.id}`);
    const stockKg = Number(D(row?._sum?.entradaPesoTotalKg).sub(D(row?._sum?.salidaPesoTotalKg)));
    if (input.soloConStock && stockKg <= 0.000001) continue;
    const g = agrupado.get(l.productoId) ?? {
      productoId: l.producto.id,
      descripcion: l.producto.descripcion,
      codigo: l.producto.codigo,
      codigoExistencia: l.producto.codigoExistencia ?? "",
      tipoExistencia: l.producto.tipoExistencia?.codigo ?? "",
      unidadMedida: l.producto.unidadMedida.codigo ?? l.producto.unidadMedida.nombre ?? "",
      metodoValuacion: l.producto.metodoValuacion,
      lotes: [],
      totalKg: 0,
    };
    g.lotes.push({ lote: l.codigo, stockKg, ubicacion: l.almacenamiento?.nombre ?? null, observacion: l.producto.observaciones ?? null });
    g.totalKg = g.totalKg + stockKg;
    agrupado.set(l.productoId, g);
  }

  const items = [...agrupado.values()];

  return {
    empresa: {
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      logoUrl: empresa.logoUrl ?? null,
      firmaUrl: empresa.firmaUrl ?? null,
      responsableReporte: empresa.responsableReporte ?? null,
      cargoReporte: empresa.cargoReporte ?? null,
    },
    establecimiento: establecimiento?.nombre ?? "",
    establecimientoCodigo: establecimiento?.codigo ?? "",
    periodo: periodo?.anio ? String(periodo.anio) : new Date().getFullYear().toString(),
    fechaInforme: new Date(),
    items,
  };
}

export async function reporteStockPTOficial(input: {
  fechaCorte?: Date | string;
  periodoId?: string;
  establecimientoId?: string;
  productoId?: string;
  soloConStock?: boolean;
}) {
  const fechaCorte = input.fechaCorte instanceof Date
    ? input.fechaCorte
    : input.fechaCorte
      ? new Date(input.fechaCorte)
      : new Date();

  const [empresa, periodo, establecimiento, products, presentations] = await Promise.all([
    prisma.empresa.findFirst({ where: { activo: true }, orderBy: { createdAt: "asc" } }),
    input.periodoId ? prisma.periodo.findUnique({ where: { id: input.periodoId } }) : Promise.resolve(undefined),
    input.establecimientoId ? prisma.establecimiento.findUnique({ where: { id: input.establecimientoId } }) : (await prisma.establecimiento.findFirst({ where: { activo: true }, orderBy: { nombre: "asc" } })),
    prisma.producto.findMany({
      where: {
        tipoInventario: "PRODUCTO_TERMINADO",
        activo: true,
        ...(input.productoId ? { id: input.productoId } : {}),
      },
      include: { unidadMedida: { select: { nombre: true } } },
      orderBy: [{ codigo: "asc" }],
    }),
    prisma.presentacion.findMany({
      where: { activo: true, producto: { tipoInventario: "PRODUCTO_TERMINADO", activo: true } },
      include: { unidadMedida: { select: { nombre: true } }, producto: { select: { id: true } } },
    }),
  ]);

  if (!empresa) throw new Error("No hay una empresa activa configurada. Configúrela en Configuración.");

  const productIds = products.map((p) => p.id);

  const stockData = await prisma.movimientoProductoTerminado.groupBy({
    by: ["productoId", "presentacionId"],
    where: {
      productoId: { in: productIds },
      fecha: { lte: fechaCorte },
      ...(input.periodoId ? { periodoId: input.periodoId } : {}),
      ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}),
    },
    _sum: { entradaCan: true, salidaCan: true, entradaCostoTotal: true, salidaCostoTotal: true },
  });

  const pm = new Map(products.map((p) => [p.id, p]));
  const prmIdx = new Map(presentations.map((p) => [p.id, p]));
  const prmByProduct = new Map<string, Map<string, (typeof presentations)[number]>>();
  for (const pres of presentations) {
    const m = prmByProduct.get(pres.productoId) ?? new Map();
    m.set(pres.id, pres);
    prmByProduct.set(pres.productoId, m);
  }

  const items: Array<{
    productoId: string;
    presentacionId: string | null;
    descripcion: string;
    codigo: string;
    presentacion: string;
    unidad: string;
    stock: number;
    costoValorizado: number;
  }> = [];

  for (const p of products) {
    const pres = prmByProduct.get(p.id) ?? new Map();
    if (pres.size === 0) {
      const row = stockData.find((r) => r.productoId === p.id && r.presentacionId === null);
      const stock = Number(D(row?._sum?.entradaCan).sub(D(row?._sum?.salidaCan)));
      if (input.soloConStock && stock <= 0.000001) continue;
      items.push({
        productoId: p.id,
        presentacionId: null,
        descripcion: p.descripcion,
        codigo: p.codigo,
        presentacion: "SIN PRESENTACIÓN",
        unidad: p.unidadMedida?.nombre ?? "UND",
        stock,
        costoValorizado: Number(D(row?._sum?.entradaCostoTotal).sub(D(row?._sum?.salidaCostoTotal))),
      });
      continue;
    }
    for (const pr of pres.values()) {
      const row = stockData.find((r) => r.productoId === p.id && r.presentacionId === pr.id);
      const stock = Number(D(row?._sum?.entradaCan).sub(D(row?._sum?.salidaCan)));
      if (input.soloConStock && stock <= 0.000001) continue;
      items.push({
        productoId: p.id,
        presentacionId: pr.id,
        descripcion: p.descripcion,
        codigo: p.codigo,
        presentacion: pr.nombre,
        unidad: pr.unidadMedida?.nombre ?? p.unidadMedida?.nombre ?? "UND",
        stock,
        costoValorizado: Number(D(row?._sum?.entradaCostoTotal).sub(D(row?._sum?.salidaCostoTotal))),
      });
    }
  }

  items.sort((a, b) => (a.codigo < b.codigo ? -1 : a.codigo > b.codigo ? 1 : 0));

  return {
    empresa: {
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      logoUrl: empresa.logoUrl ?? null,
      firmaUrl: empresa.firmaUrl ?? null,
      responsableReporte: empresa.responsableReporte ?? null,
      cargoReporte: empresa.cargoReporte ?? null,
    },
    establecimiento: establecimiento?.nombre ?? "",
    establecimientoCodigo: establecimiento?.codigo ?? "",
    periodo: periodo?.anio ? String(periodo.anio) : new Date(fechaCorte).getFullYear().toString(),
    fechaInforme: fechaCorte,
    fechaCorte,
    items,
  };
}

export async function reporteStockContexto() {
  const [periodos, establecimientos] = await Promise.all([
    prisma.periodo.findMany({ where: { activo: true }, orderBy: { anio: "desc" }, select: { id: true, anio: true } }),
    prisma.establecimiento.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);
  return { periodos, establecimientos };
}

export async function reporteStockBase(input: { periodoId?: string; establecimientoId?: string }) {
  const rows = await prisma.movimientoBaseActiva.groupBy({
    by: ["productoId"],
    where: { ...(input.periodoId ? { periodoId: input.periodoId } : {}), ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}) },
    _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true, costoTotalEntrada: true, costoTotalSalida: true },
  });
  const products = await prisma.producto.findMany({ where: { id: { in: rows.map(r => r.productoId) } }, select: { id: true, codigo: true, descripcion: true, unidadMedida: { select: { nombre: true } } } });
  const map = new Map(products.map(p => [p.id, p]));
  return rows.map(r => ({ codigo: map.get(r.productoId)?.codigo ?? "", descripcion: map.get(r.productoId)?.descripcion ?? "", unidad: map.get(r.productoId)?.unidadMedida.nombre ?? "", entradasKg: s(r._sum?.entradaPesoTotalKg), salidasKg: s(r._sum?.salidaPesoTotalKg), stockKg: D(r._sum?.entradaPesoTotalKg).sub(D(r._sum?.salidaPesoTotalKg)).toString(), costoEntradas: s(r._sum?.costoTotalEntrada), costoSalidas: s(r._sum?.costoTotalSalida) }));
}

export async function reporteStockPT(input: { periodoId?: string; establecimientoId?: string }) {
  const rows = await prisma.movimientoProductoTerminado.groupBy({
    by: ["productoId", "presentacionId"],
    where: { ...(input.periodoId ? { periodoId: input.periodoId } : {}), ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}) },
    _sum: { entradaCan: true, salidaCan: true, entradaCostoTotal: true, salidaCostoTotal: true },
  });
  const ps = await prisma.producto.findMany({ where: { id: { in: [...new Set(rows.map(r => r.productoId))] } }, select: { id: true, codigo: true, descripcion: true } });
  const prs = await prisma.presentacion.findMany({ where: { id: { in: rows.flatMap(r => r.presentacionId ? [r.presentacionId] : []) } }, select: { id: true, nombre: true } });
  const pm = new Map(ps.map(p => [p.id, p])); const prm = new Map(prs.map(p => [p.id, p]));
  return rows.map(r => ({ codigo: pm.get(r.productoId)?.codigo ?? "", descripcion: pm.get(r.productoId)?.descripcion ?? "", presentacion: r.presentacionId ? prm.get(r.presentacionId)?.nombre ?? "" : "SIN PRESENTACIÓN", entradas: s(r._sum?.entradaCan), salidas: s(r._sum?.salidaCan), stock: D(r._sum?.entradaCan).sub(D(r._sum?.salidaCan)).toString(), costoEntradas: s(r._sum?.entradaCostoTotal), costoSalidas: s(r._sum?.salidaCostoTotal) }));
}

export async function reporteMovimientosBase(input: { productoId?: string; periodoId?: string; establecimientoId?: string; desde?: Date; hasta?: Date }) {
  const rows = await prisma.movimientoBaseActiva.findMany({ where: { ...(input.productoId ? { productoId: input.productoId } : {}), ...(input.periodoId ? { periodoId: input.periodoId } : {}), ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}), ...(input.desde || input.hasta ? { fecha: { ...(input.desde ? { gte: input.desde } : {}), ...(input.hasta ? { lte: input.hasta } : {}) } } : {}) }, orderBy: [{ fecha: "asc" }, { id: "asc" }], include: { producto: { select: { codigo: true, descripcion: true } }, lote: { select: { codigo: true } }, tipoOperacion: { select: { codigo: true, nombre: true } }, almacenamiento: { select: { nombre: true } } } });
  return rows.map(m => ({ fecha: m.fecha.toISOString(), codigo: m.producto.codigo, descripcion: m.producto.descripcion, lote: m.lote.codigo, operacion: m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "", almacenamiento: m.almacenamiento?.nombre ?? m.almacenamientoNombre ?? "", observacion: m.observacion ?? "", entradaKg: s(m.entradaPesoTotalKg), salidaKg: s(m.salidaPesoTotalKg), costoEntrada: s(m.costoTotalEntrada), costoSalida: s(m.costoTotalSalida) }));
}

export async function reporteMovimientosPT(input: { productoId?: string; presentacionId?: string; periodoId?: string; establecimientoId?: string; desde?: Date; hasta?: Date }) {
  const rows = await prisma.movimientoProductoTerminado.findMany({ where: { ...(input.productoId ? { productoId: input.productoId } : {}), ...(input.presentacionId ? { presentacionId: input.presentacionId } : {}), ...(input.periodoId ? { periodoId: input.periodoId } : {}), ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}), ...(input.desde || input.hasta ? { fecha: { ...(input.desde ? { gte: input.desde } : {}), ...(input.hasta ? { lte: input.hasta } : {}) } } : {}) }, orderBy: [{ fecha: "asc" }, { id: "asc" }], include: { producto: { select: { codigo: true, descripcion: true } }, presentacion: { select: { nombre: true } }, tipoOperacion: { select: { codigo: true, nombre: true } } } });
  return rows.map(m => ({ fecha: m.fecha.toISOString(), codigo: m.producto.codigo, descripcion: m.producto.descripcion, presentacion: m.presentacion?.nombre ?? "SIN PRESENTACIÓN", operacion: m.tipoOperacion?.nombre ?? m.tipoOperacion?.codigo ?? "", documento: [m.serie, m.numero].filter(Boolean).join("-"), motivo: m.motivo ?? "", observacion: m.observacion ?? "", entrada: s(m.entradaCan), salida: s(m.salidaCan), costoEntrada: s(m.entradaCostoTotal), costoSalida: s(m.salidaCostoTotal) }));
}

export async function resumenBaseActivaOficial(input: {
  productoId?: string;
  loteId?: string;
  establecimientoId?: string;
  periodoId?: string;
  fechaCorte?: Date | string;
  fechaDesde?: Date | string;
  fechaHasta?: Date | string;
  soloConStock?: boolean;
}) {
  const fechaHasta = input.fechaHasta instanceof Date
    ? input.fechaHasta
    : input.fechaHasta
      ? new Date(input.fechaHasta + "T23:59:59")
      : input.fechaCorte instanceof Date
        ? input.fechaCorte
        : input.fechaCorte
          ? new Date(input.fechaCorte)
          : new Date();
  const fechaDesde = input.fechaDesde instanceof Date
    ? input.fechaDesde
    : input.fechaDesde
      ? new Date(input.fechaDesde + "T00:00:00")
      : null;

  if (fechaDesde && fechaDesde > fechaHasta) {
    throw new Error("La fecha desde no puede ser mayor que la fecha hasta.");
  }

  const [empresa, productos, lotes] = await Promise.all([
    prisma.empresa.findFirst({ where: { activo: true }, orderBy: { createdAt: "asc" } }),
    prisma.producto.findMany({
      where: {
        tipoInventario: "BASE_ACTIVA",
        activo: true,
        ...(input.productoId ? { id: input.productoId } : {}),
      },
      select: { id: true, codigo: true, descripcion: true, observaciones: true },
      orderBy: [{ descripcion: "asc" }, { codigo: "asc" }],
    }),
    prisma.loteBaseActiva.findMany({
      where: {
        ...(input.productoId ? { productoId: input.productoId } : {}),
        ...(input.loteId ? { id: input.loteId } : {}),
      },
      select: { id: true, productoId: true, codigo: true, observaciones: true },
      orderBy: [{ codigo: "asc" }],
    }),
  ]);

  if (!empresa) throw new Error("No hay una empresa activa configurada. Configúrela en Configuración.");

  const loteIds = lotes.map((l) => l.id);
  const productIds = productos.map((p) => p.id);

  const movs = await prisma.movimientoBaseActiva.groupBy({
    by: ["productoId", "loteId"],
    where: {
      productoId: { in: productIds },
      ...(loteIds.length ? { loteId: { in: loteIds } } : {}),
      fecha: {
        ...(fechaDesde ? { gte: fechaDesde } : {}),
        lte: fechaHasta,
      },
      ...(input.establecimientoId ? { establecimientoId: input.establecimientoId } : {}),
      ...(input.periodoId ? { periodoId: input.periodoId } : {}),
    },
    _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true },
  });

  const movMap = new Map(movs.map((m) => [`${m.productoId}::${m.loteId}`, m]));

  const agrupado = new Map<string, {
    productoId: string;
    descripcion: string;
    codigo: string;
    observacion: string | null;
    lotes: Array<{ loteId: string; lote: string; stockKg: number; observacion: string | null }>;
    totalKg: number;
  }>();

  for (const p of productos) {
    if (!loteIds.length || lotes.some((l) => l.productoId === p.id)) {
      const pLotes = lotes.filter((l) => l.productoId === p.id);
      const g = {
        productoId: p.id,
        descripcion: p.descripcion,
        codigo: p.codigo,
        observacion: p.observaciones ?? null,
        lotes: [] as Array<{ loteId: string; lote: string; stockKg: number; observacion: string | null }>,
        totalKg: 0,
      };
      for (const l of pLotes) {
        const row = movMap.get(`${p.id}::${l.id}`);
        const stockKg = Number(D(row?._sum?.entradaPesoTotalKg).sub(D(row?._sum?.salidaPesoTotalKg)));
        if (input.soloConStock && stockKg <= 0.000001) continue;
        g.lotes.push({
          loteId: l.id,
          lote: l.codigo,
          stockKg,
          observacion: l.observaciones ?? null,
        });
        g.totalKg += stockKg;
      }
      agrupado.set(p.id, g);
    }
  }

  const items = [...agrupado.values()].filter((g) => g.codigo);

  return {
    empresa: {
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      logoUrl: empresa.logoUrl ?? null,
      firmaUrl: empresa.firmaUrl ?? null,
      responsableReporte: empresa.responsableReporte ?? null,
      cargoReporte: empresa.cargoReporte ?? null,
    },
    establecimiento: "",
    periodo: String(new Date(fechaHasta).getFullYear()),
    fechaCorte: fechaHasta,
    items,
    lotes,
  };
}

export async function reporteCapasPEPS(tipo: "BASE" | "PT") {
  if (tipo === "BASE") {
    const rows = await prisma.capaPEPSBase.findMany({ where: { cantidadKgRestante: { gt: 0 } }, orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }], include: { producto: { select: { codigo: true, descripcion: true } }, lote: { select: { codigo: true } } } });
    return rows.map(r => ({ codigo: r.producto.codigo, descripcion: r.producto.descripcion, lote: r.lote.codigo, fechaEntrada: r.fechaEntrada.toISOString(), inicial: s(r.cantidadKgInicial), restante: s(r.cantidadKgRestante), costoUnitario: s(r.costoUnitarioKg) }));
  }
  const rows = await prisma.capaPEPSPT.findMany({ where: { cantidadRestante: { gt: 0 } }, orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }], include: { producto: { select: { codigo: true, descripcion: true } }, presentacion: { select: { nombre: true } } } });
  return rows.map(r => ({ codigo: r.producto.codigo, descripcion: r.producto.descripcion, presentacion: r.presentacion?.nombre ?? "SIN PRESENTACIÓN", fechaEntrada: r.fechaEntrada.toISOString(), inicial: s(r.cantidadInicial), restante: s(r.cantidadRestante), costoUnitario: s(r.costoUnitario) }));
}
