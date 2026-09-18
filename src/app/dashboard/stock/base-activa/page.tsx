import { obtenerStockReporteService } from "@/lib/services/stock.service";
import { StockModule } from "../stock-module";

export const dynamic = "force-dynamic";

export default async function StockBaseActivaPage() {
  const inicial = await obtenerStockReporteService("BASE_ACTIVA", {});
  return <StockModule tipo="BASE_ACTIVA" inicial={inicial} />;
}