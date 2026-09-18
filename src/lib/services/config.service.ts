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
      logoUrl: input.logoUrl || null,
      firmaUrl: input.firmaUrl || null,
      responsableReporte: input.responsableReporte || null,
      cargoReporte: input.cargoReporte || null,
    },
  });
}

export async function cambiarEstadoEmpresaService(id: string, activo: boolean) {
  return prisma.empresa.update({ where: { id }, data: { activo } });
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
