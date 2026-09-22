export interface PersonaSunat {
  razonSocial: string;
  nombreComercial?: string;
  estado?: string;
  condicion?: string;
  direccion?: string;
  numeroDocumento: string;
}

const API_KEY = process.env.DECOLECTA_API_KEY;

export async function consultarRucSunatService(numero: string): Promise<PersonaSunat | null> {
  if (!API_KEY) {
    console.error("[SUNAT] DECOLECTA_API_KEY no configurada");
    return null;
  }
  if (!/^\d{11}$/.test(numero)) return null;
  try {
    const response = await fetch(`https://api.decolecta.com/v1/sunat/ruc?numero=${numero}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`[SUNAT] Error HTTP ${response.status}`);
      return null;
    }
    const data = (await response.json()) as {
      razon_social?: string;
      numero_documento?: string;
      estado?: string;
      condicion?: string;
      direccion?: string;
    };
    const razonSocial = data.razon_social ?? "";
    if (!razonSocial) return null;
    return {
      razonSocial,
      estado: data.estado,
      condicion: data.condicion,
      direccion: data.direccion,
      numeroDocumento: data.numero_documento ?? numero,
    };
  } catch (error) {
    console.error("[SUNAT] Error de conexión:", error);
    return null;
  }
}
