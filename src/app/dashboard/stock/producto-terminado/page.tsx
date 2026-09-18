import { obtenerStockReporteService } from "@/lib/services/stock.service";
import { StockModule } from "../stock-module";

export const dynamic = "force-dynamic";

export default async function StockProductoTerminadoPage() {
  const inicial = await obtenerStockReporteService("PRODUCTO_TERMINADO", {});
  return <StockModule tipo="PRODUCTO_TERMINADO" inicial={inicial} />;
}