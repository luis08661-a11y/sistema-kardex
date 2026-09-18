import { prisma } from "@/lib/db/prisma";
import { EstadoVenta, FormaPago, Prisma, TipoComprobante } from "@prisma/client";

export interface ReporteVentasFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoComprobante?: string;
  estado?: string;
  formaPago?: string;
  numeroComprobante?: string;
  documento?: string;
}

export interface ReporteVentasContexto {
  empresa: {
    ruc: string;
    razonSocial: string;
    logoUrl: string | null;
    firmaUrl: string | null;
    responsableReporte: string | null;
    cargoReporte: string | null;
  };
  establecimiento: string | null;
}

export interface ReporteVentasFila {
  ventaId: string;
  fecha: string;
  tipoComprobante: string;
  comprobante: string;
  cliente: string;
  documento: string;
  telefono: string;
  email: string;
  formaPago: string;
  metodoPago: string;
  numeroOperacion: string;
  items: number;
  subtotal: number;
  opGravada: number;
  opExonerada: number;
  opInafecta: number;
  igv: number;
  total: number;
  estado: string;
}

export interface ReporteVentasData {
  items: ReporteVentasFila[];
  resumen: {
    cantidad: number;
    subtotal: number;
    opGravada: number;
    opExonerada: number;
    opInafecta: number;
    igv: number;
    total: number;
  };
  periodo: string;
}

export async function obtenerContextoReporteVentasService(): Promise<ReporteVentasContexto> {
  const [empresa, establecimiento] = await Promise.all([
    prisma.empresa.findFirst({
      where: { activo: true },
      orderBy: { ruc: "asc" },
      select: {
        ruc: true,
        razonSocial: true,
        logoUrl: true,
        firmaUrl: true,
        responsableReporte: true,
        cargoReporte: true,
      },
    }),
    prisma.establecimiento.findFirst({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { nombre: true },
    }),
  ]);

  return {
    empresa: {
      ruc: empresa?.ruc ?? "",
      razonSocial: empresa?.razonSocial ?? "EMPRESA",
      logoUrl: empresa?.logoUrl ?? null,
      firmaUrl: empresa?.firmaUrl ?? null,
      responsableReporte: empresa?.responsableReporte ?? null,
      cargoReporte: empresa?.cargoReporte ?? null,
    },
    establecimiento: establecimiento?.nombre ?? null,
  };
}

function fechaBorde(d: string | undefined, finDeDia: boolean): Date | undefined {
  if (!d) return undefined;
  const dt = new Date(`${d}T${finDeDia ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

const n = (v: Prisma.Decimal | number | null | undefined) => Number(v ?? 0);

export async function consultarReporteVentasService(
  filtros: ReporteVentasFiltros = {},
): Promise<ReporteVentasData> {
  const rangoFecha =
    filtros.fechaDesde || filtros.fechaHasta
      ? {
          ...(filtros.fechaDesde
            ? { gte: fechaBorde(filtros.fechaDesde, false) }
            : {}),
          ...(filtros.fechaHasta
            ? { lte: fechaBorde(filtros.fechaHasta, true) }
            : {}),
        }
      : undefined;
  const where: Prisma.VentaWhereInput = {
    ...(rangoFecha ? { fecha: rangoFecha } : {}),
    ...(filtros.tipoComprobante && filtros.tipoComprobante !== "TODOS"
      ? { tipoComprobante: filtros.tipoComprobante as TipoComprobante }
      : {}),
    ...(filtros.estado && filtros.estado !== "TODOS"
      ? { estado: filtros.estado as EstadoVenta }
      : {}),
    ...(filtros.formaPago && filtros.formaPago !== "TODOS"
      ? { formaPago: filtros.formaPago as FormaPago }
      : {}),
  };

  const comprobante = filtros.numeroComprobante?.trim();
  if (comprobante) {
    const [serie, numeroTexto] = comprobante.split("-");
    const numero = Number(numeroTexto);
    if (serie && Number.isInteger(numero)) {
      where.serie = serie;
      where.numero = numero;
    } else if (Number.isInteger(Number(comprobante))) {
      where.numero = Number(comprobante);
    } else {
      where.serie = { contains: comprobante, mode: "insensitive" };
    }
  }

  const documento = filtros.documento?.trim();
  if (documento) {
    where.cliente = {
      numeroDocumento: { contains: documento, mode: "insensitive" },
    };
  }

  const ventas = await prisma.venta.findMany({
    where,
    orderBy: [{ fecha: "desc" }, { numero: "desc" }],
    select: {
      id: true,
      fecha: true,
      tipoComprobante: true,
      serie: true,
      numero: true,
      formaPago: true,
      metodoPago: true,
      numeroOperacion: true,
      subtotal: true,
      opGravada: true,
      opExonerada: true,
      opInafecta: true,
      igv: true,
      total: true,
      estado: true,
      cliente: {
        select: {
          tipoDocumento: true,
          numeroDocumento: true,
          razonSocial: true,
          telefono: true,
          email: true,
        },
      },
      _count: { select: { detalles: true } },
    },
  });

  const items: ReporteVentasFila[] = ventas.map((v) => ({
    ventaId: v.id,
    fecha: v.fecha.toISOString(),
    tipoComprobante: v.tipoComprobante,
    comprobante: `${v.serie}-${String(v.numero).padStart(6, "0")}`,
    cliente: v.cliente?.razonSocial ?? "CONSUMIDOR FINAL",
    documento: v.cliente
      ? `${v.cliente.tipoDocumento}: ${v.cliente.numeroDocumento}`
      : "—",
    telefono: v.cliente?.telefono ?? "",
    email: v.cliente?.email ?? "",
    formaPago: v.formaPago,
    metodoPago: v.metodoPago,
    numeroOperacion: v.numeroOperacion ?? "",
    items: v._count.detalles,
    subtotal: n(v.subtotal),
    opGravada: n(v.opGravada),
    opExonerada: n(v.opExonerada),
    opInafecta: n(v.opInafecta),
    igv: n(v.igv),
    total: n(v.total),
    estado: v.estado,
  }));

  const resumen = items.reduce(
    (acc, r) => {
      acc.cantidad += 1;
      acc.subtotal += r.subtotal;
      acc.opGravada += r.opGravada;
      acc.opExonerada += r.opExonerada;
      acc.opInafecta += r.opInafecta;
      acc.igv += r.igv;
      acc.total += r.total;
      return acc;
    },
    { cantidad: 0, subtotal: 0, opGravada: 0, opExonerada: 0, opInafecta: 0, igv: 0, total: 0 },
  );

  const periodo = [
    filtros.fechaDesde ?? "…",
    filtros.fechaHasta ?? "…",
  ].join(" al ");

  return { items, resumen, periodo };
}