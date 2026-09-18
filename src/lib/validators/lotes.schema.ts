import { z } from "zod";

const fechaValida = z
  .string()
  .transform((value, ctx) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La fecha es obligatoria y debe ser válida" });
      return z.NEVER;
    }
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), 12);
  });

export const loteGestionSchema = z.object({
  productoId: z.coerce.string().min(1, "Seleccione un producto"),
  codigo: z.string().trim().min(1, "El lote es obligatorio").max(100),
  fechaIngreso: fechaValida,
  pesoUnitarioKg: z.coerce.number().finite().min(0, "El peso no puede ser negativo").default(0),
  almacenamientoId: z.coerce.string().optional().nullable(),
});

export type LoteGestionInput = z.infer<typeof loteGestionSchema>;