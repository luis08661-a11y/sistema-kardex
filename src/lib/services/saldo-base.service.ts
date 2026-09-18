import { Prisma } from "@prisma/client";

const D = Prisma.Decimal;
const ZERO = new D(0);

type MovimientoSaldos = {
  id: string;
  tipoMovimiento: string;
  entradaUnd: Prisma.Decimal;
  entradaPesoTotalKg: Prisma.Decimal;
  salidaUnd: Prisma.Decimal;
  salidaPesoTotalKg: Prisma.Decimal;
  saldoUnd: Prisma.Decimal;
  saldoPesoUnitarioKg: Prisma.Decimal;
  saldoTotalKg: Prisma.Decimal;
};

/**
 * Recalcula los campos de saldo (saldoUnd, saldoPesoUnitarioKg, saldoTotalKg)
 * de todos los movimientos del lote, en orden cronológico (fecha, id).
 * Actualiza solo las filas cuyo saldo cambió.
 */
export async function recalcularSaldosLoteTx(
  tx: Prisma.TransactionClient,
  loteId: string,
) {
  const movimientos: MovimientoSaldos[] = await tx.movimientoBaseActiva.findMany({
    where: { loteId },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
    select: {
      id: true,
      tipoMovimiento: true,
      entradaUnd: true,
      entradaPesoTotalKg: true,
      salidaUnd: true,
      salidaPesoTotalKg: true,
      saldoUnd: true,
      saldoPesoUnitarioKg: true,
      saldoTotalKg: true,
    },
  });

  let saldoUnd = ZERO;
  let saldoPeso = ZERO;

  for (const mov of movimientos) {
    saldoUnd = saldoUnd.plus(mov.entradaUnd ?? ZERO).minus(mov.salidaUnd ?? ZERO);
    saldoPeso = saldoPeso
      .plus(mov.entradaPesoTotalKg ?? ZERO)
      .minus(mov.salidaPesoTotalKg ?? ZERO);

    const saldoUnitario =
      saldoUnd.gt(ZERO) && saldoPeso.gt(ZERO) ? saldoPeso.div(saldoUnd) : ZERO;

    if (
      !mov.saldoUnd.eq(saldoUnd) ||
      !mov.saldoPesoUnitarioKg.eq(saldoUnitario) ||
      !mov.saldoTotalKg.eq(saldoPeso)
    ) {
      await tx.movimientoBaseActiva.update({
        where: { id: mov.id },
        data: {
          saldoUnd,
          saldoPesoUnitarioKg: saldoUnitario,
          saldoTotalKg: saldoPeso,
        },
      });
    }
  }
}

/**
 * Recalcula los saldos de todos los lotes de un producto Base Activa.
 */
export async function recalcularSaldosProductoTx(
  tx: Prisma.TransactionClient,
  productoId: string,
) {
  const lotes = await tx.loteBaseActiva.findMany({
    where: { productoId },
    select: { id: true },
  });
  for (const lote of lotes) {
    await recalcularSaldosLoteTx(tx, lote.id);
  }
}
