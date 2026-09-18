import { prisma } from "@/lib/db/prisma";
import { Prisma, TipoMovimiento } from "@prisma/client";
import type { RegistroInventarioInput } from "@/lib/validators/inventory.schema";
import { rebuildBaseTx } from "@/lib/services/peps.service";
import { recalcularSaldosProductoTx } from "@/lib/services/saldo-base.service";

function fechaLocal(fecha: string): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function formatearFechaLocal(f: Date): string {
  const m = String(f.getMonth() + 1).padStart(2, "0");
  const d = String(f.getDate()).padStart(2, "0");
  return `${f.getFullYear()}-${m}-${d}`;
}

export interface KardexRow {
  id: string;
  fecha: string;
  codigo: string;
  descripcion: string;
  observacion: string;
  responsable_del_registro: string;
  tipo_operacion: string;
  operacion_codigo: string;

  entrada_und: number;
  entrada_peso_kg: number;
  entrada_peso_total: number;

  salida_und: number;
  salida_peso_unitario: number;
  salida_peso_total: number;

  saldo_und: number;
  saldo_peso_kg: number;
  saldo_peso_total: number;

  motivo_salida_formulacion: string | null;
  responsable_formulacion: string | null;
  cantidad_producto_formulado: number | null;
  almacenamiento: string | null;
}

interface MovimientoConRelaciones {
  id: string;
  fecha: Date;
  tipoMovimiento: TipoMovimiento;
  observacion: string | null;
  responsableRegistro: string | null;
  entradaUnd: Prisma.Decimal;
  entradaPesoKg: Prisma.Decimal;
  entradaPesoTotalKg: Prisma.Decimal;
  salidaUnd: Prisma.Decimal;
  salidaPesoUnitarioKg: Prisma.Decimal;
  salidaPesoTotalKg: Prisma.Decimal;
  formulacion: string | null;
  responsableFormulacion: string | null;
  cantidadProductoFormulado: Prisma.Decimal | null;
  almacenamientoNombre: string | null;
  producto: { codigo: string; descripcion: string };
  lote: { codigo: string };
  tipoOperacion: { codigo: string; nombre: string } | null;
}

async function fetchMovimientosBase(where?: Prisma.MovimientoBaseActivaWhereInput) {
  return prisma.movimientoBaseActiva.findMany({
    where,
    include: {
      producto: { select: { codigo: true, descripcion: true } },
      lote: { select: { codigo: true } },
      tipoOperacion: { select: { codigo: true, nombre: true } },
    },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
  });
}

function num(v: Prisma.Decimal | null | undefined) {
  return Number(v ?? 0);
}

function mapearFila(r: MovimientoConRelaciones, saldoUnd: number, saldoPeso: number): KardexRow {
  const esInvInicial = r.tipoOperacion?.codigo === "INVENTARIO_INICIAL";
  const entradaUnd = esInvInicial ? 0 : num(r.entradaUnd);
  const entradaPeso = esInvInicial ? 0 : num(r.entradaPesoTotalKg);
  const entradaPesoKg = esInvInicial ? 0 : num(r.entradaPesoKg);
  const salidaUnd = esInvInicial ? 0 : num(r.salidaUnd);
  const salidaPeso = esInvInicial ? 0 : num(r.salidaPesoTotalKg);

  return {
    id: r.id,
    fecha: formatearFechaLocal(r.fecha),
    codigo: r.lote.codigo,
    descripcion: r.producto.descripcion,
    observacion: r.observacion ?? "",
    responsable_del_registro: r.responsableRegistro ?? "",
    tipo_operacion: r.tipoOperacion?.nombre ?? "",
    operacion_codigo: r.tipoOperacion?.codigo ?? "",

    entrada_und: entradaUnd,
    entrada_peso_kg: entradaPesoKg,
    entrada_peso_total: entradaPeso,

    salida_und: salidaUnd,
    salida_peso_unitario:
      esInvInicial || salidaUnd === 0
        ? 0
        : num(r.salidaPesoUnitarioKg) || (salidaPeso > 0 ? salidaPeso / salidaUnd : 0),
    salida_peso_total: salidaPeso,

    saldo_und: saldoUnd,
    saldo_peso_kg: saldoUnd > 0 ? Math.round((saldoPeso / saldoUnd) * 1000) / 1000 : 0,
    saldo_peso_total: saldoPeso,

    motivo_salida_formulacion: r.formulacion ?? null,
    responsable_formulacion: r.responsableFormulacion ?? null,
    cantidad_producto_formulado: r.cantidadProductoFormulado != null
      ? num(r.cantidadProductoFormulado)
      : null,
    almacenamiento: r.almacenamientoNombre ?? null,
  };
}

async function validarProductoLote(
  tx: Prisma.TransactionClient,
  productoId: string,
  loteId: string,
) {
  const [producto, lote] = await Promise.all([
    tx.producto.findFirst({
      where: { id: productoId, tipoInventario: "BASE_ACTIVA", activo: true },
      select: { id: true },
    }),
    tx.loteBaseActiva.findFirst({
      where: { id: loteId, productoId },
      select: { id: true },
    }),
  ]);
  if (!producto) throw new Error("El producto no es un producto Base Activa activo.");
  if (!lote) throw new Error("El lote seleccionado no pertenece al producto.");
}

async function esInventarioInicial(
  tx: Prisma.TransactionClient,
  tipoOperacionId: string,
) {
  const op = await tx.tipoOperacion.findUnique({
    where: { id: tipoOperacionId },
    select: { codigo: true },
  });
  return op?.codigo === "INVENTARIO_INICIAL";
}

export async function crearRegistroService(input: RegistroInventarioInput) {
  return prisma.$transaction(async (tx) => {
    await validarProductoLote(tx, input.productoId, input.loteId);

    const esInvInicial = await esInventarioInicial(tx, input.tipoOperacionId);
    const esEntrada = esInvInicial || input.tipoMovimiento === "ENTRADA";
    const pesoTotal = input.pesoTotal || input.unidades * input.pesoUnitario;

    if (!esEntrada) {
      const agg = await tx.movimientoBaseActiva.aggregate({
        where: { loteId: input.loteId },
        _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true },
      });
      const stock = num(agg._sum?.entradaPesoTotalKg) - num(agg._sum?.salidaPesoTotalKg);
      if (pesoTotal > stock + 0.000001) {
        throw new Error(`Stock insuficiente en el lote. Disponible: ${stock.toFixed(6)} Kg.`);
      }
    }

    const movimiento = await tx.movimientoBaseActiva.create({
      data: {
        periodoId: input.periodoId,
        establecimientoId: input.establecimientoId,
        productoId: input.productoId,
        loteId: input.loteId,
        almacenamientoId: input.almacenamientoId?.trim() || null,
        tipoOperacionId: input.tipoOperacionId,
        fecha: fechaLocal(input.fecha),
        tipoMovimiento: esEntrada ? TipoMovimiento.ENTRADA : TipoMovimiento.SALIDA,
        observacion: input.observacion?.trim() || null,
        responsableRegistro: input.responsable?.trim() || null,
        entradaUnd: esEntrada ? input.unidades : 0,
        entradaPesoKg: esEntrada ? input.pesoUnitario : 0,
        entradaPesoTotalKg: esEntrada ? pesoTotal : 0,
        salidaUnd: esEntrada ? 0 : input.unidades,
        salidaPesoUnitarioKg: esEntrada ? 0 : input.pesoUnitario,
        salidaPesoTotalKg: esEntrada ? 0 : pesoTotal,
        formulacion: input.formulacion?.trim() || null,
        responsableFormulacion: input.responsableFormulacion?.trim() || null,
        cantidadProductoFormulado: input.cantidadProductoFormulado ?? null,
        almacenamientoNombre: input.almacenamientoNombre?.trim() || null,
        costoUnitarioKg: input.costoUnitarioKg ?? null,
      },
    });

    await rebuildBaseTx(tx, input.productoId);
    await recalcularSaldosProductoTx(tx, input.productoId);

    return { ...movimiento, id: movimiento.id };
  });
}

export async function obtenerKardexService(codigoLote?: string) {
  const movimientos = await fetchMovimientosBase(
    codigoLote ? { lote: { codigo: codigoLote } } : undefined,
  );

  let saldoUnd = 0;
  let saldoPeso = 0;
  return movimientos.map((mov) => {
    saldoUnd += num(mov.entradaUnd) - num(mov.salidaUnd);
    saldoPeso += num(mov.entradaPesoTotalKg) - num(mov.salidaPesoTotalKg);
    return mapearFila(mov, saldoUnd, saldoPeso);
  });
}

export async function obtenerProductosConLotesService() {
  return prisma.producto.findMany({
    where: { tipoInventario: "BASE_ACTIVA", activo: true },
    select: {
      id: true,
      codigo: true,
      descripcion: true,
      codigoExistencia: true,
      lotesBase: {
        select: {
          id: true,
          codigo: true,
          fechaIngreso: true,
          almacenamiento: { select: { nombre: true } },
          _count: { select: { movimientos: true } },
        },
        orderBy: { codigo: "asc" },
      },
    },
    orderBy: { codigo: "asc" },
  });
}

export type KardexSortKey =
  | "fecha"
  | "entrada_und"
  | "entrada_peso_total"
  | "salida_und"
  | "salida_peso_total"
  | "saldo_und"
  | "saldo_peso_total";

export interface KardexQueryParams {
  producto?: string;
  operacion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  sortCol?: KardexSortKey;
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface KardexTotales {
  entradaUnd: number;
  entradaPesoKg: number;
  entradaPeso: number;
  salidaUnd: number;
  salidaPesoKg: number;
  salidaPeso: number;
  saldoUnd: number;
  saldoPesoKg: number;
  saldoPeso: number;
}

export interface KardexResumen {
  rows: KardexRow[];
  total: number;
  page: number;
  pageSize: number;
  totals: KardexTotales;
  operaciones: { label: string; value: string }[];
  stockActual?: number;
}

export async function obtenerKardexResumenService(
  params: KardexQueryParams,
): Promise<KardexResumen> {
  const fechaDesde = params.fechaDesde
    ? fechaLocal(params.fechaDesde)
    : undefined;
  const fechaHasta = params.fechaHasta
    ? new Date(
        fechaLocal(params.fechaHasta).setHours(23, 59, 59, 999),
      )
    : undefined;

  const where: Prisma.MovimientoBaseActivaWhereInput = {
    ...(params.producto
      ? { lote: { producto: { codigo: params.producto } } }
      : {}),
    ...(params.operacion
      ? { tipoOperacion: { nombre: params.operacion } }
      : {}),
    ...(fechaDesde || fechaHasta
      ? {
          fecha: {
            ...(fechaDesde ? { gte: fechaDesde } : {}),
            ...(fechaHasta ? { lte: fechaHasta } : {}),
          },
        }
      : {}),
  };

  const movimientos = await fetchMovimientosBase(where);

  let saldoUnd = 0;
  let saldoPeso = 0;
  const mapped: KardexRow[] = movimientos.map((mov) => {
    saldoUnd += num(mov.entradaUnd) - num(mov.salidaUnd);
    saldoPeso += num(mov.entradaPesoTotalKg) - num(mov.salidaPesoTotalKg);
    return mapearFila(mov, saldoUnd, saldoPeso);
  });

  let filtered = mapped;
  const q = (params.busqueda ?? "").trim().toLowerCase();
  if (q) {
    filtered = mapped.filter((row) =>
      [
        row.codigo,
        row.descripcion,
        row.observacion,
        row.responsable_del_registro,
        row.motivo_salida_formulacion,
        row.almacenamiento,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  if (params.sortCol) {
    const dir = params.sortDir === "desc" ? -1 : 1;
    const key = params.sortCol;
    filtered.sort((a, b) => {
      const res =
        key === "fecha"
          ? a.fecha.localeCompare(b.fecha)
          : Number(a[key] ?? 0) - Number(b[key] ?? 0);
      return res * dir;
    });
  }

  const total = filtered.length;
  const pageSize = Math.max(1, params.pageSize);
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page), maxPage);
  const start = (page - 1) * pageSize;

  const rows = filtered.slice(start, start + pageSize);

  const totals: KardexTotales = {
    entradaUnd: filtered.reduce((acc, r) => acc + r.entrada_und, 0),
    entradaPesoKg: filtered.reduce((acc, r) => acc + r.entrada_peso_kg, 0),
    entradaPeso: filtered.reduce((acc, r) => acc + r.entrada_peso_total, 0),
    salidaUnd: filtered.reduce((acc, r) => acc + r.salida_und, 0),
    salidaPesoKg: filtered.reduce(
      (acc, r) => acc + r.salida_peso_unitario,
      0,
    ),
    salidaPeso: filtered.reduce((acc, r) => acc + r.salida_peso_total, 0),
    saldoUnd: filtered.length ? filtered[filtered.length - 1].saldo_und : 0,
    saldoPesoKg: filtered.length ? filtered[filtered.length - 1].saldo_peso_kg : 0,
    saldoPeso: filtered.length ? filtered[filtered.length - 1].saldo_peso_total : 0,
  };

  const operaciones = await prisma.tipoOperacion.findMany({
    where: { activo: true },
    orderBy: { codigo: "asc" },
  });

  const stockActual = rows[rows.length - 1]?.saldo_und ?? 0;

  return {
    rows,
    total,
    page,
    pageSize,
    totals,
    operaciones: operaciones.map((op) => ({
      label: op.nombre,
      value: op.nombre,
    })),
    stockActual,
  };
}

export async function actualizarRegistroService(
  movimientoId: string,
  input: RegistroInventarioInput,
) {
  return prisma.$transaction(async (tx) => {
    const existente = await tx.movimientoBaseActiva.findUniqueOrThrow({
      where: { id: movimientoId },
      select: { productoId: true },
    });

    await validarProductoLote(tx, input.productoId, input.loteId);

    const esInvInicial = await esInventarioInicial(tx, input.tipoOperacionId);
    const esEntrada = esInvInicial || input.tipoMovimiento === "ENTRADA";
    const pesoTotal = input.pesoTotal || input.unidades * input.pesoUnitario;

    if (!esEntrada) {
      const agg = await tx.movimientoBaseActiva.aggregate({
        where: { loteId: input.loteId },
        _sum: { entradaPesoTotalKg: true, salidaPesoTotalKg: true },
      });
      const stock =
        num(agg._sum?.entradaPesoTotalKg) - num(agg._sum?.salidaPesoTotalKg);
      if (pesoTotal > stock + 0.000001) {
        throw new Error(
          `Stock insuficiente en el lote. Disponible: ${stock.toFixed(6)} Kg.`,
        );
      }
    }

    await tx.movimientoBaseActiva.update({
      where: { id: movimientoId },
      data: {
        periodoId: input.periodoId,
        establecimientoId: input.establecimientoId,
        productoId: input.productoId,
        loteId: input.loteId,
        almacenamientoId: input.almacenamientoId?.trim() || null,
        tipoOperacionId: input.tipoOperacionId,
        fecha: fechaLocal(input.fecha),
        tipoMovimiento: esEntrada ? TipoMovimiento.ENTRADA : TipoMovimiento.SALIDA,
        observacion: input.observacion?.trim() || null,
        responsableRegistro: input.responsable?.trim() || null,
        entradaUnd: esEntrada ? input.unidades : 0,
        entradaPesoKg: esEntrada ? input.pesoUnitario : 0,
        entradaPesoTotalKg: esEntrada ? pesoTotal : 0,
        salidaUnd: esEntrada ? 0 : input.unidades,
        salidaPesoUnitarioKg: esEntrada ? 0 : input.pesoUnitario,
        salidaPesoTotalKg: esEntrada ? 0 : pesoTotal,
        formulacion: input.formulacion?.trim() || null,
        responsableFormulacion: input.responsableFormulacion?.trim() || null,
        cantidadProductoFormulado: input.cantidadProductoFormulado ?? null,
        almacenamientoNombre: input.almacenamientoNombre?.trim() || null,
        costoUnitarioKg: input.costoUnitarioKg ?? null,
      },
    });

    await rebuildBaseTx(tx, input.productoId);
    await recalcularSaldosProductoTx(tx, input.productoId);
    if (existente.productoId !== input.productoId) {
      await rebuildBaseTx(tx, existente.productoId);
      await recalcularSaldosProductoTx(tx, existente.productoId);
    }

    return { ok: true };
  });
}

export async function eliminarRegistroService(movimientoId: string) {
  return prisma.$transaction(async (tx) => {
    const movimiento = await tx.movimientoBaseActiva.findUniqueOrThrow({
      where: { id: movimientoId },
      select: { productoId: true, tipoMovimiento: true },
    });

    await tx.aplicacionPEPSBase.deleteMany({
      where: { movimientoSalidaId: movimientoId },
    });

    const capa = await tx.capaPEPSBase.findFirst({
      where: { movimientoEntradaId: movimientoId },
      select: { id: true },
    });
    if (capa) {
      await tx.aplicacionPEPSBase.deleteMany({ where: { capaId: capa.id } });
      await tx.capaPEPSBase.delete({ where: { id: capa.id } });
    }

    await tx.movimientoBaseActiva.delete({ where: { id: movimientoId } });
    await rebuildBaseTx(tx, movimiento.productoId);
    await recalcularSaldosProductoTx(tx, movimiento.productoId);

    return { ok: true };
  });
}