export interface PersonaSunat {
  razonSocial: string;
  nombreComercial?: string;
  estado?: string;
  condicion?: string;
  direccion?: string;
  numeroDocumento: string;
}

const API_KEY = process.env.PERUAPI_KEY;

export async function consultarRucSunatService(numero: string): Promise<PersonaSunat | null> {
  if (!API_KEY) {
    console.error("[SUNAT] PERUAPI_KEY no configurada");
    return null;
  }
  if (!/^\d{11}$/.test(numero)) return null;
  try {
    const response = await fetch(`https://peruapi.com/api/ruc/${numero}`, {
      headers: { "X-API-KEY": API_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`[SUNAT] Error HTTP ${response.status}`);
      return null;
    }
    const data = (await response.json()) as {
      razonSocial?: string;
      razon_social?: string;
      nombreComercial?: string;
      estado?: string;
      condicion?: string;
      direccion?: string;
      code?: number;
      mensaje?: string;
    };
    if (data.mensaje && data.mensaje !== "OK") {
      console.error(`[SUNAT] Error API: ${data.mensaje}`);
      return null;
    }
    const razonSocial = data.razonSocial ?? data.razon_social ?? "";
    if (!razonSocial) return null;
    return {
      razonSocial,
      nombreComercial: data.nombreComercial,
      estado: data.estado,
      condicion: data.condicion,
      direccion: data.direccion,
      numeroDocumento: numero,
    };
  } catch (error) {
    console.error("[SUNAT] Error de conexión:", error);
    return null;
  }
}
