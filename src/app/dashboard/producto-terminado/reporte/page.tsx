import { obtenerContextoReporteGeneralProductoTerminado } from "@/actions/reporte-general-producto-terminado.actions";
import { ReporteGeneralProductoTerminadoModule } from "./reporte-general-producto-terminado-module";

export default async function ReporteGeneralProductoTerminadoPage() {
  const contexto = await obtenerContextoReporteGeneralProductoTerminado();

  return <ReporteGeneralProductoTerminadoModule contexto={contexto} />;
}
