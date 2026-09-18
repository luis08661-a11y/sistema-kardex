import { z } from "zod";

const positive = z.coerce.number().finite().min(0);

export const loteBaseSchema = z.object({
  productoId: z.coerce.string().min(1, "Seleccione un producto"),
  codigo: z.string().trim().min(1, "El lote es obligatorio").max(100),
  fechaIngreso: z.coerce.date().optional(),
  observaciones: z.string().trim().max(500).optional().or(z.literal("")),
  almacenamientoId: z.coerce.string().optional().nullable(),
});

export const movimientoBaseSchema = z.object({
  periodoId: z.coerce.string().min(1, "Seleccione un periodo"),
  establecimientoId: z.coerce.string().min(1, "Seleccione un establecimiento"),
  productoId: z.coerce.string().min(1, "Seleccione un producto"),
  loteId: z.coerce.string().min(1, "Seleccione un lote"),
  almacenamientoId: z.coerce.string().optional().nullable(),
  tipoOperacionId: z.coerce.string().optional().nullable(),
  fecha: z.coerce.date(),
  tipoMovimiento: z.enum(["ENTRADA", "SALIDA"]),
  observacion: z.string().trim().max(500).optional().or(z.literal("")),
  responsableRegistro: z.string().trim().max(150).optional().or(z.literal("")),
  entradaUnd: positive.default(0),
  entradaPesoKg: positive.default(0),
  entradaPesoTotalKg: positive.default(0),
  salidaUnd: positive.default(0),
  salidaPesoUnitarioKg: positive.default(0),
  salidaPesoTotalKg: positive.default(0),
  formulacion: z.string().trim().max(150).optional().or(z.literal("")),
  responsableFormulacion: z.string().trim().max(150).optional().or(z.literal("")),
  cantidadProductoFormulado: positive.optional().nullable(),
  almacenamientoNombre: z.string().trim().max(150).optional().or(z.literal("")),
  costoUnitarioKg: positive.optional().nullable(),
}).superRefine((v, ctx) => {
  if (v.tipoMovimiento === "ENTRADA") {
    if (v.entradaPesoTotalKg <= 0) ctx.addIssue({ code: "custom", path: ["entradaPesoTotalKg"], message: "La entrada debe tener peso total mayor a 0" });
  } else if (v.salidaPesoTotalKg <= 0) {
    ctx.addIssue({ code: "custom", path: ["salidaPesoTotalKg"], message: "La salida debe tener peso total mayor a 0" });
  }
});

export type LoteBaseInput = z.infer<typeof loteBaseSchema>;
export type MovimientoBaseInput = z.infer<typeof movimientoBaseSchema>;
