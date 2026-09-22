import {
  obtenerUsuariosService,
  obtenerRolesService,
  obtenerPermisosService,
  obtenerEstadisticasService,
} from "@/lib/services/usuarios.service";
import { exigirPermiso } from "@/lib/auth/permissions";
import { UsuariosModule } from "./usuarios-module";

export default async function UsuariosPage() {
  await exigirPermiso("USUARIOS.GESTIONAR");
  const [usuarios, roles, permisos, estadisticas] = await Promise.all([
    obtenerUsuariosService(),
    obtenerRolesService(),
    obtenerPermisosService(),
    obtenerEstadisticasService(),
  ]);
  return (
    <UsuariosModule
      usuarios={usuarios}
      roles={roles}
      permisos={permisos}
      estadisticas={estadisticas}
    />
  );
}
