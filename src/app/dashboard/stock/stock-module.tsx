"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  PackageSearch,
  Warehouse,
  Boxes,
  Coins,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  consultarStockReporte,
  type StockReporteRow,
  type TipoStockReporte,
} from "@/actions/stock.actions";

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Módulo Stock (reporte de existencias).
 *
 * Los toggles "Integra un dato" (costo unitario / costo total) son SOLO una vista
 * previa: cambian la presentación de columnas para simular cómo se verán esos campos
 * cuando se integren en el módulo Productos. No persisten ni modifican datos.
 *
 * Integración real pendiente (ver obtenerStockReporteService en stock.service.ts):
 * - Mover costo unitario / costo total (y stock) a la ficha del producto en
 *   productos-module, con permisos por rol.
 * - Sincronizar con el registro de movimientos de BA/PT y descuento de stock del POS.
 * - Decidir si el costo se congela (captura manual) o sigue siendo el promedio
 *   ponderado de las capas PEPS (vista viva).
 * - Migración Prisma + seed y pruebas con datos reales.
 */

export function StockModule({
  tipo,
  inicial,
}: {
  tipo: TipoStockReporte;
  inicial: StockReporteRow[];
}) {
  const esBA = tipo === "BASE_ACTIVA";

  const [codigo, setCodigo] = useState("");
  const [producto, setProducto] = useState("");
  const [stockMin, setStockMin] = useState("");
  const [stockMax, setStockMax] = useState("");
  const [integrarCostoUnitario, setIntegrarCostoUnitario] = useState(false);
  const [integrarCostoTotal, setIntegrarCostoTotal] = useState(false);
  const [rows, setRows] = useState<StockReporteRow[]>(inicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const hayFiltros = Boolean(codigo || producto || stockMin || stockMax);

  const toNumero = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  async function consultar() {
    setError("");
    setCargando(true);
    try {
      const res = await consultarStockReporte(
        tipo,
        { codigo: codigo || undefined, producto: producto || undefined },
      );
      const min = toNumero(stockMin);
      const max = toNumero(stockMax);
      setRows(
        res.filter((r) => (min === undefined || r.stock >= min) && (max === undefined || r.stock <= max)),
      );
    } catch (e) {
      setError((e instanceof Error ? e.message : "Error al consultar el stock.") || "Error al consultar el stock.");
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setCodigo("");
    setProducto("");
    setStockMin("");
    setStockMax("");
    setRows(inicial);
    setError("");
  }

  const totalStock = rows.reduce((acc, r) => acc + r.stock, 0);
  const totalCosto = rows.reduce((acc, r) => acc + r.costoTotal, 0);
  const costoUnitarioPromedio = totalStock > 0 ? totalCosto / totalStock : 0;

  const haySimulacion = integrarCostoUnitario || integrarCostoTotal;
  const integradoChip = (
    <span className="ml-1.5 inline-block rounded bg-emerald-600 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white align-middle">
      Integrado
    </span>
  );
  const celdaIntegrada = "text-right font-sans font-semibold text-emerald-700 dark:text-emerald-400";

  const unidadEtiqueta = esBA ? "Unidad" : "Presentación";
  const stockEtiqueta = esBA ? "Stock (kg)" : "Stock (und)";
  const cuEtiqueta = esBA ? "Costo unitario (S/ / kg)" : "Costo unitario (S/ / und)";
  const ctEtiqueta = "Costo total (S/)";
  const titulo = esBA ? "STOCK BASE ACTIVA" : "STOCK PRODUCTO TERMINADO";
  const subtitulo = esBA ? "BASE ACTIVA (MATERIA PRIMA)" : "PRODUCTO TERMINADO";

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-3 md:py-4 px-4 lg:px-6">
        <div className="space-y-6">
          {/* HEADER */}
          <div className="relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
            <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  {esBA ? (
                    <Warehouse className="h-5 w-5" />
                  ) : (
                    <Boxes className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight md:text-lg">
                    {titulo}
                  </h1>
                  <p className="text-xs text-zinc-200">
                    {subtitulo}
                    <span className="mx-1.5 text-white/40">·</span>
                    Reporte de existencias valorizado (capas PEPS vigentes).
                  </p>
                </div>
              </div>
              {haySimulacion && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <Check className="h-3 w-3" />
                  Vista previa de integración a Productos
                </span>
              )}
            </div>
          </div>

          {/* FILTROS */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="mb-1 flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Búsqueda y Filtros
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {!cargando && (
                    <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                      <span className="font-bold text-foreground">{rows.length}</span>{" "}
                      {rows.length === 1 ? "producto" : "productos"}
                      {totalStock > 0 && !hayFiltros && (
                        <>
                          {" "}
                          · Stock total{" "}
                          <span className="font-bold text-foreground">
                            {fmt(totalStock)}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                  {hayFiltros && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limpiar}
                      className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground">
                    Código
                  </Label>
                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Código del producto..."
                    className="h-8 text-[11px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground">
                    Producto
                  </Label>
                  <Input
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    placeholder="Descripción del producto..."
                    className="h-8 text-[11px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground">
                    Stock mín.
                  </Label>
                  <Input
                    type="number"
                    value={stockMin}
                    onChange={(e) => setStockMin(e.target.value)}
                    placeholder="0"
                    className="h-8 text-[11px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-semibold text-muted-foreground">
                    Stock máx.
                  </Label>
                  <Input
                    type="number"
                    value={stockMax}
                    onChange={(e) => setStockMax(e.target.value)}
                    placeholder="Sin límite"
                    className="h-8 text-[11px]"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={consultar}
                    disabled={cargando}
                    className="h-8 w-full gap-1.5 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold">
                    {cargando ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    {cargando ? "Consultando..." : "Consultar"}
                  </Button>
                </div>
              </div>

              {/* INTEGRA UN DATO (vista previa) */}
              <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Coins className="h-3.5 w-3.5 text-emerald-600" />
                  Integra un dato:
                </span>
                <button
                  type="button"
                  onClick={() => setIntegrarCostoUnitario((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                    integrarCostoUnitario
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}>
                  Costo unitario
                  {integrarCostoUnitario && <Check className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIntegrarCostoTotal((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                    integrarCostoTotal
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}>
                  Costo total
                  {integrarCostoTotal && <Check className="h-3 w-3" />}
                </button>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Solo previsualiza cómo quedará cada campo en la ficha de Productos.
                </span>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>

          {haySimulacion && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-600/30 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="space-y-1">
                <p className="font-semibold">Simulación de integración al módulo Productos</p>
                <p>
                  Los campos{" "}
                  {[
                    ...(integrarCostoUnitario ? ["costo unitario"] : []),
                    ...(integrarCostoTotal ? ["costo total"] : []),
                  ].join(" y ")}{" "}
                  se mostrarán tal como se verán integrados en la ficha del producto.
                  No se guarda ni modifica ningún dato. La implementación real queda
                  pendiente en el módulo Productos (ver comentarios en
                  stock.service.ts y stock-module.tsx).
                </p>
              </div>
            </div>
          )}

          {cargando && (
            <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando...
            </div>
          )}

          {!cargando && rows.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-12 text-center shadow-sm">
              <PackageSearch className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Sin existencias para los filtros seleccionados.
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                El reporte se construye con las capas PEPS vigentes (saldo restante &gt; 0) de{" "}
                {esBA ? "Base Activa" : "Producto Terminado"}.
              </p>
            </div>
          )}

          {!cargando && rows.length > 0 && (
            <div className="no-print flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  {esBA ? (
                    <Warehouse className="h-4 w-4" />
                  ) : (
                    <Boxes className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-wide">
                    {esBA ? "Stock Base Activa" : "Stock Producto Terminado"}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {rows.length} {rows.length === 1 ? "producto" : "productos"} · Stock total{" "}
                    {fmt(totalStock)}
                    {esBA ? " kg" : " und"} · Valorizado S/ {fmt(totalCosto)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!cargando && rows.length > 0 && (
            <div className="rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-28">Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="w-32">{unidadEtiqueta}</TableHead>
                    <TableHead className="w-32 text-right">{stockEtiqueta}</TableHead>
                    <TableHead className="w-44 text-right">
                      <span className="inline-flex items-center">
                        {cuEtiqueta}
                        {integrarCostoUnitario && integradoChip}
                      </span>
                    </TableHead>
                    <TableHead className="w-40 text-right">
                      <span className="inline-flex items-center">
                        {ctEtiqueta}
                        {integrarCostoTotal && integradoChip}
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${r.productoId}|${r.presentacionId ?? ""}`}>
                      <TableCell className="font-mono text-[11px]">{r.codigo}</TableCell>
                      <TableCell className="text-[12px] font-medium">{r.descripcion}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {esBA ? r.unidad : r.presentacion}
                      </TableCell>
                      <TableCell className="text-right text-[12px] font-semibold">
                        {fmt(r.stock)}
                      </TableCell>
                      <TableCell className={integrarCostoUnitario ? celdaIntegrada : "text-right text-[12px]"}>
                        {fmt(r.costoUnitario)}
                      </TableCell>
                      <TableCell className={integrarCostoTotal ? celdaIntegrada : "text-right text-[12px]"}>
                        {fmt(r.costoTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-foreground/10 bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={3} className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Totales
                    </TableCell>
                    <TableCell className="text-right text-[12px] font-bold">{fmt(totalStock)}</TableCell>
                    <TableCell className="text-right text-[12px] font-bold">
                      {fmt(costoUnitarioPromedio)}
                    </TableCell>
                    <TableCell className={`text-right text-[12px] ${integrarCostoTotal ? celdaIntegrada : "font-bold"}`}>
                      {fmt(totalCosto)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}