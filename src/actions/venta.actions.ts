"use server";

import { revalidatePath } from "next/cache";
import { ventaSchema, ventaFiltrosSchema } from "@/lib/validators/venta.schema";
import * as service from "@/lib/services/venta.service";
import type { VentaDTO, VentasPaginadasDTO } from "@/lib/services/venta.service";

export type VentaActionState = {
  success: boolean;
  message: string;
  data?: VentaDTO;
};

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return "Ya existe un comprobante con esa serie y número.";
  }
  if (typeof error === "object" && error && "code" in error && error.code === "P2003") {
    return "El registro está relacionado con otros datos y no puede modificarse de esa forma.";
  }
  return error instanceof Error ? error.message : fallback;
}

export async function guardarVenta(input: unknown): Promise<VentaActionState> {
  const parsed = ventaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos de venta inválidos",
    };
  }
  try {
    const venta = await service.crearVentaService(parsed.data);
    revalidatePath("/dashboard/ventas");
    return { success: true, message: "Venta registrada correctamente", data: venta };
  } catch (error) {
    return { success: false, message: errorMessage(error, "No se pudo registrar la venta") };
  }
}

export async function obtenerVenta(id: string): Promise<VentaDTO | null> {
  if (!id) return null;
  return service.obtenerVentaConDetallesService(id);
}

export async function obtenerVentas(input: unknown): Promise<VentasPaginadasDTO> {
  const parsed = ventaFiltrosSchema.safeParse(input);
  if (!parsed.success) {
    return { data: [], total: 0, page: 1, pageSize: 20, totalPaginas: 0 };
  }
  return service.obtenerVentasService(parsed.data);
}

export async function anularVenta(id: string): Promise<VentaActionState> {
  if (!id) return { success: false, message: "Venta inválida" };
  try {
    await service.anularVentaService(id);
    revalidatePath("/dashboard/ventas");
    return { success: true, message: "Comprobante anulado correctamente" };
  } catch (error) {
    return { success: false, message: errorMessage(error, "No se pudo anular la venta") };
  }
}

export async function eliminarVenta(id: string): Promise<VentaActionState> {
  if (!id) return { success: false, message: "Venta inválida" };
  try {
    await service.eliminarVentaService(id);
    revalidatePath("/dashboard/ventas");
    return { success: true, message: "Comprobante eliminado correctamente" };
  } catch (error) {
    return {
      success: false,
      message: errorMessage(error, "No se pudo eliminar la venta"),
    };
  }
}

export async function buscarProductos(filtro: string) {
  if (!filtro.trim()) return [];
  return service.buscarProductosVentaService(filtro);
}

export async function obtenerCatalogosVenta() {
  return service.obtenerCatalogosVentaService();
}

export async function obtenerProductosCatalogo() {
  return service.obtenerProductosCatalogoService();
}

export async function obtenerProximoNumero(tipoComprobante: string) {
  return service.obtenerProximoNumeroService(tipoComprobante);
}