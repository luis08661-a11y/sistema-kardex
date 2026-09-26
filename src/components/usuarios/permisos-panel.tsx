"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, X, ShieldCheck, ChevronDown, ChevronRight } from "lucide-react";

import { asignarPermisosRolAction } from "@/actions/usuarios.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type Permiso = { id: string; codigo: string; nombre: string; modulo: string };
type Rol = {
  id: string;
  name: string;
  permissions: { permission: { id: string } }[];
};

interface Props {
  rol: Rol;
  permisos: Permiso[];
  onCerrar: () => void;
  onGuardado: () => void;
}

export function PermisosPanel({ rol, permisos, onCerrar, onGuardado }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [guardando, setGuardando] = useState(false);
  const [modulosAbiertos, setModulosAbiertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set(rol.permissions.map((p) => p.permission.id)));
    const mods = new Set(permisos.map((p) => p.modulo));
    setModulosAbiertos(mods);
  }, [rol, permisos]);

  const permisosPorModulo = useMemo(() => {
    return permisos.reduce(
      (acc, p) => {
        (acc[p.modulo] ??= []).push(p);
        return acc;
      },
      {} as Record<string, Permiso[]>,
    );
  }, [permisos]);

  const toggleModulo = (modulo: string) => {
    setModulosAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(modulo)) next.delete(modulo);
      else next.add(modulo);
      return next;
    });
  };

  const togglePermiso = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodosModulo = (modulo: string) => {
    const permisosModulo = permisosPorModulo[modulo] ?? [];
    const allSelected = permisosModulo.every((p) => selected.has(p.id));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of permisosModulo) {
        if (allSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  };

  const toggleTodos = () => {
    const allSelected = permisos.every((p) => selected.has(p.id));
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(permisos.map((p) => p.id)));
    }
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await asignarPermisosRolAction(rol.id, Array.from(selected));
      if (res.success) {
        toast.success(res.message);
        onGuardado();
      } else {
        toast.error(res.message);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
            <ShieldCheck className="size-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Permisos de: {rol.name}</h3>
            <p className="text-xs text-muted-foreground">
              {selected.size} de {permisos.length} permisos seleccionados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Cerrar" className="size-8" onClick={onCerrar}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
        {/* Select All */}
        <button
          onClick={toggleTodos}
          className="flex w-full items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
        >
          <Checkbox checked={permisos.every((p) => selected.has(p.id))} />
          <span className="text-sm font-semibold">Seleccionar todos</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {selected.size}/{permisos.length}
          </Badge>
        </button>

        <Separator />

        {/* Módulos */}
        {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => {
          const aberto = modulosAbiertos.has(modulo);
          const todosSeleccionados = permisosModulo.every((p) => selected.has(p.id));
          const algunosSeleccionados = permisosModulo.some((p) => selected.has(p.id));
          const count = permisosModulo.filter((p) => selected.has(p.id)).length;

          return (
            <div key={modulo} className="rounded-lg border overflow-hidden">
              {/* Header del módulo */}
              <div className="flex items-center gap-3 bg-muted/30 px-3 py-2.5">
                <button
                  onClick={() => toggleModulo(modulo)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {aberto ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold">{modulo}</span>
                  <Badge
                    variant={todosSeleccionados ? "default" : algunosSeleccionados ? "secondary" : "outline"}
                    className={`text-xs ${todosSeleccionados ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : ""}`}
                  >
                    {count}/{permisosModulo.length}
                  </Badge>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleTodosModulo(modulo); }}
                  className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                >
                  {todosSeleccionados ? "Quitar todos" : "Seleccionar todos"}
                </button>
              </div>

              {/* Permisos del módulo */}
              {aberto && (
                <div className="divide-y">
                  {permisosModulo.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => togglePermiso(p.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-mono text-muted-foreground">{p.codigo}</span>
                        <span className="mx-2 text-muted-foreground">·</span>
                        <span className="text-sm">{p.nombre}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <Button variant="outline" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button onClick={() => void guardar()} disabled={guardando} className="gap-1.5">
          {guardando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar permisos"
          )}
        </Button>
      </div>
    </div>
  );
}
