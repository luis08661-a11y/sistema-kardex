import { z } from "zod";

export const usuarioSchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z.string().trim().email().max(150),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(100).optional(),
  status: z.boolean().default(true),
});

export const rolSchema = z.object({
  name: z.string().trim().min(2).max(50).regex(/^[A-Za-z0-9_ -]+$/),
  description: z.string().trim().max(200).optional(),
});

export const permisoSchema = z.object({
  codigo: z.string().trim().min(3).max(80).regex(/^[A-Z0-9_.-]+$/),
  nombre: z.string().trim().min(2).max(120),
  modulo: z.string().trim().min(2).max(80),
  activo: z.boolean().default(true),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type RolInput = z.infer<typeof rolSchema>;
export type PermisoInput = z.infer<typeof permisoSchema>;
