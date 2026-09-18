import { z } from "zod";

export const tipoComprobanteSchema = z.enum(["COTIZACION", "FACTURA", "BOLETA"]);
export const formaPagoSchema = z.enum(["CONTADO", "CREDITO"]);
export const metodoPagoSchema = z.enum([
  "EFECTIVO",
  "YAPE",
  "PLIN",
  "TRANSFERENCIA",
  "TARJETA",
  "DEPOSITO",
  "OTRO",
]);

export const ventaDetalleSchema = z.object({
  productoId: z.string().min(1, "Producto inválido"),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().nonnegative("El precio no puede ser negativo"),
});

export const ventaSchema = z
  .object({
    tipoComprobante: tipoComprobanteSchema,
    formaPago: formaPagoSchema,
    metodoPago: metodoPagoSchema,
    fecha: z.coerce.date().optional(),
    observacion: z.string().trim().max(500).optional().default(""),
    clienteId: z.string().trim().optional().default(""),
    ventaOrigenId: z.string().trim().optional().default(""),
    cliente: z
      .object({
        tipoDocumento: z.enum(["DNI", "RUC", "CE", "PASAPORTE", "OTRO"]),
        numeroDocumento: z
          .string()
          .trim()
          .min(1, "El número de documento es obligatorio")
          .max(20),
        razonSocial: z
          .string()
          .trim()
          .min(2, "La razón social / nombre es obligatorio")
          .max(200),
        direccion: z.string().trim().max(250).optional().default(""),
        telefono: z.string().trim().max(30).optional().default(""),
        email: z.string().trim().email("Correo inválido").or(z.literal("")).optional().default(""),
      })
      .optional(),
    detalles: z.array(ventaDetalleSchema).min(1, "Agregue al menos un producto"),
  })
  .superRefine((data, ctx) => {
    if (!data.clienteId && !data.cliente) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccione un cliente o registre uno nuevo",
        path: ["clienteId"],
      });
    }
    if (data.tipoComprobante !== "COTIZACION" && data.ventaOrigenId && data.fecha) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha se asigna automáticamente al registrar la venta",
        path: ["fecha"],
      });
    }
  });

export const ventaFiltrosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().max(100).optional().default(""),
  tipoComprobante: z.enum(["TODOS", "COTIZACION", "FACTURA", "BOLETA"]).default("TODOS"),
  estado: z.enum(["TODOS", "EMITIDA", "ANULADA"]).default("TODOS"),
  formaPago: z.enum(["TODOS", "CONTADO", "CREDITO"]).default("TODOS"),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
});

export type VentaDetalleInput = z.infer<typeof ventaDetalleSchema>;
export type VentaInput = z.infer<typeof ventaSchema>;
export type VentaFiltrosInput = z.infer<typeof ventaFiltrosSchema>;