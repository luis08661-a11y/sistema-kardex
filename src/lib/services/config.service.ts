import { prisma } from "@/lib/db/prisma";
import type {
  EmpresaInput,
  PeriodoInput,
  EstablecimientoInput,
} from "@/lib/validators/config.schema";

export async function obtenerConfiguracionService() {
  const [empresas, periodos, establecimientos] = await Promise.all([
    prisma.empresa.findMany({ orderBy: { razonSocial: "asc" } }),
    prisma.periodo.findMany({
      include: { empresa: { select: { id: true, razonSocial: true, ruc: true } } },
      orderBy: [{ anio: "desc" }, { id: "desc" }],
    }),
    prisma.establecimiento.findMany({
      include: { empresa: { select: { id: true, razonSocial: true, ruc: true } } },
      orderBy: [{ activo: "desc" }, { nombre: "asc" }],
    }),
  ]);

  return { empresas, periodos, establecimientos };
}

export async function crearEmpresaService(input: EmpresaInput) {
  return prisma.empresa.create({
    data: {
      ruc: input.ruc,
      razonSocial: input.razonSocial.toUpperCase(),
      logoUrl: input.logoUrl || null,
      firmaUrl: input.firmaUrl || null,
      responsableReporte: input.responsableReporte || null,
      cargoReporte: input.cargoReporte || null,
    },
  });
}

export async function actualizarEmpresaService(id: string, input: EmpresaInput) {
  return prisma.empresa.update({
    where: { id },
    data: {
      ruc: input.ruc,
      razonSocial: input.razonSocial.toUpperCase(),
    },
  });
}

export async function cambiarEstadoEmpresaService(id: string, activo: boolean) {
  return prisma.empresa.update({ where: { id }, data: { activo } });
}

export async function eliminarEmpresaService(id: string) {
  const [empresa, totalEmpresas] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: { periodos: true, establecimientos: true, clientes: true, ventas: true },
        },
      },
    }),
    prisma.empresa.count(),
  ]);

  if (!empresa) throw new Error("La empresa no existe.");
  if (totalEmpresas <= 1) {
    throw new Error("No se puede eliminar la única empresa configurada.");
  }

  const { periodos, establecimientos, clientes, ventas } = empresa._count;
  if (periodos || establecimientos || clientes || ventas) {
    throw new Error("La empresa tiene periodos, establecimientos, clientes o ventas asociados. Desactívela en lugar de eliminarla.");
  }

  return prisma.empresa.delete({
    where: { id },
    select: { id: true, logoUrl: true, firmaUrl: true },
  });
}

export async function crearPeriodoService(input: PeriodoInput) {
  return prisma.periodo.create({ data: input });
}

export async function actualizarPeriodoService(id: string, input: PeriodoInput) {
  return prisma.periodo.update({ where: { id }, data: input });
}

export async function cambiarEstadoPeriodoService(id: string, activo: boolean) {
  return prisma.periodo.update({ where: { id }, data: { activo } });
}

export async function eliminarPeriodoService(id: string) {
  const periodo = await prisma.periodo.findUnique({
    where: { id },
    select: {
      anio: true,
      _count: { select: { movimientosBase: true, movimientosPT: true } },
    },
  });

  if (!periodo) throw new Error("El periodo no existe.");
  if (periodo._count.movimientosBase + periodo._count.movimientosPT > 0) {
    throw new Error(`El periodo ${periodo.anio} tiene movimientos registrados. Desactivelo en lugar de eliminarlo.`);
  }

  return prisma.periodo.delete({ where: { id } });
}

export async function crearEstablecimientoService(input: EstablecimientoInput) {
  return prisma.establecimiento.create({
    data: {
      empresaId: input.empresaId,
      codigo: input.codigo || null,
      nombre: input.nombre.toUpperCase(),
      direccion: input.direccion || null,
    },
  });
}

export async function actualizarEstablecimientoService(id: string, input: EstablecimientoInput) {
  return prisma.establecimiento.update({
    where: { id },
    data: {
      empresaId: input.empresaId,
      codigo: input.codigo || null,
      nombre: input.nombre.toUpperCase(),
      direccion: input.direccion || null,
    },
  });
}

export async function cambiarEstadoEstablecimientoService(id: string, activo: boolean) {
  return prisma.establecimiento.update({ where: { id }, data: { activo } });
}

export async function eliminarEstablecimientoService(id: string) {
  const establecimiento = await prisma.establecimiento.findUnique({
    where: { id },
    select: {
      nombre: true,
      _count: {
        select: { almacenamientos: true, movimientosBase: true, movimientosPT: true },
      },
    },
  });

  if (!establecimiento) throw new Error("El establecimiento no existe.");

  const { almacenamientos, movimientosBase, movimientosPT } = establecimiento._count;
  if (almacenamientos > 0) {
    throw new Error(`El establecimiento ${establecimiento.nombre} tiene ${almacenamientos} almacenamiento(s) asociados. Desactívelo en lugar de eliminarlo.`);
  }
  if (movimientosBase + movimientosPT > 0) {
    throw new Error(`El establecimiento ${establecimiento.nombre} tiene movimientos registrados. Desactívelo en lugar de eliminarlo.`);
  }

  return prisma.establecimiento.delete({ where: { id } });
}
