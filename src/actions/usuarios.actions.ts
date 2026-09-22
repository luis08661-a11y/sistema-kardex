"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { exigirPermiso } from "@/lib/auth/permissions";
import { usuarioSchema, rolSchema, permisoSchema } from "@/lib/validators/usuarios.schema";
import {
  crearUsuarioService,
  actualizarUsuarioService,
  cambiarEstadoUsuarioService,
  eliminarUsuarioService,
  crearRolService,
  actualizarRolService,
  eliminarRolService,
  crearPermisoService,
  actualizarPermisoService,
  eliminarPermisoService,
  cambiarEstadoPermisoService,
  asignarRolesUsuarioService,
  asignarPermisosRolService,
  registrarAuditoriaService,
} from "@/lib/services/usuarios.service";

type ActionResult = { success: boolean; message: string };

async function audit(accion: string, entidad: string, entidadId?: string, detalle?: unknown) {
  const session = await getSession();
  await registrarAuditoriaService({
    usuarioId: session?.userId, accion, entidad, entidadId, detalle,
  });
}

export async function crearUsuarioAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await exigirPermiso("USUARIOS.GESTIONAR");
    const parsed = usuarioSchema.safeParse({
      username: formData.get("username"),
      email: formData.get("email"),
      name: formData.get("name"),
      password: formData.get("password") || undefined,
      status: formData.get("status") !== "false",
    });
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    const user = await crearUsuarioService(parsed.data);
    await audit("CREAR", "User", user.id, { username: user.username });
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Usuario creado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al crear usuario" };
  }
}

export async function actualizarUsuarioAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await exigirPermiso("USUARIOS.GESTIONAR");
    const parsed = usuarioSchema.safeParse({
      username: formData.get("username"),
      email: formData.get("email"),
      name: formData.get("name"),
      password: formData.get("password") || undefined,
      status: formData.get("status") === "true",
    });
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await actualizarUsuarioService(id, parsed.data);
    await audit("ACTUALIZAR", "User", id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Usuario actualizado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al actualizar usuario" };
  }
}

export async function cambiarEstadoUsuarioAction(id: string, status: boolean): Promise<ActionResult> {
  try {
    await exigirPermiso("USUARIOS.GESTIONAR");
    await cambiarEstadoUsuarioService(id, status);
    await audit(status ? "ACTIVAR" : "DESACTIVAR", "User", id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: status ? "Usuario activado" : "Usuario desactivado" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al cambiar estado" };
  }
}

export async function eliminarUsuarioAction(id: string): Promise<ActionResult> {
  try {
    await exigirPermiso("USUARIOS.GESTIONAR");
    await eliminarUsuarioService(id);
    await audit("ELIMINAR", "User", id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Usuario eliminado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al eliminar usuario" };
  }
}

export async function crearRolAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    const parsed = rolSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
    });
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    const role = await crearRolService(parsed.data);
    await audit("CREAR", "Role", role.id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Rol creado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al crear rol" };
  }
}

export async function actualizarRolAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    const parsed = rolSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
    });
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await actualizarRolService(id, parsed.data);
    await audit("ACTUALIZAR", "Role", id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Rol actualizado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al actualizar rol" };
  }
}

export async function eliminarRolAction(id: string): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    await eliminarRolService(id);
    await audit("ELIMINAR", "Role", id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Rol eliminado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al eliminar rol" };
  }
}

export async function crearPermisoAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    const parsed = permisoSchema.safeParse({
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      modulo: formData.get("modulo"),
      activo: formData.get("activo") !== "false",
    });
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    const p = await crearPermisoService(parsed.data);
    await audit("CREAR", "Permission", String(p.id));
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Permiso creado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al crear permiso" };
  }
}

export async function actualizarPermisoAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    const parsed = permisoSchema.safeParse({
      codigo: formData.get("codigo"),
      nombre: formData.get("nombre"),
      modulo: formData.get("modulo"),
      activo: formData.get("activo") === "true",
    });
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };
    await actualizarPermisoService(id, parsed.data);
    await audit("ACTUALIZAR", "Permission", String(id));
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Permiso actualizado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al actualizar permiso" };
  }
}

export async function eliminarPermisoAction(id: string): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    await eliminarPermisoService(id);
    await audit("ELIMINAR", "Permission", id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Permiso eliminado correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al eliminar permiso" };
  }
}

export async function cambiarEstadoPermisoAction(id: string, activo: boolean): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    await cambiarEstadoPermisoService(id, activo);
    await audit(activo ? "ACTIVAR" : "DESACTIVAR", "Permission", id);
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: activo ? "Permiso activado" : "Permiso desactivado" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al cambiar estado" };
  }
}

export async function asignarRolesUsuarioAction(userId: string, roleIds: string[]): Promise<ActionResult> {
  try {
    await exigirPermiso("USUARIOS.GESTIONAR");
    await asignarRolesUsuarioService(userId, roleIds);
    await audit("ASIGNAR_ROLES", "User", userId, { roleIds });
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Roles asignados correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al asignar roles" };
  }
}

export async function asignarPermisosRolAction(roleId: string, permissionIds: string[]): Promise<ActionResult> {
  try {
    await exigirPermiso("ROLES.GESTIONAR");
    await asignarPermisosRolService(roleId, permissionIds);
    await audit("ASIGNAR_PERMISOS", "Role", roleId, { permissionIds });
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Permisos asignados correctamente" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Error al asignar permisos" };
  }
}
