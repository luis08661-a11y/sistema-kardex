import { obtenerContextoReporteGeneral } from "@/actions/reporte-general-base-activa.actions";
import { ReporteGeneralBaseActivaModule } from "./reporte-general-base-activa-module";

export default async function ReporteGeneralBaseActivaPage() {
  const contexto = await obtenerContextoReporteGeneral();

  return <ReporteGeneralBaseActivaModule contexto={contexto} />;
}
