import nodemailer from "nodemailer";
import { ENVIO_ERROR_CODES, type EnvioErrorCode } from "@/lib/validators/envio-comprobante.validator";

export class EnvioComprobanteError extends Error {
  code: EnvioErrorCode;
  constructor(code: EnvioErrorCode, message: string) {
    super(message);
    this.name = "EnvioComprobanteError";
    this.code = code;
  }
}

export interface CorreoServicioConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  secure: boolean;
}

export function configuracionCorreo(): CorreoServicioConfig {
  return {
    host: process.env.MAIL_HOST ?? "",
    port: Number(process.env.MAIL_PORT ?? 587),
    user: process.env.MAIL_USER ?? "",
    password: process.env.MAIL_PASSWORD ?? "",
    from: process.env.MAIL_FROM ?? process.env.MAIL_USER ?? "",
    secure: process.env.MAIL_SECURE === "true",
  };
}

export function correoConfigurado(cfg = configuracionCorreo()): boolean {
  return Boolean(cfg.host && cfg.user && cfg.password && cfg.from);
}

export async function enviarCorreoService(opciones: {
  para: string;
  asunto: string;
  cuerpo: string;
  adjunto?: { nombre: string; contenido: Buffer };
}): Promise<void> {
  const cfg = configuracionCorreo();
  if (!correoConfigurado(cfg)) {
    throw new EnvioComprobanteError(
      ENVIO_ERROR_CODES.SMTP_NO_CONFIGURADO,
      "El envío por correo no está configurado. Agregue MAIL_HOST, MAIL_USER, MAIL_PASSWORD y MAIL_FROM en el archivo .env.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.password,
    },
  });

  try {
    await transporter.sendMail({
      from: cfg.from,
      to: opciones.para,
      subject: opciones.asunto,
      text: opciones.cuerpo,
      attachments:
        opciones.adjunto && opciones.adjunto.contenido.length > 0
          ? [{ filename: opciones.adjunto.nombre, content: opciones.adjunto.contenido }]
          : [],
    });
  } catch (error) {
    throw new EnvioComprobanteError(
      ENVIO_ERROR_CODES.SMTP_ERROR,
      `No se pudo enviar el correo: ${error instanceof Error ? error.message : "error desconocido"}`,
    );
  }
}