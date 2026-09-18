import {
  obtenerVentaConDetallesService,
  type VentaDTO,
} from "@/lib/services/venta.service";
import {
  ventaDTOParaImprimir,
  type VentaParaImprimir,
} from "@/components/ventas/types";
import {
  crearDocumentoVenta,
  nombrePdfVenta,
} from "@/components/ventas/venta-export";
import { ENVIO_ERROR_CODES } from "@/lib/validators/envio-comprobante.validator";

export interface VentaPdfResultado {
  buffer: Buffer;
  extension: string;
  tipoComprobante: string;
  serie: string;
  numero: number;
}

export function nombreArchivoPdfVenta(venta: VentaParaImprimir): string {
  return `${nombrePdfVenta(venta)}.pdf`;
}

async function ventaToPdfBuffer(venta: VentaParaImprimir): Promise<Buffer> {
  const doc = await crearDocumentoVenta(venta);
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export async function generarPdfVentaService(ventaId: string): Promise<{
  buffer: Buffer;
  nombre: string;
  venta: VentaDTO;
}> {
  const venta = await obtenerVentaConDetallesService(ventaId);
  if (!venta) {
    throw new Error(ENVIO_ERROR_CODES.VENTA_NO_ENCONTRADA);
  }
  const imprimible = ventaDTOParaImprimir(venta);
  const buffer = await ventaToPdfBuffer(imprimible);

  return {
    buffer,
    nombre: nombreArchivoPdfVenta(imprimible),
    venta,
  };
}
