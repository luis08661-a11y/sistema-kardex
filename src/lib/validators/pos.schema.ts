import { z } from "zod";

export const tipoComprobantePosSchema = z.enum([
  "COTIZACION",
  "FACTURA",
  "BOLETA",
  "NOTA_DE_VENTA",
]);
export const formaPagoPosSchema = z.enum(["CONTADO", "CREDITO"]);
export const metodoPagoPosSchema = z.enum([
  "EFECTIVO",
  "YAPE",
  "PLIN",
  "TRANSFERENCIA",
  "TARJETA",
  "DEPOSITO",
  "OTRO",
]);

const DNI_REGEX = /^\d{8}$/;
const RUC_REGEX = /^\d{11}$/;
const CE_REGEX = /^\d{8,12}$/;

export function validarDocumentoSegunComprobante(
  tipoComprobante: string,
  tipoDocumento: string,
  numeroDocumento: string,
): string | null {
  if (!numeroDocumento.trim()) {
    return tipoComprobante === "COTIZACION"
      ? null
      : "El número de documento es obligatorio para este comprobante.";
  }
  if (tipoComprobante === "FACTURA") {
    if (tipoDocumento !== "RUC") return "La factura requiere un RUC (11 dígitos).";
    if (!RUC_REGEX.test(numeroDocumento)) return "RUC inválido: debe tener 11 dígitos.";
    return null;
  }
  if (tipoComprobante === "BOLETA") {
    if (tipoDocumento === "DNI" && !DNI_REGEX.test(numeroDocumento)) {
      return "DNI inválido: debe tener 8 dígitos.";
    }
    if (tipoDocumento === "CE" && !CE_REGEX.test(numeroDocumento)) {
      return "Carné de extranjería inválido.";
    }
    if (!["DNI", "CE"].includes(tipoDocumento)) {
      return "La boleta acepta DNI o Carné de extranjería.";
    }
    return null;
  }
  if (tipoComprobante === "NOTA_DE_VENTA") {
    if (tipoDocumento === "DNI" && !DNI_REGEX.test(numeroDocumento)) {
      return "DNI inválido: debe tener 8 dígitos.";
    }
    if (tipoDocumento === "RUC" && !RUC_REGEX.test(numeroDocumento)) {
      return "RUC inválido: debe tener 11 dígitos.";
    }
    return null;
  }
  return null;
}

export const clientePosSchema = z.object({
  id: z.string().trim().optional().default(""),
  tipoDocumento: z.enum(["DNI", "RUC", "CE", "PASAPORTE", "OTRO"]),
  numeroDocumento: z
    .string()
    .trim()
    .max(20)
    .optional()
    .default(""),
  razonSocial: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(""),
  direccion: z.string().trim().max(250).optional().default(""),
  telefono: z.string().trim().max(30).optional().default(""),
  email: z.string().trim().email("Correo inválido").or(z.literal("")).optional().default(""),
});

export const posVentaDetalleSchema = z.object({
  productoId: z.string().min(1, "Producto inválido"),
  codigo: z.string().trim().max(50).optional().default(""),
  descripcion: z.string().trim().max(200).optional().default(""),
  unidadMedida: z.string().trim().max(20).optional().default(""),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0").max(100000),
  precioUnitario: z.coerce.number().nonnegative("El precio no puede ser negativo"),
});

export const posVentaSchema = z
  .object({
    tipoComprobante: tipoComprobantePosSchema,
    serie: z.string().trim().min(3, "Serie inválida").max(10),
    formaPago: formaPagoPosSchema,
    metodoPago: metodoPagoPosSchema,
    moneda: z.enum(["PEN", "USD"]).default("PEN"),
    tipoCambio: z.coerce.number().positive("Tipo de cambio inválido").default(1),
    fecha: z.coerce.date().optional(),
    fechaVencimiento: z.coerce.date().optional(),
    numeroOperacion: z.string().trim().max(50).optional().default(""),
    observacion: z.string().trim().max(500).optional().default(""),
    recibido: z.coerce.number().nonnegative("El monto recibido no puede ser negativo").optional(),
    clienteId: z.string().trim().optional().default(""),
    cliente: clientePosSchema.optional(),
    detalles: z.array(posVentaDetalleSchema).min(1, "Agregue al menos un producto"),
  })
  .superRefine((data, ctx) => {
    if (!data.clienteId && !data.cliente?.numeroDocumento && !data.cliente?.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccione un cliente o registre uno nuevo",
        path: ["clienteId"],
      });
    }
  });

export const consultaDocumentoSchema = z.object({
  tipo: z.enum(["DNI", "RUC"]),
  numero: z.string().trim().min(8).max(11),
});

export const posCatalogoFiltrosSchema = z.object({
  categoriaId: z.string().trim().optional().default(""),
  q: z.string().trim().max(100).optional().default(""),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(60).default(24),
});

export const posDirectorioFiltrosSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(30).default(20),
});

export type PosVentaDetalleInput = z.infer<typeof posVentaDetalleSchema>;
export type PosVentaInput = z.infer<typeof posVentaSchema>;
export type PosClienteInput = z.infer<typeof clientePosSchema>;