"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { History, User, Wallet, ScanBarcode, Trash2 } from "lucide-react";

import {
  guardarVenta,
  obtenerVenta,
  obtenerProximoNumero,
  type VentaActionState,
} from "@/actions/venta.actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ProductSearch } from "@/components/ventas/product-search";
import { VentaDetalleTable } from "@/components/ventas/venta-detalle-table";
import { ClienteSearch } from "@/components/ventas/cliente-search";
import { ClienteForm } from "@/components/ventas/cliente-form";
import { ComprobanteForm } from "@/components/ventas/comprobante-form";
import { ResumenVenta } from "@/components/ventas/resumen-venta";
import { VentaActions } from "@/components/ventas/venta-actions";
import { VentaPrint } from "@/components/ventas/venta-print";
import { VentasHistoryModal } from "@/components/ventas/ventas-history-modal";
import { CatalogoProductosModal } from "@/components/ventas/catalogo-productos-modal";
import {
  ventaDTOParaImprimir,
  fechaLocalISO,
  FORMA_PAGO_LABEL,
  type ProductoResultado,
  type LineaDetalle,
  type ClienteSeleccionado,
  type TipoComprobante,
  type FormaPago,
  type MetodoPago,
  type VentaParaImprimir,
} from "@/components/ventas/types";

const IGV_TASA = 0.18;

function redondear(n: number) {
  return Math.round(n * 100) / 100;
}

export function VentaForm() {
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>("COTIZACION");
  const [serie, setSerie] = useState("COT");
  const [numeroPreview, setNumeroPreview] = useState<number | null>(null);
  const [fecha, setFecha] = useState(fechaLocalISO());
  const [formaPago, setFormaPago] = useState<FormaPago>("CONTADO");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [observacion, setObservacion] = useState("");
  const [lineas, setLineas] = useState<LineaDetalle[]>([]);
  const [cliente, setCliente] = useState<ClienteSeleccionado | null>(null);
  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [clienteFormKey, setClienteFormKey] = useState(0);
  const [clienteFormInitial, setClienteFormInitial] = useState<{
    tipoDocumento: "DNI" | "RUC" | "CE" | "PASAPORTE" | "OTRO";
    numeroDocumento: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [ventaImprimible, setVentaImprimible] = useState<VentaParaImprimir | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [catalogoOpen, setCatalogoOpen] = useState(false);

  useEffect(() => {
    const aplicar = (prox: { serie: string; numero: number }) => {
      setSerie(prox.serie);
      setNumeroPreview(prox.numero);
    };
    void obtenerProximoNumero(tipoComprobante).then(aplicar);
  }, [tipoComprobante]);

  const subtotal = useMemo(
    () => redondear(lineas.reduce((acc, l) => acc + (l.importe || 0), 0)),
    [lineas],
  );
  const igv = redondear(subtotal * IGV_TASA);
  const total = redondear(subtotal + igv);

  const agregarProducto = (p: ProductoResultado) => {
    setLineas((prev) => {
      const existente = prev.find((l) => l.productoId === p.id);
      if (existente) {
        return prev.map((l) => {
          if (l.productoId !== p.id) return l;
          const cantidad = l.cantidad + 1;
          return { ...l, cantidad, importe: redondear(cantidad * l.precioUnitario) };
        });
      }
      return [
        ...prev,
        {
          productoId: p.id,
          codigo: p.codigo,
          descripcion: p.descripcion,
          unidadMedida: p.unidadMedida?.codigo || p.unidadMedida?.nombre || "U.M.",
          cantidad: 1,
          precioUnitario: 0,
          importe: 0,
        },
      ];
    });
  };

  const recalcular = (productoId: string, cantidad: number, precioUnitario: number) => {
    setLineas((prev) =>
      prev.map((l) =>
        l.productoId === productoId
          ? {
              ...l,
              cantidad,
              precioUnitario,
              importe: redondear(cantidad * precioUnitario),
            }
          : l,
      ),
    );
  };

  const cambiarCantidad = (id: string, cantidad: number) =>
    recalcular(id, Math.max(0, cantidad), lineas.find((l) => l.productoId === id)?.precioUnitario ?? 0);
  const cambiarPrecio = (id: string, precio: number) =>
    recalcular(id, lineas.find((l) => l.productoId === id)?.cantidad ?? 0, Math.max(0, precio));
  const incrementar = (id: string) => {
    const l = lineas.find((x) => x.productoId === id);
    if (l) recalcular(id, l.cantidad + 1, l.precioUnitario);
  };
  const decrementar = (id: string) => {
    const l = lineas.find((x) => x.productoId === id);
    if (l) recalcular(id, Math.max(0, l.cantidad - 1), l.precioUnitario);
  };
  const eliminarLinea = (id: string) => setLineas((prev) => prev.filter((l) => l.productoId !== id));
  const vaciarLista = () => setLineas([]);

  const onGuardadoCliente = (c: {
    id: string;
    tipoDocumento: string;
    numeroDocumento: string;
    razonSocial: string;
    direccion: string;
    telefono: string;
    email: string;
  }) => {
    setCliente({
      id: c.id,
      tipoDocumento: c.tipoDocumento as "DNI" | "RUC" | "CE" | "PASAPORTE" | "OTRO",
      numeroDocumento: c.numeroDocumento,
      razonSocial: c.razonSocial,
      direccion: c.direccion,
      telefono: c.telefono,
      email: c.email,
    });
  };

  const guardar = async () => {
    if (lineas.length === 0) {
      toast.error("Agregue al menos un producto");
      return;
    }
    if (!cliente) {
      toast.error("Seleccione o registre un cliente");
      return;
    }
    for (const l of lineas) {
      if (l.cantidad <= 0) {
        toast.error(`La cantidad de «${l.descripcion}» debe ser mayor a 0`);
        return;
      }
    }
    if (lineas.some((l) => l.precioUnitario <= 0)) {
      toast.error("El precio unitario debe ser mayor a 0");
      return;
    }

    setSaving(true);
    try {
      const res: VentaActionState = await guardarVenta({
        tipoComprobante,
        formaPago,
        metodoPago,
        fecha: new Date(`${fecha}T12:00:00`),
        observacion,
        clienteId: cliente.id ?? "",
        cliente: cliente.id
          ? undefined
          : {
              tipoDocumento: cliente.tipoDocumento,
              numeroDocumento: cliente.numeroDocumento,
              razonSocial: cliente.razonSocial,
              direccion: cliente.direccion,
              telefono: cliente.telefono,
              email: cliente.email,
            },
        detalles: lineas.map((l) => ({
          productoId: l.productoId,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
        })),
      });
      if (res.success && res.data) {
        toast.success(`${res.message}: ${res.data.serie}-${String(res.data.numero).padStart(6, "0")}`);
        setVentaImprimible(ventaDTOParaImprimir(res.data));
        setLineas([]);
        setCliente(null);
        setObservacion("");
        setNumeroPreview(res.data.numero + 1);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la venta");
    } finally {
      setSaving(false);
    }
  };

  const imprimir = () => {
    if (ventaImprimible) setPrintOpen(true);
  };

  const recargar = async (fila: import("@/components/ventas/ventas-history-modal").Fila) => {
    try {
      const dto = await obtenerVenta(fila.id);
      if (!dto) {
        toast.error("No se pudo cargar el comprobante");
        return;
      }
      setTipoComprobante(dto.tipoComprobante as TipoComprobante);
      setSerie(dto.serie);
      setNumeroPreview(dto.numero);
      setFecha(fechaLocalISO(new Date(dto.fecha)));
      setFormaPago(dto.formaPago as FormaPago);
      setMetodoPago(dto.metodoPago as MetodoPago);
      setObservacion(dto.observacion ?? "");
      setCliente(
        dto.cliente
          ? {
              id: dto.cliente.id,
              tipoDocumento: dto.cliente.tipoDocumento as "DNI" | "RUC" | "CE" | "PASAPORTE" | "OTRO",
              numeroDocumento: dto.cliente.numeroDocumento,
              razonSocial: dto.cliente.razonSocial,
              direccion: dto.cliente.direccion ?? "",
              telefono: "",
              email: "",
            }
          : null,
      );
      setLineas(
        dto.detalles.map((d) => ({
          productoId: d.productoId,
          codigo: d.codigo,
          descripcion: d.descripcion,
          unidadMedida: d.unidadMedida || "U.M.",
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          importe: d.importe,
        })),
      );
      setVentaImprimible(ventaDTOParaImprimir(dto));
      toast.success("Comprobante cargado en el formulario");
    } catch {
      toast.error("No se pudo cargar el comprobante");
    }
  };

  const canSave = lineas.length > 0 && cliente !== null && !saving;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Registro de ventas y cotizaciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Registre un comprobante, asocie un cliente y agréguele productos.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setHistorialOpen(true)}>
          <History className="size-4" />
          Historial
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* ===== Columna izquierda: productos ===== */}
        <div className="min-w-0 space-y-4">
          <Card size="sm" className="relative z-10 overflow-visible">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ScanBarcode className="size-4 text-blue-600" />
                Buscar Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSearch
                onAgregar={agregarProducto}
                onAbrirCatalogo={() => setCatalogoOpen(true)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="grid-cols-[1fr_auto] items-center gap-2">
              <div className="flex items-center gap-2">
                <CardTitle>Detalle de Productos</CardTitle>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                  {lineas.length} item{lineas.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={vaciarLista}
                disabled={lineas.length === 0}
                className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
              >
                <Trash2 className="size-4" />
                Vaciar Lista
              </Button>
            </CardHeader>
            <CardContent>
              <VentaDetalleTable
                lineas={lineas}
                onChangeCantidad={cambiarCantidad}
                onChangePrecio={cambiarPrecio}
                onIncrementar={incrementar}
                onDecrementar={decrementar}
                onEliminar={eliminarLinea}
              />
            </CardContent>
          </Card>
        </div>

        {/* ===== Columna derecha: comprobante y cobro ===== */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-xl bg-[#111827] p-4 text-white shadow-sm ring-1 ring-black/10">
            <ComprobanteForm
              tipoComprobante={tipoComprobante}
              onChangeTipo={setTipoComprobante}
              serie={serie}
              numeroPreview={numeroPreview}
              fecha={fecha}
              onChangeFecha={setFecha}
            />
          </div>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="size-4 text-blue-600" />
                Datos del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClienteSearch
                cliente={cliente}
                onSeleccionar={setCliente}
                onLimpiar={() => setCliente(null)}
                onNuevo={(prefijo) => {
                  setClienteFormInitial(prefijo);
                  setClienteFormOpen(true);
                  setClienteFormKey((k) => k + 1);
                }}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Wallet className="size-4 text-blue-600" />
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Forma Pago</Label>
                  <div className="flex rounded-lg bg-slate-100 p-0.5">
                    {(["CONTADO", "CREDITO"] as FormaPago[]).map((f) => {
                      const activo = formaPago === f;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFormaPago(f)}
                          className={cn(
                            "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                            activo
                              ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-200"
                              : "text-slate-500 hover:text-slate-700",
                          )}
                        >
                          {FORMA_PAGO_LABEL[f]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Método Pago</Label>
                  <Select
                    value={metodoPago}
                    onValueChange={(v) => setMetodoPago((v ?? "EFECTIVO") as MetodoPago)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="YAPE">Yape</SelectItem>
                      <SelectItem value="PLIN">Plin</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                      <SelectItem value="TARJETA">Tarjeta</SelectItem>
                      <SelectItem value="DEPOSITO">Depósito</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Observación</Label>
                <Textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Notas internas (opcional)"
                  rows={2}
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <ResumenVenta subtotal={subtotal} igv={igv} total={total} />
            </CardContent>
          </Card>

          <VentaActions
            saving={saving}
            canSave={canSave}
            onGuardar={() => void guardar()}
            onImprimir={imprimir}
            canImprimir={!!ventaImprimible}
          />
        </div>
      </div>

      <ClienteForm
        key={clienteFormKey}
        open={clienteFormOpen}
        onOpenChange={setClienteFormOpen}
        initial={clienteFormInitial}
        onGuardado={onGuardadoCliente}
      />

      <CatalogoProductosModal
        open={catalogoOpen}
        onOpenChange={setCatalogoOpen}
        onAgregar={agregarProducto}
        agregados={lineas.map((l) => l.productoId)}
      />

      <VentaPrint
        venta={ventaImprimible}
        open={printOpen}
        onOpenChange={setPrintOpen}
      />

      <VentasHistoryModal
        open={historialOpen}
        onOpenChange={setHistorialOpen}
        onRecargar={(fila) => void recargar(fila)}
        onImprimir={(venta) => {
          setVentaImprimible(venta);
          setPrintOpen(true);
        }}
        onCambio={() => {
          void obtenerProximoNumero(tipoComprobante).then((prox) => {
            setSerie(prox.serie);
            setNumeroPreview(prox.numero);
          });
        }}
      />
    </div>
  );
}