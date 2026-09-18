import { z } from "zod";

export const ENVIO_ERROR_CODES = {
  VENTA_NO_ENCONTRADA: "VENTA_NO_ENCONTRADA",
  VENTA_ANULADA: "VENTA_ANULADA",
  CORREO_INVALIDO: "CORREO_INVALIDO",
  TELEFONO_INVALIDO: "TELEFONO_INVALIDO",
  SMTP_NO_CONFIGURADO: "SMTP_NO_CONFIGURADO",
  SMTP_ERROR: "SMTP_ERROR",
  PDF_GENERACION_ERROR: "PDF_GENERACION_ERROR",
  WHATSAPP_NO_CONFIGURADO: "WHATSAPP_NO_CONFIGURADO",
  WHATSAPP_API_ERROR: "WHATSAPP_API_ERROR",
  PERMISO_DENEGADO: "PERMISO_DENEGADO",
  ENVIO_NO_ENCONTRADO: "ENVIO_NO_ENCONTRADO",
} as const;

export type EnvioErrorCode = (typeof ENVIO_ERROR_CODES)[keyof typeof ENVIO_ERROR_CODES];

export const envioCorreoSchema = z.object({
  ventaId: z.string().min(1, "Venta inválida"),
  destino: z.string().trim().email("Correo electrónico inválido").max(200),
  mensaje: z.string().trim().max(5000).optional().default(""),
});

export const envioWhatsAppSchema = z.object({
  ventaId: z.string().min(1, "Venta inválida"),
  telefono: z
    .string()
    .trim()
    .min(6, "El teléfono debe tener al menos 6 dígitos")
    .max(20, "El teléfono no puede superar 20 dígitos")
    .regex(/^\+?\d+$/, "El teléfono solo puede contener números"),
  mensaje: z.string().trim().max(5000).optional().default(""),
});

export const marcarEnviadoSchema = z.object({
  envioId: z.string().min(1, "Envío inválido"),
});

export type EnvioCorreoInput = z.infer<typeof envioCorreoSchema>;
export type EnvioWhatsAppInput = z.infer<typeof envioWhatsAppSchema>;
export type MarcarEnviadoInput = z.infer<typeof marcarEnviadoSchema>;