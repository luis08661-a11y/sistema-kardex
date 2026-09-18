import { z } from "zod";

export const reconstruirBaseSchema = z.object({
  productoId: z.coerce.string().min(1, "Producto inválido"),
});

export const reconstruirPTSchema = z.object({
  productoId: z.coerce.string().min(1, "Producto inválido"),
});

export type ReconstruirBaseInput = z.infer<typeof reconstruirBaseSchema>;
export type ReconstruirPTInput = z.infer<typeof reconstruirPTSchema>;
