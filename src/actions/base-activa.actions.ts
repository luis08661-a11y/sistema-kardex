"use server";
import { revalidatePath } from "next/cache";
import { loteBaseSchema, movimientoBaseSchema } from "@/lib/validators/base-activa.schema";
import * as service from "@/lib/services/base-activa.service";

export type BaseState = { success: boolean; message: string };
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const n = (fd: FormData, k: string) => { const v = s(fd, k); return v === "" ? undefined : Number(v); };
function err(e: unknown, fallback: string) { if (typeof e === "object" && e && "code" in e && e.code === "P2002") return "El lote ya existe."; return e instanceof Error ? e.message : fallback; }

export async function obtenerContextoBase() { return service.obtenerContextoBaseService(); }
export async function obtenerLotesBase(filtro?: string) { return service.obtenerLotesBaseService(filtro); }
export async function obtenerMovimientosBase(filtros?: { productoId?: string; loteId?: string }) { return service.obtenerMovimientosBaseService(filtros); }
export async function obtenerStockBase() { return service.obtenerStockBaseService(); }

export async function guardarLoteBase(_prev: BaseState, fd: FormData): Promise<BaseState> {
  const parsed = loteBaseSchema.safeParse({ productoId: s(fd,"productoId"), codigo: s(fd,"codigo"), fechaIngreso: s(fd,"fechaIngreso") || undefined, observaciones: s(fd,"observaciones"), almacenamientoId: s(fd,"almacenamientoId") || null });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
  try { await service.crearLoteBaseService(parsed.data); revalidatePath("/dashboard/base-activa"); return { success: true, message: "Lote registrado correctamente" }; }
  catch (e) { return { success: false, message: err(e,"No se pudo registrar el lote") }; }
}

export async function guardarMovimientoBase(_prev: BaseState, fd: FormData): Promise<BaseState> {
  const parsed = movimientoBaseSchema.safeParse({
    periodoId:s(fd,"periodoId"), establecimientoId:s(fd,"establecimientoId"), productoId:s(fd,"productoId"), loteId:s(fd,"loteId"), almacenamientoId:s(fd,"almacenamientoId") || null,
    tipoOperacionId:s(fd,"tipoOperacionId") || null, fecha:s(fd,"fecha"), tipoMovimiento:s(fd,"tipoMovimiento"), observacion:s(fd,"observacion"), responsableRegistro:s(fd,"responsableRegistro"),
    entradaUnd:n(fd,"entradaUnd") ?? 0, entradaPesoKg:n(fd,"entradaPesoKg") ?? 0, entradaPesoTotalKg:n(fd,"entradaPesoTotalKg") ?? 0,
    salidaUnd:n(fd,"salidaUnd") ?? 0, salidaPesoUnitarioKg:n(fd,"salidaPesoUnitarioKg") ?? 0, salidaPesoTotalKg:n(fd,"salidaPesoTotalKg") ?? 0,
    formulacion:s(fd,"formulacion"), responsableFormulacion:s(fd,"responsableFormulacion"), cantidadProductoFormulado:n(fd,"cantidadProductoFormulado") ?? null,
    almacenamientoNombre:s(fd,"almacenamientoNombre"), costoUnitarioKg:n(fd,"costoUnitarioKg") ?? null,
  });
  if (!parsed.success) return { success:false, message:parsed.error.issues[0].message };
  try { await service.crearMovimientoBaseService(parsed.data); revalidatePath("/dashboard/base-activa"); return { success:true, message:"Movimiento registrado correctamente" }; }
  catch(e) { return { success:false, message:err(e,"No se pudo registrar el movimiento") }; }
}
