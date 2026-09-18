import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function tienePermiso(codigo: string) {
  const session = await getSession();
  if (!session) return false;
  if (session.roles.includes("ADMIN")) return true;
  const count = await prisma.rolePermission.count({ where: { permission: { codigo, activo: true }, role: { users: { some: { userId: session.userId } } } } });
  return count > 0;
}

export async function exigirPermiso(codigo: string) {
  const ok = await tienePermiso(codigo);
  if (!ok) throw new Error("No tienes permisos para realizar esta operación");
}
