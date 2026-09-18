"use server";

import { revalidatePath } from "next/cache";
import {
  reconstruirBaseSchema,
  reconstruirPTSchema,
} from "@/lib/validators/peps.schema";
import {
  reconstruirPEPSBaseService,
  reconstruirPEPSPTService,
} from "@/lib/services/peps.service";

export type PepsState = { success: boolean; message: string };

export async function reconstruirPEPSBase(
  _prev: PepsState,
  formData: FormData,
): Promise<PepsState> {
  const parsed = reconstruirBaseSchema.safeParse({
    productoId: formData.get("productoId"),
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    const r = await reconstruirPEPSBaseService(parsed.data.productoId);
    revalidatePath("/dashboard/peps");
    revalidatePath("/dashboard/base-activa");
    return {
      success: true,
      message: `PEPS Base reconstruido: ${r.capas} capas, ${r.salidasProcesadas} salidas procesadas, stock ${r.stock.toString()} Kg.`,
    };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "No se pudo reconstruir PEPS Base" };
  }
}

export async function reconstruirPEPSPT(
  _prev: PepsState,
  formData: FormData,
): Promise<PepsState> {
  const parsed = reconstruirPTSchema.safeParse({
    productoId: formData.get("productoId"),
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    const r = await reconstruirPEPSPTService(parsed.data.productoId);
    revalidatePath("/dashboard/peps");
    revalidatePath("/dashboard/producto-terminado");
    return {
      success: true,
      message: `PEPS PT reconstruido: ${r.capas} capas, ${r.salidasProcesadas} salidas procesadas, stock ${r.stock.toString()}.`,
    };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "No se pudo reconstruir PEPS PT" };
  }
}
