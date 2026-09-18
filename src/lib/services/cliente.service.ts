import { Prisma, type Cliente } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  ClienteFiltrosInput,
  ClienteInput,
} from "@/lib/validators/cliente.schema";
import { obtenerEmpresaActivaService } from "@/lib/services/empresa.service";

export interface ClienteDTO {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

function mapearCliente(c: Cliente): ClienteDTO {
  return {
    id: c.id,
    tipoDocumento: c.tipoDocumento,
    numeroDocumento: c.numeroDocumento,
    razonSocial: c.razonSocial,
    direccion: c.direccion,
    telefono: c.telefono,
    email: c.email,
    activo: c.activo,
  };
}

export async function obtenerClienteService(id: string): Promise<ClienteDTO | null> {
  const c = await prisma.cliente.findUnique({ where: { id } });
  return c ? mapearCliente(c) : null;
}

export interface ClienteFilaDTO {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
  empresa: string;
  ventas: number;
  createdAt: Date;
}

export interface ClientesPaginadasDTO {
  data: ClienteFilaDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPaginas: number;
}

export async function obtenerClientesService(
  filtros: ClienteFiltrosInput,
): Promise<ClientesPaginadasDTO> {
  const empresa = await obtenerEmpresaActivaService();
  const q = (filtros.search ?? "").trim();
  const page = Math.max(1, filtros.page);
  const pageSize = Math.min(100, Math.max(1, filtros.pageSize));

  const where: Prisma.ClienteWhereInput = {
    empresaId: empresa.id,
    ...(filtros.estado !== "TODOS"
      ? { activo: filtros.estado === "ACTIVO" }
      : {}),
    ...(q
      ? {
          OR: [
            { numeroDocumento: { contains: q, mode: "insensitive" } },
            { razonSocial: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [filas, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: {
        empresa: { select: { razonSocial: true } },
        _count: { select: { ventas: true } },
      },
      orderBy: [{ activo: "desc" }, { razonSocial: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.cliente.count({ where }),
  ]);

  return {
    data: filas.map((c) => ({
      id: c.id,
      tipoDocumento: c.tipoDocumento,
      numeroDocumento: c.numeroDocumento,
      razonSocial: c.razonSocial,
      direccion: c.direccion,
      telefono: c.telefono,
      email: c.email,
      activo: c.activo,
      empresa: c.empresa.razonSocial,
      ventas: c._count.ventas,
      createdAt: c.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPaginas: Math.ceil(total / pageSize),
  };
}

export async function buscarClientePorDocumento(filtro: string) {
  const empresa = await obtenerEmpresaActivaService();
  return prisma.cliente.findMany({
    where: {
      empresaId: empresa.id,
      activo: true,
      OR: [
        { numeroDocumento: { contains: filtro, mode: "insensitive" } },
        { razonSocial: { contains: filtro, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { razonSocial: "asc" },
  });
}

export async function crearClienteService(input: ClienteInput): Promise<ClienteDTO> {
  const empresa = await obtenerEmpresaActivaService();
  const c = await prisma.cliente.create({
    data: {
      empresaId: input.empresaId || empresa.id,
      tipoDocumento: input.tipoDocumento,
      numeroDocumento: input.numeroDocumento,
      razonSocial: input.razonSocial.toUpperCase(),
      direccion: input.direccion?.trim() || null,
      telefono: input.telefono?.trim() || null,
      email: input.email?.trim() || null,
    },
  });
  return mapearCliente(c);
}

export async function actualizarClienteService(id: string, input: ClienteInput): Promise<ClienteDTO> {
  const c = await prisma.cliente.update({
    where: { id },
    data: {
      tipoDocumento: input.tipoDocumento,
      numeroDocumento: input.numeroDocumento,
      razonSocial: input.razonSocial.toUpperCase(),
      direccion: input.direccion?.trim() || null,
      telefono: input.telefono?.trim() || null,
      email: input.email?.trim() || null,
    },
  });
  return mapearCliente(c);
}

export async function cambiarEstadoClienteService(id: string, activo: boolean): Promise<void> {
  await prisma.cliente.update({ where: { id }, data: { activo } });
}

export async function eliminarClienteService(id: string): Promise<void> {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    select: { id: true, ventas: { select: { id: true }, take: 1 } },
  });
  if (!cliente) throw new Error("No se encontró el cliente.");
  if (cliente.ventas.length > 0) {
    throw new Error("El cliente tiene ventas registradas y no puede eliminarse.");
  }
  await prisma.cliente.delete({ where: { id } });
}