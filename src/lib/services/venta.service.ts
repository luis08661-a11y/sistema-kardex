import { Prisma } from "@prisma/client";
import type { VentaDetalleInput, VentaFiltrosInput, VentaInput } from "@/lib/validators/venta.schema";
import { prisma } from "@/lib/db/prisma";
import { obtenerEmpresaActivaService } from "@/lib/services/empresa.service";

const IGV_TASA = 0.18;

type TipoComprobanteValor = "COTIZACION" | "FACTURA" | "BOLETA";
type EstadoVentaValor = "EMITIDA" | "ANULADA";

function redondearDinero(n: number) {
  return Math.round(n * 100) / 100;
}

function num(v: Prisma.Decimal | number | null | undefined) {
  return Number(v ?? 0);
}

type VentaConDetalles = Prisma.VentaGetPayload<{
  include: {
    empresa: { select: { id: true; ruc: true; razonSocial: true; firmaUrl: true } };
    cliente: true;
    detalles: {
      include: {
        producto: {
          include: {
            unidadMedida: { select: { codigo: true, nombre: true } },
            presentacion: { select: { nombre: true } },
          };
        };
      };
    };
  };
}>;

export interface DetalleVentaDTO {
  id: string;
  productoId: string;
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  presentacion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  importe: number;
}

export interface VentaDTO {
  id: string;
  empresa: { id: string; ruc: string; razonSocial: string; firmaUrl: string | null };
  tipoComprobante: string;
  serie: string;
  numero: number;
  fecha: Date;
  cliente: {
    id: string;
    tipoDocumento: string;
    numeroDocumento: string;
    razonSocial: string;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
  } | null;
  formaPago: string;
  metodoPago: string;
  numeroOperacion: string | null;
  subtotal: number;
  opGravada: number;
  opExonerada: number;
  opInafecta: number;
  igv: number;
  total: number;
  estado: string;
  observacion: string | null;
  detalles: DetalleVentaDTO[];
}

function mapearVenta(v: VentaConDetalles): VentaDTO {
  return {
    id: v.id,
    empresa: {
      id: v.empresa.id,
      ruc: v.empresa.ruc,
      razonSocial: v.empresa.razonSocial,
      firmaUrl: v.empresa.firmaUrl,
    },
    tipoComprobante: v.tipoComprobante,
    serie: v.serie,
    numero: v.numero,
    fecha: v.fecha,
    cliente: v.cliente
      ? {
          id: v.cliente.id,
          tipoDocumento: v.cliente.tipoDocumento,
          numeroDocumento: v.cliente.numeroDocumento,
          razonSocial: v.cliente.razonSocial,
          direccion: v.cliente.direccion,
          telefono: v.cliente.telefono,
          email: v.cliente.email,
        }
      : null,
    formaPago: v.formaPago,
    metodoPago: v.metodoPago,
    numeroOperacion: v.numeroOperacion,
    subtotal: num(v.subtotal),
    opGravada: num(v.opGravada),
    opExonerada: num(v.opExonerada),
    opInafecta: num(v.opInafecta),
    igv: num(v.igv),
    total: num(v.total),
    estado: v.estado,
    observacion: v.observacion,
    detalles: v.detalles.map((d: VentaConDetalles["detalles"][number]) => ({
      id: d.id,
      productoId: d.productoId,
      codigo: d.producto?.codigo ?? "",
      descripcion: d.producto?.descripcion ?? "",
      unidadMedida: d.producto?.unidadMedida?.codigo || (d.producto?.unidadMedida?.nombre ?? ""),
      presentacion: d.producto?.presentacion?.nombre ?? "",
      cantidad: num(d.cantidad),
      precioUnitario: num(d.precioUnitario),
      subtotal: num(d.subtotal),
      importe: num(d.importe ?? d.subtotal),
    })),
  };
}

async function obtenerSiguienteNumero(tx: Prisma.TransactionClient, empresaId: string, tipoComprobante: string, serie: string) {
  const agg = await tx.venta.aggregate({
    where: { empresaId, tipoComprobante: tipoComprobante as TipoComprobanteValor, serie },
    _max: { numero: true },
  });
  return (agg._max.numero ?? 0) + 1;
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

export async function crearVentaService(input: VentaInput): Promise<VentaDTO> {
  const empresa = await obtenerEmpresaActivaService();
  const serie = input.tipoComprobante === "COTIZACION" ? "COT" : input.tipoComprobante === "FACTURA" ? "F001" : "B001";

  const resultado = await conReintentos(() =>
    prisma.$transaction(
      async (tx) => {
        let clienteId: string | null = null;

        if (input.cliente) {
          const upsert = await tx.cliente.upsert({
            where: {
              tipoDocumento_numeroDocumento: {
                tipoDocumento: input.cliente.tipoDocumento,
                numeroDocumento: input.cliente.numeroDocumento,
              },
            },
            create: {
              empresaId: empresa.id,
              tipoDocumento: input.cliente.tipoDocumento,
              numeroDocumento: input.cliente.numeroDocumento,
              razonSocial: input.cliente.razonSocial.toUpperCase(),
              direccion: input.cliente.direccion?.trim() || null,
              telefono: input.cliente.telefono?.trim() || null,
              email: input.cliente.email?.trim() || null,
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
          select: { id: true, codigo: true, descripcion: true, activo: true },
        });
        const encontrados = new Set(productos.map((p) => p.id));
        const faltante = ids.find((id) => !encontrados.has(id));
        if (faltante) throw new Error("Uno de los productos no existe o está inactivo.");

        let subtotal = 0;
        for (const d of input.detalles) {
          const importe = redondearDinero(d.cantidad * d.precioUnitario);
          subtotal += importe;
        }
        subtotal = redondearDinero(subtotal);
        const igv = redondearDinero(subtotal * IGV_TASA);
        const total = redondearDinero(subtotal + igv);

        const numero = await obtenerSiguienteNumero(tx, empresa.id, input.tipoComprobante, serie);

        const venta = await tx.venta.create({
          data: {
            empresaId: empresa.id,
            tipoComprobante: input.tipoComprobante,
            serie,
            numero,
            fecha: input.fecha ?? new Date(),
            clienteId,
            formaPago: input.formaPago,
            metodoPago: input.metodoPago,
            subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
            igv: new Prisma.Decimal(igv.toFixed(2)),
            total: new Prisma.Decimal(total.toFixed(2)),
            observacion: input.observacion?.trim() || null,
            detalles: {
              create: input.detalles.map((d: VentaDetalleInput) => ({
                productoId: d.productoId,
                cantidad: new Prisma.Decimal(d.cantidad.toFixed(3)),
                precioUnitario: new Prisma.Decimal(d.precioUnitario.toFixed(2)),
                subtotal: new Prisma.Decimal(
                  redondearDinero(d.cantidad * d.precioUnitario).toFixed(2),
                ),
              })),
            },
          },
          include: {
            empresa: { select: { id: true, ruc: true, razonSocial: true, firmaUrl: true } },
            cliente: true,
            detalles: { include: { producto: { include: { unidadMedida: { select: { codigo: true, nombre: true } }, presentacion: { select: { nombre: true } } } } } },
          },
        });

        return venta;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 8000,
        timeout: 20000,
      },
    ),
  );

  return mapearVenta(resultado);
}

export async function obtenerVentaConDetallesService(id: string): Promise<VentaDTO | null> {
  const venta = await prisma.venta.findUnique({
    where: { id },
    include: {
      empresa: { select: { id: true, ruc: true, razonSocial: true, firmaUrl: true } },
      cliente: true,
      detalles: {
        include: {
          producto: {
            include: {
unidadMedida: { select: { codigo: true, nombre: true } },
              presentacion: { select: { nombre: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return venta ? mapearVenta(venta) : null;
}

export interface VentaFilaDTO {
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
  subtotal: number;
  igv: number;
  estado: string;
  items: number;
  detalles: {
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    igv: number;
    importe: number;
    unidadMedida: string;
  }[];
}

export interface VentasPaginadasDTO {
  data: VentaFilaDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPaginas: number;
}

export async function obtenerVentasService(filtros: VentaFiltrosInput): Promise<VentasPaginadasDTO> {
  const q = (filtros.search ?? "").trim();
  const page = Math.max(1, filtros.page);
  const pageSize = Math.min(100, Math.max(1, filtros.pageSize));

  const where: Prisma.VentaWhereInput = {
    ...(filtros.tipoComprobante && filtros.tipoComprobante !== "TODOS"
      ? { tipoComprobante: filtros.tipoComprobante as TipoComprobanteValor }
      : {}),
    ...(filtros.estado && filtros.estado !== "TODOS" ? { estado: filtros.estado as EstadoVentaValor } : {}),
    ...(filtros.formaPago && filtros.formaPago !== "TODOS" ? { formaPago: filtros.formaPago as "CONTADO" | "CREDITO" } : {}),
    ...(filtros.fechaDesde || filtros.fechaHasta
      ? {
          fecha: {
            ...(filtros.fechaDesde ? { gte: filtros.fechaDesde } : {}),
            ...(filtros.fechaHasta ? { lte: new Date(filtros.fechaHasta.setHours(23, 59, 59, 999)) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { cliente: { razonSocial: { contains: q, mode: "insensitive" } } },
            { cliente: { numeroDocumento: { contains: q, mode: "insensitive" } } },
            { serie: { contains: q, mode: "insensitive" } },
            ...(Number.isInteger(Number(q))
              ? [{ numero: Number(q) } as Prisma.VentaWhereInput]
              : []),
          ],
        }
      : {}),
  };

  const [filas, total] = await Promise.all([
    prisma.venta.findMany({
      where,
      include: {
        cliente: { select: { razonSocial: true, numeroDocumento: true } },
        _count: { select: { detalles: true } },
        detalles: {
          select: {
            cantidad: true,
            precioUnitario: true,
            subtotal: true,
            igv: true,
            importe: true,
            unidadMedida: true,
            producto: {
              select: {
                descripcion: true,
                unidadMedida: { select: { codigo: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ fecha: "desc" }, { numero: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.venta.count({ where }),
  ]);

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
      subtotal: num(v.subtotal),
      igv: num(v.igv),
      estado: v.estado,
      items: v._count.detalles,
      detalles: v.detalles.map((d) => ({
        descripcion: d.producto?.descripcion ?? "",
        cantidad: num(d.cantidad),
        precioUnitario: num(d.precioUnitario),
        subtotal: num(d.subtotal),
        igv: num(d.igv),
        importe: num(d.importe ?? d.subtotal),
        unidadMedida: d.producto?.unidadMedida?.codigo || (d.unidadMedida ?? ""),
      })),
    })),
    total,
    page,
    pageSize,
    totalPaginas: Math.ceil(total / pageSize),
  };
}

export async function anularVentaService(id: string): Promise<void> {
  const venta = await prisma.venta.findUnique({ where: { id } });
  if (!venta) throw new Error("No se encontró la venta.");
  await prisma.venta.update({ where: { id }, data: { estado: "ANULADA" } });
}

export async function eliminarVentaService(id: string): Promise<void> {
  const venta = await prisma.venta.findUnique({ where: { id } });
  if (!venta) throw new Error("No se encontró la venta.");
  await anularVentaService(id);
}

export async function buscarProductosVentaService(filtro: string, limit = 20) {
  const q = filtro.trim();
  return prisma.producto.findMany({
    where: {
      activo: true,
      OR: [
        { codigo: { contains: q, mode: "insensitive" } },
        { descripcion: { contains: q, mode: "insensitive" } },
        { codigoExistencia: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      unidadMedida: { select: { codigo: true, nombre: true } },
      presentacion: { select: { nombre: true } },
    },
    orderBy: [{ tipoInventario: "asc" }, { descripcion: "asc" }],
    take: limit,
  });
}

export async function obtenerCatalogosVentaService() {
  const empresas = await prisma.empresa.findMany({ orderBy: { razonSocial: "asc" } });
  return { empresas };
}

export async function obtenerProductosCatalogoService(limit = 200) {
  return prisma.producto.findMany({
    where: { activo: true },
    include: {
      unidadMedida: { select: { codigo: true, nombre: true } },
      presentacion: { select: { nombre: true } },
      categoria: { select: { nombre: true } },
    },
    orderBy: [{ tipoInventario: "asc" }, { descripcion: "asc" }],
    take: limit,
  });
}

export async function obtenerProximoNumeroService(tipoComprobante: string) {
  const empresa = await obtenerEmpresaActivaService();
  const serie = tipoComprobante === "COTIZACION" ? "COT" : tipoComprobante === "FACTURA" ? "F001" : "B001";
  const agg = await prisma.venta.aggregate({
    where: { empresaId: empresa.id, tipoComprobante: tipoComprobante as TipoComprobanteValor, serie },
    _max: { numero: true },
  });
  return { serie, numero: (agg._max.numero ?? 0) + 1 };
}