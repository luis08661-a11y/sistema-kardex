import { z } from "zod";

const positive = z.coerce.number().finite().min(0);

export const registroInventarioSchema = z
  .object({
    periodoId: z.coerce.string().min(1, "Seleccione un período"),
    establecimientoId: z.coerce
      .string()
      .min(1, "Seleccione un establecimiento"),
    productoId: z.coerce.string().min(1, "Seleccione un producto"),
    loteId: z.coerce.string().min(1, "Seleccione un lote"),
    almacenamientoId: z.coerce.string().optional().nullable(),
    tipoOperacionId: z.coerce.string().min(1, "Seleccione una operación"),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    tipoMovimiento: z.enum(["ENTRADA", "SALIDA"], {
      message: "Tipo de movimiento inválido",
    }),
    unidades: positive,
    pesoUnitario: positive,
    pesoTotal: positive.optional().default(0),
    observacion: z.string().trim().max(500).optional().or(z.literal("")),
    responsable: z.string().trim().max(150).optional().or(z.literal("")),
    formulacion: z.string().trim().max(150).optional().or(z.literal("")),
    responsableFormulacion: z
      .string()
      .trim()
      .max(150)
      .optional()
      .or(z.literal("")),
    cantidadProductoFormulado: positive.optional().nullable(),
    almacenamientoNombre: z
      .string()
      .trim()
      .max(150)
      .optional()
      .or(z.literal("")),
    costoUnitarioKg: positive.optional().nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.unidades <= 0)
      ctx.addIssue({
        code: "custom",
        path: ["unidades"],
        message: "Ingrese las unidades del movimiento",
      });
    if (v.pesoUnitario <= 0)
      ctx.addIssue({
        code: "custom",
        path: ["pesoUnitario"],
        message: "Ingrese el peso unitario del movimiento",
      });
  });

export type RegistroInventarioInput = z.infer<typeof registroInventarioSchema>;

export const actualizarRegistroSchema = registroInventarioSchema;

export type ActualizarRegistroInput = z.infer<typeof actualizarRegistroSchema>;