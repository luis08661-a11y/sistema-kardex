import { prisma } from "@/lib/db/prisma";
import type { LoteGestionInput } from "@/lib/validators/lotes.schema";

export type LoteListado = {
  id: string;
  codigo: string;
  fechaIngreso: string | null;
  pesoUnitarioKg: number;
  producto: { id: string; codigo: string; descripcion: string };
  almacenamiento: { id: string; codigo: string | null; nombre: string } | null;
  _count: { movimientos: number };
};

export type ContextoLotes = {
  productos: { id: string; codigo: string; descripcion: string }[];
  almacenamientos: { id: string; codigo: string | null; nombre: string }[];
};

function plainify<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "object" && v !== null && typeof v.toNumber === "function" ? v.toNumber() : v,
    ),
  );
}

const loteInclude = {
  producto: { select: { id: true, codigo: true, descripcion: true } },
  almacenamiento: { select: { id: true, codigo: true, nombre: true } },
  _count: { select: { movimientos: true } },
} as const;

export async function obtenerLotesService(filtro?: string): Promise<LoteListado[]> {
  const q = filtro?.trim();
  return plainify(
    await prisma.loteBaseActiva.findMany({
      where: q
        ? {
            OR: [
              { codigo: { contains: q, mode: "insensitive" } },
              { producto: { descripcion: { contains: q, mode: "insensitive" } } },
              { producto: { codigo: { contains: q, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: loteInclude,
      orderBy: [{ fechaIngreso: "desc" }, { codigo: "asc" }],
    }),
  ) as unknown as LoteListado[];
}

export async function obtenerContextoLotesService(): Promise<ContextoLotes> {
  const [productos, almacenamientos] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, tipoInventario: "BASE_ACTIVA" },
      orderBy: { descripcion: "asc" },
      select: { id: true, codigo: true, descripcion: true, unidadMedida: { select: { nombre: true } } },
    }),
    prisma.almacenamiento.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, codigo: true, nombre: true },
    }),
  ]);
  return plainify({ productos, almacenamientos }) as unknown as ContextoLotes;
}

export async function crearLoteService(input: LoteGestionInput) {
  const producto = await prisma.producto.findFirst({
    where: { id: input.productoId, tipoInventario: "BASE_ACTIVA", activo: true },
    select: { id: true },
  });
  if (!producto) throw new Error("El producto no es un producto Base Activa activo.");

  const codigo = input.codigo.trim().toUpperCase();
  const existente = await prisma.loteBaseActiva.findUnique({ where: { codigo }, select: { id: true } });
  if (existente) throw new Error("El lote ya existe.");

  return prisma.loteBaseActiva.create({
    data: {
      productoId: input.productoId,
      codigo,
      fechaIngreso: input.fechaIngreso,
      pesoUnitarioKg: input.pesoUnitarioKg ?? 0,
      almacenamientoId: input.almacenamientoId ?? null,
    },
  });
}

export async function actualizarLoteService(id: string, input: LoteGestionInput) {
  const actual = await prisma.loteBaseActiva.findUnique({
    where: { id },
    select: { id: true, codigo: true, productoId: true, _count: { select: { movimientos: true } } },
  });
  if (!actual) throw new Error("El lote no existe.");

  const producto = await prisma.producto.findFirst({
    where: { id: input.productoId, tipoInventario: "BASE_ACTIVA", activo: true },
    select: { id: true },
  });
  if (!producto) throw new Error("El producto no es un producto Base Activa activo.");

  const codigo = input.codigo.trim().toUpperCase();
  const existente = await prisma.loteBaseActiva.findUnique({ where: { codigo }, select: { id: true } });
  if (existente && existente.id !== id) throw new Error("El lote ya existe.");

  if (actual._count.movimientos > 0) {
    if (input.productoId !== actual.productoId || codigo !== actual.codigo) {
      throw new Error("Un lote con movimientos no permite modificar el producto ni el código.");
    }
  }

  return prisma.loteBaseActiva.update({
    where: { id },
    data: {
      productoId: input.productoId,
      codigo,
      fechaIngreso: input.fechaIngreso,
      pesoUnitarioKg: input.pesoUnitarioKg ?? 0,
      almacenamientoId: input.almacenamientoId ?? null,
    },
  });
}

export async function eliminarLoteService(id: string) {
  const lote = await prisma.loteBaseActiva.findUnique({
    where: { id },
    select: { id: true, codigo: true, _count: { select: { movimientos: true } } },
  });
  if (!lote) throw new Error("El lote no existe.");

  if (lote._count.movimientos > 0) {
    throw new Error("No se puede eliminar este lote porque tiene movimientos asociados.");
  }

  return prisma.loteBaseActiva.delete({ where: { id } });
}