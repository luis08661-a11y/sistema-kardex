export interface PersonaReniec {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  digitoVerificador?: string;
}

const API_KEY = process.env.PERUAPI_KEY;

export async function consultarDniReniecService(numero: string): Promise<PersonaReniec | null> {
  if (!API_KEY) {
    console.error("[RENIEC] PERUAPI_KEY no configurada");
    return null;
  }
  if (!/^\d{8}$/.test(numero)) return null;
  try {
    const response = await fetch(`https://peruapi.com/api/dni/${numero}`, {
      headers: { "X-API-KEY": API_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`[RENIEC] Error HTTP ${response.status}`);
      return null;
    }
    const data = (await response.json()) as {
      nombres?: string;
      apellidoPaterno?: string;
      apellidoMaterno?: string;
      apellido_paterno?: string;
      apellido_materno?: string;
      dv?: string;
      codVerifica?: string;
      code?: number;
      mensaje?: string;
    };
    if (data.mensaje && data.mensaje !== "OK") {
      console.error(`[RENIEC] Error API: ${data.mensaje}`);
      return null;
    }
    const nombre = data.nombres;
    if (!nombre) return null;
    return {
      nombre,
      apellidoPaterno: data.apellidoPaterno ?? data.apellido_paterno ?? "",
      apellidoMaterno: data.apellidoMaterno ?? data.apellido_materno ?? "",
      numeroDocumento: numero,
      digitoVerificador: data.dv ?? data.codVerifica,
    };
  } catch (error) {
    console.error("[RENIEC] Error de conexión:", error);
    return null;
  }
}
