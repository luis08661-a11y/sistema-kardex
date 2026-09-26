"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

import { asignarPermisosRolAction } from "@/actions/usuarios.actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Permiso = { id: string; codigo: string; nombre: string; modulo: string };
type Rol = {
  id: string;
  name: string;
  permissions: { permission: { id: string } }[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: Rol | null;
  permisos: Permiso[];
}

export function AsignarPermisosDialog({ open, onOpenChange, rol, permisos }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (rol) {
      setSelected(rol.permissions.map((p) => p.permission.id));
    }
  }, [rol]);

  const toggle = (permId: string) => {
    setSelected((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId],
    );
  };

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const guardar = async () => {
    if (!rol) return;
    setGuardando(true);
    try {
      const res = await asignarPermisosRolAction(rol.id, selected);
      if (res.success) {
        toast.success(res.message);
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } finally {
      setGuardando(false);
    }
  };

  const permisosPorModulo = permisos.reduce(
    (acc, p) => {
      (acc[p.modulo] ??= []).push(p);
      return acc;
    },
    {} as Record<string, Permiso[]>,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Asignar permisos
          </DialogTitle>
          <DialogDescription>
            Seleccione los permisos para el rol <strong>{rol?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
            <div key={modulo} className="space-y-2">
              <Badge variant="secondary" className="text-xs">
                {modulo}
              </Badge>
              <div className="grid gap-1 pl-2">
                {permisosModulo.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedSet.has(perm.id)}
                      onCheckedChange={() => toggle(perm.id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{perm.codigo}</span>
                      <span className="text-xs text-muted-foreground">{perm.nombre}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {permisos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay permisos disponibles</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={() => void guardar()} disabled={guardando}>
            {guardando ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar permisos"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
