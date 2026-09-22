import { obtenerAuditoriaService } from "@/lib/services/usuarios.service";
import { AuditoriaModule } from "./auditoria-module";

export default async function AuditoriaPage() {
  const auditoria = await obtenerAuditoriaService(500);
  return <AuditoriaModule auditoria={auditoria} />;
}
