"use client";

import { useEffect, useMemo, useState, useEffectEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import {
  Package,
  Pencil,
  Plus,
  Layers,
  Tag,
  Boxes,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  guardarProducto,
  type ProductoState,
} from "@/actions/productos.actions";

/* -------------------------------------------------------------------------- */
/* TIPOS                                                                      */
/* -------------------------------------------------------------------------- */

type Producto = {
  id: string;
  tipoInventario: string;
  codigo: string;
  codigoExistencia: string | null;
  descripcion: string;
  observaciones: string | null;
  unidadMedidaId: string;
  tipoExistenciaId: string | null;
  activo: boolean;
  precioVenta: number;
  unidadMedida?: { id: string; codigo: string | null; nombre: string } | null;
  tipoExistencia?: { id: string; codigo: string | null; nombre: string } | null;
  presentacion?: { id: string; nombre: string; unidadMedidaId: string | null; activo: boolean } | null;
};

type Catalogo = { id: string; codigo?: string | null; nombre: string };

type Catalogos = {
  unidades: Catalogo[];
  tipos: Catalogo[];
  categorias: Catalogo[];
  marcas: Catalogo[];
  afectaciones: Catalogo[];
  presentaciones: Catalogo[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Producto | null;
  catalogos: Catalogos;
}

const initialState: ProductoState = { success: false, message: "" };

/* -------------------------------------------------------------------------- */
/* COMPONENTE                                                                 */
/* -------------------------------------------------------------------------- */

export function ProductoDialog({ open, onOpenChange, editing, catalogos }: Props) {
  const router = useRouter();
  const editando = editing !== null;

  const initial = useMemo(() => ({
    tipoInv: (editing?.tipoInventario ?? "BASE_ACTIVA") as "BASE_ACTIVA" | "PRODUCTO_TERMINADO",
    unidad: editing ? String(editing.unidadMedidaId) : (catalogos.unidades[0]?.id ? String(catalogos.unidades[0].id) : ""),
    tipoExistencia: editing?.tipoExistenciaId ? String(editing.tipoExistenciaId) : "",
    presentacionNombre: editing?.presentacion?.nombre ?? "",
    precioUnitario: editing?.precioVenta ? String(editing.precioVenta) : "",
    observaciones: editing?.observaciones ?? "",
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [editing?.id]);

  const [tipoInv, setTipoInv] = useState<"BASE_ACTIVA" | "PRODUCTO_TERMINADO">(initial.tipoInv);
  const [unidad, setUnidad] = useState(initial.unidad);
  const [tipoExistencia, setTipoExistencia] = useState(initial.tipoExistencia);
  const [presentacionNombre, setPresentacionNombre] = useState(initial.presentacionNombre);
  const [precioUnitario, setPrecioUnitario] = useState(initial.precioUnitario);
  const [observaciones, setObservaciones] = useState(initial.observaciones);
  const [state, formAction, actionPending] = useActionState(guardarProducto, initialState);
  const isPT = tipoInv === "PRODUCTO_TERMINADO";

  const handleExito = useEffectEvent(() => {
    toast.success(state.message);
    router.refresh();
    setTimeout(() => onOpenChange(false), 0);
  });

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      handleExito();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-200! gap-0 overflow-hidden p-0">
        <form action={formAction}>
          {/* header moderno */}
          <DialogHeader className="border-b bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-3 py-2">
            <DialogTitle className="flex items-center gap-3 text-lg text-white">
              <div className={`flex size-9 items-center justify-center rounded-xl ${editando ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {editando ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              </div>
              <div>
                <span>{editando ? "Editar Producto" : "Nuevo Producto"}</span>
                <p className="text-[11px] font-normal text-slate-400">
                  {editando ? "Modifique los datos del producto" : "Complete los campos para registrar"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* body */}
          <div className="px-6 py-5">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <input type="hidden" name="tipoInventario" value={tipoInv} />

            <div className="grid gap-6 lg:grid-cols-5">
              {/* columna izquierda */}
              <div className="space-y-4 lg:col-span-3">
                <SectionHeader icon={<Package className="size-3.5 border-amber-300" />} title="Identificación" />
                <div className="grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
                  <Field label="Nombre del producto *">
                    <Input
                      name="descripcion"
                      defaultValue={editing?.descripcion ?? ""}
                      placeholder="Nombre del producto"
                    />
                  </Field>
                  <Field label="Codigo *">
                    <Input
                      name="codigo"
                      defaultValue={editing?.codigo ?? ""}
                      placeholder={tipoInv === "BASE_ACTIVA" ? "Ej. TH" : "Ej. 01"}
                      className="font-mono"
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Código de existencia *">
                    <Input
                      name="codigoExistencia"
                      defaultValue={editing?.codigoExistencia ?? ""}
                      placeholder="1"
                    />
                  </Field>
                  <Field label="Tabla 5 (afectación) *">
                    <SelectField
                      name="tipoExistenciaId"
                      value={tipoExistencia}
                      onChange={setTipoExistencia}
                      options={catalogos.tipos.map(i => ({ value: String(i.id), label: i.nombre }))}
                      placeholder="Seleccionar"
                    />
                  </Field>
                </div>

                <Separator />

                <SectionHeader icon={<Boxes className="size-3.5" />} title="Tipo de inventario" />
                <div className="grid grid-cols-2 gap-2">
                  <TipoCard
                    title="Base Activa"
                    desc="Insumo o base"
                    icon={<Layers className="size-4" />}
                    selected={tipoInv === "BASE_ACTIVA"}
                    onSelect={() => setTipoInv("BASE_ACTIVA")}
                    color="emerald"
                  />
                  <TipoCard
                    title="Producto Terminado"
                    desc="Requiere U.M."
                    icon={<Tag className="size-4" />}
                    selected={tipoInv === "PRODUCTO_TERMINADO"}
                    onSelect={() => setTipoInv("PRODUCTO_TERMINADO")}
                    color="violet"
                  />
                </div>

                <Separator />

                <SectionHeader icon={<FileText className="size-3.5" />} title="Observaciones" />
                <Textarea
                  name="observaciones"
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  placeholder="Notas opcionales del producto"
                  className="min-h-18"
                />
              </div>

              {/* columna derecha */}
              <div className="space-y-4 lg:col-span-2">
                <div className={`rounded-xl border p-4 ${isPT ? "border-violet-500/20 bg-violet-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vista previa</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex size-7 items-center justify-center rounded-lg ${isPT ? "bg-violet-500/10 text-violet-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        <Package className="size-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">{editing?.descripcion || "Nombre producto"}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{editing?.codigo || "XX"}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Badge variant="outline" className={isPT ? "border-violet-500/40 bg-violet-500/10 text-violet-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}>
                        {isPT ? "PT" : "BASE"}
                      </Badge>
                      {isPT && precioUnitario && (
                        <Badge variant="secondary">S/ {Number(precioUnitario || 0).toFixed(2)}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {!isPT && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                    <SectionHeader icon={<Layers className="size-3.5" />} title="Base Activa" />
                    <Field label="Unidad de medida *">
                      <SelectField
                        name="unidadMedidaId"
                        value={unidad}
                        onChange={setUnidad}
                        options={catalogos.unidades.map(i => ({ value: String(i.id), label: i.nombre }))}
                        placeholder="Seleccionar unidad"
                      />
                    </Field>
                  </div>
                )}

                {isPT && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <SectionHeader icon={<Tag className="size-3.5" />} title="Producto Terminado" />
                      <Badge variant="secondary" className="text-[10px]">Requerido</Badge>
                    </div>
                    <Field label="Presentación *">
                      <SelectField
                        name="presentacionNombre"
                        value={presentacionNombre}
                        onChange={setPresentacionNombre}
                        options={catalogos.presentaciones.map(i => ({ value: i.nombre, label: i.nombre }))}
                        placeholder="Seleccionar"
                      />
                    </Field>
                    <Field label="Unidad de medida *">
                      <SelectField
                        name="unidadMedidaId"
                        value={unidad}
                        onChange={setUnidad}
                        options={catalogos.unidades.map(i => ({ value: String(i.id), label: i.nombre }))}
                        placeholder="Seleccionar"
                      />
                    </Field>
                    <Field label="Precio unitario (S/) *">
                      <Input
                        name="precioUnitario"
                        type="number"
                        step="0.01"
                        min="0"
                        value={precioUnitario}
                        onChange={e => setPrecioUnitario(e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Precio para el módulo de Venta POS.
                      </p>
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="border-t border-slate-700/50 bg-slate-900 px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={actionPending} className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500">
              {actionPending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Guardando...
                </>
              ) : editando ? "Actualizar" : "Guardar Producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTES                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {title}
    </div>
  );
}

function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const selected = options.find(o => o.value === value)?.label;
  return (
    <>
      <input type="hidden" name={name} value={value === "NONE" ? "" : value} />
      <Select value={value || null} onValueChange={v => onChange(v ?? "")}>
        <SelectTrigger className="w-full">
          {selected
            ? <span className="line-clamp-1 text-left">{selected}</span>
            : <SelectValue placeholder={placeholder} />}
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function TipoCard({
  title,
  desc,
  icon,
  selected,
  onSelect,
  color,
}: {
  title: string;
  desc: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: () => void;
  color: "emerald" | "violet";
}) {
  const colors = {
    emerald: {
      selected: "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500",
      icon: "bg-emerald-500/10 text-emerald-400",
      iconDefault: "bg-muted text-muted-foreground",
    },
    violet: {
      selected: "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500",
      icon: "bg-violet-500/10 text-violet-400",
      iconDefault: "bg-muted text-muted-foreground",
    },
  };
  const c = colors[color];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
        selected ? c.selected : "border-border hover:bg-muted/50"
      }`}
    >
      <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${selected ? c.icon : c.iconDefault}`}>
        {icon}
      </div>
      <div>
        <span className="block text-xs font-semibold leading-tight">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{desc}</span>
      </div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
