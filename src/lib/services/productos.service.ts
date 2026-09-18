import { prisma } from "@/lib/db/prisma";
import type { ProductoInput, PresentacionInput } from "@/lib/validators/productos.schema";

const catalogInclude = {
  unidadMedida: { select: { id: true, codigo: true, nombre: true } },
  tipoExistencia: { select: { id: true, codigo: true, nombre: true } },
  categoria: { select: { id: true, nombre: true } },
  marca: { select: { id: true, nombre: true } },
  tipoAfectacion: { select: { id: true, codigo: true, nombre: true } },
  presentacion: { include: { unidadMedida: { select: { id: true, codigo: true, nombre: true } } } },
} as const;

export async function obtenerCatalogosProductoService() {
  const [unidades, tipos, categorias, marcas, afectaciones, presentaciones] = await Promise.all([
    prisma.unidadMedida.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.tipoExistencia.findMany({ where: { activo: true }, orderBy: { codigo: "asc" } }),
    prisma.categoria.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.marca.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.tipoAfectacion.findMany({ where: { activo: true }, orderBy: { codigo: "asc" } }),
    prisma.presentacionCatalogo.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);
  return { unidades, tipos, categorias, marcas, afectaciones, presentaciones };
}

export async function obtenerProductosService(filtro?: string) {
  const q = filtro?.trim();
  const productos = await prisma.producto.findMany({
    where: q ? { OR: [{ codigo: { contains: q, mode: "insensitive" } }, { descripcion: { contains: q, mode: "insensitive" } }] } : undefined,
    include: catalogInclude,
    orderBy: [{ tipoInventario: "asc" }, { codigo: "asc" }],
  });
  return productos.map((p) => ({ ...p, precioVenta: Number(p.precioVenta) }));
}

export async function crearProductoService(input: ProductoInput) {
  return prisma.producto.create({
    data: {
      tipoInventario: input.tipoInventario,
      codigo: input.codigo.trim().toUpperCase(),
      codigoExistencia: input.codigoExistencia?.trim() || null,
      descripcion: input.descripcion.trim().toUpperCase(),
      observaciones: input.observaciones?.trim() || null,
      unidadMedidaId: input.unidadMedidaId,
      tipoExistenciaId: input.tipoExistenciaId,
      categoriaId: input.categoriaId ?? null,
      marcaId: input.marcaId ?? null,
      tipoAfectacionId: input.tipoAfectacionId ?? null,
      precioVenta: input.precioUnitario ?? 0,
    },
  });
}

export async function actualizarProductoService(id: string, input: ProductoInput) {
  return prisma.producto.update({
    where: { id },
    data: {
      tipoInventario: input.tipoInventario,
      codigo: input.codigo.trim().toUpperCase(),
      codigoExistencia: input.codigoExistencia?.trim() || null,
      descripcion: input.descripcion.trim().toUpperCase(),
      observaciones: input.observaciones?.trim() || null,
      unidadMedidaId: input.unidadMedidaId,
      tipoExistenciaId: input.tipoExistenciaId,
      categoriaId: input.categoriaId ?? null,
      marcaId: input.marcaId ?? null,
      tipoAfectacionId: input.tipoAfectacionId ?? null,
      precioVenta: input.precioUnitario ?? 0,
    },
  });
}

export async function cambiarEstadoProductoService(id: string, activo: boolean) {
  return prisma.producto.update({ where: { id }, data: { activo } });
}

export async function guardarPresentacionService(input: PresentacionInput) {
  return prisma.presentacion.upsert({
    where: { productoId: input.productoId },
    create: { productoId: input.productoId, nombre: input.nombre.trim().toUpperCase(), unidadMedidaId: input.unidadMedidaId ?? null },
    update: { nombre: input.nombre.trim().toUpperCase(), unidadMedidaId: input.unidadMedidaId ?? null, activo: true },
  });
}

export async function cambiarEstadoPresentacionService(id: string, activo: boolean) {
  return prisma.presentacion.update({ where: { id }, data: { activo } });
}

export async function eliminarProductoService(id: string): Promise<void> {
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      lotesBase: { select: { id: true }, take: 1 },
      movimientosBase: { select: { id: true }, take: 1 },
      movimientosPT: { select: { id: true }, take: 1 },
      ventasDetalle: { select: { id: true }, take: 1 },
    },
  });
  if (!producto) throw new Error("No se encontró el producto.");
  if (producto.lotesBase.length > 0 || producto.movimientosBase.length > 0 || producto.movimientosPT.length > 0 || producto.ventasDetalle.length > 0) {
    throw new Error("El producto tiene movimientos, lotes o ventas registradas y no puede eliminarse.");
  }
  await prisma.presentacion.deleteMany({ where: { productoId: id } });
  await prisma.producto.delete({ where: { id } });
}
