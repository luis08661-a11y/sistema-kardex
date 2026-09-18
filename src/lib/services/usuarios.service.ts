import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { PermisoInput, RolInput, UsuarioInput } from "@/lib/validators/usuarios.schema";

export async function obtenerUsuariosService() {
  return prisma.user.findMany({
    select: { id: true, username: true, email: true, name: true, status: true, createdAt: true, updatedAt: true,
      roles: { select: { role: { select: { id: true, name: true } } } } },
    orderBy: { username: "asc" },
  });
}

export async function obtenerRolesService() {
  return prisma.role.findMany({
    include: { users: { select: { userId: true } }, permissions: { include: { permission: true } } },
    orderBy: { name: "asc" },
  });
}

export async function obtenerPermisosService() {
  return prisma.permission.findMany({ orderBy: [{ modulo: "asc" }, { codigo: "asc" }] });
}

export async function crearUsuarioService(input: UsuarioInput) {
  if (!input.password) throw new Error("La contraseña es obligatoria al crear un usuario");
  const password = await bcrypt.hash(input.password, 12);
  return prisma.user.create({ data: { username: input.username, email: input.email, name: input.name, password, status: input.status } });
}

export async function actualizarUsuarioService(id: string, input: UsuarioInput) {
  const data: { username: string; email: string; name: string; status: boolean; password?: string } = { username: input.username, email: input.email, name: input.name, status: input.status };
  if (input.password) data.password = await bcrypt.hash(input.password, 12);
  return prisma.user.update({ where: { id }, data });
}

export async function cambiarEstadoUsuarioService(id: string, status: boolean) {
  return prisma.user.update({ where: { id }, data: { status } });
}

export async function crearRolService(input: RolInput) {
  return prisma.role.create({ data: { name: input.name.toUpperCase(), description: input.description || null } });
}

export async function actualizarRolService(id: string, input: RolInput) {
  return prisma.role.update({ where: { id }, data: { name: input.name.toUpperCase(), description: input.description || null } });
}

export async function crearPermisoService(input: PermisoInput) {
  return prisma.permission.create({ data: input });
}

export async function actualizarPermisoService(id: string, input: PermisoInput) {
  return prisma.permission.update({ where: { id }, data: input });
}

export async function asignarRolesUsuarioService(userId: string, roleIds: string[]) {
  return prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    if (roleIds.length) await tx.userRole.createMany({ data: roleIds.map((roleId) => ({ userId, roleId })), skipDuplicates: true });
    return tx.user.findUnique({ where: { id: userId }, include: { roles: { include: { role: true } } } });
  });
}

export async function asignarPermisosRolService(roleId: string, permissionIds: string[]) {
  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length) await tx.rolePermission.createMany({ data: permissionIds.map((permissionId) => ({ roleId, permissionId })), skipDuplicates: true });
    return tx.role.findUnique({ where: { id: roleId }, include: { permissions: { include: { permission: true } } } });
  });
}

export async function registrarAuditoriaService(input: { usuarioId?: string | null; accion: string; entidad: string; entidadId?: string | null; ruta?: string | null; metodo?: string | null; detalle?: unknown; ip?: string | null; userAgent?: string | null; }) {
  return prisma.auditLog.create({ data: { usuarioId: input.usuarioId ?? null, accion: input.accion, entidad: input.entidad, entidadId: input.entidadId ?? null, ruta: input.ruta ?? null, metodo: input.metodo ?? null, detalle: input.detalle == null ? undefined : JSON.parse(JSON.stringify(input.detalle)), ip: input.ip ?? null, userAgent: input.userAgent ?? null } });
}

export async function obtenerAuditoriaService(limit = 200) {
  return prisma.auditLog.findMany({ take: limit, orderBy: { createdAt: "desc" }, include: { usuario: { select: { username: true, name: true } } } });
}
