export interface TipoCambioInfo {
  compra: number;
  venta: number;
  moneda: string;
  fecha: string;
  fuente?: string;
}

const API_KEY = process.env.PERUAPI_KEY;

export async function consultarTipoCambioService(): Promise<TipoCambioInfo | null> {
  if (!API_KEY) return null;
  try {
    const response = await fetch("https://peruapi.com/api/tipo_cambio?summary=0", {
      headers: { "X-API-KEY": API_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      compra?: string;
      venta?: string;
      moneda?: string;
      fecha?: string;
      fuente?: string;
      code?: string;
    };
    if (!data.venta || (data.code && data.code !== "200")) return null;
    const venta = Number(data.venta);
    if (!Number.isFinite(venta)) return null;
    const compra = Number(data.compra);
    return {
      compra: Number.isFinite(compra) ? compra : venta,
      venta,
      moneda: data.moneda ?? "USD",
      fecha: data.fecha ?? new Date().toISOString().slice(0, 10),
      fuente: data.fuente,
    };
  } catch {
    return null;
  }
}