import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const D = Prisma.Decimal;
const ZERO = new D(0);

function positive(value: Prisma.Decimal | null | undefined) {
  return value != null && value.gt(ZERO);
}

function decimal(value: Prisma.Decimal | null | undefined) {
  return value ?? ZERO;
}

function costoUnitario(
  unitario: Prisma.Decimal | null | undefined,
  total: Prisma.Decimal | null | undefined,
  cantidad: Prisma.Decimal,
) {
  if (positive(unitario)) return unitario!;
  if (positive(total) && cantidad.gt(ZERO)) return total!.div(cantidad);
  return ZERO;
}

export async function rebuildBaseTx(tx: Prisma.TransactionClient, productoId: string) {
  await tx.aplicacionPEPSBase.deleteMany({ where: { capa: { productoId } } });
  await tx.capaPEPSBase.deleteMany({ where: { productoId } });

  const movimientos = await tx.movimientoBaseActiva.findMany({
    where: { productoId },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
  });

  const capas: Array<{
    id: string;
    movimientoEntradaId: string;
    fechaEntrada: Date;
    cantidadKgRestante: Prisma.Decimal;
    costoUnitarioKg: Prisma.Decimal;
  }> = [];

  let salidasProcesadas = 0;
  let costoSalidas = ZERO;

  for (const mov of movimientos) {
    if (mov.tipoMovimiento === "ENTRADA") {
      const cantidad = positive(mov.entradaPesoTotalKg)
        ? mov.entradaPesoTotalKg
        : mov.entradaPesoKg;
      if (!positive(cantidad)) continue;

      const costo = costoUnitario(
        mov.costoUnitarioKg,
        mov.costoTotalEntrada,
        cantidad,
      );

      const capa = await tx.capaPEPSBase.create({
        data: {
          productoId,
          loteId: mov.loteId,
          movimientoEntradaId: mov.id,
          fechaEntrada: mov.fecha,
          cantidadKgInicial: cantidad,
          cantidadKgRestante: cantidad,
          costoUnitarioKg: costo,
        },
      });

      capas.push({
        id: capa.id,
        movimientoEntradaId: mov.id,
        fechaEntrada: mov.fecha,
        cantidadKgRestante: cantidad,
        costoUnitarioKg: costo,
      });
      continue;
    }

    let pendiente = decimal(mov.salidaPesoTotalKg);
    if (!positive(pendiente)) continue;

    const disponibles = capas.filter((c) => c.cantidadKgRestante.gt(ZERO));
    const totalDisponible = disponibles.reduce(
      (sum, c) => sum.plus(c.cantidadKgRestante),
      ZERO,
    );

    if (totalDisponible.lt(pendiente)) {
      throw new Error(
        `PEPS Base Activa: stock insuficiente para la salida #${mov.id}. Requerido ${pendiente.toString()} Kg, disponible ${totalDisponible.toString()} Kg.`,
      );
    }

    let costoTotal = ZERO;
    for (const capa of disponibles) {
      if (!positive(pendiente)) break;
      const aplicado = Prisma.Decimal.min(pendiente, capa.cantidadKgRestante);
      const costo = capa.costoUnitarioKg;
      const total = aplicado.mul(costo);

      await tx.aplicacionPEPSBase.create({
        data: {
          movimientoSalidaId: mov.id,
          capaId: capa.id,
          cantidadKg: aplicado,
          costoUnitarioKg: costo,
          costoTotal: total,
        },
      });

      capa.cantidadKgRestante = capa.cantidadKgRestante.minus(aplicado);
      costoTotal = costoTotal.plus(total);
      pendiente = pendiente.minus(aplicado);
    }

    const costoPromedio = costoTotal.div(decimal(mov.salidaPesoTotalKg));
    await tx.movimientoBaseActiva.update({
      where: { id: mov.id },
      data: {
        costoTotalSalida: costoTotal,
        salidaPesoUnitarioKg: costoPromedio,
      },
    });

    salidasProcesadas += 1;
    costoSalidas = costoSalidas.plus(costoTotal);

    for (const capa of disponibles) {
      await tx.capaPEPSBase.update({
        where: { id: capa.id },
        data: { cantidadKgRestante: capa.cantidadKgRestante },
      });
    }
  }

  return {
    movimientos: movimientos.length,
    salidasProcesadas,
    costoSalidas,
    capas: capas.length,
    stock: capas.reduce((sum, c) => sum.plus(c.cantidadKgRestante), ZERO),
  };
}

async function rebuildPTTx(
  tx: Prisma.TransactionClient,
  productoId: string,
  presentacionId: string | null,
) {
  await tx.aplicacionPEPSPT.deleteMany({
    where: { capa: { productoId, presentacionId } },
  });
  await tx.capaPEPSPT.deleteMany({
    where: { productoId, presentacionId },
  });

  const movimientos = await tx.movimientoProductoTerminado.findMany({
    where: { productoId, presentacionId },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
  });

  const capas: Array<{
    id: string;
    movimientoEntradaId: string;
    fechaEntrada: Date;
    cantidadRestante: Prisma.Decimal;
    costoUnitario: Prisma.Decimal;
  }> = [];

  let salidasProcesadas = 0;
  let costoSalidas = ZERO;

  for (const mov of movimientos) {
    if (mov.tipoMovimiento === "ENTRADA") {
      const cantidad = decimal(mov.entradaCan);
      if (!positive(cantidad)) continue;
      const costo = costoUnitario(
        mov.entradaCostoUnitario,
        mov.entradaCostoTotal,
        cantidad,
      );

      const capa = await tx.capaPEPSPT.create({
        data: {
          productoId,
          presentacionId,
          movimientoEntradaId: mov.id,
          fechaEntrada: mov.fecha,
          cantidadInicial: cantidad,
          cantidadRestante: cantidad,
          costoUnitario: costo,
        },
      });

      capas.push({
        id: capa.id,
        movimientoEntradaId: mov.id,
        fechaEntrada: mov.fecha,
        cantidadRestante: cantidad,
        costoUnitario: costo,
      });
      continue;
    }

    let pendiente = decimal(mov.salidaCan);
    if (!positive(pendiente)) continue;

    const disponibles = capas.filter((c) => c.cantidadRestante.gt(ZERO));
    const totalDisponible = disponibles.reduce(
      (sum, c) => sum.plus(c.cantidadRestante),
      ZERO,
    );

    if (totalDisponible.lt(pendiente)) {
      throw new Error(
        `PEPS Producto Terminado: stock insuficiente para la salida #${mov.id}. Requerido ${pendiente.toString()}, disponible ${totalDisponible.toString()}.`,
      );
    }

    let costoTotal = ZERO;
    for (const capa of disponibles) {
      if (!positive(pendiente)) break;
      const aplicado = Prisma.Decimal.min(pendiente, capa.cantidadRestante);
      const total = aplicado.mul(capa.costoUnitario);

      await tx.aplicacionPEPSPT.create({
        data: {
          movimientoSalidaId: mov.id,
          capaId: capa.id,
          cantidad: aplicado,
          costoUnitario: capa.costoUnitario,
          costoTotal: total,
        },
      });

      capa.cantidadRestante = capa.cantidadRestante.minus(aplicado);
      costoTotal = costoTotal.plus(total);
      pendiente = pendiente.minus(aplicado);
    }

    const costoPromedio = costoTotal.div(decimal(mov.salidaCan));
    await tx.movimientoProductoTerminado.update({
      where: { id: mov.id },
      data: {
        salidaCostoTotal: costoTotal,
        salidaCostoUnitario: costoPromedio,
      },
    });

    salidasProcesadas += 1;
    costoSalidas = costoSalidas.plus(costoTotal);

    for (const capa of disponibles) {
      await tx.capaPEPSPT.update({
        where: { id: capa.id },
        data: { cantidadRestante: capa.cantidadRestante },
      });
    }
  }

  return {
    movimientos: movimientos.length,
    salidasProcesadas,
    costoSalidas,
    capas: capas.length,
    stock: capas.reduce((sum, c) => sum.plus(c.cantidadRestante), ZERO),
  };
}

export async function reconstruirPEPSBaseService(productoId: string) {
  return prisma.$transaction(
    (tx) => rebuildBaseTx(tx, productoId),
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function reconstruirPEPSPTService(productoId: string) {
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { tipoInventario: true, presentacion: { select: { id: true } } },
  });
  if (!producto || producto.tipoInventario !== "PRODUCTO_TERMINADO") {
    throw new Error("El producto seleccionado no es Producto Terminado.");
  }
  const presentacionId = producto.presentacion?.id ?? null;

  return prisma.$transaction(
    (tx) => rebuildPTTx(tx, productoId, presentacionId),
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function obtenerResumenPEPSService() {
  const [productosBase, productosPT, capasBase, capasPT, salidasBase, salidasPT] =
    await Promise.all([
      prisma.producto.count({ where: { tipoInventario: "BASE_ACTIVA", activo: true } }),
      prisma.producto.count({ where: { tipoInventario: "PRODUCTO_TERMINADO", activo: true } }),
      prisma.capaPEPSBase.findMany({
        where: { cantidadKgRestante: { gt: ZERO } },
        include: { producto: true, lote: true },
        orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }],
        take: 100,
      }),
      prisma.capaPEPSPT.findMany({
        where: { cantidadRestante: { gt: ZERO } },
        include: { producto: true, presentacion: true },
        orderBy: [{ fechaEntrada: "asc" }, { id: "asc" }],
        take: 100,
      }),
      prisma.movimientoBaseActiva.count({ where: { tipoMovimiento: "SALIDA" } }),
      prisma.movimientoProductoTerminado.count({ where: { tipoMovimiento: "SALIDA" } }),
    ]);

  return {
    productosBase,
    productosPT,
    salidasBase,
    salidasPT,
    capasBase: capasBase.map((c) => ({
      id: c.id,
      producto: c.producto.codigo,
      descripcion: c.producto.descripcion,
      lote: c.lote.codigo,
      fecha: c.fechaEntrada,
      cantidad: c.cantidadKgRestante.toString(),
      costo: c.costoUnitarioKg?.toString() ?? "0",
    })),
    capasPT: capasPT.map((c) => ({
      id: c.id,
      producto: c.producto.codigo,
      descripcion: c.producto.descripcion,
      presentacion: c.presentacion?.nombre ?? "Sin presentación",
      fecha: c.fechaEntrada,
      cantidad: c.cantidadRestante.toString(),
      costo: c.costoUnitario.toString(),
    })),
  };
}

export async function obtenerProductosPEPSService() {
  return prisma.producto.findMany({
    where: { activo: true },
    select: {
      id: true,
      codigo: true,
      descripcion: true,
      tipoInventario: true,
      presentacion: { select: { id: true, nombre: true } },
    },
    orderBy: [{ tipoInventario: "asc" }, { codigo: "asc" }],
  });
}
