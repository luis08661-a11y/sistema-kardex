import { z } from "zod";
export const filtrosReporteSchema = z.object({
  productoId: z.coerce.string().optional(),
  presentacionId: z.coerce.string().optional(),
  periodoId: z.coerce.string().optional(),
  establecimientoId: z.coerce.string().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});
export type FiltrosReporte = z.infer<typeof filtrosReporteSchema>;

export const reporteStockPTSchema = z.object({
  fechaCorte: z.string().optional(),
  periodoId: z.coerce.string().optional(),
  establecimientoId: z.coerce.string().optional(),
  productoId: z.coerce.string().optional(),
  soloConStock: z.coerce.boolean().optional(),
});
export type ReporteStockPTInput = z.infer<typeof reporteStockPTSchema>;
