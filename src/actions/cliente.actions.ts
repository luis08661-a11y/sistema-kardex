"use server";

import { revalidatePath } from "next/cache";
import {
  clienteFiltrosSchema,
  clienteSchema,
} from "@/lib/validators/cliente.schema";
import * as service from "@/lib/services/cliente.service";
import type {
  ClienteDTO,
  ClientesPaginadasDTO,
} from "@/lib/services/cliente.service";

export type ClienteActionState = {
  success: boolean;
  message: string;
  data?: ClienteDTO;
};

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return "Ya existe un cliente con ese tipo y número de documento.";
  }
  if (typeof error === "object" && error && "code" in error && error.code === "P2003") {
    return "El cliente está relacionado con ventas y no puede eliminarse.";
  }
  return error instanceof Error ? error.message : fallback;
}

export async function buscarClientes(filtro: string): Promise<ClienteDTO[]> {
  if (!filtro.trim()) return [];
  const clientes = await service.buscarClientePorDocumento(filtro);
  return clientes.map((c) => ({
    id: c.id,
    tipoDocumento: c.tipoDocumento,
    numeroDocumento: c.numeroDocumento,
    razonSocial: c.razonSocial,
    direccion: c.direccion,
    telefono: c.telefono,
    email: c.email,
    activo: c.activo,
  }));
}

export async function obtenerCliente(id: string): Promise<ClienteDTO | null> {
  if (!id) return null;
  return service.obtenerClienteService(id);
}

export async function obtenerClientes(input: unknown): Promise<ClientesPaginadasDTO> {
  const parsed = clienteFiltrosSchema.safeParse(input);
  if (!parsed.success) {
    return { data: [], total: 0, page: 1, pageSize: 20, totalPaginas: 0 };
  }
  return service.obtenerClientesService(parsed.data);
}

export async function guardarCliente(input: unknown): Promise<ClienteActionState> {
  const parsed = clienteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos de cliente inválidos",
    };
  }
  try {
    const data = parsed.data;
    const cliente = data.id
      ? await service.actualizarClienteService(data.id, data)
      : await service.crearClienteService(data);
    revalidatePath("/dashboard/ventas");
    return {
      success: true,
      message: data.id ? "Cliente actualizado correctamente" : "Cliente registrado correctamente",
      data: cliente,
    };
  } catch (error) {
    return { success: false, message: errorMessage(error, "No se pudo guardar el cliente") };
  }
}

export async function cambiarEstadoCliente(id: string, activo: boolean): Promise<ClienteActionState> {
  if (!id) return { success: false, message: "Cliente inválido" };
  try {
    await service.cambiarEstadoClienteService(id, activo);
    revalidatePath("/dashboard/ventas");
    return { success: true, message: "Estado de cliente actualizado" };
  } catch (error) {
    return { success: false, message: errorMessage(error, "No se pudo actualizar el cliente") };
  }
}

export async function eliminarCliente(id: string): Promise<ClienteActionState> {
  if (!id) return { success: false, message: "Cliente inválido" };
  try {
    await service.eliminarClienteService(id);
    revalidatePath("/dashboard/ventas");
    return { success: true, message: "Cliente eliminado correctamente" };
  } catch (error) {
    return { success: false, message: errorMessage(error, "No se pudo eliminar el cliente") };
  }
}