import { obtenerContextoReporteVentas } from "@/actions/reporte-ventas.actions";
import { ReporteVentasModule } from "./reporte-ventas-module";

export const dynamic = "force-dynamic";

export default async function ReporteVentasPage() {
  const contexto = await obtenerContextoReporteVentas();
  return <ReporteVentasModule contexto={contexto} />;
}