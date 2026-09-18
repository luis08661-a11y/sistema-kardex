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
  if (!API_KEY) return null;
  if (!/^\d{11}$/.test(numero)) return null;
  try {
    const response = await fetch(`https://peruapi.com/api/ruc/${numero}`, {
      headers: { "X-API-KEY": API_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      razon_social?: string;
      estado?: string;
      condicion?: string;
      direccion?: string;
      code?: string;
    };
    const razonSocial = data.razon_social ?? "";
    if (!razonSocial || (data.code && data.code !== "200")) return null;
    return {
      razonSocial,
      estado: data.estado,
      condicion: data.condicion,
      direccion: data.direccion,
      numeroDocumento: numero,
    };
  } catch {
    return null;
  }
}