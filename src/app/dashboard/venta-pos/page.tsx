import { obtenerDatosPosService } from "@/lib/services/pos.service";
import { PosPage } from "@/components/pos/pos-page";

export const dynamic = "force-dynamic";

export default async function VentaPosPage() {
  const datos = await obtenerDatosPosService();
  return <PosPage datos={datos} />;
}