import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { MovimientoPTInput } from "@/lib/validators/producto-terminado.schema";

const D = (v: Prisma.Decimal | number | string | null | undefined) => new Prisma.Decimal(v ?? 0);
const s = (v: Prisma.Decimal | null | undefined) => D(v).toString();
const clean = (v?: string | null) => v?.trim() || null;

function plainify<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "object" && v !== null && typeof v.toNumber === "function" ? v.toNumber() : v,
    ),
  );
}

export async function getProductoTerminadoView(periodoId?: string) {
  const [productos, presentaciones, periodos, establecimientos, operaciones, movimientos, stockData] = await Promise.all([
    prisma.producto.findMany({ where: { tipoInventario: "PRODUCTO_TERMINADO", activo: true }, include: { unidadMedida: true }, orderBy: [{ codigo: "asc" }] }),
    prisma.presentacion.findMany({ where: { activo: true, producto: { tipoInventario: "PRODUCTO_TERMINADO", activo: true } }, include: { unidadMedida: true }, orderBy: { nombre: "asc" } }),
    prisma.periodo.findMany({ where: { activo: true }, orderBy: { anio: "desc" } }),
    prisma.establecimiento.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.tipoOperacion.findMany({ where: { activo: true }, orderBy: { codigo: "asc" } }),
    prisma.movimientoProductoTerminado.findMany({
      where: periodoId ? { periodoId } : undefined,
      include: { producto: true, presentacion: { include: { unidadMedida: true } }, periodo: true, establecimiento: true, tipoOperacion: true },
      orderBy: [{ fecha: "desc" }, { id: "desc" }], take: 300,
    }),
    prisma.movimientoProductoTerminado.groupBy({
      by: ["productoId", "presentacionId"],
      _sum: { entradaCan: true, salidaCan: true, entradaCostoTotal: true, salidaCostoTotal: true },
    }),
  ]);

  const stockMap = new Map<string, number>();
  const costoMap = new Map<string, number>();
  for (const row of stockData) {
    const key = `${row.productoId}::${row.presentacionId ?? ""}`;
    const stock = D(row._sum?.entradaCan).sub(D(row._sum?.salidaCan)).toNumber();
    const costo = D(row._sum?.entradaCostoTotal).sub(D(row._sum?.salidaCostoTotal)).toNumber();
    stockMap.set(key, (stockMap.get(key) ?? 0) + stock);
    costoMap.set(key, (costoMap.get(key) ?? 0) + costo);
  }

  const stockPT = productos.map((p) => {
    const pres = presentaciones.filter((pr) => pr.productoId === p.id);
    if (pres.length === 0) {
      const key = `${p.id}::`;
      return { productoId: p.id, presentacionId: null, codigo: p.codigo, descripcion: p.descripcion, presentacion: "SIN PRESENTACIÓN", stock: stockMap.get(key) ?? 0, costoValorizado: costoMap.get(key) ?? 0, unidad: p.unidadMedida?.nombre ?? "UND" };
    }
    return pres.map((pr) => {
      const key = `${p.id}::${pr.id}`;
      return { productoId: p.id, presentacionId: pr.id, codigo: p.codigo, descripcion: p.descripcion, presentacion: pr.nombre, stock: stockMap.get(key) ?? 0, costoValorizado: costoMap.get(key) ?? 0, unidad: pr.unidadMedida?.nombre ?? p.unidadMedida?.nombre ?? "UND" };
    });
  }).flat();

  const totalEntradas = movimientos.filter((m) => m.tipoMovimiento === "ENTRADA").reduce((sum, m) => sum + Number(m.entradaCan), 0);
  const totalSalidas = movimientos.filter((m) => m.tipoMovimiento === "SALIDA").reduce((sum, m) => sum + Number(m.salidaCan), 0);
  const stockActual = stockPT.reduce((sum, s) => sum + s.stock, 0);
  const costoValorizadoTotal = stockPT.reduce((sum, s) => sum + s.costoValorizado, 0);

  const resumenPT = stockPT.filter((s) => s.stock > 0.000001);

  const allChrono = await prisma.movimientoProductoTerminado.findMany({
    where: periodoId ? { periodoId } : undefined,
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
    select: { id: true, productoId: true, presentacionId: true, tipoMovimiento: true, entradaCan: true, salidaCan: true, entradaCostoTotal: true, salidaCostoTotal: true },
  });
  const saldoPorMov = new Map<string, { saldoCan: number; costoUnitarioSaldo: number; costoTotalSaldo: number }>();
  const acum = new Map<string, { can: number; costo: number }>();
  const acumCapas = new Map<string, Array<{ restante: number; costo: number }>>();
  for (const m of allChrono) {
    const key = `${m.productoId}::${m.presentacionId ?? ""}`;
    const cur = acum.get(key) ?? { can: 0, costo: 0 };
    const capas = acumCapas.get(key) ?? [];
    if (m.tipoMovimiento === "ENTRADA") {
      const can = Number(m.entradaCan);
      const costoT = Number(m.entradaCostoTotal);
      cur.can += can;
      cur.costo += costoT;
      capas.push({ restante: can, costo: can > 0 ? costoT / can : 0 });
    } else {
      let pendiente = Number(m.salidaCan);
      let costoSale = 0;
      for (const capa of capas) {
        if (pendiente <= 0) break;
        const aplicado = Math.min(pendiente, capa.restante);
        costoSale += aplicado * capa.costo;
        capa.restante -= aplicado;
        pendiente -= aplicado;
      }
      cur.can -= Number(m.salidaCan);
      cur.costo -= costoSale;
    }
    acum.set(key, cur);
    acumCapas.set(key, capas.filter((c) => c.restante > 0));
    const saldoCan = cur.can;
    const costoTotalSaldo = cur.costo;
    saldoPorMov.set(m.id, {
      saldoCan,
      costoUnitarioSaldo: saldoCan > 0 ? costoTotalSaldo / saldoCan : 0,
      costoTotalSaldo,
    });
  }

  const movimientosConSaldo = movimientos.map((m) => {
    const s = saldoPorMov.get(m.id);
    return {
      ...m,
      saldo: s?.saldoCan ?? 0,
      costoUnitarioSaldo: s?.costoUnitarioSaldo ?? 0,
      costoTotalSaldo: s?.costoTotalSaldo ?? 0,
    };
  });

  return plainify({ productos, presentaciones, periodos, establecimientos, operaciones, movimientos: movimientosConSaldo, stockPT, resumenPT, resumen: { totalEntradas, totalSalidas, stockActual, costoValorizadoTotal } });
}

export async function getCuadroResumenPT() {
  const stockData = await prisma.movimientoProductoTerminado.groupBy({
    by: ["productoId", "presentacionId"],
    _sum: { entradaCan: true, salidaCan: true },
  });

  const productIds = [...new Set(stockData.map((r) => r.productoId))];
  const products = await prisma.producto.findMany({
    where: { id: { in: productIds } },
    select: { id: true, codigo: true, descripcion: true },
  });

  const presIds = stockData.filter((r) => r.presentacionId).map((r) => r.presentacionId!);
  const presentations = await prisma.presentacion.findMany({
    where: { id: { in: [...new Set(presIds)] } },
    select: { id: true, nombre: true, productoId: true },
  });

  const pm = new Map(products.map((p) => [p.id, p]));
  const prm = new Map(presentations.map((p) => [p.id, p]));

  const items = stockData.map((r) => {
    const stock = D(r._sum?.entradaCan).sub(D(r._sum?.salidaCan)).toNumber();
    const prod = pm.get(r.productoId);
    const pres = r.presentacionId ? prm.get(r.presentacionId) : null;
    return {
      codigo: prod?.codigo ?? "",
      descripcion: prod?.descripcion ?? "",
      presentacion: pres?.nombre ?? "SIN PRESENTACIÓN",
      stock,
      observaciones: prod?.descripcion ?? "",
    };
  }).filter((item) => item.stock > 0.000001);

  return items;
}

export async function getStockProductoPT(productoId: string, presentacionId?: string | null) {
  const capas = await prisma.capaPEPSPT.findMany({
    where: {
      productoId,
      presentacionId: presentacionId ?? null,
      cantidadRestante: { gt: 0 },
    },
  });
  const stock = capas.reduce((sum, c) => sum + Number(c.cantidadRestante), 0);
  const costoValorizado = capas.reduce((sum, c) => sum + Number(c.cantidadRestante) * Number(c.costoUnitario), 0);
  return { stock, costoValorizado };
}

export async function createMovimientoPT(input: MovimientoPTInput, usuarioId?: string | null) {
  if (input.tipoMovimiento === "SALIDA" && !input.motivo) throw new Error("Las salidas de Producto Terminado requieren motivo: PRODUCCION, VENTA o ENSAYO.");

  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findFirst({ where: { id: input.productoId, tipoInventario: "PRODUCTO_TERMINADO", activo: true } });
    if (!producto) throw new Error("El producto seleccionado no es un Producto Terminado activo.");

    if (input.presentacionId) {
      const p = await tx.presentacion.findFirst({ where: { id: input.presentacionId, productoId: input.productoId, activo: true } });
      if (!p) throw new Error("La presentación no pertenece al producto seleccionado.");
    }

    const isEntry = input.tipoMovimiento === "ENTRADA";

    if (!isEntry) {
      const capas = await tx.capaPEPSPT.findMany({
        where: { productoId: input.productoId, presentacionId: input.presentacionId ?? null, cantidadRestante: { gt: 0 } },
        orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }],
      });
      const totalDisponible = capas.reduce((sum, c) => sum + Number(c.cantidadRestante), 0);
      if (input.cantidad > totalDisponible + 1e-9) {
        throw new Error(`Stock insuficiente. Disponible: ${totalDisponible.toFixed(6)} unidades.`);
      }
    }

    const movement = await tx.movimientoProductoTerminado.create({
      data: {
        periodoId: input.periodoId,
        establecimientoId: input.establecimientoId,
        productoId: input.productoId,
        presentacionId: input.presentacionId ?? null,
        usuarioId: usuarioId ?? null,
        tipoOperacionId: input.tipoOperacionId ?? null,
        fecha: input.fecha,
        tipoMovimiento: input.tipoMovimiento,
        documentoTraslado: clean(input.documentoTraslado),
        serie: clean(input.serie),
        numero: clean(input.numero),
        observacion: clean(input.observacion),
        responsableDespacho: clean(input.responsableDespacho),
        entradaCan: isEntry ? input.cantidad : 0,
        entradaCostoUnitario: isEntry ? input.costoUnitario : 0,
        entradaCostoTotal: isEntry ? input.cantidad * input.costoUnitario : 0,
        salidaCan: isEntry ? 0 : input.cantidad,
        salidaCostoUnitario: 0,
        salidaCostoTotal: 0,
        motivo: input.motivo ?? null,
        facturaGuia: clean(input.facturaGuia),
        empresaDestino: clean(input.empresaDestino),
        ingCampo: clean(input.ingCampo),
      },
    });

    if (isEntry) {
      await tx.capaPEPSPT.create({
        data: {
          productoId: input.productoId,
          presentacionId: input.presentacionId ?? null,
          movimientoEntradaId: movement.id,
          fechaEntrada: input.fecha,
          cantidadInicial: input.cantidad,
          cantidadRestante: input.cantidad,
          costoUnitario: input.costoUnitario,
        },
      });
    } else {
      let pendiente = D(input.cantidad);
      const capas = await tx.capaPEPSPT.findMany({
        where: { productoId: input.productoId, presentacionId: input.presentacionId ?? null, cantidadRestante: { gt: 0 } },
        orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }],
      });

      let costoTotalSalida = D(0);
      for (const capa of capas) {
        if (pendiente.lte(0)) break;
        const aplicado = Prisma.Decimal.min(pendiente, capa.cantidadRestante);
        const costo = aplicado.mul(capa.costoUnitario);

        await tx.aplicacionPEPSPT.create({
          data: {
            movimientoSalidaId: movement.id,
            capaId: capa.id,
            cantidad: aplicado,
            costoUnitario: capa.costoUnitario,
            costoTotal: costo,
          },
        });

        await tx.capaPEPSPT.update({
          where: { id: capa.id },
          data: { cantidadRestante: capa.cantidadRestante.minus(aplicado) },
        });

        costoTotalSalida = costoTotalSalida.plus(costo);
        pendiente = pendiente.minus(aplicado);
      }

      const costoUnitarioSalida = input.cantidad > 0 ? costoTotalSalida.div(D(input.cantidad)) : D(0);
      await tx.movimientoProductoTerminado.update({
        where: { id: movement.id },
        data: {
          salidaCostoUnitario: costoUnitarioSalida,
          salidaCostoTotal: costoTotalSalida,
        },
      });
    }

    return movement;
  });
}

export async function eliminarMovimientoPTService(movimientoId: string) {
  return prisma.$transaction(async (tx) => {
    const movimiento = await tx.movimientoProductoTerminado.findUniqueOrThrow({
      where: { id: movimientoId },
      select: { productoId: true, tipoMovimiento: true },
    });

    await tx.aplicacionPEPSPT.deleteMany({
      where: { movimientoSalidaId: movimientoId },
    });

    const capa = await tx.capaPEPSPT.findFirst({
      where: { movimientoEntradaId: movimientoId },
      select: { id: true },
    });
    if (capa) {
      await tx.aplicacionPEPSPT.deleteMany({ where: { capaId: capa.id } });
      await tx.capaPEPSPT.delete({ where: { id: capa.id } });
    }

    await tx.movimientoProductoTerminado.delete({ where: { id: movimientoId } });

    return { ok: true };
  });
}

export async function actualizarMovimientoPTService(
  movimientoId: string,
  input: MovimientoPTInput,
) {
  if (input.tipoMovimiento === "SALIDA" && !input.motivo)
    throw new Error("Las salidas de Producto Terminado requieren motivo: PRODUCCION, VENTA o ENSAYO.");

  return prisma.$transaction(async (tx) => {
    const existente = await tx.movimientoProductoTerminado.findUniqueOrThrow({
      where: { id: movimientoId },
      select: { productoId: true, presentacionId: true, tipoMovimiento: true },
    });

    const producto = await tx.producto.findFirst({
      where: { id: input.productoId, tipoInventario: "PRODUCTO_TERMINADO", activo: true },
    });
    if (!producto) throw new Error("El producto seleccionado no es un Producto Terminado activo.");

    if (input.presentacionId) {
      const p = await tx.presentacion.findFirst({
        where: { id: input.presentacionId, productoId: input.productoId, activo: true },
      });
      if (!p) throw new Error("La presentación no pertenece al producto seleccionado.");
    }

    const isEntry = input.tipoMovimiento === "ENTRADA";

    if (!isEntry) {
      const capas = await tx.capaPEPSPT.findMany({
        where: {
          productoId: input.productoId,
          presentacionId: input.presentacionId ?? null,
          cantidadRestante: { gt: 0 },
          movimientoEntradaId: { not: movimientoId },
        },
        orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }],
      });
      const totalDisponible = capas.reduce((sum, c) => sum + Number(c.cantidadRestante), 0);
      if (input.cantidad > totalDisponible + 1e-9) {
        throw new Error(`Stock insuficiente. Disponible: ${totalDisponible.toFixed(6)} unidades.`);
      }
    }

    // Revertir efecto del movimiento original
    if (existente.tipoMovimiento === "ENTRADA") {
      const capaOld = await tx.capaPEPSPT.findFirst({
        where: { movimientoEntradaId: movimientoId },
      });
      if (capaOld) {
        await tx.aplicacionPEPSPT.deleteMany({ where: { capaId: capaOld.id } });
        await tx.capaPEPSPT.delete({ where: { id: capaOld.id } });
      }
    } else {
      await tx.aplicacionPEPSPT.deleteMany({ where: { movimientoSalidaId: movimientoId } });
    }

    // Actualizar el movimiento
    await tx.movimientoProductoTerminado.update({
      where: { id: movimientoId },
      data: {
        periodoId: input.periodoId,
        establecimientoId: input.establecimientoId,
        productoId: input.productoId,
        presentacionId: input.presentacionId ?? null,
        tipoOperacionId: input.tipoOperacionId ?? null,
        fecha: input.fecha,
        tipoMovimiento: input.tipoMovimiento,
        documentoTraslado: clean(input.documentoTraslado),
        serie: clean(input.serie),
        numero: clean(input.numero),
        observacion: clean(input.observacion),
        responsableDespacho: clean(input.responsableDespacho),
        entradaCan: isEntry ? input.cantidad : 0,
        entradaCostoUnitario: isEntry ? input.costoUnitario : 0,
        entradaCostoTotal: isEntry ? input.cantidad * input.costoUnitario : 0,
        salidaCan: isEntry ? 0 : input.cantidad,
        salidaCostoUnitario: 0,
        salidaCostoTotal: 0,
        motivo: input.motivo ?? null,
        facturaGuia: clean(input.facturaGuia),
        empresaDestino: clean(input.empresaDestino),
        ingCampo: clean(input.ingCampo),
      },
    });

    // Re-aplicar efecto PEPS
    if (isEntry) {
      await tx.capaPEPSPT.create({
        data: {
          productoId: input.productoId,
          presentacionId: input.presentacionId ?? null,
          movimientoEntradaId: movimientoId,
          fechaEntrada: input.fecha,
          cantidadInicial: input.cantidad,
          cantidadRestante: input.cantidad,
          costoUnitario: input.costoUnitario,
        },
      });
    } else {
      let pendiente = D(input.cantidad);
      const capas = await tx.capaPEPSPT.findMany({
        where: {
          productoId: input.productoId,
          presentacionId: input.presentacionId ?? null,
          cantidadRestante: { gt: 0 },
        },
        orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }],
      });

      let costoTotalSalida = D(0);
      for (const capa of capas) {
        if (pendiente.lte(0)) break;
        const aplicado = Prisma.Decimal.min(pendiente, capa.cantidadRestante);
        const costo = aplicado.mul(capa.costoUnitario);

        await tx.aplicacionPEPSPT.create({
          data: {
            movimientoSalidaId: movimientoId,
            capaId: capa.id,
            cantidad: aplicado,
            costoUnitario: capa.costoUnitario,
            costoTotal: costo,
          },
        });

        await tx.capaPEPSPT.update({
          where: { id: capa.id },
          data: { cantidadRestante: capa.cantidadRestante.minus(aplicado) },
        });

        costoTotalSalida = costoTotalSalida.plus(costo);
        pendiente = pendiente.minus(aplicado);
      }

      const costoUnitarioSalida = input.cantidad > 0 ? costoTotalSalida.div(D(input.cantidad)) : D(0);
      await tx.movimientoProductoTerminado.update({
        where: { id: movimientoId },
        data: {
          salidaCostoUnitario: costoUnitarioSalida,
          salidaCostoTotal: costoTotalSalida,
        },
      });
    }

    return { ok: true };
  });
}
