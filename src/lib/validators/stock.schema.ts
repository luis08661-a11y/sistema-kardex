import { z } from "zod";

const positiveInt = z.coerce.string().min(1);

export const stockFilterSchema = z.object({
  productoId: z.coerce.string().optional(),
  periodoId: z.coerce.string().optional(),
  establecimientoId: z.coerce.string().optional(),
});

export const kardexBaseSchema = z.object({
  productoId: positiveInt,
  periodoId: z.coerce.string().optional(),
  establecimientoId: z.coerce.string().optional(),
});

export const kardexPTSchema = kardexBaseSchema.extend({
  presentacionId: z.coerce.string().optional(),
});

export const stockLoteSchema = z.object({
  productoId: z.coerce.string().optional(),
  loteId: z.coerce.string().optional(),
  establecimientoId: z.coerce.string().optional(),
  periodoId: z.coerce.string().optional(),
  soloConStock: z.preprocess((v) => v === "true" || v === true, z.boolean().optional()),
});
