import type { VentaDTO } from "@/lib/services/venta.service";

export type TipoComprobante =
  | "COTIZACION"
  | "FACTURA"
  | "BOLETA"
  | "NOTA_DE_VENTA";
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
export type EstadoVenta = "EMITIDA" | "ANULADA";

export interface ProductoResultado {
  id: string;
  codigo: string;
  descripcion: string;
  codigoExistencia: string | null;
  tipoInventario: string;
  unidadMedida?: { codigo: string | null; nombre: string } | null;
  presentacion?: { nombre: string } | null;
  categoria?: { nombre: string } | null;
}

export interface LineaDetalle {
  productoId: string;
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface ClienteSeleccionado {
  id?: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface VentaParaImprimir {
  id: string;
  tipoComprobante: TipoComprobante;
  serie: string;
  numero: number;
  fecha: Date | string;
  empresa?: {
    id: string;
    ruc: string;
    razonSocial: string;
    firmaUrl?: string | null;
    logoUrl?: string | null;
    direccion?: string;
    contactos?: string;
    web?: string;
    email?: string;
    banco?: string;
    cuenta?: string;
    cci?: string;
  };
  cliente: ClienteSeleccionado | null;
  formaPago: FormaPago;
  metodoPago: MetodoPago;
  numeroOperacion?: string | null;
  subtotal: number;
  opGravada: number;
  opExonerada: number;
  opInafecta: number;
  igv: number;
  total: number;
  estado: string;
  observacion?: string | null;
  detalles: {
    id?: string;
    codigo: string;
    descripcion: string;
    presentacion?: string;
    unidad?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    importe: number;
  }[];
}

export const TIPO_COMPROBANTE_LABEL: Record<TipoComprobante, string> = {
  COTIZACION: "Cotización",
  FACTURA: "Factura",
  BOLETA: "Boleta",
  NOTA_DE_VENTA: "Nota de Venta",
};

export const TIPO_DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  DNI: "DNI",
  RUC: "RUC",
  CE: "Cédula",
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

export function formatearMoneda(n: number) {
  return n.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatearNumero(n: number) {
  return n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatearFechaLocal(d: Date | string) {
  const f = d instanceof Date ? d : new Date(d);
  return f.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function fechaLocalISO(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function ventaDTOParaImprimir(dto: VentaDTO): VentaParaImprimir {
  return {
    id: dto.id,
    tipoComprobante: dto.tipoComprobante as TipoComprobante,
    serie: dto.serie,
    numero: dto.numero,
    fecha: dto.fecha,
    empresa: dto.empresa,
    cliente: dto.cliente
      ? {
          id: dto.cliente.id,
          tipoDocumento: dto.cliente.tipoDocumento as TipoDocumento,
          numeroDocumento: dto.cliente.numeroDocumento,
          razonSocial: dto.cliente.razonSocial,
          direccion: dto.cliente.direccion ?? "",
          telefono: dto.cliente.telefono ?? "",
          email: dto.cliente.email ?? "",
        }
      : null,
    formaPago: dto.formaPago as FormaPago,
    metodoPago: dto.metodoPago as MetodoPago,
    numeroOperacion: dto.numeroOperacion,
    subtotal: dto.subtotal,
    opGravada: dto.opGravada,
    opExonerada: dto.opExonerada,
    opInafecta: dto.opInafecta,
    igv: dto.igv,
    total: dto.total,
    estado: dto.estado,
    observacion: dto.observacion,
    detalles: dto.detalles.map((d) => ({
      id: d.id,
      codigo: d.codigo,
      descripcion: d.descripcion,
      presentacion: d.presentacion,
      unidad: d.unidadMedida,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      subtotal: d.subtotal,
      importe: d.importe,
    })),
  };
}