export const IGV_RATE = 0.18;
export const IGV_DIVISOR = 1 + IGV_RATE;

export function redondearDinero(n: number) {
  return Math.round(n * 100) / 100;
}

export function redondearCantidad(n: number) {
  return Math.round(n * 1000) / 1000;
}

export function formatearMonedaSoles(n: number) {
  return `S/ ${redondearDinero(n).toFixed(2)}`;
}

export function formatearNumero(n: number) {
  return n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatearNumeroEntero(n: number) {
  return Math.round(n).toLocaleString("es-PE");
}

export interface LineaCalculada {
  importe: number;
  base: number;
  igv: number;
}

export function calcularLinea(price: number, quantity: number): LineaCalculada {
  const importe = redondearDinero(price * quantity);
  const base = redondearDinero(importe / IGV_DIVISOR);
  const igv = redondearDinero(importe - base);
  return { importe, base, igv };
}

export interface TotalesCalculados {
  gravada: number;
  exonerada: number;
  inafecta: number;
  igv: number;
  total: number;
}

export function calcularTotales(
  lineas: { price: number; quantity: number }[],
): TotalesCalculados {
  let total = 0;
  let igv = 0;
  let gravada = 0;
  for (const linea of lineas) {
    const l = calcularLinea(linea.price, linea.quantity);
    total += l.importe;
    igv += l.igv;
    gravada += l.base;
  }
  total = redondearDinero(total);
  igv = redondearDinero(igv);
  gravada = redondearDinero(gravada);
  return { gravada, exonerada: 0, inafecta: 0, igv, total };
}

export function calcularVuelto(recibido: number, total: number) {
  return redondearDinero(recibido - total);
}