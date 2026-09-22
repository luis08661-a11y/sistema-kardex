"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, KeyRound } from "lucide-react";

import { crearPermisoAction, actualizarPermisoAction } from "@/actions/usuarios.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Permiso = {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  activo: boolean;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permiso?: Permiso | null;
}

function PermisoDialogInner({ open, onOpenChange, permiso }: Props) {
  const editando = permiso !== null && permiso !== undefined;
  const [guardando, setGuardando] = useState(false);

  const [state, formAction, isPending] = useActionState(
    editando
      ? (prev: { success: boolean; message: string }, formData: FormData) =>
          actualizarPermisoAction(permiso!.id, prev, formData)
      : crearPermisoAction,
    { success: false, message: "" },
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onOpenChange(false);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    setGuardando(isPending);
  }, [isPending]);

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {editando ? <Pencil className="size-4" /> : <KeyRound className="size-4" />}
          {editando ? "Editar permiso" : "Nuevo permiso"}
        </DialogTitle>
        <DialogDescription>
          {editando ? "Modifique los datos del permiso." : "Complete los datos para crear un permiso."}
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="grid gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Código *</Label>
          <Input
            name="codigo"
            defaultValue={permiso?.codigo}
            required
            minLength={3}
            maxLength={80}
            placeholder="Ej. USUARIOS.GESTIONAR"
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Nombre *</Label>
          <Input name="nombre" defaultValue={permiso?.nombre} required minLength={2} maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Módulo *</Label>
          <Input name="modulo" defaultValue={permiso?.modulo} required minLength={2} maxLength={80} placeholder="Ej. USUARIOS" />
        </div>
        {editando && (
          <input type="hidden" name="activo" value={String(permiso!.activo)} />
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : editando ? (
              "Guardar cambios"
            ) : (
              "Crear permiso"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function PermisoDialog({ open, onOpenChange, permiso }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <PermisoDialogInner open={open} onOpenChange={onOpenChange} permiso={permiso} />}
    </Dialog>
  );
}
