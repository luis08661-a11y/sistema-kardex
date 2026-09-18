"use server";

import { revalidatePath } from "next/cache";

import { registroInventarioSchema } from "@/lib/validators/inventory.schema";
import {
  crearRegistroService,
  obtenerKardexService,
  obtenerProductosConLotesService,
  actualizarRegistroService,
  eliminarRegistroService,
  obtenerKardexResumenService,
  type KardexQueryParams,
  type KardexResumen,
} from "@/lib/services/inventory.service";

export type InventoryState = {
  success: boolean;
  message: string;
};

function sanitizarFormulario(formData: FormData) {
  const num = (k: string, _default = "") => {
    const v = String(formData.get(k) ?? "");
    return v === "" ? _default : v;
  };
  return {
    periodoId: String(formData.get("periodoId") ?? ""),
    establecimientoId: String(formData.get("establecimientoId") ?? ""),
    productoId: String(formData.get("productoId") ?? ""),
    loteId: String(formData.get("loteId") ?? ""),
    almacenamientoId: String(formData.get("almacenamientoId") ?? ""),
    tipoOperacionId: String(formData.get("tipoOperacionId") ?? ""),
    fecha: String(formData.get("fecha") ?? ""),
    tipoMovimiento: String(formData.get("tipoMovimiento") ?? ""),
    unidades: num("unidades", "0"),
    pesoUnitario: num("pesoUnitario", "0"),
    pesoTotal: num("pesoTotal", "0"),
    observacion: String(formData.get("observacion") ?? ""),
    responsable: String(formData.get("responsable") ?? ""),
    formulacion: String(formData.get("formulacion") ?? ""),
    responsableFormulacion: String(formData.get("responsableFormulacion") ?? ""),
    cantidadProductoFormulado: String(formData.get("cantidadProductoFormulado") ?? ""),
    almacenamientoNombre: String(formData.get("almacenamientoNombre") ?? ""),
    costoUnitarioKg: String(formData.get("costoUnitarioKg") ?? ""),
  };
}

export async function crearRegistroInventario(
  _prevState: InventoryState,
  formData: FormData
): Promise<InventoryState> {
  const validation = registroInventarioSchema.safeParse(sanitizarFormulario(formData));

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  try {
    await crearRegistroService(validation.data);
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      message: "Registro de inventario creado correctamente",
    };
  } catch (error) {
    console.error("Error al crear registro de inventario:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error al crear el registro de inventario",
    };
  }
}

export async function obtenerKardex(codigoLote?: string) {
  return obtenerKardexService(codigoLote);
}

export async function obtenerKardexPaginado(
  params: KardexQueryParams
): Promise<KardexResumen> {
  return obtenerKardexResumenService(params);
}

export async function obtenerProductosConLotes() {
  return obtenerProductosConLotesService();
}

export async function actualizarRegistroInventario(
  _prevState: InventoryState,
  formData: FormData
): Promise<InventoryState> {
  const movimientoId = String(formData.get("movimientoId") ?? "");
  if (!movimientoId) {
    return { success: false, message: "ID del movimiento no proporcionado" };
  }

  const validation = registroInventarioSchema.safeParse(sanitizarFormulario(formData));

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  try {
    await actualizarRegistroService(movimientoId, validation.data);
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      message: "Registro de inventario actualizado correctamente",
    };
  } catch (error) {
    console.error("Error al actualizar registro de inventario:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error al actualizar el registro de inventario",
    };
  }
}

export async function eliminarRegistroInventario(
  _prevState: InventoryState,
  formData: FormData
): Promise<InventoryState> {
  const movimientoId = String(formData.get("movimientoId") ?? "");

  if (!movimientoId) {
    return {
      success: false,
      message: "ID del movimiento no proporcionado",
    };
  }

  try {
    await eliminarRegistroService(movimientoId);
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      message: "Registro de inventario eliminado correctamente",
    };
  } catch (error) {
    console.error("Error al eliminar registro de inventario:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error al eliminar el registro de inventario",
    };
  }
}