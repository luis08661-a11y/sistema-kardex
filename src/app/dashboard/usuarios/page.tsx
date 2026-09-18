import { obtenerUsuariosService, obtenerRolesService, obtenerPermisosService, obtenerAuditoriaService } from "@/lib/services/usuarios.service";
import { exigirPermiso } from "@/lib/auth/permissions";
import { UsuariosModule } from "./usuarios-module";

export default async function UsuariosPage() {
  await exigirPermiso("USUARIOS.GESTIONAR");
  const [usuarios, roles, permisos, auditoria] = await Promise.all([obtenerUsuariosService(), obtenerRolesService(), obtenerPermisosService(), obtenerAuditoriaService()]);
  return <UsuariosModule usuarios={usuarios} roles={roles} permisos={permisos} auditoria={auditoria} />;
}
