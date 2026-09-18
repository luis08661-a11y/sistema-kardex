"use server";

import { getSession } from "@/lib/auth/session";
import {
  envioCorreoSchema,
  envioWhatsAppSchema,
  marcarEnviadoSchema,
  ENVIO_ERROR_CODES,
  type EnvioErrorCode,
} from "@/lib/validators/envio-comprobante.validator";
import { generarPdfVentaService } from "@/lib/services/pdf.service";
import { enviarCorreoService } from "@/lib/services/email.service";
import {
  enlaceWhatsAppWeb,
  obtenerServicioWhatsApp,
} from "@/lib/services/whatsapp.service";
import {
  registrarEnvioComprobanteService,
  actualizarEnvioComprobanteService,
  listarEnviosComprobanteService,
  type EnvioComprobanteDTO,
} from "@/lib/services/envio-comprobante.service";
import { obtenerVentaConDetallesService } from "@/lib/services/venta.service";
import {
  TIPO_COMPROBANTE_LABEL,
  ventaDTOParaImprimir,
  type TipoComprobante,
  type VentaParaImprimir,
} from "@/components/ventas/types";
import { armarMensajeVenta, nombrePdfVenta } from "@/components/ventas/venta-export";

export type ResultadoEnvioComprobante = {
  success: boolean;
  message: string;
  code?: EnvioErrorCode;
  data?: {
    envioId?: string;
    enlaceWhatsApp?: string;
    pdfDescargaUrl?: string;
    pdfNombre?: string;
  };
};

function extraerCodigoError(error: unknown): EnvioErrorCode | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: EnvioErrorCode }).code;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const mensaje = String((error as { message: unknown }).message);
    if (Object.values(ENVIO_ERROR_CODES).includes(mensaje as EnvioErrorCode)) {
      return mensaje as EnvioErrorCode;
    }
  }
  return undefined;
}

function mensajeFrio(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

async function sesionObligatoria() {
  const session = await getSession();
  if (!session) {
    const err = new Error("Debe iniciar sesión para continuar.");
    (err as unknown as { code: EnvioErrorCode }).code = ENVIO_ERROR_CODES.PERMISO_DENEGADO;
    throw err;
  }
  return session;
}

export async function enviarVentaPorCorreoAction(input: unknown): Promise<ResultadoEnvioComprobante> {
  const parsed = envioCorreoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos de envío inválidos",
      code: ENVIO_ERROR_CODES.CORREO_INVALIDO,
    };
  }
  try {
    const session = await sesionObligatoria();

    const pdf = await generarPdfVentaService(parsed.data.ventaId);
    const ventaImprimible: VentaParaImprimir = ventaDTOParaImprimir(pdf.venta);
    const tipo = ventaImprimible.tipoComprobante as TipoComprobante;
    const asunto = ventaImprimible.cliente
      ? `${TIPO_COMPROBANTE_LABEL[tipo]} ${nombrePdfVenta(ventaImprimible)} - ${ventaImprimible.cliente.razonSocial}`
      : `${TIPO_COMPROBANTE_LABEL[tipo]} ${nombrePdfVenta(ventaImprimible)}`;
    const cuerpo = parsed.data.mensaje || armarMensajeVenta(ventaImprimible);

    let envio;
    try {
      await enviarCorreoService({
        para: parsed.data.destino,
        asunto,
        cuerpo,
        adjunto: { nombre: pdf.nombre, contenido: pdf.buffer },
      });
      envio = await registrarEnvioComprobanteService({
        ventaId: pdf.venta.id,
        tipo: "CORREO",
        destino: parsed.data.destino,
        mensaje: cuerpo,
        usuarioId: session.userId,
      });
      envio = await actualizarEnvioComprobanteService({
        envioId: envio.id,
        estado: "ENVIADO",
        enviadoAt: new Date(),
      });
    } catch (correoError) {
      const code = extraerCodigoError(correoError);
      if (code && code !== ENVIO_ERROR_CODES.SMTP_ERROR && code !== ENVIO_ERROR_CODES.SMTP_NO_CONFIGURADO) {
        throw correoError;
      }
      const registro = await registrarEnvioComprobanteService({
        ventaId: pdf.venta.id,
        tipo: "CORREO",
        destino: parsed.data.destino,
        mensaje: cuerpo,
        usuarioId: session.userId,
      });
      await actualizarEnvioComprobanteService({
        envioId: registro.id,
        estado: "ERROR",
        error: mensajeFrio(correoError, "Error SMTP"),
      });
      return {
        success: false,
        message: mensajeFrio(correoError, "No se pudo enviar el correo"),
        code,
        data: { envioId: registro.id },
      };
    }

    return {
      success: true,
      message: "Comprobante enviado por correo correctamente",
      data: { envioId: envio!.id, pdfNombre: pdf.nombre },
    };
  } catch (error) {
    return {
      success: false,
      message: mensajeFrio(error, "No se pudo procesar el envío del correo"),
      code: extraerCodigoError(error),
    };
  }
}

export async function enviarVentaWhatsAppAction(input: unknown): Promise<ResultadoEnvioComprobante> {
  const parsed = envioWhatsAppSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos de envío inválidos",
      code: ENVIO_ERROR_CODES.TELEFONO_INVALIDO,
    };
  }
  try {
    const session = await sesionObligatoria();

    const pdf = await generarPdfVentaService(parsed.data.ventaId);
    const ventaImprimible: VentaParaImprimir = ventaDTOParaImprimir(pdf.venta);
    const cuerpo = parsed.data.mensaje || armarMensajeVenta(ventaImprimible);
    const servicio = obtenerServicioWhatsApp();

    if (servicio.modo === "CLOUD_API" && servicio.estaConfigurado()) {
      const telefono = Number(parsed.data.telefono.replace(/\D/g, ""));
      let envio = await registrarEnvioComprobanteService({
        ventaId: pdf.venta.id,
        tipo: "WHATSAPP",
        destino: parsed.data.telefono,
        mensaje: cuerpo,
        usuarioId: session.userId,
      });
      try {
        const resultado = await servicio.enviar({
          telefono,
          texto: cuerpo,
          adjunto: { nombre: pdf.nombre, contenido: pdf.buffer },
        });
        envio = await actualizarEnvioComprobanteService({
          envioId: envio.id,
          estado: "ENVIADO",
          enviadoAt: new Date(),
        });
        return {
          success: resultado.ok,
          message: "Comprobante enviado por WhatsApp correctamente",
          data: {
            envioId: envio.id,
            pdfNombre: pdf.nombre,
            pdfDescargaUrl: `/api/ventas/${pdf.venta.id}/pdf?descargar=1`,
          },
        };
      } catch (apiError) {
        await actualizarEnvioComprobanteService({
          envioId: envio.id,
          estado: "ERROR",
          error: mensajeFrio(apiError, "Error WhatsApp API"),
        });
        throw apiError;
      }
    }

    // Modo local: WhatsApp Web
    const enlace = enlaceWhatsAppWeb({ telefono: parsed.data.telefono, texto: cuerpo });
    const envio = await registrarEnvioComprobanteService({
      ventaId: pdf.venta.id,
      tipo: "WHATSAPP",
      destino: parsed.data.telefono,
      mensaje: cuerpo,
      usuarioId: session.userId,
    });

    return {
      success: true,
      message: "Enlace de WhatsApp y PDF listos para enviar",
      data: {
        envioId: envio.id,
        enlaceWhatsApp: enlace,
        pdfNombre: pdf.nombre,
        pdfDescargaUrl: `/api/ventas/${pdf.venta.id}/pdf?descargar=1`,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: mensajeFrio(error, "No se pudo preparar el envío por WhatsApp"),
      code: extraerCodigoError(error),
    };
  }
}

export async function marcarEnviadoWhatsAppAction(input: unknown): Promise<ResultadoEnvioComprobante> {
  const parsed = marcarEnviadoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Envío inválido" };
  }
  try {
    await sesionObligatoria();
    const envio = await actualizarEnvioComprobanteService({
      envioId: parsed.data.envioId,
      estado: "ENVIADO",
      enviadoAt: new Date(),
    });
    return { success: true, message: "Envío marcado como realizado", data: { envioId: envio.id } };
  } catch (error) {
    if (extraerCodigoError(error) === ENVIO_ERROR_CODES.PERMISO_DENEGADO) {
      return { success: false, message: mensajeFrio(error, "Debe iniciar sesión") };
    }
    return {
      success: false,
      message: "No se encontró el envío",
      code: ENVIO_ERROR_CODES.ENVIO_NO_ENCONTRADO,
    };
  }
}

export async function listarEnviosComprobanteAction(ventaId: string): Promise<EnvioComprobanteDTO[]> {
  if (!ventaId) return [];
  const session = await sesionObligatoria();
  void session;
  return listarEnviosComprobanteService(ventaId);
}

export async function generarPdfVentaServidor(ventaId: string): Promise<ResultadoEnvioComprobante> {
  try {
    await sesionObligatoria();
    const pdf = await generarPdfVentaService(ventaId);
    return {
      success: true,
      message: "PDF generado",
      data: {
        pdfNombre: pdf.nombre,
        pdfDescargaUrl: `/api/ventas/${pdf.venta.id}/pdf?descargar=1`,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: mensajeFrio(error, "No se pudo generar el PDF"),
      code: extraerCodigoError(error),
    };
  }
}

export async function checkVentaCorreoDestino(ventaId: string) {
  const venta = await obtenerVentaConDetallesService(ventaId);
  return venta?.cliente?.email ?? null;
}

export async function checkVentaTelefonoDestino(ventaId: string) {
  const venta = await obtenerVentaConDetallesService(ventaId);
  return venta?.cliente?.telefono ?? null;
}