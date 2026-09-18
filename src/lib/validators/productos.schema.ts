import { z } from "zod";

const optionalId = z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().min(1).optional());

const precioUnitario = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : Number(v)),
  z
    .number({ message: "Precio unitario inválido" })
    .min(0, "El precio unitario no puede ser negativo")
    .max(9999999, "El precio unitario no es válido")
    .optional(),
);

export const productoSchema = z
  .object({
    tipoInventario: z.enum(["BASE_ACTIVA", "PRODUCTO_TERMINADO"]),
    codigo: z.string().trim().min(1, "El código es obligatorio").max(50),
    codigoExistencia: z.string().trim().min(1, "El código de existencia es obligatorio").max(30),
    descripcion: z.string().trim().min(1, "El nombre del producto es obligatorio").max(200),
    observaciones: z.string().trim().max(500).optional().default(""),
    unidadMedidaId: z.coerce.string().min(1, "Seleccione una unidad de medida"),
    tipoExistenciaId: z.coerce.string().min(1, "Seleccione la Tabla 5 (tipo de afectación)"),
    presentacionNombre: z.string().trim().max(150).optional().default(""),
    presentacionUnidadMedidaId: optionalId,
    categoriaId: optionalId,
    marcaId: optionalId,
    tipoAfectacionId: optionalId,
    precioUnitario,
  })
  .superRefine((data, ctx) => {
    if (data.tipoInventario === "PRODUCTO_TERMINADO" && !data.presentacionNombre) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La presentación es obligatoria para Producto Terminado",
        path: ["presentacionNombre"],
      });
    }
    if (data.tipoInventario === "PRODUCTO_TERMINADO" && (data.precioUnitario == null || data.precioUnitario <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio unitario es obligatorio para Producto Terminado",
        path: ["precioUnitario"],
      });
    }
  });

export const presentacionSchema = z.object({
  productoId: z.coerce.string().min(1, "Producto inválido"),
  nombre: z.string().trim().min(1, "El nombre de la presentación es obligatorio").max(150),
  unidadMedidaId: optionalId,
});

export type ProductoInput = z.infer<typeof productoSchema>;
export type PresentacionInput = z.infer<typeof presentacionSchema>;