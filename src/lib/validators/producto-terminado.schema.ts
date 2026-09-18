import { z } from "zod";

const decimal = z.coerce.number().finite().min(0);

export const movimientoPTSchema = z.object({
  periodoId: z.coerce.string().min(1, "Seleccione un periodo"),
  establecimientoId: z.coerce.string().min(1, "Seleccione un establecimiento"),
  productoId: z.coerce.string().min(1, "Seleccione un producto"),
  presentacionId: z.coerce.string().optional().nullable(),
  tipoOperacionId: z.coerce.string().optional().nullable(),
  fecha: z.coerce.date(),
  tipoMovimiento: z.enum(["ENTRADA", "SALIDA"]),
  documentoTraslado: z.string().trim().max(100).optional().or(z.literal("")),
  serie: z.string().trim().max(30).optional().or(z.literal("")),
  numero: z.string().trim().max(30).optional().or(z.literal("")),
  observacion: z.string().trim().max(500).optional().or(z.literal("")),
  responsableDespacho: z.string().trim().max(150).optional().or(z.literal("")),
  cantidad: decimal.refine((v) => v > 0, "La cantidad debe ser mayor que 0"),
  costoUnitario: decimal,
  motivo: z.enum(["PRODUCCION", "VENTA", "ENSAYO"]).optional().nullable(),
  facturaGuia: z.string().trim().max(100).optional().or(z.literal("")),
  empresaDestino: z.string().trim().max(200).optional().or(z.literal("")),
  ingCampo: z.string().trim().max(150).optional().or(z.literal("")),
});

export type MovimientoPTInput = z.infer<typeof movimientoPTSchema>;
