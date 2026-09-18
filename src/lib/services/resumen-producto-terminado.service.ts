import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const D = (v: Prisma.Decimal | number | string | null | undefined) => new Prisma.Decimal(v ?? 0);

export async function getResumenProductoTerminado(filters: {
  productoId?: string;
  fechaCorte?: Date;
  fechaDesde?: Date;
  fechaHasta?: Date;
  soloConStock?: boolean;
}) {
  const fechaHasta = filters.fechaHasta ?? filters.fechaCorte ?? new Date();
  const fechaDesde = filters.fechaDesde ?? undefined;

  const [empresa, productos, presentaciones, movimientos] = await Promise.all([
    prisma.empresa.findFirst({ where: { activo: true }, orderBy: { createdAt: "asc" } }),
    prisma.producto.findMany({
      where: {
        tipoInventario: "PRODUCTO_TERMINADO",
        activo: true,
        ...(filters.productoId ? { id: filters.productoId } : {}),
      },
      select: { id: true, codigo: true, descripcion: true, observaciones: true },
      orderBy: [{ descripcion: "asc" }, { codigo: "asc" }],
    }),
    prisma.presentacion.findMany({
      where: { activo: true, producto: { tipoInventario: "PRODUCTO_TERMINADO", activo: true } },
      select: { id: true, productoId: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.movimientoProductoTerminado.findMany({
      where: {
        fecha: {
          ...(fechaDesde ? { gte: fechaDesde } : {}),
          lte: fechaHasta,
        },
        ...(filters.productoId ? { productoId: filters.productoId } : {}),
      },
      select: { productoId: true, presentacionId: true, entradaCan: true, salidaCan: true },
    }),
  ]);

  if (!empresa) throw new Error("No hay una empresa activa configurada. Configúrela en Configuración.");

  const movMap = new Map<string, { entrada: number; salida: number }>();
  for (const m of movimientos) {
    const key = `${m.productoId}::${m.presentacionId ?? ""}`;
    const row = movMap.get(key) ?? { entrada: 0, salida: 0 };
    row.entrada += Number(m.entradaCan);
    row.salida += Number(m.salidaCan);
    movMap.set(key, row);
  }

  const items = productos
    .map((p) => {
      const pPresents = presentaciones.filter((pr) => pr.productoId === p.id);
      if (pPresents.length === 0) {
        const key = `${p.id}::`;
        const stock = D(movMap.get(key)?.entrada ?? 0).sub(D(movMap.get(key)?.salida ?? 0)).toNumber();
        return {
          productoId: p.id,
          codigo: p.codigo,
          descripcion: p.descripcion,
          presentacion: "SIN PRESENTACIÓN",
          stock,
          observaciones: p.observaciones ?? "",
        };
      }
      return pPresents.map((pr) => {
        const key = `${p.id}::${pr.id}`;
        const stock = D(movMap.get(key)?.entrada ?? 0).sub(D(movMap.get(key)?.salida ?? 0)).toNumber();
        return {
          productoId: p.id,
          codigo: p.codigo,
          descripcion: p.descripcion,
          presentacion: pr.nombre,
          stock,
          observaciones: p.observaciones ?? "",
        };
      });
    })
    .flat()
    .filter(item => !filters.soloConStock || item.stock > 0)
    .sort((a, b) => a.descripcion.localeCompare(b.descripcion) || a.codigo.localeCompare(b.codigo));

  const totalGeneral = items.reduce((acc, item) => acc + item.stock, 0);

  return {
    empresa: {
      ruc: empresa.ruc,
      razonSocial: empresa.razonSocial,
      logoUrl: empresa.logoUrl ?? null,
      firmaUrl: empresa.firmaUrl ?? null,
      responsableReporte: empresa.responsableReporte ?? null,
      cargoReporte: empresa.cargoReporte ?? null,
    },
    fechaCorte: fechaHasta,
    items,
    totalGeneral,
  };
}

export async function getContextoResumenPT() {
  const [productos] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, tipoInventario: "PRODUCTO_TERMINADO" },
      select: { id: true, codigo: true, descripcion: true },
      orderBy: [{ descripcion: "asc" }, { codigo: "asc" }],
    }),
  ]);
  return { productos };
}
