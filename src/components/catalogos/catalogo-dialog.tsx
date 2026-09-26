"use client";

import { useEffect, useMemo, useEffectEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import {
  Ruler,
  Package,
  Database,
  Tags,
  Factory,
  FileText,
  SlidersHorizontal,
  Warehouse,
  Pencil,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  crearUnidad,
  crearPresentacion,
  crearTipoExistencia,
  crearCategoria,
  crearMarca,
  crearTipoAfectacion,
  crearTipoOperacion,
  crearAlmacenamiento,
  actualizarCatalogo,
  type CatalogoState,
} from "@/actions/catalogos.actions";

type CatalogoRow = {
  id: string;
  codigo: string | null;
  nombre: string;
  activo: boolean;
  establecimiento?: { id: string; nombre: string } | null;
};

type Tab = "unidades" | "presentaciones" | "existencias" | "categorias" | "marcas" | "afectaciones" | "operaciones" | "almacenamientos";

type DialogData = { row: CatalogoRow | null; tipo: Tab } | null;

type Catalogos = Awaited<ReturnType<typeof import("@/actions/catalogos.actions").obtenerCatalogos>>;

const initialState: CatalogoState = { success: false, message: "" };

const tabConfig: Record<Tab, { label: string; icon: React.ElementType; hasCode: boolean; needsEstablecimiento: boolean }> = {
  unidades: { label: "Unidad de medida", icon: Ruler, hasCode: true, needsEstablecimiento: false },
  presentaciones: { label: "Presentación", icon: Package, hasCode: true, needsEstablecimiento: false },
  existencias: { label: "Tipo de existencia", icon: Database, hasCode: true, needsEstablecimiento: false },
  categorias: { label: "Categoría", icon: Tags, hasCode: false, needsEstablecimiento: false },
  marcas: { label: "Marca", icon: Factory, hasCode: false, needsEstablecimiento: false },
  afectaciones: { label: "Tipo de afectación", icon: FileText, hasCode: true, needsEstablecimiento: false },
  operaciones: { label: "Tipo de operación", icon: SlidersHorizontal, hasCode: true, needsEstablecimiento: false },
  almacenamientos: { label: "Almacenamiento", icon: Warehouse, hasCode: true, needsEstablecimiento: true },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DialogData;
  onGuardado: () => void;
  catalogos: Catalogos;
}

export function CatalogoDialog({ open, onOpenChange, data, onGuardado, catalogos }: Props) {
  const router = useRouter();
  const editando = !!data?.row;
  const tipo = data?.tipo || "unidades";
  const config = tabConfig[tipo];

  const action = useMemo(() => editando ? actualizarCatalogo : getActionForTipo(tipo), [editando, tipo]);

  const [state, formAction, actionPending] = useActionState(
    action,
    initialState
  );

  const handleExito = useEffectEvent(() => {
    toast.success(state.message);
    router.refresh();
    onGuardado();
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
      <DialogContent className="max-w-md! gap-0 overflow-hidden p-0">
        <form action={formAction}>
          <input type="hidden" name="tipo" value={tipo} />
          {editando && <input type="hidden" name="id" value={data!.row!.id} />}
          {tipo === "almacenamientos" && editando && data?.row?.establecimiento && (
            <input type="hidden" name="establecimientoId" value={data!.row!.establecimiento!.id} />
          )}

          {/* header moderno */}
          <DialogHeader className="border-b bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-3 py-2">
            <DialogTitle className="flex items-center gap-3 text-lg text-white">
              <div className={`flex size-9 items-center justify-center rounded-xl ${editando ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {editando ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              </div>
              <div>
                <span>{editando ? `Editar ${config.label}` : `Nueva ${config.label}`}</span>
                <p className="text-[11px] font-normal text-slate-400">
                  {editando ? "Modifique los datos del registro" : "Complete los campos para registrar"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* body */}
          <div className="px-6 py-5 space-y-4">
            {config.hasCode && (
              <Field label="Código *">
                <Input
                  name="codigo"
                  defaultValue={editando ? data!.row!.codigo ?? "" : ""}
                  placeholder="Ej. KG"
                  className="font-mono uppercase"
                  required
                />
              </Field>
            )}

            <Field label="Nombre *">
              <Input
                name="nombre"
                defaultValue={editando ? data!.row!.nombre : ""}
                placeholder={`Nombre de la ${config.label.toLowerCase()}`}
                className="uppercase"
                required
              />
            </Field>

            {config.needsEstablecimiento && (
              <Field label="Establecimiento *">
                <Select name="establecimientoId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar establecimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogos.establecimientos.map((e: { id: string; nombre: string }) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </div>

          {/* footer */}
          <DialogFooter className="border-t border-slate-700/50 bg-slate-900">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" disabled={actionPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={actionPending} className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500">
              {actionPending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Guardando...
                </>
              ) : editando ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getActionForTipo(tipo: Tab) {
  switch (tipo) {
    case "unidades":
      return crearUnidad;
    case "presentaciones":
      return crearPresentacion;
    case "existencias":
      return crearTipoExistencia;
    case "categorias":
      return crearCategoria;
    case "marcas":
      return crearMarca;
    case "afectaciones":
      return crearTipoAfectacion;
    case "operaciones":
      return crearTipoOperacion;
    case "almacenamientos":
      return crearAlmacenamiento;
    default:
      return crearUnidad;
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}