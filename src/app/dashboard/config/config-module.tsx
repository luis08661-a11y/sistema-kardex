"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Pencil,
  Plus,
  Building2,
  CalendarDays,
  MapPin,
  Power,
  Trash2,
  Upload,
  X,
  ImagePlus,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cambiarEstadoEmpresa,
  cambiarEstadoEstablecimiento,
  cambiarEstadoPeriodo,
  guardarEmpresa,
  guardarEstablecimiento,
  guardarPeriodo,
  guardarEmpresaReporte,
  eliminarEmpresa,
  eliminarEstablecimiento,
  eliminarPeriodo,
} from "@/actions/config.actions";
import type { ConfiguracionView } from "./page";
import Image from "next/image";
import { useRef } from "react";

const initialConfigState = { success: false, message: "" };

type EntidadConfig = "empresa" | "periodo" | "establecimiento";

const ETIQUETA_ELIMINAR: Record<EntidadConfig, string> = {
  empresa: "la empresa",
  periodo: "el periodo",
  establecimiento: "el establecimiento",
};

export default function ConfigModule({ data }: { data: ConfiguracionView }) {
  const router = useRouter();
  const [tab, setTab] = useState("empresa");
  const [empresaOpen, setEmpresaOpen] = useState(false);
  const [periodoOpen, setPeriodoOpen] = useState(false);
  const [establecimientoOpen, setEstablecimientoOpen] = useState(false);
  const [empresaEdit, setEmpresaEdit] = useState<
    ConfiguracionView["empresas"][number] | null
  >(null);
  const [periodoEdit, setPeriodoEdit] = useState<
    ConfiguracionView["periodos"][number] | null
  >(null);
  const [establecimientoEdit, setEstablecimientoEdit] = useState<
    ConfiguracionView["establecimientos"][number] | null
  >(null);
  const [pending, startTransition] = useTransition();
  const [eliminar, setEliminar] = useState<{
    entidad: EntidadConfig;
    id: string;
    nombre: string;
  } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const empresaActiva = useMemo(
    () => data.empresas.find(e => e.activo) ?? data.empresas[0],
    [data.empresas],
  );
  const [empresaReporte, setEmpresaReporte] = useState<string>(
    empresaActiva?.id ?? "",
  );

  const tabEfectivo = data.empresas.length === 0 ? "empresa" : tab;
  const empresaReporteEfectivo = data.empresas.some(
    e => e.id === empresaReporte,
  )
    ? empresaReporte
    : (data.empresas[0]?.id ?? "");

  const refrescar = () => {
    setEmpresaEdit(null);
    setPeriodoEdit(null);
    setEstablecimientoEdit(null);
    router.refresh();
  };

  const cambiarEstado = (
    action: (fd: FormData) => Promise<{ success: boolean; message: string }>,
    id: string,
    activo: boolean,
  ) => {
    const fd = new FormData();
    fd.set("id", String(id));
    fd.set("activo", String(activo));
    startTransition(async () => {
      const result = await action(fd);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const confirmarEliminar = () => {
    if (!eliminar) return;
    const objetivo = eliminar;
    setEliminando(true);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", objetivo.id);
      const action =
        objetivo.entidad === "empresa"
          ? eliminarEmpresa
          : objetivo.entidad === "periodo"
            ? eliminarPeriodo
            : eliminarEstablecimiento;
      const result = await action(fd);
      setEliminando(false);
      if (result.success) {
        toast.success(result.message);
        setEliminar(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-xl border p-4 text-white shadow-lg shadow-emerald-500/20">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Configuración General
              </h1>
              <p className="text-sm text-zinc-200 mt-0.5">
                Empresa, periodo contable y establecimientos del Kardex.
              </p>
            </div>
          </div>
          <Badge className="w-fit bg-white/15 text-white hover:bg-white/20 border-white/20">
            Módulo 1 · Base del sistema
          </Badge>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="space-y-4">
        <div className="flex gap-1 border-b">
          {[
            {
              key: "empresa",
              label: "Empresa",
              icon: <Building2 className="h-3.5 w-3.5" />,
              color: "emerald",
            },
            {
              key: "periodo",
              label: "Periodos",
              icon: <CalendarDays className="h-3.5 w-3.5" />,
              color: "emerald",
            },
            {
              key: "establecimiento",
              label: "Establecimientos",
              icon: <MapPin className="h-3.5 w-3.5" />,
              color: "emerald",
            },
            {
              key: "reportes",
              label: "Reportes",
              icon: <ClipboardList className="h-3.5 w-3.5" />,
              color: "emerald",
            },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                tabEfectivo === t.key
                  ? t.color === "emerald"
                    ? "border-b-2 border-emerald-600 font-semibold text-emerald-600"
                    : t.color === "sky"
                      ? "border-b-2 border-sky-600 font-semibold text-sky-600"
                      : t.color === "violet"
                        ? "border-b-2 border-violet-600 font-semibold text-violet-600"
                        : "border-b-2 border-amber-600 font-semibold text-amber-600"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── EMPRESA ── */}
        {tabEfectivo === "empresa" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Datos de empresa</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Información principal usada por los reportes.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEmpresaEdit(null);
                  setEmpresaOpen(true);
                }}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva empresa
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="border-emerald-400/60 bg-emerald-500/40">
                    <TableRow className="border-emerald-400/30">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        RUC
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Razón social
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Estado
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.empresas.map(e => (
                      <TableRow key={e.id} className="h-9">
                        <TableCell className="font-mono py-1.5">
                          {e.ruc}
                        </TableCell>
                        <TableCell className="font-medium py-1.5">
                          {e.razonSocial}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Badge variant={e.activo ? "default" : "secondary"}>
                            {e.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-1.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Editar"
                            onClick={() => {
                              setEmpresaEdit(e);
                              setEmpresaOpen(true);
                            }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={e.activo ? "Desactivar" : "Activar"}
                            disabled={pending}
                            onClick={() =>
                              cambiarEstado(
                                cambiarEstadoEmpresa,
                                e.id,
                                !e.activo,
                              )
                            }>
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${e.razonSocial}`}
                            disabled={pending || eliminando}
                            className="text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                            onClick={() =>
                              setEliminar({
                                entidad: "empresa",
                                id: e.id,
                                nombre: e.razonSocial,
                              })
                            }>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── PERIODOS ── */}
        {tabEfectivo === "periodo" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Periodos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  El periodo queda ligado a la empresa y al movimiento de
                  Kardex.
                </p>
              </div>
              <Button
                onClick={() => {
                  setPeriodoEdit(null);
                  setPeriodoOpen(true);
                }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo periodo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="border-emerald-400/60 bg-emerald-500/40">
                    <TableRow className="border-emerald-400/30">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Año
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Empresa
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        RUC
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Estado
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.periodos.map(p => (
                      <TableRow key={p.id} className="h-9">
                        <TableCell className="font-semibold py-1.5">
                          {p.anio}
                        </TableCell>
                        <TableCell className="py-1.5">
                          {p.empresa.razonSocial}
                        </TableCell>
                        <TableCell className="font-mono py-1.5">
                          {p.empresa.ruc}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Badge variant={p.activo ? "default" : "secondary"}>
                            {p.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-1.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Editar"
                            onClick={() => {
                              setPeriodoEdit(p);
                              setPeriodoOpen(true);
                            }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={p.activo ? "Desactivar" : "Activar"}
                            disabled={pending}
                            onClick={() =>
                              cambiarEstado(
                                cambiarEstadoPeriodo,
                                p.id,
                                !p.activo,
                              )
                            }>
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar periodo ${p.anio}`}
                            disabled={pending || eliminando}
                            className="text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                            onClick={() =>
                              setEliminar({
                                entidad: "periodo",
                                id: p.id,
                                nombre: String(p.anio),
                              })
                            }>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── ESTABLECIMIENTOS ── */}
        {tabEfectivo === "establecimiento" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Establecimientos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cada establecimiento podrá tener sus almacenamientos y
                  movimientos.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEstablecimientoEdit(null);
                  setEstablecimientoOpen(true);
                }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo establecimiento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="border-emerald-400/60 bg-emerald-500/40">
                    <TableRow className="border-emerald-400/30">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Código
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Nombre
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Dirección
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Empresa
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">
                        Estado
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.establecimientos.map(e => (
                      <TableRow key={e.id} className="h-9">
                        <TableCell className="font-mono py-1.5">
                          {e.codigo || "—"}
                        </TableCell>
                        <TableCell className="font-medium py-1.5">
                          {e.nombre}
                        </TableCell>
                        <TableCell className="py-1.5">
                          {e.direccion || "—"}
                        </TableCell>
                        <TableCell className="py-1.5">
                          {e.empresa.razonSocial}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Badge variant={e.activo ? "default" : "secondary"}>
                            {e.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-1.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Editar"
                            onClick={() => {
                              setEstablecimientoEdit(e);
                              setEstablecimientoOpen(true);
                            }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={e.activo ? "Desactivar" : "Activar"}
                            disabled={pending}
                            onClick={() =>
                              cambiarEstado(
                                cambiarEstadoEstablecimiento,
                                e.id,
                                !e.activo,
                              )
                            }>
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${e.nombre}`}
                            disabled={pending || eliminando}
                            className="text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                            onClick={() =>
                              setEliminar({
                                entidad: "establecimiento",
                                id: e.id,
                                nombre: e.nombre,
                              })
                            }>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── REPORTES ── */}
        {tabEfectivo === "reportes" && (
          <Card>
            <CardHeader>
              <CardTitle>Configuración de reportes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Logo, firma, responsable y cargo usados por la plantilla oficial
                de reportes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.empresas
                .filter(e => e.id === empresaReporteEfectivo)
                .map(e => (
                  <ReporteConfigForm
                    key={`${e.id}-${e.responsableReporte ?? ""}-${e.cargoReporte ?? ""}-${e.logoUrl ?? ""}-${e.firmaUrl ?? ""}`}
                    empresa={e}
                    empresas={data.empresas}
                    empresaReporte={empresaReporteEfectivo}
                    setEmpresaReporte={setEmpresaReporte}
                  />
                ))}
            </CardContent>
          </Card>
        )}
      </div>

      <EmpresaDialog
        key={`empresa-${empresaEdit?.id ?? "nueva"}-${empresaOpen}`}
        open={empresaOpen}
        onOpenChange={setEmpresaOpen}
        initial={empresaEdit}
        onGuardado={refrescar}
      />
      <PeriodoDialog
        key={`periodo-${periodoEdit?.id ?? "nuevo"}-${periodoOpen}`}
        open={periodoOpen}
        onOpenChange={setPeriodoOpen}
        initial={periodoEdit}
        empresas={data.empresas}
        defaultEmpresaId={empresaActiva?.id}
        onGuardado={refrescar}
      />
      <EstablecimientoDialog
        key={`establecimiento-${establecimientoEdit?.id ?? "nuevo"}-${establecimientoOpen}`}
        open={establecimientoOpen}
        onOpenChange={setEstablecimientoOpen}
        initial={establecimientoEdit}
        empresas={data.empresas}
        defaultEmpresaId={empresaActiva?.id}
        onGuardado={refrescar}
      />

      <AlertDialog
        open={!!eliminar}
        onOpenChange={o => !o && !eliminando && setEliminar(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar {eliminar ? ETIQUETA_ELIMINAR[eliminar.entidad] : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente &quot;{eliminar?.nombre}&quot;. Si tiene
              datos asociados no se podrá eliminar y tendrás que desactivarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={eliminando}
              onClick={confirmarEliminar}>
              {eliminando ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReporteConfigForm({
  empresa,
  empresas,
  empresaReporte,
  setEmpresaReporte,
}: {
  empresa: ConfiguracionView["empresas"][number] & {
    logoUrl?: string | null;
    firmaUrl?: string | null;
    responsableReporte?: string | null;
    cargoReporte?: string | null;
  };
  empresas: ConfiguracionView["empresas"];
  empresaReporte: string;
  setEmpresaReporte: (v: string) => void;
}) {
  const [pending, start] = useTransition();
  const logoRef = useRef<HTMLInputElement>(null);
  const firmaRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>(empresa.logoUrl ?? "");
  const [firmaPreview, setFirmaPreview] = useState<string>(
    empresa.firmaUrl ?? "",
  );
  const [logoDrag, setLogoDrag] = useState(false);
  const [firmaDrag, setFirmaDrag] = useState(false);

  const preview = (file?: File, cb?: (v: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb?.(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleDrop = (
    e: React.DragEvent,
    cb: (v: string) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      preview(file, cb);
      if (inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
      }
    }
  };

  return (
    <form
      action={fd =>
        start(async () => {
          const r = await guardarEmpresaReporte(fd);
          r.success
            ? (toast.success(r.message),
              setLogoPreview(r.logoUrl ?? ""),
              setFirmaPreview(r.firmaUrl ?? ""))
            : toast.error(r.message);
        })
      }
      className="space-y-5">
      <input type="hidden" name="id" value={empresa.id} />
      {/* ── Text fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Empresa</Label>
          <Select
            value={empresaReporte}
            onValueChange={v => setEmpresaReporte(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar">
                {value =>
                  empresas.find(e => e.id === value)?.razonSocial ??
                  String(value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Seleccionar</SelectItem>
              {empresas.map(e => (
                <SelectItem key={e.id} value={e.id}>
                  {e.razonSocial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Responsable de reportes</Label>
          <Input
            name="responsableReporte"
            defaultValue={empresa.responsableReporte ?? ""}
            placeholder="YOBER GARCIA CABRERA"
            className="uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Cargo</Label>
          <Input
            name="cargoReporte"
            defaultValue={empresa.cargoReporte ?? ""}
            placeholder="JEFE DE CONTROL DE CALIDAD"
            className="uppercase"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full h-9 gap-1.5 bg-emerald-500 text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 font-semibold" disabled={pending}>
            {pending ? "Guardando..." : "Guardar configuración"}
          </Button>
        </div>
      </div>
      {/* ── Image uploads ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Logo de empresa</Label>
          <label
            onDragOver={e => {
              e.preventDefault();
              setLogoDrag(true);
            }}
            onDragLeave={() => setLogoDrag(false)}
            onDrop={e => {
              setLogoDrag(false);
              handleDrop(e, setLogoPreview, logoRef);
            }}
            className={`
              group relative flex h-36 cursor-pointer flex-col items-center justify-center
              rounded-xl border-2 border-dashed transition-all duration-200
              ${
                logoDrag
                  ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                  : "border-slate-600 bg-slate-800/40 hover:border-emerald-500/60 hover:bg-emerald-500/5 hover:shadow-md hover:shadow-emerald-500/10 hover:scale-[1.01]"
              }
            `}>
            <div className="absolute inset-0 rounded-xl bg-emerald-500/0 transition-colors duration-200 group-hover:bg-emerald-500/10" />
            {logoPreview ? (
              <>
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setLogoPreview("");
                    if (logoRef.current) logoRef.current.value = "";
                  }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/90 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60 transition-colors group-hover:bg-slate-600/60">
                  <ImagePlus className="h-5 w-5 text-slate-400 group-hover:text-slate-300" />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                  Arrastra o haz clic
                </span>
                <span className="mt-0.5 text-[11px] text-slate-500">
                  PNG, JPG, WEBP · Máx. 5 MB
                </span>
              </>
            )}
            <input
              ref={logoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              name="logo"
              className="sr-only"
              aria-label="Subir logo de empresa"
              onChange={e => preview(e.target.files?.[0], setLogoPreview)}
            />
          </label>
        </div>

        {/* Firma */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Firma (responsable)</Label>
          <label
            onDragOver={e => {
              e.preventDefault();
              setFirmaDrag(true);
            }}
            onDragLeave={() => setFirmaDrag(false)}
            onDrop={e => {
              setFirmaDrag(false);
              handleDrop(e, setFirmaPreview, firmaRef);
            }}
            className={`
              group relative flex h-36 cursor-pointer flex-col items-center justify-center
              rounded-xl border-2 border-dashed transition-all duration-200
              ${
                firmaDrag
                  ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10 scale-[1.02]"
                  : "border-slate-600 bg-slate-800/40 hover:border-violet-500/60 hover:bg-violet-500/5 hover:shadow-md hover:shadow-violet-500/10 hover:scale-[1.01]"
              }
            `}>
            <div className="absolute inset-0 rounded-xl bg-violet-500/0 transition-colors duration-200 group-hover:bg-violet-500/10" />
            {firmaPreview ? (
              <>
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <img
                    src={firmaPreview}
                    alt="Firma"
                    className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setFirmaPreview("");
                    if (firmaRef.current) firmaRef.current.value = "";
                  }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/90 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60 transition-colors group-hover:bg-slate-600/60">
                  <Upload className="h-5 w-5 text-slate-400 group-hover:text-slate-300" />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                  Arrastra o haz clic
                </span>
                <span className="mt-0.5 text-[11px] text-slate-500">
                  PNG, JPG, WEBP · Máx. 5 MB
                </span>
              </>
            )}
            <input
              ref={firmaRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              name="firma"
              className="sr-only"
              aria-label="Subir firma del responsable"
              onChange={e => preview(e.target.files?.[0], setFirmaPreview)}
            />
          </label>
        </div>
      </div>
    </form>
  );
}

function EmpresaField({
  empresas,
  defaultValue,
}: {
  empresas: ConfiguracionView["empresas"];
  defaultValue: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Empresa *</Label>
      <Select name="empresaId" defaultValue={String(defaultValue)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar empresa">
            {value =>
              empresas.find(e => String(e.id) === String(value))
                ?.razonSocial ?? String(value)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Seleccionar</SelectItem>
          {empresas.map(e => (
            <SelectItem key={e.id} value={String(e.id)}>
              {e.razonSocial}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EmpresaDialog({
  open,
  onOpenChange,
  initial,
  onGuardado,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ConfiguracionView["empresas"][number] | null;
  onGuardado: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl bg-emerald-700 px-4 py-3">
          <DialogTitle className="text-white font-bold">
            {initial ? "Editar empresa" : "Nueva empresa"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={fd =>
            start(async () => {
              const r = await guardarEmpresa(initialConfigState, fd);
              r.success
                ? (toast.success(r.message), onGuardado(), onOpenChange(false))
                : toast.error(r.message);
            })
          }
          className="space-y-4">
          <input type="hidden" name="id" value={initial?.id ?? ""} />
          <div className="space-y-2">
            <Label>RUC *</Label>
            <Input
              name="ruc"
              maxLength={11}
              defaultValue={initial?.ruc ?? ""}
              placeholder="20477222766"
            />
          </div>
          <div className="space-y-2">
            <Label>Razón social *</Label>
            <Input
              name="razonSocial"
              defaultValue={initial?.razonSocial ?? ""}
              placeholder="BIOALTERNATIVA E&F S.A.C."
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Guardar empresa"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PeriodoDialog({
  open,
  onOpenChange,
  initial,
  empresas,
  defaultEmpresaId,
  onGuardado,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ConfiguracionView["periodos"][number] | null;
  empresas: ConfiguracionView["empresas"];
  defaultEmpresaId?: string;
  onGuardado: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl bg-emerald-700 px-4 py-3">
          <DialogTitle className="text-white font-bold">
            {initial ? "Editar periodo" : "Nuevo periodo"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={fd =>
            start(async () => {
              const r = await guardarPeriodo(initialConfigState, fd);
              r.success
                ? (toast.success(r.message), onGuardado(), onOpenChange(false))
                : toast.error(r.message);
            })
          }
          className="space-y-4">
          <input type="hidden" name="id" value={initial?.id ?? ""} />
          <EmpresaField
            empresas={empresas}
            defaultValue={initial?.empresaId ?? defaultEmpresaId ?? ""}
          />
          <div className="space-y-1.5">
            <Label>Año *</Label>
            <Input
              name="anio"
              type="number"
              min={2000}
              max={2100}
              defaultValue={initial?.anio ?? new Date().getFullYear()}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Guardar periodo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EstablecimientoDialog({
  open,
  onOpenChange,
  initial,
  empresas,
  defaultEmpresaId,
  onGuardado,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ConfiguracionView["establecimientos"][number] | null;
  empresas: ConfiguracionView["empresas"];
  defaultEmpresaId?: string;
  onGuardado: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl bg-emerald-700 px-4 py-3">
          <DialogTitle className="text-white font-bold">
            {initial ? "Editar establecimiento" : "Nuevo establecimiento"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={fd =>
            start(async () => {
              const r = await guardarEstablecimiento(initialConfigState, fd);
              r.success
                ? (toast.success(r.message), onGuardado(), onOpenChange(false))
                : toast.error(r.message);
            })
          }
          className="space-y-4">
          <input type="hidden" name="id" value={initial?.id ?? ""} />
          <EmpresaField
            empresas={empresas}
            defaultValue={initial?.empresaId ?? defaultEmpresaId ?? ""}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input
                name="codigo"
                defaultValue={initial?.codigo ?? ""}
                placeholder="001"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                name="nombre"
                defaultValue={initial?.nombre ?? ""}
                placeholder="HUANCHACO - LAS LOMAS"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dirección</Label>
            <Input
              name="direccion"
              defaultValue={initial?.direccion ?? ""}
              placeholder="Dirección del establecimiento"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Guardar establecimiento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
