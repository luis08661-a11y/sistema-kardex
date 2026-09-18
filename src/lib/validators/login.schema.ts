import { z } from "zod";

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Ingresa tu usuario o correo"),

  password: z
    .string()
    .min(1, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;