"use server";

import { revalidatePath } from "next/cache";
import { loteGestionSchema } from "@/lib/validators/lotes.schema";
import {
  actualizarLoteService,
  crearLoteService,
  eliminarLoteService,
  obtenerContextoLotesService,
  obtenerLotesService,
  type ContextoLotes,
  type LoteListado,
} from "@/lib/services/lotes.service";

export type LoteState = { success: boolean; message: string };

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");

function err(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export async function obtenerLotes(filtro?: string): Promise<LoteListado[]> {
  return obtenerLotesService(filtro);
}

export async function obtenerContextoLotes(): Promise<ContextoLotes> {
  return obtenerContextoLotesService();
}

export async function crearLote(_prev: LoteState, fd: FormData): Promise<LoteState> {
  const parsed = loteGestionSchema.safeParse({
    productoId: s(fd, "productoId"),
    codigo: s(fd, "codigo"),
    fechaIngreso: s(fd, "fechaIngreso"),
    pesoUnitarioKg: s(fd, "pesoUnitarioKg"),
    almacenamientoId: s(fd, "almacenamientoId") || null,
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    await crearLoteService(parsed.data);
    revalidatePath("/dashboard/lotes");
    return { success: true, message: "Lote creado correctamente" };
  } catch (e) {
    return { success: false, message: err(e, "No se pudo crear el lote") };
  }
}

export async function actualizarLote(_prev: LoteState, fd: FormData): Promise<LoteState> {
  const id = s(fd, "id");
  if (!id) return { success: false, message: "Lote no identificado" };

  const parsed = loteGestionSchema.safeParse({
    productoId: s(fd, "productoId"),
    codigo: s(fd, "codigo"),
    fechaIngreso: s(fd, "fechaIngreso"),
    pesoUnitarioKg: s(fd, "pesoUnitarioKg"),
    almacenamientoId: s(fd, "almacenamientoId") || null,
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    await actualizarLoteService(id, parsed.data);
    revalidatePath("/dashboard/lotes");
    return { success: true, message: "Lote actualizado correctamente" };
  } catch (e) {
    return { success: false, message: err(e, "No se pudo actualizar el lote") };
  }
}

export async function eliminarLote(fd: FormData): Promise<LoteState> {
  const id = String(fd.get("id") ?? "");
  if (!id) return { success: false, message: "Lote no identificado" };

  try {
    await eliminarLoteService(id);
    revalidatePath("/dashboard/lotes");
    return { success: true, message: "Lote eliminado correctamente" };
  } catch (e) {
    return { success: false, message: err(e, "No se pudo eliminar el lote") };
  }
}