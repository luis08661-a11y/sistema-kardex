"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

import { asignarRolesUsuarioAction } from "@/actions/usuarios.actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Rol = { id: string; name: string };
type Usuario = {
  id: string;
  username: string;
  name: string;
  roles: { role: { id: string; name: string } }[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  roles: Rol[];
}

export function AsignarRolesDialog({ open, onOpenChange, usuario, roles }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setSelected(usuario.roles.map((r) => r.role.id));
    }
  }, [usuario]);

  const toggle = (roleId: string) => {
    setSelected((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const guardar = async () => {
    if (!usuario) return;
    setGuardando(true);
    try {
      const res = await asignarRolesUsuarioAction(usuario.id, selected);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Asignar roles
          </DialogTitle>
          <DialogDescription>
            Seleccione los roles para <strong>{usuario?.name}</strong> ({usuario?.username})
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 max-h-80 overflow-y-auto">
          {roles.map((rol) => (
            <label
              key={rol.id}
              className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={selected.includes(rol.id)}
                onCheckedChange={() => toggle(rol.id)}
              />
              <span className="text-sm font-medium">{rol.name}</span>
            </label>
          ))}
          {roles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay roles disponibles</p>
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
              "Guardar roles"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
