"use server";

import { revalidatePath } from "next/cache";
import {
  almacenamientoSchema,
  catalogoCodigoNombreSchema,
  catalogoNombreSchema,
  unidadMedidaSchema,
} from "@/lib/validators/catalogos.schema";
import {
  actualizarCatalogoService,
  cambiarEstadoCatalogoService,
  crearAfectacionService,
  crearAlmacenamientoService,
  crearCategoriaService,
  crearMarcaService,
  crearOperacionService,
  crearPresentacionService,
  crearTipoExistenciaService,
  crearUnidadService,
  eliminarCatalogoService,
  obtenerCatalogosService,
} from "@/lib/services/catalogos.service";

export type CatalogoState = { success: boolean; message: string };

function ok(message: string): CatalogoState { return { success: true, message }; }
function fail(error: unknown): CatalogoState {
  if (typeof error === "object" && error && "code" in error && error.code === "P2003") {
    return { success: false, message: "No se puede eliminar: el registro está en uso por otras tablas." };
  }
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return { success: false, message: "Ya existe un registro con ese código o nombre." };
  }
  return { success: false, message: error instanceof Error ? error.message : "No se pudo completar la operación" };
}

export async function obtenerCatalogos() { return obtenerCatalogosService(); }

export async function crearUnidad(_prev: CatalogoState, formData: FormData): Promise<CatalogoState> {
  const parsed = unidadMedidaSchema.safeParse({ codigo: String(formData.get("codigo") ?? ""), nombre: String(formData.get("nombre") ?? "") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message);
  try { await crearUnidadService(parsed.data); revalidatePath("/dashboard/catalogos"); return ok("Unidad de medida creada"); } catch (e) { return fail(e); }
}

export async function crearPresentacion(_prev: CatalogoState, formData: FormData): Promise<CatalogoState> {
  const parsed = unidadMedidaSchema.safeParse({ codigo: String(formData.get("codigo") ?? ""), nombre: String(formData.get("nombre") ?? "") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message);
  try {
    await crearPresentacionService(parsed.data);
    revalidatePath("/dashboard/catalogos");
    revalidatePath("/dashboard/productos");
    return ok("Presentación creada");
  } catch (e) { return fail(e); }
}

export async function actualizarCatalogo(_prev: CatalogoState, formData: FormData): Promise<CatalogoState> {
  const tipo = String(formData.get("tipo") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!tipo || !id) return fail("Datos inválidos");
  const parsed = unidadMedidaSchema.safeParse({ codigo: String(formData.get("codigo") ?? ""), nombre: String(formData.get("nombre") ?? "") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message);
  try { await actualizarCatalogoService(tipo, id, parsed.data); revalidatePath("/dashboard/catalogos"); return ok("Registro actualizado"); } catch (e) { return fail(e); }
}

export async function eliminarCatalogo(_prev: CatalogoState, formData: FormData): Promise<CatalogoState> {
  const tipo = String(formData.get("tipo") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!tipo || !id) return fail("Datos inválidos");
  try { await eliminarCatalogoService(tipo, id); revalidatePath("/dashboard/catalogos"); return ok("Registro eliminado"); } catch (e) { return fail(e); }
}

async function crearCodigoNombre(
  formData: FormData,
  service: (data: { codigo: string; nombre: string }) => Promise<unknown>,
  mensaje: string,
): Promise<CatalogoState> {
  const parsed = catalogoCodigoNombreSchema.safeParse({ codigo: String(formData.get("codigo") ?? ""), nombre: String(formData.get("nombre") ?? "") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message);
  try { await service(parsed.data); revalidatePath("/dashboard/catalogos"); return ok(mensaje); } catch (e) { return fail(e); }
}

async function crearNombre(
  formData: FormData,
  service: (data: { nombre: string }) => Promise<unknown>,
  mensaje: string,
): Promise<CatalogoState> {
  const parsed = catalogoNombreSchema.safeParse({ nombre: String(formData.get("nombre") ?? "") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message);
  try { await service(parsed.data); revalidatePath("/dashboard/catalogos"); return ok(mensaje); } catch (e) { return fail(e); }
}

export const crearTipoExistencia = async (_prev: CatalogoState, fd: FormData) => crearCodigoNombre(fd, crearTipoExistenciaService, "Tipo de existencia creado");
export const crearCategoria = async (_prev: CatalogoState, fd: FormData) => crearNombre(fd, crearCategoriaService, "Categoría creada");
export const crearMarca = async (_prev: CatalogoState, fd: FormData) => crearNombre(fd, crearMarcaService, "Marca creada");
export const crearTipoAfectacion = async (_prev: CatalogoState, fd: FormData) => crearCodigoNombre(fd, crearAfectacionService, "Tipo de afectación creado");
export const crearTipoOperacion = async (_prev: CatalogoState, fd: FormData) => crearCodigoNombre(fd, crearOperacionService, "Tipo de operación creado");

export async function crearAlmacenamiento(_prev: CatalogoState, formData: FormData): Promise<CatalogoState> {
  const parsed = almacenamientoSchema.safeParse({
    codigo: String(formData.get("codigo") ?? ""),
    nombre: String(formData.get("nombre") ?? ""),
    establecimientoId: formData.get("establecimientoId"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message);
  try { await crearAlmacenamientoService(parsed.data); revalidatePath("/dashboard/catalogos"); return ok("Almacenamiento creado"); } catch (e) { return fail(e); }
}

export async function cambiarEstadoCatalogo(_prev: CatalogoState, formData: FormData): Promise<CatalogoState> {
  const tipo = String(formData.get("tipo") ?? "");
  const id = String(formData.get("id") ?? "");
  const activo = String(formData.get("activo")) === "true";
  if (!tipo || !id) return fail("Datos inválidos");
  try { await cambiarEstadoCatalogoService(tipo, id, activo); revalidatePath("/dashboard/catalogos"); return ok(activo ? "Registro activado" : "Registro desactivado"); } catch (e) { return fail(e); }
}
