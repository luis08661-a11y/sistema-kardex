export type TipoComprobantePos = "COTIZACION" | "FACTURA" | "BOLETA" | "NOTA_DE_VENTA";
export type TipoDocumento = "DNI" | "RUC" | "CE" | "PASAPORTE" | "OTRO";
export type FormaPago = "CONTADO" | "CREDITO";
export type MetodoPago =
  | "EFECTIVO"
  | "YAPE"
  | "PLIN"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "DEPOSITO"
  | "OTRO";

export interface ClienteSeleccionado {
  id?: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface CartItem {
  productoId: string;
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  cantidad: number;
  precio: number;
  stock: number;
}

export const TIPO_COMPROBANTE_POS_LABEL: Record<TipoComprobantePos, string> = {
  COTIZACION: "COTIZACIÓN",
  FACTURA: "FACTURA ELECTRÓNICA",
  BOLETA: "BOLETA DE VENTA",
  NOTA_DE_VENTA: "NOTA DE VENTA",
};

export const TIPO_COMPROBANTE_POS_CORTO: Record<TipoComprobantePos, string> = {
  COTIZACION: "COTIZACIÓN",
  FACTURA: "FACTURA",
  BOLETA: "BOLETA",
  NOTA_DE_VENTA: "NOTA DE VENTA",
};

export const TIPO_DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  DNI: "DNI",
  RUC: "RUC",
  CE: "Carné de Extranjería",
  PASAPORTE: "Pasaporte",
  OTRO: "Otro",
};

export const FORMA_PAGO_LABEL: Record<FormaPago, string> = {
  CONTADO: "Contado",
  CREDITO: "Crédito",
};

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  DEPOSITO: "Depósito",
  OTRO: "Otro",
};

export function redondearDinero(n: number) {
  return Math.round(n * 100) / 100;
}

export function ventaPosParaImprimir(
  venta: import("@/lib/services/pos.service").VentaPosGuardadaDTO,
): import("@/components/ventas/types").VentaParaImprimir {
  return {
    id: venta.id,
    tipoComprobante:
      venta.tipoComprobante as import("@/components/ventas/types").VentaParaImprimir["tipoComprobante"],
    serie: venta.serie,
    numero: venta.numero,
    fecha: venta.fecha,
    empresa: {
      id: venta.id,
      ruc: venta.empresa.ruc,
      razonSocial: venta.empresa.razonSocial,
      firmaUrl: venta.empresa.firmaUrl,
    },
    cliente: venta.cliente
      ? {
          id: venta.cliente.id,
          tipoDocumento: venta.cliente.tipoDocumento,
          numeroDocumento: venta.cliente.numeroDocumento,
          razonSocial: venta.cliente.razonSocial,
          direccion: venta.cliente.direccion,
          telefono: venta.cliente.telefono,
          email: venta.cliente.email,
        }
      : null,
    formaPago: venta.formaPago as import("@/components/ventas/types").VentaParaImprimir["formaPago"],
    metodoPago: venta.metodoPago as import("@/components/ventas/types").VentaParaImprimir["metodoPago"],
    subtotal: venta.subtotal,
    opGravada: venta.opGravada,
    opExonerada: venta.opExonerada,
    opInafecta: venta.opInafecta,
    igv: venta.igv,
    total: venta.total,
    estado: venta.estado,
    detalles: venta.detalles.map(d => ({
      codigo: d.codigo,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      subtotal: d.importe,
      importe: d.importe,
    })),
  };
}