import { obtenerContextoResumenBase, obtenerResumenBaseActiva } from "@/actions/resumen-base-activa.actions";
import { ResumenPlanillaModule } from "./resumen-planilla-module";

export default async function ResumenPlanillaPage() {
  const [contexto, inicial] = await Promise.all([
    obtenerContextoResumenBase(),
    obtenerResumenBaseActiva({ soloConStock: true }),
  ]);

  return <ResumenPlanillaModule contexto={contexto} inicial={inicial} />;
}
