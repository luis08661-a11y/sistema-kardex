"use server";

import { revalidatePath } from "next/cache";
import { productoSchema, presentacionSchema } from "@/lib/validators/productos.schema";
import * as service from "@/lib/services/productos.service";

export type ProductoState = { success: boolean; message: string };
const text = (fd: FormData, key: string) => String(fd.get(key) ?? "");

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") return "Ya existe un registro con ese código o presentación.";
  if (typeof error === "object" && error && "code" in error && error.code === "P2003") return "El registro está relacionado con otros datos y no puede modificarse de esa forma.";
  return error instanceof Error ? error.message : fallback;
}

export async function obtenerProductos(filtro?: string) { return service.obtenerProductosService(filtro); }
export async function obtenerCatalogosProducto() { return service.obtenerCatalogosProductoService(); }

function productoRaw(fd: FormData) {
  return {
    tipoInventario: text(fd, "tipoInventario"), codigo: text(fd, "codigo"), codigoExistencia: text(fd, "codigoExistencia"), descripcion: text(fd, "descripcion"),
    observaciones: text(fd, "observaciones"), unidadMedidaId: text(fd, "unidadMedidaId"), tipoExistenciaId: text(fd, "tipoExistenciaId"),
    presentacionNombre: text(fd, "presentacionNombre"), presentacionUnidadMedidaId: text(fd, "presentacionUnidadMedidaId"),
    categoriaId: text(fd, "categoriaId"), marcaId: text(fd, "marcaId"), tipoAfectacionId: text(fd, "tipoAfectacionId"),
    precioUnitario: text(fd, "precioUnitario"),
  };
}

export async function guardarProducto(_prev: ProductoState, fd: FormData): Promise<ProductoState> {
  const parsed = productoSchema.safeParse(productoRaw(fd));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
  try {
    const id = text(fd, "id");
    const data = parsed.data;
    let productoId = id || null;
    if (productoId) await service.actualizarProductoService(productoId, data);
    else productoId = (await service.crearProductoService(data)).id;
    if (data.tipoInventario === "PRODUCTO_TERMINADO" && data.presentacionNombre) {
      await service.guardarPresentacionService({ productoId, nombre: data.presentacionNombre, unidadMedidaId: data.presentacionUnidadMedidaId ?? data.unidadMedidaId });
    }
    revalidatePath("/dashboard/productos");
    return { success: true, message: id ? "Producto actualizado correctamente" : "Producto registrado correctamente" };
  } catch (error) { return { success: false, message: errorMessage(error, "No se pudo guardar el producto") }; }
}

export async function cambiarEstadoProducto(fd: FormData): Promise<ProductoState> {
  const id = text(fd, "id");
  const activo = text(fd, "activo") === "true";
  if (!id) return { success: false, message: "Producto inválido" };
  try { await service.cambiarEstadoProductoService(id, activo); revalidatePath("/dashboard/productos"); return { success: true, message: "Estado actualizado" }; }
  catch (error) { return { success: false, message: errorMessage(error, "No se pudo actualizar el estado") }; }
}

export async function guardarPresentacion(_prev: ProductoState, fd: FormData): Promise<ProductoState> {
  const parsed = presentacionSchema.safeParse({ productoId: text(fd, "productoId"), nombre: text(fd, "nombre"), unidadMedidaId: text(fd, "unidadMedidaId") });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
  try { await service.guardarPresentacionService(parsed.data); revalidatePath("/dashboard/productos"); return { success: true, message: "Presentación guardada correctamente" }; }
  catch (error) { return { success: false, message: errorMessage(error, "No se pudo guardar la presentación") }; }
}

export async function cambiarEstadoPresentacion(fd: FormData): Promise<ProductoState> {
  const id = text(fd, "id"); const activo = text(fd, "activo") === "true";
  if (!id) return { success: false, message: "Presentación inválida" };
  try { await service.cambiarEstadoPresentacionService(id, activo); revalidatePath("/dashboard/productos"); return { success: true, message: "Estado de presentación actualizado" }; }
  catch (error) { return { success: false, message: errorMessage(error, "No se pudo actualizar la presentación") }; }
}

export async function eliminarProducto(fd: FormData): Promise<ProductoState> {
  const id = text(fd, "id");
  if (!id) return { success: false, message: "Producto inválido" };
  try { await service.eliminarProductoService(id); revalidatePath("/dashboard/productos"); return { success: true, message: "Producto eliminado correctamente" }; }
  catch (error) { return { success: false, message: errorMessage(error, "No se pudo eliminar el producto") }; }
}
