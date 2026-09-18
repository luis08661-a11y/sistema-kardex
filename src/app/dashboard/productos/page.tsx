import { obtenerCatalogosProducto, obtenerProductos } from "@/actions/productos.actions";
import { ProductosModule } from "./productos-module";

export default async function ProductosPage() {
  const [productos, catalogos] = await Promise.all([obtenerProductos(), obtenerCatalogosProducto()]);
  return <ProductosModule productos={productos} catalogos={catalogos} />;
}
