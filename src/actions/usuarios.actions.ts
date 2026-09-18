"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { exigirPermiso } from "@/lib/auth/permissions";
import { usuarioSchema, rolSchema, permisoSchema } from "@/lib/validators/usuarios.schema";
import { actualizarPermisoService, actualizarRolService, actualizarUsuarioService, asignarPermisosRolService, asignarRolesUsuarioService, cambiarEstadoUsuarioService, crearPermisoService, crearRolService, crearUsuarioService, registrarAuditoriaService } from "@/lib/services/usuarios.service";

async function audit(accion: string, entidad: string, entidadId?: string, detalle?: unknown) {
  const session = await getSession();
  await registrarAuditoriaService({ usuarioId: session?.userId, accion, entidad, entidadId, detalle });
}

export async function crearUsuarioAction(formData: FormData) {
  await exigirPermiso("USUARIOS.GESTIONAR");
  const parsed = usuarioSchema.safeParse({ username: formData.get("username"), email: formData.get("email"), name: formData.get("name"), password: formData.get("password") || undefined, status: formData.get("status") !== "false" });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const user = await crearUsuarioService(parsed.data); await audit("CREAR", "User", user.id, { username: user.username }); revalidatePath("/dashboard/usuarios");
}

export async function actualizarUsuarioAction(id: string, formData: FormData) {
  await exigirPermiso("USUARIOS.GESTIONAR");
  const parsed = usuarioSchema.safeParse({ username: formData.get("username"), email: formData.get("email"), name: formData.get("name"), password: formData.get("password") || undefined, status: formData.get("status") === "true" });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  await actualizarUsuarioService(id, parsed.data); await audit("ACTUALIZAR", "User", id); revalidatePath("/dashboard/usuarios");
}

export async function cambiarEstadoUsuarioAction(id: string, status: boolean) {
  await exigirPermiso("USUARIOS.GESTIONAR"); await cambiarEstadoUsuarioService(id, status); await audit(status ? "ACTIVAR" : "DESACTIVAR", "User", id); revalidatePath("/dashboard/usuarios");
}

export async function crearRolAction(formData: FormData) {
  await exigirPermiso("ROLES.GESTIONAR"); const parsed = rolSchema.safeParse({ name: formData.get("name"), description: formData.get("description") || undefined }); if (!parsed.success) throw new Error(parsed.error.issues[0].message); const role = await crearRolService(parsed.data); await audit("CREAR", "Role", role.id); revalidatePath("/dashboard/usuarios");
}

export async function actualizarRolAction(id: string, formData: FormData) {
  await exigirPermiso("ROLES.GESTIONAR"); const parsed = rolSchema.safeParse({ name: formData.get("name"), description: formData.get("description") || undefined }); if (!parsed.success) throw new Error(parsed.error.issues[0].message); await actualizarRolService(id, parsed.data); await audit("ACTUALIZAR", "Role", id); revalidatePath("/dashboard/usuarios");
}

export async function crearPermisoAction(formData: FormData) {
  await exigirPermiso("ROLES.GESTIONAR"); const parsed = permisoSchema.safeParse({ codigo: formData.get("codigo"), nombre: formData.get("nombre"), modulo: formData.get("modulo"), activo: formData.get("activo") !== "false" }); if (!parsed.success) throw new Error(parsed.error.issues[0].message); const p = await crearPermisoService(parsed.data); await audit("CREAR", "Permission", String(p.id)); revalidatePath("/dashboard/usuarios");
}

export async function actualizarPermisoAction(id: string, formData: FormData) {
  await exigirPermiso("ROLES.GESTIONAR"); const parsed = permisoSchema.safeParse({ codigo: formData.get("codigo"), nombre: formData.get("nombre"), modulo: formData.get("modulo"), activo: formData.get("activo") !== "false" }); if (!parsed.success) throw new Error(parsed.error.issues[0].message); await actualizarPermisoService(id, parsed.data); await audit("ACTUALIZAR", "Permission", String(id)); revalidatePath("/dashboard/usuarios");
}

export async function asignarRolesUsuarioAction(userId: string, roleIds: string[]) { await exigirPermiso("USUARIOS.GESTIONAR"); await asignarRolesUsuarioService(userId, roleIds); await audit("ASIGNAR_ROLES", "User", userId, { roleIds }); revalidatePath("/dashboard/usuarios"); }
export async function asignarPermisosRolAction(roleId: string, permissionIds: string[]) { await exigirPermiso("ROLES.GESTIONAR"); await asignarPermisosRolService(roleId, permissionIds); await audit("ASIGNAR_PERMISOS", "Role", roleId, { permissionIds }); revalidatePath("/dashboard/usuarios"); }
