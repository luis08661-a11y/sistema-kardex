"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Users, Shield, KeyRound, Plus, Search, Pencil, Power,
  Trash2, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft,
  ChevronsRight, User, CircleCheck, Loader2,
} from "lucide-react";
import {
  columnVisibilityFeature, createColumnHelper, createPaginatedRowModel,
  FlexRender, rowPaginationFeature, tableFeatures, useTable,
} from "@tanstack/react-table";

import {
  cambiarEstadoUsuarioAction, eliminarUsuarioAction,
  eliminarRolAction, eliminarPermisoAction, cambiarEstadoPermisoAction,
} from "@/actions/usuarios.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UsuarioDialog } from "@/components/usuarios/usuario-dialog";
import { RolDialog } from "@/components/usuarios/rol-dialog";
import { PermisoDialog } from "@/components/usuarios/permiso-dialog";
import { AsignarRolesDialog } from "@/components/usuarios/asignar-roles-dialog";
import { PermisosPanel } from "@/components/usuarios/permisos-panel";

type UsuarioRow = {
  id: string; username: string; email: string; name: string;
  status: boolean; createdAt: Date;
  roles: { role: { id: string; name: string } }[];
};
type RolRow = {
  id: string; name: string; description: string | null;
  users: { userId: string }[];
  permissions: { permission: { id: string } }[];
};
type PermisoRow = {
  id: string; codigo: string; nombre: string; modulo: string; activo: boolean;
};

type Estadisticas = {
  totalUsuarios: number; usuariosActivos: number;
  totalRoles: number; totalPermisos: number;
};
type Props = {
  usuarios: UsuarioRow[]; roles: RolRow[]; permisos: PermisoRow[];
  estadisticas: Estadisticas;
};

const features = tableFeatures({ rowPaginationFeature, columnVisibilityFeature });

export function UsuariosModule({ usuarios, roles, permisos, estadisticas }: Props) {
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos");
  const [busquedaRoles, setBusquedaRoles] = useState("");
  const [busquedaPermisos, setBusquedaPermisos] = useState("");
  const [tab, setTab] = useState("usuarios");

  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioRow | null>(null);
  const [rolDialogOpen, setRolDialogOpen] = useState(false);
  const [rolEditando, setRolEditando] = useState<RolRow | null>(null);
  const [permisoDialogOpen, setPermisoDialogOpen] = useState(false);
  const [permisoEditando, setPermisoEditando] = useState<PermisoRow | null>(null);
  const [asignarRolesOpen, setAsignarRolesOpen] = useState(false);
  const [usuarioParaRoles, setUsuarioParaRoles] = useState<UsuarioRow | null>(null);
  const [rolParaPermisos, setRolParaPermisos] = useState<RolRow | null>(null);

  const [confirmarEliminar, setConfirmarEliminar] = useState<{
    tipo: "usuario" | "rol" | "permiso"; id: string; nombre: string;
  } | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const usuariosFiltrados = useMemo(() => {
    let r = usuarios;
    if (filtroEstado === "activos") r = r.filter((u) => u.status);
    if (filtroEstado === "inactivos") r = r.filter((u) => !u.status);
    if (busquedaUsuarios) {
      const q = busquedaUsuarios.toLowerCase();
      r = r.filter((u) => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return r;
  }, [usuarios, filtroEstado, busquedaUsuarios]);

  const columnHelper = useMemo(() => createColumnHelper<typeof features, UsuarioRow>(), []);
  const columns = useMemo(() => columnHelper.columns([
    columnHelper.accessor("username", {
      header: "Usuario",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("name", { header: "Nombre" }),
    columnHelper.accessor("email", { header: "Correo" }),
    columnHelper.accessor("roles", {
      header: "Roles",
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().length > 0 ? info.getValue().map((r) => (
            <Badge key={r.role.id} variant="secondary" className="text-xs">{r.role.name}</Badge>
          )) : <span className="text-xs text-muted-foreground">Sin roles</span>}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Estado",
      cell: (info) => (
        <Badge variant={info.getValue() ? "default" : "secondary"}
          className={info.getValue() ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : ""}>
          <span className={`mr-1 size-1.5 rounded-full ${info.getValue() ? "bg-emerald-400" : "bg-muted-foreground"}`} />
          {info.getValue() ? "Activo" : "Inactivo"}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: "acciones",
      header: () => <span className="text-right">Acciones</span>,
      cell: (info) => {
        const u = info.row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="size-8" title="Editar"
              onClick={() => { setUsuarioEditando(u); setUsuarioDialogOpen(true); }}>
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" title="Asignar roles"
              onClick={() => { setUsuarioParaRoles(u); setAsignarRolesOpen(true); }}>
              <ShieldCheck className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon"
              className={`size-8 ${u.status ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700" : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
              title={u.status ? "Desactivar" : "Activar"}
              onClick={async () => { const res = await cambiarEstadoUsuarioAction(u.id, !u.status); if (res.success) toast.success(res.message); else toast.error(res.message); }}>
              <Power className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon"
              className="size-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              title="Eliminar"
              onClick={() => setConfirmarEliminar({ tipo: "usuario", id: u.id, nombre: u.username })}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        );
      },
    }),
  ]), [columnHelper]);

  const table = useTable({
    features,
    columns,
    data: usuariosFiltrados,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") { const p = updater({ pageIndex, pageSize }); setPageIndex(p.pageIndex); setPageSize(p.pageSize); }
      else { setPageIndex(updater.pageIndex); setPageSize(updater.pageSize); }
    },
    pageCount: Math.ceil(usuariosFiltrados.length / pageSize),
    getRowId: (row) => row.id,
  });

  const rolesFiltrados = useMemo(() => {
    if (!busquedaRoles) return roles;
    const q = busquedaRoles.toLowerCase();
    return roles.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q));
  }, [roles, busquedaRoles]);

  const permisosFiltrados = useMemo(() => {
    if (!busquedaPermisos) return permisos;
    const q = busquedaPermisos.toLowerCase();
    return permisos.filter((p) => p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q) || p.modulo.toLowerCase().includes(q));
  }, [permisos, busquedaPermisos]);

  const permisosPorModulo = useMemo(() =>
    permisosFiltrados.reduce((acc, p) => { (acc[p.modulo] ??= []).push(p); return acc; }, {} as Record<string, PermisoRow[]>),
  [permisosFiltrados]);


  const confirmarAccionEliminar = async () => {
    if (!confirmarEliminar) return;
    setEliminando(true);
    try {
      let res;
      if (confirmarEliminar.tipo === "usuario") res = await eliminarUsuarioAction(confirmarEliminar.id);
      else if (confirmarEliminar.tipo === "rol") res = await eliminarRolAction(confirmarEliminar.id);
      else res = await eliminarPermisoAction(confirmarEliminar.id);
      if (res.success) { toast.success(res.message); setConfirmarEliminar(null); }
      else toast.error(res.message);
    } finally { setEliminando(false); }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 sm:p-6">
      {/* HERO */}
      <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0f172a] p-4 text-white shadow-lg shadow-emerald-500/10 shrink-0">
        <div className="absolute -right-8 -top-2 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Usuarios, Roles y Permisos</h1>
              <p className="text-[14px] text-slate-400">Administración de acceso y trazabilidad del sistema</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5"><User className="size-3.5 text-emerald-400" /><span className="text-slate-400">Usuarios:</span><span className="font-semibold">{estadisticas.totalUsuarios}</span></div>
            <div className="flex items-center gap-1.5"><CircleCheck className="size-3.5 text-emerald-400" /><span className="text-slate-400">Activos:</span><span className="font-semibold">{estadisticas.usuariosActivos}</span></div>
            <div className="flex items-center gap-1.5"><Shield className="size-3.5 text-emerald-400" /><span className="text-slate-400">Roles:</span><span className="font-semibold">{estadisticas.totalRoles}</span></div>
            <div className="flex items-center gap-1.5"><KeyRound className="size-3.5 text-emerald-400" /><span className="text-slate-400">Permisos:</span><span className="font-semibold">{estadisticas.totalPermisos}</span></div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex gap-1 border-b shrink-0">
          {[
            { key: "usuarios", label: "Usuarios", icon: <User className="h-3.5 w-3.5" /> },
            { key: "roles", label: "Roles", icon: <Shield className="h-3.5 w-3.5" /> },
            { key: "permisos", label: "Permisos", icon: <KeyRound className="h-3.5 w-3.5" /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-emerald-600 font-semibold text-emerald-600"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB USUARIOS */}
        {tab === "usuarios" && (
          <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar por usuario, nombre o correo..." value={busquedaUsuarios} onChange={(e) => setBusquedaUsuarios(e.target.value)} className="pl-8" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
                    {(["todos", "activos", "inactivos"] as const).map((f) => (
                      <button key={f} onClick={() => setFiltroEstado(f)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          filtroEstado === f
                            ? f === "activos" ? "bg-emerald-600 text-white"
                              : f === "inactivos" ? "bg-rose-600 text-white"
                              : "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}>
                        {f === "todos" ? "Todos" : f === "activos" ? "Activos" : "Inactivos"}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                    onClick={() => { setUsuarioEditando(null); setUsuarioDialogOpen(true); }}>
                    <Plus className="size-4" /> Nuevo
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-emerald-600">
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id} className="border-emerald-500/30">
                        {hg.headers.map((h) => (
                          <TableHead key={h.id} className="text-[11px] font-semibold uppercase tracking-wide text-white">
                            {h.isPlaceholder ? null : <FlexRender header={h} />}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No se encontraron usuarios</TableCell></TableRow>
                    ) : table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="h-9">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-1.5"><FlexRender cell={cell} /></TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Página {pageIndex + 1} de {Math.max(1, Math.ceil(usuariosFiltrados.length / pageSize))}</span>
                  <span>{usuariosFiltrados.length} registro(s)</span>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="icon" className="size-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="size-4" /></Button>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="size-4" /></Button>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="size-4" /></Button>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="size-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* TAB ROLES */}
        {tab === "roles" && (
          <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar rol..." value={busquedaRoles} onChange={(e) => setBusquedaRoles(e.target.value)} className="pl-8" />
                </div>
                <Button size="sm" className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                  onClick={() => { setRolEditando(null); setRolDialogOpen(true); }}>
                  <Plus className="size-4" /> Nuevo rol
                </Button>
              </div>
              <Separator />
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-emerald-600">
                    <TableRow className="border-emerald-500/30">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">Rol</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white">Descripción</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white text-center"># Usuarios</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white text-center"># Permisos</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-white text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolesFiltrados.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No se encontraron roles</TableCell></TableRow>
                    ) : rolesFiltrados.map((r) => (
                      <TableRow key={r.id} className="h-9">
                        <TableCell className="py-1.5 font-medium">{r.name}</TableCell>
                        <TableCell className="py-1.5 text-muted-foreground">{r.description ?? "—"}</TableCell>
                        <TableCell className="py-1.5 text-center"><Badge variant="outline">{r.users.length}</Badge></TableCell>
                        <TableCell className="py-1.5 text-center"><Badge variant="outline">{r.permissions.length}</Badge></TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" title="Editar"
                              onClick={() => { setRolEditando(r); setRolDialogOpen(true); }}><Pencil className="size-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="size-8" title="Asignar permisos"
                              onClick={() => { setRolParaPermisos(r); }}><KeyRound className="size-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="size-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              title="Eliminar" onClick={() => setConfirmarEliminar({ tipo: "rol", id: r.id, nombre: r.name })}><Trash2 className="size-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {rolParaPermisos && (
            <PermisosPanel
              rol={rolParaPermisos}
              permisos={permisos}
              onCerrar={() => setRolParaPermisos(null)}
              onGuardado={() => setRolParaPermisos(null)}
            />
          )}
        </div>
        )}

        {/* TAB PERMISOS */}
        {tab === "permisos" && (
          <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar permiso..." value={busquedaPermisos} onChange={(e) => setBusquedaPermisos(e.target.value)} className="pl-8" />
            </div>
            <Button size="sm" className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => { setPermisoEditando(null); setPermisoDialogOpen(true); }}>
              <Plus className="size-4" /> Nuevo permiso
            </Button>
          </div>

          {Object.entries(permisosPorModulo).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <KeyRound className="size-10 mb-3 opacity-40" />
              <p className="text-sm">No se encontraron permisos</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => {
                const activos = permisosModulo.filter((p) => p.activo).length;
                return (
                  <div key={modulo} className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10">
                          <Shield className="size-3.5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold">{modulo}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {activos}/{permisosModulo.length}
                      </Badge>
                    </div>
                    <div className="divide-y">
                      {permisosModulo.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-muted-foreground truncate">{p.codigo}</p>
                            <p className="text-xs text-muted-foreground/70 truncate">{p.nombre}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="size-7" title="Editar"
                              onClick={() => { setPermisoEditando(p); setPermisoDialogOpen(true); }}>
                              <Pencil className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              className={`size-7 ${p.activo ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700" : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
                              title={p.activo ? "Desactivar" : "Activar"}
                              onClick={async () => { const res = await cambiarEstadoPermisoAction(p.id, !p.activo); if (res.success) toast.success(res.message); else toast.error(res.message); }}>
                              <Power className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              title="Eliminar" onClick={() => setConfirmarEliminar({ tipo: "permiso", id: p.id, nombre: p.codigo })}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                          <Badge
                            variant={p.activo ? "default" : "secondary"}
                            className={`shrink-0 text-[10px] ${p.activo ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : ""}`}
                          >
                            {p.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )}
      </div>

      <UsuarioDialog open={usuarioDialogOpen} onOpenChange={(o) => { setUsuarioDialogOpen(o); if (!o) setUsuarioEditando(null); }} usuario={usuarioEditando} />
      <RolDialog open={rolDialogOpen} onOpenChange={(o) => { setRolDialogOpen(o); if (!o) setRolEditando(null); }} rol={rolEditando} />
      <PermisoDialog open={permisoDialogOpen} onOpenChange={(o) => { setPermisoDialogOpen(o); if (!o) setPermisoEditando(null); }} permiso={permisoEditando} />
      <AsignarRolesDialog open={asignarRolesOpen} onOpenChange={(o) => { setAsignarRolesOpen(o); if (!o) setUsuarioParaRoles(null); }}
        usuario={usuarioParaRoles} roles={roles.map((r) => ({ id: r.id, name: r.name }))} />

      <AlertDialog open={!!confirmarEliminar} onOpenChange={(o) => !o && setConfirmarEliminar(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {confirmarEliminar?.tipo}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{confirmarEliminar?.nombre}</strong> permanentemente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmarAccionEliminar()} disabled={eliminando}>
              {eliminando ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
