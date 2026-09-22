export interface PersonaReniec {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  digitoVerificador?: string;
}

const API_KEY = process.env.DECOLECTA_API_KEY;

export async function consultarDniReniecService(numero: string): Promise<PersonaReniec | null> {
  if (!API_KEY) {
    console.error("[RENIEC] DECOLECTA_API_KEY no configurada");
    return null;
  }
  if (!/^\d{8}$/.test(numero)) return null;
  try {
    const response = await fetch(`https://api.decolecta.com/v1/reniec/dni?numero=${numero}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`[RENIEC] Error HTTP ${response.status}`);
      return null;
    }
    const data = (await response.json()) as {
      first_name?: string;
      first_last_name?: string;
      second_last_name?: string;
      document_number?: string;
    };
    const nombre = data.first_name;
    if (!nombre) return null;
    return {
      nombre,
      apellidoPaterno: data.first_last_name ?? "",
      apellidoMaterno: data.second_last_name ?? "",
      numeroDocumento: data.document_number ?? numero,
    };
  } catch (error) {
    console.error("[RENIEC] Error de conexión:", error);
    return null;
  }
}
