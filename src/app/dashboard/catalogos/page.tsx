import { obtenerCatalogos } from "@/actions/catalogos.actions";
import { CatalogosModule } from "./catalogos-module";

export default async function CatalogosPage() {
  const resultadoInicial = await obtenerCatalogos();
  return <CatalogosModule resultadoInicial={resultadoInicial} />;
}
