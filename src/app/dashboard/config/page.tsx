import ConfigModule from "./config-module";
import { obtenerConfiguracionService } from "@/lib/services/config.service";

export type ConfiguracionView = Awaited<ReturnType<typeof obtenerConfiguracionService>>;

export default async function ConfigPage() {
  const data = await obtenerConfiguracionService();
  return <ConfigModule data={data} />;
}
