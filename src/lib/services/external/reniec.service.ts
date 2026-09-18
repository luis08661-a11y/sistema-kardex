export interface PersonaReniec {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  digitoVerificador?: string;
}

const API_KEY = process.env.PERUAPI_KEY;

export async function consultarDniReniecService(numero: string): Promise<PersonaReniec | null> {
  if (!API_KEY) return null;
  if (!/^\d{8}$/.test(numero)) return null;
  try {
    const response = await fetch(`https://peruapi.com/api/dni/${numero}`, {
      headers: { "X-API-KEY": API_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      nombres?: string;
      apellido_paterno?: string;
      apellido_materno?: string;
      dv?: string;
      code?: string;
    };
    if (!data.nombres || (data.code && data.code !== "200")) return null;
    return {
      nombre: data.nombres,
      apellidoPaterno: data.apellido_paterno ?? "",
      apellidoMaterno: data.apellido_materno ?? "",
      numeroDocumento: numero,
      digitoVerificador: data.dv,
    };
  } catch {
    return null;
  }
}