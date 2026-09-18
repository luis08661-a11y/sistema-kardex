"use server";

import { revalidatePath } from "next/cache";
import { movimientoPTSchema } from "@/lib/validators/producto-terminado.schema";
import {
  createMovimientoPT,
  getProductoTerminadoView,
  getStockProductoPT,
  eliminarMovimientoPTService,
  actualizarMovimientoPTService,
} from "@/lib/services/producto-terminado.service";

export async function obtenerProductoTerminado(periodoId?: string) { return getProductoTerminadoView(periodoId); }

export async function obtenerStockPT(productoId: string, presentacionId?: string | null) {
  try {
    const stock = await getStockProductoPT(productoId, presentacionId);
    return { ok: true, ...stock };
  } catch (e) {
    return { ok: false, stock: 0, costoValorizado: 0, message: e instanceof Error ? e.message : "Error al obtener stock" };
  }
}

export async function registrarMovimientoPT(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = movimientoPTSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, message: parsed.error.issues.map((i) => i.message).join(" ") };
    await createMovimientoPT(parsed.data, null);
    revalidatePath("/dashboard/producto-terminado");
    return { ok: true, message: "Movimiento de Producto Terminado registrado correctamente." };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "No se pudo registrar el movimiento." }; }
}

export async function eliminarMovimientoPT(movimientoId: string) {
  try {
    await eliminarMovimientoPTService(movimientoId);
    revalidatePath("/dashboard/producto-terminado");
    return { ok: true, message: "Movimiento eliminado correctamente." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "No se pudo eliminar el movimiento." };
  }
}

export async function actualizarMovimientoPT(movimientoId: string, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = movimientoPTSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, message: parsed.error.issues.map((i) => i.message).join(" ") };
    await actualizarMovimientoPTService(movimientoId, parsed.data);
    revalidatePath("/dashboard/producto-terminado");
    return { ok: true, message: "Movimiento actualizado correctamente." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "No se pudo actualizar el movimiento." };
  }
}
