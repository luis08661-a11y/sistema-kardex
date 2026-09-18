import { z } from "zod";

const texto = (nombre: string, max = 120) =>
  z.string().trim().min(1, `${nombre} es obligatorio`).max(max);

export const unidadMedidaSchema = z.object({
  codigo: z.string().trim().max(20).optional().or(z.literal("")),
  nombre: texto("El nombre"),
});

export const catalogoNombreSchema = z.object({
  nombre: texto("El nombre"),
});

export const catalogoCodigoNombreSchema = z.object({
  codigo: texto("El código", 30),
  nombre: texto("El nombre"),
});

export const almacenamientoSchema = z.object({
  codigo: texto("El código", 30),
  nombre: texto("El nombre"),
  establecimientoId: z.coerce.string().min(1, "Establecimiento inválido"),
});

export type UnidadMedidaInput = z.infer<typeof unidadMedidaSchema>;
export type CatalogoNombreInput = z.infer<typeof catalogoNombreSchema>;
export type CatalogoCodigoNombreInput = z.infer<typeof catalogoCodigoNombreSchema>;
export type AlmacenamientoInput = z.infer<typeof almacenamientoSchema>;
