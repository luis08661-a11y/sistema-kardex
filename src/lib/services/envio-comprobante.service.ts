import type { TipoEnvio, EstadoEnvio } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface EnvioComprobanteDTO {
  id: string;
  ventaId: string;
  tipo: TipoEnvio;
  estado: EstadoEnvio;
  destino: string;
  mensaje: string;
  error: string | null;
  enviadoAt: Date | null;
  createdAt: Date;
}

export async function registrarEnvioComprobanteService(params: {
  ventaId: string;
  tipo: TipoEnvio;
  destino: string;
  mensaje: string;
  usuarioId?: string | null;
}): Promise<EnvioComprobanteDTO> {
  const envio = await prisma.envioComprobante.create({
    data: {
      ventaId: params.ventaId,
      tipo: params.tipo,
      estado: "PENDIENTE",
      destino: params.destino,
      mensaje: params.mensaje,
      usuarioId: params.usuarioId ?? null,
    },
  });
  return mapearEnvio(envio);
}

export async function actualizarEnvioComprobanteService(params: {
  envioId: string;
  estado: EstadoEnvio;
  error?: string | null;
  enviadoAt?: Date | null;
}): Promise<EnvioComprobanteDTO> {
  const envio = await prisma.envioComprobante.update({
    where: { id: params.envioId },
    data: {
      estado: params.estado,
      error: params.error ?? null,
      enviadoAt: params.enviadoAt ?? null,
    },
  });
  return mapearEnvio(envio);
}

export async function listarEnviosComprobanteService(ventaId: string): Promise<EnvioComprobanteDTO[]> {
  const envios = await prisma.envioComprobante.findMany({
    where: { ventaId },
    orderBy: { createdAt: "desc" },
  });
  return envios.map(mapearEnvio);
}

function mapearEnvio(envio: {
  id: string;
  ventaId: string;
  tipo: TipoEnvio;
  estado: EstadoEnvio;
  destino: string;
  mensaje: string;
  error: string | null;
  enviadoAt: Date | null;
  createdAt: Date;
}): EnvioComprobanteDTO {
  return {
    id: envio.id,
    ventaId: envio.ventaId,
    tipo: envio.tipo,
    estado: envio.estado,
    destino: envio.destino,
    mensaje: envio.mensaje,
    error: envio.error,
    enviadoAt: envio.enviadoAt,
    createdAt: envio.createdAt,
  };
}