import { ENVIO_ERROR_CODES, type EnvioErrorCode } from "@/lib/validators/envio-comprobante.validator";

export class WhatsAppEnvioError extends Error {
  code: EnvioErrorCode;
  constructor(code: EnvioErrorCode, message: string) {
    super(message);
    this.name = "WhatsAppEnvioError";
    this.code = code;
  }
}

export interface WhatsAppAdjunto {
  nombre: string;
  contenido: Uint8Array;
  mimeType?: string;
}

export interface WhatsAppMensaje {
  telefono: number;
  texto: string;
  adjunto?: WhatsAppAdjunto;
}

export interface WhatsAppResultado {
  ok: boolean;
  waId?: string;
  error?: string;
}

/**
 * Interfaz desacoplada para enviar mensajes por WhatsApp.
 * Permite implementar luego la WhatsApp Business Cloud API
 * sin modificar el resto del módulo.
 */
export interface ServicioWhatsApp {
  readonly modo: "WEB" | "CLOUD_API";
  estaConfigurado(): boolean;
  enviar(mensaje: WhatsAppMensaje): Promise<WhatsAppResultado>;
}

/** Normaliza el teléfono a formato internacional E.164 sin "+" (wa.me). */
export function normalizarTelefonoWhatsApp(telefono: string): string {
  const soloDigitos = telefono.replace(/\D/g, "");
  if (/^9\d{8}$/.test(soloDigitos)) {
    return `51${soloDigitos}`;
  }
  if (/^519\d{8}$/.test(soloDigitos)) {
    return soloDigitos;
  }
  if (/^\+?\d{10,15}$/.test(soloDigitos)) {
    return soloDigitos;
  }
  throw new WhatsAppEnvioError(ENVIO_ERROR_CODES.TELEFONO_INVALIDO, "El número de WhatsApp no es válido.");
}

/** Contexto para abrir WhatsApp Web / app con mensaje pre-cargado. */
export function enlaceWhatsAppWeb({
  telefono,
  texto,
}: {
  telefono: string;
  texto: string;
}): string {
  const numero = normalizarTelefonoWhatsApp(telefono);
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

type WhatsAppCloudApiConfig = {
  url: string;
  accessToken: string;
  phoneNumberId: string;
};

function configCloudApi(): WhatsAppCloudApiConfig | null {
  const url = process.env.WHATSAPP_CLOUD_API_URL?.trim();
  const accessToken = process.env.WHATSAPP_CLOUD_API_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_CLOUD_API_PHONE_ID?.trim();
  if (!url || !accessToken || !phoneNumberId) return null;
  return { url, accessToken, phoneNumberId };
}

/** Implementación para WhatsApp Web (modo local): solo prepara el enlace. */
export const whatsAppWebService: ServicioWhatsApp = {
  modo: "WEB",
  estaConfigurado: () => true,
  async enviar() {
    throw new WhatsAppEnvioError(
      ENVIO_ERROR_CODES.WHATSAPP_NO_CONFIGURADO,
      "El modo WhatsApp Web no envía el mensaje automáticamente; abra el enlace y adjunte el PDF manualmente.",
    );
  },
};

/** Implementación para la WhatsApp Business Cloud API. Envía el PDF adjunto si se provee. */
export const whatsAppCloudApiService: ServicioWhatsApp = {
  modo: "CLOUD_API",
  estaConfigurado: () => configCloudApi() !== null,
  async enviar({ telefono, texto, adjunto }) {
    const cfg = configCloudApi();
    if (!cfg) {
      throw new WhatsAppEnvioError(
        ENVIO_ERROR_CODES.WHATSAPP_NO_CONFIGURADO,
        "La WhatsApp Business Cloud API no está configurada. Agregue WHATSAPP_CLOUD_API_URL, WHATSAPP_CLOUD_API_TOKEN y WHATSAPP_CLOUD_API_PHONE_ID.",
      );
    }
    const mimeType = adjunto?.mimeType ?? "application/pdf";

    let mediaId: string | undefined;
    if (adjunto) {
      const parte: ArrayBuffer =
        adjunto.contenido instanceof Uint8Array
          ? adjunto.contenido.slice().buffer as ArrayBuffer
          : adjunto.contenido;
      const formulario = new FormData();
      formulario.append("messaging_product", "whatsapp");
      formulario.append("type", mimeType);
      formulario.append("file", new Blob([parte], { type: mimeType }), adjunto.nombre);
      const respuestaMedia = await fetch(`${cfg.url}/${cfg.phoneNumberId}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.accessToken}` },
        body: formulario,
      });
      if (!respuestaMedia.ok) {
        throw new WhatsAppEnvioError(
          ENVIO_ERROR_CODES.WHATSAPP_API_ERROR,
          `WhatsApp no aceptó el archivo (${respuestaMedia.status}).`,
        );
      }
      const datosMedia = (await respuestaMedia.json()) as { id?: string };
      mediaId = datosMedia.id;
    }

    const cuerpoMensaje = adjunto && mediaId ? {
      messaging_product: "whatsapp",
      to: String(telefono),
      type: "document",
      document: { id: mediaId, filename: adjunto.nombre, caption: texto },
    } : {
      messaging_product: "whatsapp",
      to: String(telefono),
      type: "text",
      text: { body: texto },
    };

    const respuesta = await fetch(
      `${cfg.url}/${cfg.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.accessToken}`,
        },
        body: JSON.stringify(cuerpoMensaje),
      },
    );
    if (!respuesta.ok) {
      throw new WhatsAppEnvioError(
        ENVIO_ERROR_CODES.WHATSAPP_API_ERROR,
        `La API de WhatsApp devolvió el estado ${respuesta.status}.`,
      );
    }
    const datos = (await respuesta.json()) as { messages?: { id?: string }[] };
    return { ok: true, waId: datos.messages?.[0]?.id };
  },
};

export function obtenerServicioWhatsApp(): ServicioWhatsApp {
  return whatsAppCloudApiService.estaConfigurado() ? whatsAppCloudApiService : whatsAppWebService;
}