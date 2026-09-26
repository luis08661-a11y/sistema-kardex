"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
} from "react";
import { toast } from "sonner";
import {
  Moon,
  Sun,
  History,
  ShoppingBag,
  ScanLine,
  Save,
  Printer,
  FilePen,
  FileText,
  Receipt,
  ClipboardList,
  Wallet,
  CreditCard,
  Landmark,
  Zap,
  Search,
  Grid3X3,
  Plus,
  Loader2,
  Trash2,
  Eraser,
  RefreshCw,
  Package,
} from "lucide-react";

import { Badge } from "@/components/pos/pos-ui";

import {
  buscarProductosPos,
  guardarVentaPos,
  obtenerCatalogoPos,
  obtenerConteoVentasDelDia,
  obtenerTipoCambioPos,
} from "@/actions/pos.actions";
import { obtenerVenta } from "@/actions/venta.actions";
import type { Fila } from "@/components/ventas/ventas-history-modal";
import type {
  DatosPosDTO,
  ProductoPosDTO,
  VentaPosGuardadaDTO,
} from "@/lib/services/pos.service";
import { reproducirSonidoAgregarCarrito } from "./sonido";
import { exportarPdfVenta } from "@/components/ventas/venta-export";
import {
  calcularTotales,
  formatearMonedaSoles,
  formatearNumero,
} from "@/lib/pos/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartTable } from "@/components/pos/cart-table";
import { ClienteLine } from "@/components/pos/cliente-line";
import { NuevoClienteDialog } from "@/components/pos/nuevo-cliente-dialog";
import { DirectorioClientesDialog } from "@/components/pos/directorio-clientes-dialog";
import { CatalogoVisualDialog } from "@/components/pos/catalogo-visual-dialog";
import { VentasHistoryModal } from "@/components/ventas/ventas-history-modal";
import { TicketPreviewDialog } from "@/components/pos/ticket-preview-dialog";
import { AvisoDialog } from "@/components/pos/aviso-dialog";
import { VentaPrint } from "@/components/ventas/venta-print";
import {
  FORMA_PAGO_LABEL,
  METODO_PAGO_LABEL,
  ventaPosParaImprimir,
  type CartItem,
  type ClienteSeleccionado,
  type FormaPago,
  type MetodoPago,
  type TipoComprobantePos,
} from "@/components/pos/pos-types";
import { redondearDinero } from "@/components/pos/pos-types";
import { cn } from "@/lib/utils";

const ICONOS_COMPROBANTE: Record<TipoComprobantePos, typeof FileText> = {
  NOTA_DE_VENTA: FilePen,
  FACTURA: FileText,
  BOLETA: Receipt,
  COTIZACION: ClipboardList,
};

function SmartphoneIcon(props: ComponentProps<typeof Wallet>) {
  return <ShoppingBag {...props} />;
}

const ICONOS_METODO: Record<
  MetodoPago,
  ComponentType<{ className?: string }>
> = {
  EFECTIVO: Wallet,
  YAPE: SmartphoneIcon,
  PLIN: SmartphoneIcon,
  TRANSFERENCIA: Landmark,
  TARJETA: CreditCard,
  DEPOSITO: Landmark,
  OTRO: Wallet,
};

function fechaISO(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function fechaConHoraLocal(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const ahora = new Date();
  return new Date(
    y,
    m - 1,
    d,
    ahora.getHours(),
    ahora.getMinutes(),
    ahora.getSeconds(),
  );
}

/* ─── Etiqueta inline ─── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

/* ─── Tecla de atajo (keycap) ─── */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-white/30 bg-white/15 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none">
      {children}
    </kbd>
  );
}

interface Props {
  datos: DatosPosDTO;
}

export function PosPage({ datos }: Props) {
  const comprobanteTipos = datos.comprobantes;

  const [temaClaro, setTemaClaro] = useState(false);
  const [comprobanteTipo, setComprobanteTipo] =
    useState<TipoComprobantePos>("NOTA_DE_VENTA");
  const [serie, setSerie] = useState(
    () =>
      comprobanteTipos.find(c => c.tipo === "NOTA_DE_VENTA")?.series[0]
        ?.serie ?? "NV01",
  );
  const [numero, setNumero] = useState(
    () =>
      comprobanteTipos.find(c => c.tipo === "NOTA_DE_VENTA")?.series[0]
        ?.numero ?? 1,
  );
  const [moneda, setMoneda] = useState<"PEN" | "USD">("PEN");
  const [tipoCambio, setTipoCambio] = useState("1");
  const [consultandoTipoCambio, setConsultandoTipoCambio] = useState(false);
  const [formaPago, setFormaPago] = useState<FormaPago>("CONTADO");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [fecha, setFecha] = useState(() => fechaISO());
  const [fechaVencimiento, setFechaVencimiento] = useState(() =>
    fechaISO(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
  );
  const [numeroOperacion, setNumeroOperacion] = useState("");
  const [recibidoText, setRecibidoText] = useState("");
  const recibidoTocadoRef = useRef(false);
  const [cliente, setCliente] = useState<ClienteSeleccionado>({
    tipoDocumento: "DNI",
    numeroDocumento: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    email: "",
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [rapidos, setRapidos] = useState<ProductoPosDTO[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [ventasDelDia, setVentasDelDia] = useState(0);

  const [aviso, setAviso] = useState<{
    titulo: string;
    mensaje: string;
    tipo: "error" | "success";
    labelAccion?: string;
    onAccion?: () => void;
    onExportarPdf?: () => void;
  } | null>(null);
  const [openNuevoCliente, setOpenNuevoCliente] = useState(false);
  const [openDirectorio, setOpenDirectorio] = useState(false);
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [busquedaInicial, setBusquedaInicial] = useState("");
  const [openHistorial, setOpenHistorial] = useState(false);
  const [ticket, setTicket] = useState<VentaPosGuardadaDTO | null>(null);
  const [openTicket, setOpenTicket] = useState(false);
  const [imprimirHistorial, setImprimirHistorial] = useState<
    import("@/components/ventas/types").VentaParaImprimir | null
  >(null);
  const [openImprimirHistorial, setOpenImprimirHistorial] = useState(false);

  const cargarRapidos = async () => {
    try {
      const res = await obtenerCatalogoPos({
        q: "",
        categoriaId: "TODOS",
        page: 1,
        pageSize: 12,
      });
      setRapidos(res.data);
    } catch {
      setRapidos([]);
    }
  };

  const cargarVentasDelDia = async () => {
    try {
      const total = await obtenerConteoVentasDelDia();
      setVentasDelDia(total);
    } catch {
      // mantener el último valor conocido
    }
  };

  useEffect(() => {
    void cargarRapidos();
    void cargarVentasDelDia();
  }, []);

  const totales = useMemo(
    () =>
      calcularTotales(
        cart.map(l => ({ price: l.precio, quantity: l.cantidad })),
      ),
    [cart],
  );
  const recibidoTextoVisible =
    metodoPago === "EFECTIVO" && !recibidoTocadoRef.current
      ? String(totales.total)
      : recibidoText;
  const recibido =
    Number.isFinite(Number(recibidoTextoVisible)) &&
    Number(recibidoTextoVisible) > 0
      ? Number(recibidoTextoVisible)
      : 0;
  const vuelto = redondearDinero(recibido - totales.total);

  const comprobanteActual = useMemo(
    () => comprobanteTipos.find(c => c.tipo === comprobanteTipo),
    [comprobanteTipos, comprobanteTipo],
  );

  const cambiarComprobante = (tipo: TipoComprobantePos) => {
    const conf = comprobanteTipos.find(c => c.tipo === tipo);
    setComprobanteTipo(tipo);
    if (conf?.series[0]) {
      setSerie(conf.series[0].serie);
      setNumero(conf.series[0].numero);
    }
  };

  const agregarProducto = (p: ProductoPosDTO) => {
    const existente = cart.find(x => x.productoId === p.id);
    let nuevas: CartItem[];
    if (existente) {
      if (p.stock > 0 && existente.cantidad + 1 > p.stock) {
        setAviso({
          titulo: "Stock insuficiente",
          mensaje: `Solo hay ${formatearNumero(p.stock)} unidades disponibles de "${p.descripcion}".`,
          tipo: "error",
        });
        return;
      }
      nuevas = cart.map(x =>
        x.productoId === p.id ? { ...x, cantidad: x.cantidad + 1 } : x,
      );
    } else {
      const precio = p.precioVenta > 0 ? p.precioVenta : 0;
      const nuevo: CartItem = {
        productoId: p.id,
        codigo: p.codigo,
        descripcion: p.descripcion,
        unidadMedida: p.unidadMedida || "UNIDAD",
        cantidad: 1,
        precio,
        stock: p.stock,
      };
      if (nuevo.stock > 0 && nuevo.cantidad > nuevo.stock) {
        setAviso({
          titulo: "Stock insuficiente",
          mensaje: `La cantidad supera el stock disponible de "${p.descripcion}".`,
          tipo: "error",
        });
        return;
      }
      nuevas = [...cart, nuevo];
    }
    reproducirSonidoAgregarCarrito();
    setCart(nuevas);
  };

  const cambiarCantidad = (productoId: string, cantidad: number) => {
    if (!Number.isFinite(cantidad) || cantidad <= 0) return;
    const item = cart.find(x => x.productoId === productoId);
    if (item && item.stock > 0 && cantidad > item.stock) {
      setAviso({
        titulo: "Stock insuficiente",
        mensaje: `Solo hay ${formatearNumero(item.stock)} unidades disponibles de "${item.descripcion}".`,
        tipo: "error",
      });
      return;
    }
    setCart(c =>
      c.map(x => (x.productoId === productoId ? { ...x, cantidad } : x)),
    );
  };

  const cambiarPrecio = (productoId: string, precio: number) => {
    setCart(c =>
      c.map(x =>
        x.productoId === productoId
          ? {
              ...x,
              precio: Number.isFinite(precio) && precio >= 0 ? precio : 0,
            }
          : x,
      ),
    );
  };

  const eliminarProducto = (productoId: string) => {
    setCart(c => c.filter(x => x.productoId !== productoId));
  };

  const limpiarCliente = () => {
    setCliente({
      id: undefined,
      tipoDocumento: "DNI",
      numeroDocumento: "",
      razonSocial: "",
      direccion: "",
      telefono: "",
      email: "",
    });
  };

  const limpiarVenta = () => {
    setCart([]);
    setRecibidoText("");
    setBusqueda("");
    setBarcode("");
    recibidoTocadoRef.current = false;
  };

  const seleccionarMetodoPago = (m: MetodoPago) => {
    setMetodoPago(m);
    if (m !== "EFECTIVO") setRecibidoText("");
    else recibidoTocadoRef.current = false;
  };

  const agregarBarcode = async () => {
    const codigo = barcode.trim();
    if (!codigo) return;
    const res = await buscarProductosPos(codigo);
    const p =
      res.find(x => x.codigo === codigo || x.codigoExistencia === codigo) ??
      res[0];
    if (p) {
      agregarProducto(p);
      setBarcode("");
    } else {
      setBarcode("");
      setBusquedaInicial(codigo);
      setOpenCatalogo(true);
    }
  };

  const validarAntesDeGuardar = (): string | null => {
    if (!cart.length) return "Ingresar productos";
    const doc = cliente.numeroDocumento.trim();
    if (!doc) {
      if (cliente.tipoDocumento === "DNI") return "Ingresar DNI";
      if (cliente.tipoDocumento === "RUC") return "Ingresar RUC";
    }
    if (comprobanteTipo === "FACTURA") {
      if (cliente.tipoDocumento !== "RUC" || !/^\d{11}$/.test(doc)) {
        return "Una FACTURA ELECTRÓNICA exige un RUC de 11 dígitos.";
      }
    }
    if (comprobanteTipo === "BOLETA") {
      const ok =
        (cliente.tipoDocumento === "DNI" && /^\d{8}$/.test(doc)) ||
        (cliente.tipoDocumento === "CE" && /^\d{8,12}$/.test(doc));
      if (!ok)
        return "La BOLETA DE VENTA exige DNI (8 dígitos) o Carné de Extranjería.";
    }
    if (metodoPago === "EFECTIVO" && recibido < totales.total) {
      return "El monto recibido es menor al total de la venta.";
    }
    return null;
  };

  const guardar = async (imprimir: boolean) => {
    if (guardando) return;
    const error = validarAntesDeGuardar();
    if (error) {
      setAviso({
        titulo: "Verifique los datos",
        mensaje: error,
        tipo: "error",
      });
      return;
    }
    setGuardando(true);
    try {
      const res = await guardarVentaPos({
        tipoComprobante: comprobanteTipo,
        serie,
        formaPago,
        metodoPago,
        moneda,
        tipoCambio: Number(tipoCambio) || 1,
        fecha: fechaConHoraLocal(fecha),
        fechaVencimiento:
          comprobanteTipo === "COTIZACION" || formaPago === "CREDITO"
            ? new Date(`${fechaVencimiento}T00:00:00`)
            : undefined,
        numeroOperacion,
        recibido: metodoPago === "EFECTIVO" ? recibido : undefined,
        clienteId: cliente.id ?? "",
        cliente: {
          tipoDocumento: cliente.tipoDocumento,
          numeroDocumento: cliente.numeroDocumento,
          razonSocial: cliente.razonSocial,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
          email: cliente.email,
        },
        detalles: cart.map(l => ({
          productoId: l.productoId,
          codigo: l.codigo,
          descripcion: l.descripcion,
          unidadMedida: l.unidadMedida,
          cantidad: l.cantidad,
          precioUnitario: l.precio,
        })),
      });
      if (!res.success || !res.data) {
        setAviso({
          titulo: "No se pudo registrar la venta",
          mensaje: res.message,
          tipo: "error",
        });
        return;
      }
      const venta = res.data;
      setNumero(venta.numero + 1);
      limpiarVenta();
      limpiarCliente();
      void cargarRapidos();
      void cargarVentasDelDia();
      if (imprimir) {
        setTicket(venta);
        setOpenTicket(true);
        toast.success("Comprobante registrado correctamente");
      } else {
        setAviso({
          titulo: "Registro exitoso",
          mensaje: `Comprobante ${venta.serie}-${String(venta.numero).padStart(6, "0")} registrado correctamente.\n¿Desea imprimirlo ahora?`,
          tipo: "success",
          labelAccion: "Imprimir",
          onAccion: () => {
            setAviso(null);
            setTicket(venta);
            setOpenTicket(true);
          },
          onExportarPdf: () =>
            void exportarPdfVenta(ventaPosParaImprimir(venta)),
        });
      }
    } catch (e) {
      setAviso({
        titulo: "No se pudo registrar la venta",
        mensaje:
          e instanceof Error ? e.message : "Ocurrió un error inesperado.",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault();
        void guardar(true);
      } else if (e.key === "F8") {
        e.preventDefault();
        void guardar(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const mostrarPagoRapido = (valor: number) => {
    recibidoTocadoRef.current = true;
    setRecibidoText(
      String(
        redondearDinero(valor === 0 ? totales.total : totales.total + valor),
      ),
    );
  };

  const actualizarTipoCambio = async (opciones?: { seguir?: () => boolean }) => {
    setConsultandoTipoCambio(true);
    try {
      const res = await obtenerTipoCambioPos();
      if (opciones?.seguir && !opciones.seguir()) return;
      if (res) {
        setTipoCambio(String(res.venta));
        toast.success(
          `Tipo de cambio actualizado: S/ ${res.venta} (${res.fuente ?? "SUNAT"})`,
        );
      } else {
        toast.error("No se pudo obtener el tipo de cambio.");
      }
    } finally {
      if (!opciones?.seguir || opciones.seguir()) {
        setConsultandoTipoCambio(false);
      }
    }
  };

  useEffect(() => {
    if (moneda !== "USD") return;
    let activo = true;
    const seguir = () => activo;
    void actualizarTipoCambio({ seguir });
    return () => {
      activo = false;
    };
  }, [moneda]);

  const mostrarVencimiento =
    comprobanteTipo === "COTIZACION" || formaPago === "CREDITO";

  const recargarVentaEnPos = async (fila: Fila) => {
    try {
      const dto = await obtenerVenta(fila.id);
      if (!dto) {
        toast.error("No se pudo cargar el comprobante");
        return;
      }
      setComprobanteTipo(dto.tipoComprobante as TipoComprobantePos);
      setSerie(dto.serie);
      setNumero(dto.numero + 1);
      setFormaPago(dto.formaPago as FormaPago);
      setMetodoPago(dto.metodoPago as MetodoPago);
      setFecha(fechaISO(new Date(dto.fecha)));
      setCliente({
        id: dto.cliente?.id,
        tipoDocumento: (dto.cliente?.tipoDocumento ??
          "DNI") as ClienteSeleccionado["tipoDocumento"],
        numeroDocumento: dto.cliente?.numeroDocumento ?? "",
        razonSocial: dto.cliente?.razonSocial ?? "",
        direccion: dto.cliente?.direccion ?? "",
        telefono: dto.cliente?.telefono ?? "",
        email: dto.cliente?.email ?? "",
      });
      setCart(
        dto.detalles.map(d => ({
          productoId: d.productoId,
          codigo: d.codigo,
          descripcion: d.descripcion,
          unidadMedida: d.unidadMedida || "UNIDAD",
          cantidad: d.cantidad,
          precio: d.precioUnitario,
          stock: d.cantidad,
        })),
      );
      setOpenHistorial(false);
      toast.success("Venta cargada en el punto de venta");
    } catch {
      toast.error("No se pudo cargar el comprobante");
    }
  };

  return (
    <div
      data-pos-theme={temaClaro ? "light" : "dark"}
      className="flex h-[calc(100svh_-_var(--header-height))] flex-col gap-3 overflow-hidden bg-pos-bg p-3 text-foreground md:h-[calc(100svh_-_var(--header-height)_-_1rem)]">
      {/* ════════════ HEADER ════════════ */}
      <header className="flex items-center justify-between gap-3 rounded-lg border border-pos-border bg-pos-card px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-pos-blue to-pos-teal text-white shadow-lg shadow-pos-blue/30">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">
              Punto de Venta
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground">
              Facturación · Cotizaciones · Ventas Rápidas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ventas del día */}
          <button
            type="button"
            onClick={() => setOpenHistorial(true)}
            className="flex items-center gap-2 rounded-xl border border-pos-border bg-pos-input px-3 py-2 text-xs font-bold transition hover:border-pos-blue/50 hover:text-pos-blue-light">
            <History className="size-4 text-pos-blue-light" />
            Ventas del Día
            <span className="rounded-md bg-pos-blue px-1.5 py-0.5 font-mono text-[10px] font-black text-white tabular-nums">
              {ventasDelDia}
            </span>
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
        {/* ════════════ PANEL IZQUIERDO ════════════ */}
        <div className="min-w-0 space-y-3 overflow-y-auto lg:col-span-8 xl:col-span-9">
          {/* ── Card: Documento y cliente ── */}
          <section className="rounded-lg border border-pos-border bg-pos-card p-2">
            <div className="mb-2 flex items-center gap-2 border-b border-pos-border pb-1">
              <span className="flex size-6 items-center justify-center rounded-md bg-pos-blue/15 text-pos-blue-light">
                <Receipt className="size-3.5" />
              </span>
              <h2 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Documento y cliente
              </h2>
            </div>

            {/* Row 1: Comprobante */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
              <div className="md:col-span-3">
                <FieldLabel>Comprobante</FieldLabel>
                <Select
                  value={comprobanteTipo}
                  onValueChange={v =>
                    cambiarComprobante(
                      (v ?? "NOTA_DE_VENTA") as TipoComprobantePos,
                    )
                  }>
                  <SelectTrigger className="h-9 w-full bg-input border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {comprobanteTipos.map(c => {
                      const Icono = ICONOS_COMPROBANTE[c.tipo];
                      return (
                        <SelectItem key={c.tipo} value={c.tipo}>
                          <span className="flex items-center gap-2">
                            <Icono className="size-3.5" />
                            {c.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <FieldLabel>Serie</FieldLabel>
                <Select value={serie} onValueChange={v => setSerie(v ?? serie)}>
                  <SelectTrigger className="h-9 w-full bg-input border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(comprobanteActual?.series ?? []).map(s => (
                      <SelectItem key={s.serie} value={s.serie}>
                        {s.serie} - Serie Principal
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <FieldLabel>N° Correlativo</FieldLabel>
                <div className="flex h-8 items-center justify-center rounded-lg border border-border bg-pos-input font-mono text-sm font-bold tabular-nums text-pos-blue-light">
                  {String(numero).padStart(6, "0")}
                </div>
              </div>
              <div className="md:col-span-2">
                <FieldLabel>Moneda</FieldLabel>
                <Select
                  value={moneda}
                  onValueChange={v => setMoneda((v ?? "PEN") as "PEN" | "USD")}>
                  <SelectTrigger className="h-9 w-full bg-input border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEN">SOLES (S/)</SelectItem>
                    <SelectItem value="USD">DÓLARES ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <FieldLabel>Tipo de Cambio</FieldLabel>
                <div className="relative">
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    className="h-8 bg-input border-border pr-9 font-mono text-center text-sm font-bold tabular-nums"
                    value={tipoCambio}
                    onChange={e => setTipoCambio(e.target.value)}
                  />
                  <button
                    type="button"
                    title="Actualizar tipo de cambio"
                    aria-label="Actualizar tipo de cambio"
                    disabled={consultandoTipoCambio}
                    onClick={() => void actualizarTipoCambio()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-pos-soft hover:text-pos-blue-light disabled:opacity-50">
                    {consultandoTipoCambio ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Cliente (consulta RENIEC/SUNAT, nuevo y directorio) */}
            <div className="pt-2">
              <ClienteLine
                cliente={cliente}
                onChange={setCliente}
                onLimpiar={limpiarCliente}
                onAbrirNuevo={() => setOpenNuevoCliente(true)}
                onAbrirDirectorio={() => setOpenDirectorio(true)}
              />
            </div>
          </section>

          {/* ── Card: Búsqueda y productos ── */}
          <section className="overflow-hidden rounded-lg border border-pos-border bg-pos-card">
            <div className="flex flex-col gap-2 border-b border-pos-border p-2.5 sm:flex-row sm:items-center">
              {/* Búsqueda por texto */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 w-full rounded-lg border-border bg-pos-input pl-9 text-sm"
                  placeholder="Buscar producto por código o nombre…"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const texto = busqueda.trim();
                      setBusqueda("");
                      setBusquedaInicial(texto);
                      setOpenCatalogo(true);
                    }
                  }}
                />
              </div>
              {/* Código de barras + vaciar carrito */}
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="relative min-w-0 flex-1 sm:w-56">
                  <ScanLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-9 w-full rounded-lg border-border bg-pos-input pl-9 pr-3 font-mono text-sm"
                    placeholder="Código de barras"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void agregarBarcode();
                      }
                    }}
                  />
                </div>
                <Badge
                  variant="info"
                  className="h-8 gap-1.5 px-3 text-xs !rounded-lg">
                  <Package className="size-3.5" />
                  {cart.length} {cart.length === 1 ? "producto" : "productos"}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={limpiarVenta}
                  disabled={cart.length === 0}
                  className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40">
                  <Trash2 className="size-4" />
                  Vaciar Lista
                </Button>
              </div>
            </div>

            <CartTable
              cart={cart}
              onChangeCantidad={cambiarCantidad}
              onChangePrecio={cambiarPrecio}
              onRemove={eliminarProducto}
              onLimpiar={limpiarVenta}
            />
          </section>

          {/* ── Añadir rápido ── */}
          {rapidos.length > 0 && (
            <section className="flex flex-wrap items-center gap-2 rounded-lg border border-pos-border bg-pos-card px-3 py-2.5">
              <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
                <Zap className="size-4" />
                Añadir rápido
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-1.5">
                {rapidos.slice(0, 6).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => agregarProducto(p)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-pos-quick-chip-border bg-pos-quick-chip px-3 py-1.5 text-[11px] font-semibold transition hover:border-amber-400/60 hover:bg-pos-quick-chip-hover hover:text-amber-300">
                    {p.descripcion.length > 18
                      ? p.descripcion.slice(0, 18) + "…"
                      : p.descripcion}
                    <span className="font-mono text-[10px] font-bold text-pos-blue-light">
                      {formatearMonedaSoles(p.precioVenta)}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaInicial("");
                    setOpenCatalogo(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-pos-blue/40 bg-pos-blue/10 px-3 py-1.5 text-[11px] font-bold text-pos-blue-light transition hover:bg-pos-blue/20">
                  <Grid3X3 className="size-3.5" />
                  Ver todo
                </button>
              </div>
            </section>
          )}
        </div>

        {/* ════════════ PANEL DERECHO: COBRO ════════════ */}
        <div className="min-w-0 overflow-y-auto lg:col-span-4 xl:col-span-3">
          <section className="rounded-lg border border-pos-border bg-pos-card p-4">
            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Fecha emisión</FieldLabel>
                <Input
                  type="date"
                  className="h-10 bg-input border-border text-sm"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Fecha vencimiento</FieldLabel>
                <Input
                  type="date"
                  className="h-10 bg-input border-border text-sm"
                  value={fechaVencimiento}
                  onChange={e => setFechaVencimiento(e.target.value)}
                  disabled={!mostrarVencimiento}
                />
              </div>
            </div>

            {/* Forma de pago + Método de pago */}
            <div className="mt-4 grid grid-cols-2 items-start gap-3 border-t border-pos-border pt-4">
              <div className="min-w-0 space-y-1.5">
                <FieldLabel>Forma de pago</FieldLabel>
                <div className="flex rounded-sm bg-pos-soft p-1">
                  {(["CONTADO", "CREDITO"] as FormaPago[]).map(f => {
                    const activo = formaPago === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormaPago(f)}
                        className={cn(
                          "flex-1 h-7 rounded-sm px-2 text-xs font-bold transition-all",
                          activo && f === "CREDITO"
                            ? "bg-rose-600 text-white shadow-md"
                            : activo
                              ? "bg-pos-blue text-white shadow-md"
                              : "text-muted-foreground hover:text-foreground",
                        )}>
                        {FORMA_PAGO_LABEL[f]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="min-w-0 space-y-1.5">
                <FieldLabel>Método de pago</FieldLabel>
                <Select
                  value={metodoPago}
                  onValueChange={v =>
                    seleccionarMetodoPago((v ?? "EFECTIVO") as MetodoPago)
                  }>
                  <SelectTrigger className="h-10 w-full rounded-lg bg-input border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(METODO_PAGO_LABEL) as MetodoPago[]).map(m => (
                      <SelectItem key={m} value={m}>
                        <span className="flex items-center gap-2">
                          {(() => {
                            const Icono = ICONOS_METODO[m];
                            return <Icono className="size-4" />;
                          })()}
                          {METODO_PAGO_LABEL[m]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* N° operación */}
            {(metodoPago === "TARJETA" ||
              metodoPago === "YAPE" ||
              metodoPago === "PLIN" ||
              metodoPago === "TRANSFERENCIA" ||
              metodoPago === "DEPOSITO") && (
              <div className="mt-3">
                <FieldLabel>N° operación / referencia (opcional)</FieldLabel>
                <Input
                  className="h-10 bg-input border-border text-sm"
                  placeholder="Número de operación"
                  value={numeroOperacion}
                  onChange={e => setNumeroOperacion(e.target.value)}
                />
              </div>
            )}

            {/* Recibido / Vuelto */}
            {metodoPago === "EFECTIVO" && (
              <div className="mt-4 border-t border-pos-border pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Recibido (S/)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className={`h-11 border-2 bg-pos-input text-center text-base font-bold tabular-nums ${
                        recibido > 0 && vuelto < 0
                          ? "border-destructive/50 text-destructive"
                          : "border-border text-foreground"
                      }`}
                      placeholder="0.00"
                      value={recibidoTextoVisible}
                      onChange={e => {
                        recibidoTocadoRef.current = true;
                        setRecibidoText(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <FieldLabel>Vuelto</FieldLabel>
                    <div
                      className={`flex h-11 items-center justify-center rounded-lg border-2 bg-pos-input text-center text-base font-black tabular-nums ${
                        vuelto < 0
                          ? "border-destructive/50 text-destructive"
                          : "border-border text-foreground"
                      }`}>
                      {recibidoTextoVisible ? formatearMonedaSoles(vuelto) : "S/ 0.00"}
                    </div>
                  </div>
                </div>
                {recibido > 0 && vuelto < 0 && (
                  <div className="mt-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-center text-xs font-bold text-destructive">
                    Falta S/ {formatearNumero(Math.abs(vuelto))}
                  </div>
                )}
                <div className="mt-3">
                  <FieldLabel>Pago rápido en efectivo</FieldLabel>
                  <div className="mt-1 grid grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        recibidoTocadoRef.current = false;
                        setRecibidoText(String(totales.total));
                      }}
                      className="rounded-lg border border-pos-blue/40 bg-pos-blue/10 px-1 py-2 text-[11px] font-bold text-pos-blue-light transition hover:bg-pos-blue/20">
                      Exacto
                    </button>
                    {[10, 20, 50, 100].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => mostrarPagoRapido(b)}
                        className="rounded-lg border border-pos-quick-chip-border bg-pos-quick-chip px-1 py-2 font-mono text-[11px] font-bold tabular-nums transition hover:border-pos-blue/50 hover:text-pos-blue-light">
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Totales */}
            <div className="mt-4 border-t border-pos-border pt-4">
              <dl className="space-y-1.5">
                <div className="flex items-center justify-between rounded-lg bg-pos-soft/50 px-3 py-1.5 text-sm">
                  <dt className="text-muted-foreground">OP. Gravada:</dt>
                  <dd className="font-bold tabular-nums">
                    {formatearMonedaSoles(totales.gravada)}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-pos-soft/50 px-3 py-1.5 text-sm">
                  <dt className="text-muted-foreground">OP. Exonerada:</dt>
                  <dd className="font-bold tabular-nums">
                    {formatearMonedaSoles(totales.exonerada)}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-pos-soft/50 px-3 py-1.5 text-sm">
                  <dt className="text-muted-foreground">OP. Inafecta:</dt>
                  <dd className="font-bold tabular-nums">
                    {formatearMonedaSoles(totales.inafecta)}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-pos-blue/5 px-3 py-1.5 text-sm">
                  <dt className="font-bold text-pos-blue-light">IGV (18%):</dt>
                  <dd className="font-bold tabular-nums text-pos-blue-light">
                    {formatearMonedaSoles(totales.igv)}
                  </dd>
                </div>
                <div className="flex items-center justify-between overflow-hidden rounded-lg bg-gradient-to-r from-pos-blue to-pos-teal px-3 py-3 shadow-lg shadow-black/20">
                  <dt className="text-sm font-black uppercase tracking-wider text-white/90">
                    Total a pagar
                  </dt>
                  <dd className="text-sm font-black tabular-nums text-white drop-shadow-sm">
                    {formatearMonedaSoles(totales.total)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Botones de acción */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-pos-border pt-4">
              <Button
                className="h-10 gap-2 rounded-lg bg-pos-blue text-sm font-black text-white shadow-lg shadow-pos-blue/20 transition hover:bg-pos-blue/90 active:scale-[0.98]"
                disabled={guardando}
                onClick={() => void guardar(false)}>
                {guardando ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Guardar
                <Kbd>F8</Kbd>
              </Button>
              <Button
                className="h-10 gap-2 rounded-lg bg-violet-600 text-sm font-black text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 active:scale-[0.98]"
                disabled={guardando}
                onClick={() => void guardar(true)}>
                <Printer className="size-4" />
                Imprimir
                <Kbd>F9</Kbd>
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Dialogs */}
      <NuevoClienteDialog
        open={openNuevoCliente}
        onOpenChange={setOpenNuevoCliente}
        onClienteGuardado={setCliente}
      />
      <DirectorioClientesDialog
        open={openDirectorio}
        onOpenChange={setOpenDirectorio}
        onSeleccion={c => {
          setCliente(c);
          setOpenDirectorio(false);
          toast.success("Cliente seleccionado");
        }}
      />
      <CatalogoVisualDialog
        key={`catalogo-${openCatalogo}-${busquedaInicial}`}
        open={openCatalogo}
        onOpenChange={setOpenCatalogo}
        onAgregar={agregarProducto}
        categorias={datos.categorias}
        initialSearch={busquedaInicial}
      />
      <VentasHistoryModal
        open={openHistorial}
        onOpenChange={setOpenHistorial}
        onImprimir={v => {
          setImprimirHistorial(v);
          setOpenImprimirHistorial(true);
        }}
        onRecargar={fila => void recargarVentaEnPos(fila)}
        onCambio={() => {
          void cargarRapidos();
          void cargarVentasDelDia();
        }}
      />
      <TicketPreviewDialog
        venta={ticket}
        open={openTicket}
        onOpenChange={setOpenTicket}
      />
      <VentaPrint
        venta={imprimirHistorial}
        open={openImprimirHistorial}
        onOpenChange={setOpenImprimirHistorial}
      />
      <AvisoDialog
        open={aviso !== null}
        onOpenChange={o => {
          if (!o) {
            setAviso(null);
            setOpenTicket(false);
          }
        }}
        titulo={aviso?.titulo ?? ""}
        mensaje={aviso?.mensaje ?? ""}
        tipo={aviso?.tipo ?? "error"}
        labelAccion={aviso?.labelAccion}
        onAccion={aviso?.onAccion}
        onExportarPdf={aviso?.onExportarPdf}
      />
    </div>
  );
}
