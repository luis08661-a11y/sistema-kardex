import { Prisma, type TipoDocumento } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { obtenerEmpresaActivaService } from "@/lib/services/empresa.service";
import type { PosVentaInput } from "@/lib/validators/pos.schema";
import { validarDocumentoSegunComprobante } from "@/lib/validators/pos.schema";
import { calcularLinea, calcularTotales, redondearDinero } from "@/lib/pos/calculations";

export type TipoComprobanteValor = "COTIZACION" | "FACTURA" | "BOLETA" | "NOTA_DE_VENTA";
type FormaPagoValor = "CONTADO" | "CREDITO";
type MetodoPagoValor =
  | "EFECTIVO"
  | "YAPE"
  | "PLIN"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "DEPOSITO"
  | "OTRO";

export const SERIES_POR_TIPO: Record<TipoComprobanteValor, string[]> = {
  COTIZACION: ["C001", "C002"],
  FACTURA: ["F001", "F002"],
  BOLETA: ["B001", "B002"],
  NOTA_DE_VENTA: ["NV01", "NV02"],
};

export const TIPO_COMPROBANTE_LABEL: Record<TipoComprobanteValor, string> = {
  COTIZACION: "COTIZACIÓN",
  FACTURA: "FACTURA ELECTRÓNICA",
  BOLETA: "BOLETA DE VENTA",
  NOTA_DE_VENTA: "NOTA DE VENTA",
};

function num(v: Prisma.Decimal | number | null | undefined) {
  return Number(v ?? 0);
}

function esErrorDuplicado(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "P2002" || error.code === "P2034")
  );
}

async function conReintentos<T>(fn: () => Promise<T>, intentos = 6): Promise<T> {
  let ultimo: unknown;
  for (let i = 0; i < intentos; i++) {
    try {
      return await fn();
    } catch (error) {
      if (!esErrorDuplicado(error)) throw error;
      ultimo = error;
    }
  }
  throw ultimo;
}

export interface ProductoPosDTO {
  id: string;
  codigo: string;
  codigoExistencia: string | null;
  descripcion: string;
  tipoInventario: string;
  precioVenta: number;
  stock: number;
  unidadMedida: string;
  unidadMedidaCodigo: string;
  presentacion: string | null;
  categoriaId: string | null;
  categoria: string | null;
}

export interface ClienteSeleccionableDTO {
  id: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface PosSerieInfo {
  serie: string;
  numero: number;
}

export interface DatosPosDTO {
  empresa: {
    id: string;
    ruc: string;
    razonSocial: string;
    logoUrl: string | null;
  };
  establecimiento: {
    nombre: string;
    direccion: string;
  } | null;
  comprobantes: {
    tipo: TipoComprobanteValor;
    label: string;
    colores: { bg: string; text: string };
    series: PosSerieInfo[];
  }[];
  categorias: { id: string; nombre: string }[];
}

export interface HistorialVentaFilaDTO {
  id: string;
  fecha: Date;
  tipoComprobante: string;
  serie: string;
  numero: number;
  comprobante: string;
  clienteRazonSocial: string;
  clienteDocumento: string;
  formaPago: string;
  metodoPago: string;
  total: number;
  estado: string;
  items: number;
}

export interface HistorialVentasPosDTO {
  data: HistorialVentaFilaDTO[];
  resumen: { totalDocumentos: number; ingresoTotal: number; ticketPromedio: number };
}

export interface DetalleVentaPosDTO {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  base: number;
  igv: number;
  importe: number;
  unidadMedida: string;
}

export interface VentaPosGuardadaDTO {
  id: string;
  tipoComprobante: string;
  serie: string;
  numero: number;
  fecha: Date;
  fechaVencimiento: Date | null;
  formaPago: string;
  metodoPago: string;
  moneda: string;
  tipoCambio: number;
  opGravada: number;
  opExonerada: number;
  opInafecta: number;
  subtotal: number;
  igv: number;
  total: number;
  recibido: number | null;
  vuelto: number | null;
  numeroOperacion: string;
  estado: string;
  observacion: string;
  empresa: {
    ruc: string;
    razonSocial: string;
    direccion: string | null;
    firmaUrl: string | null;
    logoUrl: string | null;
  };
  cliente: ClienteSeleccionableDTO | null;
  detalles: DetalleVentaPosDTO[];
}

async function obtenerStocksPorProductos(ids: string[]): Promise<Map<string, number>> {
  const stock = new Map<string, number>();
  if (!ids.length) return stock;
  const [porBase, porPT] = await Promise.all([
    prisma.capaPEPSBase.groupBy({
      by: ["productoId"],
      where: { productoId: { in: ids } },
      _sum: { cantidadKgRestante: true },
    }),
    prisma.capaPEPSPT.groupBy({
      by: ["productoId"],
      where: { productoId: { in: ids } },
      _sum: { cantidadRestante: true },
    }),
  ]);
  for (const fila of porBase) stock.set(fila.productoId, num(fila._sum.cantidadKgRestante));
  for (const fila of porPT) {
    const actual = stock.get(fila.productoId) ?? 0;
    stock.set(fila.productoId, actual + num(fila._sum.cantidadRestante));
  }
  return stock;
}

function mapearProductoPos(
  p: {
    id: string;
    codigo: string;
    codigoExistencia: string | null;
    descripcion: string;
    tipoInventario: string;
    precioVenta: Prisma.Decimal | number;
    categoriaId: string | null;
    unidadMedida: { codigo: string | null; nombre: string } | null;
    presentacion: { nombre: string } | null;
    categoria: { nombre: string } | null;
  },
  stock: number,
): ProductoPosDTO {
  return {
    id: p.id,
    codigo: p.codigo,
    codigoExistencia: p.codigoExistencia,
    descripcion: p.descripcion,
    tipoInventario: p.tipoInventario,
    precioVenta: num(p.precioVenta),
    stock,
    unidadMedida: p.unidadMedida?.nombre ?? "",
    unidadMedidaCodigo: p.unidadMedida?.codigo ?? "",
    presentacion: p.presentacion?.nombre ?? null,
    categoriaId: p.categoriaId,
    categoria: p.categoria?.nombre ?? null,
  };
}

export async function obtenerDatosPosService(): Promise<DatosPosDTO> {
  const tipos: TipoComprobanteValor[] = ["NOTA_DE_VENTA", "FACTURA", "BOLETA", "COTIZACION"];
  const seriesPorTipo: Record<TipoComprobanteValor, PosSerieInfo[]> = {
    COTIZACION: [],
    FACTURA: [],
    BOLETA: [],
    NOTA_DE_VENTA: [],
  };

  const empresa = await obtenerEmpresaActivaService();

  const [establecimiento, categorias, agregaciones] = await Promise.all([
    prisma.establecimiento.findFirst({
      where: { empresaId: empresa.id, activo: true },
      select: { nombre: true, direccion: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.categoria.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.venta.groupBy({
      by: ["tipoComprobante", "serie"],
      _max: { numero: true },
      where: { empresaId: empresa.id },
    }),
  ]);

  for (const tipo of tipos) {
    for (const serie of SERIES_POR_TIPO[tipo]) {
      const agg = agregaciones.find(
        (a) => a.tipoComprobante === tipo && a.serie === serie,
      );
      seriesPorTipo[tipo].push({ serie, numero: (agg?._max.numero ?? 0) + 1 });
    }
  }

  const estilosComprobante: Record<
    TipoComprobanteValor,
    { label: string; colores: { bg: string; text: string } }
  > = {
    NOTA_DE_VENTA: {
      label: TIPO_COMPROBANTE_LABEL.NOTA_DE_VENTA,
      colores: { bg: "bg-blue-100 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300" },
    },
    FACTURA: {
      label: TIPO_COMPROBANTE_LABEL.FACTURA,
      colores: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300" },
    },
    BOLETA: {
      label: TIPO_COMPROBANTE_LABEL.BOLETA,
      colores: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300" },
    },
    COTIZACION: {
      label: TIPO_COMPROBANTE_LABEL.COTIZACION,
      colores: { bg: "bg-violet-100 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300" },
    },
  };

  return {
    empresa: {
      id: empresa.id,
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      logoUrl: empresa.logoUrl,
    },
    establecimiento: establecimiento
      ? { nombre: establecimiento.nombre, direccion: establecimiento.direccion ?? "" }
      : null,
    comprobantes: tipos.map((tipo) => ({
      tipo,
      label: estilosComprobante[tipo].label,
      colores: estilosComprobante[tipo].colores,
      series: seriesPorTipo[tipo],
    })),
    categorias,
  };
}

export async function obtenerProximoNumeroSerieService(
  tipoComprobante: string,
  serie: string,
): Promise<PosSerieInfo> {
  if (!SERIES_POR_TIPO[tipoComprobante as TipoComprobanteValor]?.includes(serie)) {
    throw new Error("Serie no válida para este comprobante.");
  }
  const empresa = await obtenerEmpresaActivaService();
  const agg = await prisma.venta.aggregate({
    where: {
      empresaId: empresa.id,
      tipoComprobante: tipoComprobante as TipoComprobanteValor,
      serie,
    },
    _max: { numero: true },
  });
  return { serie, numero: (agg._max.numero ?? 0) + 1 };
}

export async function buscarProductosPosService(filtro: string, limit = 20) {
  const q = filtro.trim();
  if (!q) return [] as ProductoPosDTO[];
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      tipoInventario: "PRODUCTO_TERMINADO",
      OR: [
        { codigo: { contains: q, mode: "insensitive" } },
        { codigoExistencia: { contains: q, mode: "insensitive" } },
        { descripcion: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      codigo: true,
      codigoExistencia: true,
      descripcion: true,
      tipoInventario: true,
      precioVenta: true,
      categoriaId: true,
      unidadMedida: { select: { codigo: true, nombre: true } },
      presentacion: { select: { nombre: true } },
      categoria: { select: { nombre: true } },
    },
    orderBy: [{ tipoInventario: "asc" }, { descripcion: "asc" }],
    take: limit,
  });
  const stocks = await obtenerStocksPorProductos(productos.map((p) => p.id));
  return productos.map((p) => mapearProductoPos(p, stocks.get(p.id) ?? 0));
}

export interface CatalogoPaginadoDTO {
  data: ProductoPosDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPaginas: number;
}

export async function obtenerCatalogoPosService(
  filtros: { categoriaId?: string; q?: string; page?: number; pageSize?: number },
): Promise<CatalogoPaginadoDTO> {
  const q = (filtros.q ?? "").trim();
  const page = Math.max(1, filtros.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, filtros.pageSize ?? 24));
  const where: Prisma.ProductoWhereInput = {
    activo: true,
    tipoInventario: "PRODUCTO_TERMINADO",
    ...(filtros.categoriaId && filtros.categoriaId !== "TODOS"
      ? { categoriaId: filtros.categoriaId }
      : {}),
    ...(q
      ? {
          OR: [
            { codigo: { contains: q, mode: "insensitive" } },
            { codigoExistencia: { contains: q, mode: "insensitive" } },
            { descripcion: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      select: {
        id: true,
        codigo: true,
        codigoExistencia: true,
        descripcion: true,
        tipoInventario: true,
        precioVenta: true,
        categoriaId: true,
        unidadMedida: { select: { codigo: true, nombre: true } },
        presentacion: { select: { nombre: true } },
        categoria: { select: { nombre: true } },
      },
      orderBy: [{ tipoInventario: "asc" }, { descripcion: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.producto.count({ where }),
  ]);
  const stocks = await obtenerStocksPorProductos(productos.map((p) => p.id));
  return {
    data: productos.map((p) => mapearProductoPos(p, stocks.get(p.id) ?? 0)),
    total,
    page,
    pageSize,
    totalPaginas: Math.ceil(total / pageSize),
  };
}

export async function buscarClientesDirectorioService(q: string, limit = 25) {
  const filtro = q.trim();
  const clientes = await prisma.cliente.findMany({
    where: {
      ...(filtro
        ? {
            OR: [
              { numeroDocumento: { contains: filtro, mode: "insensitive" } },
              { razonSocial: { contains: filtro, mode: "insensitive" } },
              { telefono: { contains: filtro, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      tipoDocumento: true,
      numeroDocumento: true,
      razonSocial: true,
      direccion: true,
      telefono: true,
      email: true,
    },
    orderBy: [{ activo: "desc" }, { razonSocial: "asc" }],
    take: limit,
  });
  return clientes.map((c) => ({
    id: c.id,
    tipoDocumento: c.tipoDocumento,
    numeroDocumento: c.numeroDocumento,
    razonSocial: c.razonSocial,
    direccion: c.direccion ?? "",
    telefono: c.telefono ?? "",
    email: c.email ?? "",
  })) satisfies ClienteSeleccionableDTO[];
}

export async function buscarClientePorDocumentoService(
  tipo: "DNI" | "RUC",
  numero: string,
): Promise<ClienteSeleccionableDTO | null> {
  const empresa = await obtenerEmpresaActivaService();
  const cliente = await prisma.cliente.findFirst({
    where: {
      empresaId: empresa.id,
      tipoDocumento: tipo as TipoDocumento,
      numeroDocumento: numero,
    },
    select: {
      id: true,
      tipoDocumento: true,
      numeroDocumento: true,
      razonSocial: true,
      direccion: true,
      telefono: true,
      email: true,
    },
  });
  if (!cliente) return null;
  return {
    id: cliente.id,
    tipoDocumento: cliente.tipoDocumento,
    numeroDocumento: cliente.numeroDocumento,
    razonSocial: cliente.razonSocial,
    direccion: cliente.direccion ?? "",
    telefono: cliente.telefono ?? "",
    email: cliente.email ?? "",
  };
}

export async function guardarClientePosService(
  input: {
    tipoDocumento: string;
    numeroDocumento: string;
    razonSocial: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  },
): Promise<ClienteSeleccionableDTO> {
  const empresa = await obtenerEmpresaActivaService();
  if (!input.razonSocial.trim()) {
    throw new Error("El nombre del cliente es obligatorio.");
  }
  const upsert = await prisma.cliente.upsert({
    where: {
      tipoDocumento_numeroDocumento: {
        tipoDocumento: input.tipoDocumento as TipoDocumento,
        numeroDocumento: input.numeroDocumento || `SIN-${Date.now()}`,
      },
    },
    create: {
      empresaId: empresa.id,
      tipoDocumento: input.tipoDocumento as TipoDocumento,
      numeroDocumento: input.numeroDocumento || `SIN-${Date.now()}`,
      razonSocial: input.razonSocial.toUpperCase(),
      direccion: input.direccion?.trim() || null,
      telefono: input.telefono?.trim() || null,
      email: input.email?.trim() || null,
      activo: true,
    },
    update: {
      razonSocial: input.razonSocial.toUpperCase(),
      direccion: input.direccion?.trim() || null,
      telefono: input.telefono?.trim() || null,
      email: input.email?.trim() || null,
      activo: true,
    },
  });
  return {
    id: upsert.id,
    tipoDocumento: upsert.tipoDocumento,
    numeroDocumento: upsert.numeroDocumento,
    razonSocial: upsert.razonSocial,
    direccion: upsert.direccion ?? "",
    telefono: upsert.telefono ?? "",
    email: upsert.email ?? "",
  };
}

export async function obtenerConteoVentasDelDiaService(): Promise<number> {
  const empresa = await obtenerEmpresaActivaService();
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  return prisma.venta.count({
    where: {
      empresaId: empresa.id,
      estado: "EMITIDA",
      fecha: { gte: desde },
    },
  });
}

export async function obtenerHistorialVentasPosService(): Promise<HistorialVentasPosDTO> {
  const empresa = await obtenerEmpresaActivaService();
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  const where: Prisma.VentaWhereInput = {
    empresaId: empresa.id,
    fecha: { gte: desde },
  };
  const [filas, agregado] = await Promise.all([
    prisma.venta.findMany({
      where,
      include: {
        cliente: { select: { razonSocial: true, numeroDocumento: true } },
        _count: { select: { detalles: true } },
      },
      orderBy: [{ fecha: "desc" }, { numero: "desc" }],
      take: 50,
    }),
    prisma.venta.aggregate({
      where: { ...where, estado: "EMITIDA" },
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);
  const ingresoTotal = num(agregado._sum.total);
  const totalDocumentos = agregado._count._all;
  return {
    data: filas.map((v) => ({
      id: v.id,
      fecha: v.fecha,
      tipoComprobante: v.tipoComprobante,
      serie: v.serie,
      numero: v.numero,
      comprobante: `${v.serie}-${String(v.numero).padStart(6, "0")}`,
      clienteRazonSocial: v.cliente?.razonSocial ?? "Consumidor final",
      clienteDocumento: v.cliente?.numeroDocumento ?? "",
      formaPago: v.formaPago,
      metodoPago: v.metodoPago,
      total: num(v.total),
      estado: v.estado,
      items: v._count.detalles,
    })),
    resumen: {
      totalDocumentos,
      ingresoTotal,
      ticketPromedio:
        totalDocumentos > 0 ? redondearDinero(ingresoTotal / totalDocumentos) : 0,
    },
  };
}

export async function guardarVentaPosService(input: PosVentaInput): Promise<VentaPosGuardadaDTO> {
  const empresa = await obtenerEmpresaActivaService();
  const tipo = input.tipoComprobante as TipoComprobanteValor;
  const seriesPermitidas = SERIES_POR_TIPO[tipo];
  if (!seriesPermitidas.includes(input.serie)) {
    throw new Error("Serie no válida para este comprobante.");
  }
  if (input.cliente?.numeroDocumento) {
    const errorDoc = validarDocumentoSegunComprobante(
      input.tipoComprobante,
      input.cliente.tipoDocumento,
      input.cliente.numeroDocumento,
    );
    if (errorDoc) throw new Error(errorDoc);
  }

  const resultados = await conReintentos(() =>
    prisma.$transaction(
      async (tx) => {
        let clienteId: string | null = null;

        if (input.cliente?.numeroDocumento || input.cliente?.razonSocial) {
          const upsert = await tx.cliente.upsert({
            where: {
              tipoDocumento_numeroDocumento: {
                tipoDocumento: input.cliente.tipoDocumento,
                numeroDocumento: input.cliente.numeroDocumento || `SIN-${Date.now()}`,
              },
            },
            create: {
              empresaId: empresa.id,
              tipoDocumento: input.cliente.tipoDocumento,
              numeroDocumento: input.cliente.numeroDocumento || `SIN-${Date.now()}`,
              razonSocial: input.cliente.razonSocial.toUpperCase(),
              direccion: input.cliente.direccion?.trim() || null,
              telefono: input.cliente.telefono?.trim() || null,
              email: input.cliente.email?.trim() || null,
              activo: true,
            },
            update: {
              razonSocial: input.cliente.razonSocial.toUpperCase(),
              direccion: input.cliente.direccion?.trim() || null,
              telefono: input.cliente.telefono?.trim() || null,
              email: input.cliente.email?.trim() || null,
              activo: true,
            },
          });
          clienteId = upsert.id;
        } else if (input.clienteId) {
          const cliente = await tx.cliente.findFirst({
            where: { id: input.clienteId, activo: true },
            select: { id: true },
          });
          if (!cliente) throw new Error("No se encontró el cliente seleccionado.");
          clienteId = cliente.id;
        } else {
          throw new Error("Seleccione un cliente o registre uno nuevo.");
        }

        const ids = [...new Set(input.detalles.map((d) => d.productoId))];
        const productos = await tx.producto.findMany({
          where: { id: { in: ids }, activo: true },
          select: {
            id: true,
            tipoInventario: true,
            codigo: true,
            descripcion: true,
            unidadMedida: { select: { nombre: true, codigo: true } },
          },
        });
        const encontrados = new Set(productos.map((p) => p.id));
        const faltante = ids.find((id) => !encontrados.has(id));
        if (faltante) throw new Error("Uno de los productos no existe o está inactivo.");

        const stocks = new Map<string, number>();
        const idsPT = productos.filter((p) => p.tipoInventario === "PRODUCTO_TERMINADO").map((p) => p.id);
        const idsBase = productos.filter((p) => p.tipoInventario === "BASE_ACTIVA").map((p) => p.id);
        const [porPT, porBase] = await Promise.all([
          tx.capaPEPSPT.groupBy({
            by: ["productoId"],
            where: { productoId: { in: idsPT } },
            _sum: { cantidadRestante: true },
          }),
          tx.capaPEPSBase.groupBy({
            by: ["productoId"],
            where: { productoId: { in: idsBase } },
            _sum: { cantidadKgRestante: true },
          }),
        ]);
        for (const fila of porPT) stocks.set(fila.productoId, num(fila._sum.cantidadRestante));
        for (const fila of porBase) {
          const actual = stocks.get(fila.productoId) ?? 0;
          stocks.set(fila.productoId, actual + num(fila._sum.cantidadKgRestante));
        }

        for (const d of input.detalles) {
          const stock = stocks.get(d.productoId) ?? 0;
          if (stock > 0 && d.cantidad > stock) {
            const p = productos.find((x) => x.id === d.productoId);
            throw new Error(
              `Stock insuficiente de "${p?.descripcion ?? (d.descripcion || d.codigo)}": disponible ${stock}.`,
            );
          }
        }

        const totales = calcularTotales(
          input.detalles.map((d) => ({ price: d.precioUnitario, quantity: d.cantidad })),
        );

        const numero = await (async () => {
          const agg = await tx.venta.aggregate({
            where: { empresaId: empresa.id, tipoComprobante: tipo, serie: input.serie },
            _max: { numero: true },
          });
          return (agg._max.numero ?? 0) + 1;
        })();

        const fechaVencimiento =
          input.fechaVencimiento ??
          (input.formaPago === "CREDITO"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : input.tipoComprobante === "COTIZACION"
              ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              : null);

        const recibido =
          input.recibido !== undefined && input.recibido !== null ? input.recibido : null;
        const vuelto = recibido !== null ? redondearDinero(recibido - totales.total) : null;

        const venta = await tx.venta.create({
          data: {
            empresaId: empresa.id,
            tipoComprobante: tipo,
            serie: input.serie,
            numero,
            fecha: input.fecha ?? new Date(),
            fechaVencimiento,
            clienteId,
            formaPago: input.formaPago as FormaPagoValor,
            metodoPago: input.metodoPago as MetodoPagoValor,
            moneda: input.moneda,
            tipoCambio: new Prisma.Decimal(input.tipoCambio.toFixed(4)),
            subtotal: new Prisma.Decimal(totales.gravada.toFixed(2)),
            igv: new Prisma.Decimal(totales.igv.toFixed(2)),
            total: new Prisma.Decimal(totales.total.toFixed(2)),
            opGravada: new Prisma.Decimal(totales.gravada.toFixed(2)),
            opExonerada: new Prisma.Decimal(totales.exonerada.toFixed(2)),
            opInafecta: new Prisma.Decimal(totales.inafecta.toFixed(2)),
            numeroOperacion: input.numeroOperacion?.trim() || null,
            recibido: recibido !== null ? new Prisma.Decimal(recibido.toFixed(2)) : null,
            vuelto: vuelto !== null ? new Prisma.Decimal(vuelto.toFixed(2)) : null,
            observacion: input.observacion?.trim() || null,
            detalles: {
              create: input.detalles.map((d) => {
                const linea = calcularLinea(d.precioUnitario, d.cantidad);
                const p = productos.find((x) => x.id === d.productoId);
                return {
                  productoId: d.productoId,
                  cantidad: new Prisma.Decimal(d.cantidad.toFixed(3)),
                  precioUnitario: new Prisma.Decimal(d.precioUnitario.toFixed(2)),
                  subtotal: new Prisma.Decimal(linea.base.toFixed(2)),
                  igv: new Prisma.Decimal(linea.igv.toFixed(2)),
                  importe: new Prisma.Decimal(linea.importe.toFixed(2)),
                  unidadMedida: p?.unidadMedida?.codigo || d.unidadMedida || p?.unidadMedida?.nombre || null,
                };
              }),
            },
          },
        });

        await tx.auditLog.create({
          data: {
            accion: "CREAR_VENTA_POS",
            entidad: "Venta",
            entidadId: venta.id,
            ruta: "/dashboard/venta-pos",
            metodo: "guardarVentaPos",
            detalle: {
              tipoComprobante: tipo,
              serie: input.serie,
              numero,
              total: totales.total,
            },
          },
        });

        return tx.venta.findUniqueOrThrow({
          where: { id: venta.id },
          include: {
            empresa: { select: { ruc: true, razonSocial: true, firmaUrl: true, logoUrl: true } },
            cliente: true,
            detalles: {
              include: { producto: { select: { codigo: true, descripcion: true, unidadMedida: { select: { codigo: true, nombre: true } } } } },
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 8000,
        timeout: 20000,
      },
    ),
  );

  const establecimiento = await prisma.establecimiento.findFirst({
    where: { empresaId: empresa.id, activo: true },
    select: { direccion: true },
    orderBy: { nombre: "asc" },
  });

  return {
    id: resultados.id,
    tipoComprobante: resultados.tipoComprobante,
    serie: resultados.serie,
    numero: resultados.numero,
    fecha: resultados.fecha,
    fechaVencimiento: resultados.fechaVencimiento,
    formaPago: resultados.formaPago,
    metodoPago: resultados.metodoPago,
    moneda: resultados.moneda,
    tipoCambio: num(resultados.tipoCambio),
    opGravada: num(resultados.opGravada),
    opExonerada: num(resultados.opExonerada),
    opInafecta: num(resultados.opInafecta),
    subtotal: num(resultados.subtotal),
    igv: num(resultados.igv),
    total: num(resultados.total),
    recibido: resultados.recibido !== null ? num(resultados.recibido) : null,
    vuelto: resultados.vuelto !== null ? num(resultados.vuelto) : null,
    numeroOperacion: resultados.numeroOperacion ?? "",
    estado: resultados.estado,
    observacion: resultados.observacion ?? "",
    empresa: {
      ruc: resultados.empresa.ruc,
      razonSocial: resultados.empresa.razonSocial,
      direccion: establecimiento?.direccion ?? null,
      firmaUrl: resultados.empresa.firmaUrl,
      logoUrl: resultados.empresa.logoUrl,
    },
    cliente: resultados.cliente
      ? {
          id: resultados.cliente.id,
          tipoDocumento: resultados.cliente.tipoDocumento,
          numeroDocumento: resultados.cliente.numeroDocumento,
          razonSocial: resultados.cliente.razonSocial,
          direccion: resultados.cliente.direccion ?? "",
          telefono: resultados.cliente.telefono ?? "",
          email: resultados.cliente.email ?? "",
        }
      : null,
    detalles: resultados.detalles.map((d) => ({
      codigo: d.producto?.codigo ?? "",
      descripcion: d.producto?.descripcion ?? "",
      cantidad: num(d.cantidad),
      precioUnitario: num(d.precioUnitario),
      base: num(d.subtotal),
      igv: num(d.igv),
      importe: num(d.importe),
      unidadMedida: d.producto?.unidadMedida?.codigo || (d.unidadMedida ?? ""),
    })),
  };
}

export async function esSerieUsadaService(tipoComprobante: string, serie: string) {
  if (!SERIES_POR_TIPO[tipoComprobante as TipoComprobanteValor]?.includes(serie)) {
    throw new Error("Serie no válida para este comprobante.");
  }
  return true;
}