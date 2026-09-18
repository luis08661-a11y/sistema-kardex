import { z } from "zod";

export const clienteSchema = z.object({
  id: z.string().trim().optional().default(""),
  empresaId: z.string().trim().min(1, "Empresa inválida").optional().default(""),
  tipoDocumento: z.enum(["DNI", "RUC", "CE", "PASAPORTE", "OTRO"]),
  numeroDocumento: z
    .string()
    .trim()
    .min(1, "El número de documento es obligatorio")
    .max(20),
  razonSocial: z
    .string()
    .trim()
    .min(2, "La razón social / nombre es obligatorio")
    .max(200),
  direccion: z.string().trim().max(250).optional().default(""),
  telefono: z.string().trim().max(30).optional().default(""),
  email: z
    .string()
    .trim()
    .email("Correo inválido")
    .or(z.literal(""))
    .optional()
    .default(""),
  activo: z.boolean().optional().default(true),
});

export const clienteBusquedaSchema = z.object({
  q: z.string().trim().min(1),
});

export const clienteFiltrosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().max(100).optional().default(""),
  estado: z.enum(["TODOS", "ACTIVO", "INACTIVO"]).default("TODOS"),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
export type ClienteBusquedaInput = z.infer<typeof clienteBusquedaSchema>;
export type ClienteFiltrosInput = z.infer<typeof clienteFiltrosSchema>;