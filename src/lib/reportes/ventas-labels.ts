import {
  FORMA_PAGO_LABEL,
  METODO_PAGO_LABEL,
  TIPO_COMPROBANTE_POS_CORTO,
  type FormaPago,
  type MetodoPago,
  type TipoComprobantePos,
} from "@/components/pos/pos-types";

export const tipoLabel = (t: string) => TIPO_COMPROBANTE_POS_CORTO[t as TipoComprobantePos] ?? t;
export const formaLabel = (f: string) => FORMA_PAGO_LABEL[f as FormaPago] ?? f;
export const metodoLabel = (m: string) => METODO_PAGO_LABEL[m as MetodoPago] ?? m;
