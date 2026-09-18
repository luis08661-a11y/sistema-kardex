import { obtenerResumenPT, obtenerContextoResumenPT } from "@/actions/resumen-producto-terminado.actions";
import { ResumenProductoTerminadoModule } from "./resumen-producto-terminado-module";

export default async function ResumenProductoTerminadoPage() {
  const [inicial, contexto] = await Promise.all([
    obtenerResumenPT({ soloConStock: true }),
    obtenerContextoResumenPT(),
  ]);

  return (
    <ResumenProductoTerminadoModule contexto={contexto} inicial={inicial} />
  );
}
