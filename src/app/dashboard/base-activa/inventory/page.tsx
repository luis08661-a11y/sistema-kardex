import KardexTableContainer from "./kardex-table-container";
import {
  obtenerKardexResumenService,
  obtenerProductosConLotesService,
} from "@/lib/services/inventory.service";
import {
  obtenerContextoBaseService,
  obtenerStockBaseService,
} from "@/lib/services/base-activa.service";

export default async function InventoryPage() {
  const [resumen, productos, contexto, stockRaw] = await Promise.all([
    obtenerKardexResumenService({ page: 1, pageSize: 10 }),
    obtenerProductosConLotesService(),
    obtenerContextoBaseService(),
    obtenerStockBaseService(),
  ]);

  const stock = stockRaw.map((s) => ({
    ...s,
    _sum: {
      entradaPesoTotalKg: Number(s._sum.entradaPesoTotalKg ?? 0),
      salidaPesoTotalKg: Number(s._sum.salidaPesoTotalKg ?? 0),
    },
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <KardexTableContainer
              resumen={resumen}
              productos={productos}
              contexto={contexto}
              stock={stock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}