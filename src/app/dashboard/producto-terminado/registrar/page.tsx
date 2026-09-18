import { getProductoTerminadoView } from "@/lib/services/producto-terminado.service";
import { ProductoTerminadoModule } from "./producto-terminado-module";

export default async function ProductoTerminadoPage() {
  const data = await getProductoTerminadoView();
  return <ProductoTerminadoModule data={data} />;
}
