import { z } from "zod";

export const empresaSchema = z.object({
  ruc: z.string().trim().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  razonSocial: z.string().trim().min(2, "La razón social es obligatoria").max(200),
  logoUrl: z.string().trim().max(500).optional().default(""),
  firmaUrl: z.string().trim().max(500).optional().default(""),
  responsableReporte: z.string().trim().max(200).optional().default(""),
  cargoReporte: z.string().trim().max(200).optional().default(""),
});

export const periodoSchema = z.object({
  empresaId: z.string().min(1, "Empresa inválida"),
  anio: z.coerce.number().int().min(2000, "Año inválido").max(2100, "Año inválido"),
});

export const establecimientoSchema = z.object({
  empresaId: z.string().min(1, "Empresa inválida"),
  codigo: z.string().trim().max(30, "El código es demasiado largo").optional().default(""),
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(150),
  direccion: z.string().trim().max(250).optional().default(""),
});

export type EmpresaInput = z.infer<typeof empresaSchema>;
export type PeriodoInput = z.infer<typeof periodoSchema>;
export type EstablecimientoInput = z.infer<typeof establecimientoSchema>;
