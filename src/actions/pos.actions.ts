"use server";

import { revalidatePath } from "next/cache";
import {
  posVentaSchema,
  consultaDocumentoSchema,
  posCatalogoFiltrosSchema,
  posDirectorioFiltrosSchema,
  clientePosSchema,
} from "@/lib/validators/pos.schema";
import * as service from "@/lib/services/pos.service";
import { consultarDniReniecService } from "@/lib/services/external/reniec.service";
import { consultarRucSunatService } from "@/lib/services/external/sunat.service";
import { consultarTipoCambioService } from "@/lib/services/external/tipo-cambio.service";
import type {
  DatosPosDTO,
  HistorialVentasPosDTO,
  VentaPosGuardadaDTO,
  PosSerieInfo,
  CatalogoPaginadoDTO,
  ProductoPosDTO,
  ClienteSeleccionableDTO,
} from "@/lib/services/pos.service";

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return "Ya existe un comprobante con esa serie y número.";
  }
  if (typeof error === "object" && error && "code" in error && error.code === "P2003") {
    return "El registro está relacionado con otros datos y no puede guardarse de esa forma.";
  }
  return error instanceof Error ? error.message : fallback;
}

export async function obtenerDatosPos(): Promise<DatosPosDTO> {
  return service.obtenerDatosPosService();
}

export async function obtenerTipoCambioPos() {
  return consultarTipoCambioService();
}

export async function obtenerProximoNumeroPos(
  tipoComprobante: string,
  serie: string,
): Promise<PosSerieInfo> {
  return service.obtenerProximoNumeroSerieService(tipoComprobante, serie);
}

export async function buscarProductosPos(filtro: string): Promise<ProductoPosDTO[]> {
  if (!filtro.trim()) return [];
  return service.buscarProductosPosService(filtro);
}

export async function obtenerCatalogoPos(input: unknown): Promise<CatalogoPaginadoDTO> {
  const parsed = posCatalogoFiltrosSchema.safeParse(input);
  if (!parsed.success) {
    return { data: [], total: 0, page: 1, pageSize: 24, totalPaginas: 0 };
  }
  return service.obtenerCatalogoPosService(parsed.data);
}

export async function obtenerHistorialVentasPos(): Promise<HistorialVentasPosDTO> {
  return service.obtenerHistorialVentasPosService();
}

export async function buscarClientesDirectorio(input: unknown): Promise<ClienteSeleccionableDTO[]> {
  const parsed = posDirectorioFiltrosSchema.safeParse(input);
  const q = parsed.success ? parsed.data.q ?? "" : "";
  return service.buscarClientesDirectorioService(q);
}

export async function guardarClientePos(input: unknown): Promise<ClienteSeleccionableDTO> {
  const parsed = clientePosSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos del cliente inválidos");
  }
  return service.guardarClientePosService(parsed.data);
}

export async function consultarDocumentoPos(
  input: unknown,
): Promise<{
  success: boolean;
  persona?: { nombre?: string; razonSocial?: string; direccion?: string };
  cliente?: ClienteSeleccionableDTO;
}> {
  const parsed = consultaDocumentoSchema.safeParse(input);
  if (!parsed.success) return { success: false };
  const { tipo, numero } = parsed.data;

  const clienteLocal = await service.buscarClientePorDocumentoService(tipo, numero);
  if (clienteLocal) {
    return {
      success: true,
      cliente: clienteLocal,
      persona: {
        razonSocial: clienteLocal.razonSocial,
        direccion: clienteLocal.direccion,
      },
    };
  }

  if (tipo === "DNI") {
    const persona = await consultarDniReniecService(numero);
    if (!persona) return { success: false };
    return {
      success: true,
      persona: {
        nombre: `${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.trim(),
      },
    };
  }
  const persona = await consultarRucSunatService(numero);
  if (!persona) return { success: false };
  return {
    success: true,
    persona: { razonSocial: persona.razonSocial, direccion: persona.direccion },
  };
}

export async function guardarVentaPos(
  input: unknown,
): Promise<{ success: boolean; message: string; data: VentaPosGuardadaDTO | null }> {
  const parsed = posVentaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos de venta inválidos",
      data: null,
    };
  }
  try {
    const venta = await service.guardarVentaPosService(parsed.data);
    revalidatePath("/dashboard/venta-pos");
    return { success: true, message: "Venta registrada correctamente", data: venta };
  } catch (error) {
    return { success: false, message: errorMessage(error, "No se pudo registrar la venta"), data: null };
  }
}

export async function verificarSeriePos(tipoComprobante: string, serie: string) {
  return service.esSerieUsadaService(tipoComprobante, serie);
}