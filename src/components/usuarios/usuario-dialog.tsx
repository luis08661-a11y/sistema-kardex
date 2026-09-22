"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, UserPlus } from "lucide-react";

import { crearUsuarioAction, actualizarUsuarioAction } from "@/actions/usuarios.actions";
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

type Usuario = {
  id: string;
  username: string;
  email: string;
  name: string;
  status: boolean;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario | null;
}

function UsuarioDialogInner({ open, onOpenChange, usuario }: Props) {
  const editando = usuario !== null && usuario !== undefined;
  const [guardando, setGuardando] = useState(false);

  const [state, formAction, isPending] = useActionState(
    editando
      ? (prev: { success: boolean; message: string }, formData: FormData) =>
          actualizarUsuarioAction(usuario!.id, prev, formData)
      : crearUsuarioAction,
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
          {editando ? <Pencil className="size-4" /> : <UserPlus className="size-4" />}
          {editando ? "Editar usuario" : "Nuevo usuario"}
        </DialogTitle>
        <DialogDescription>
          {editando ? "Modifique los datos del usuario." : "Complete los datos para crear un usuario."}
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="grid gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Nombre de usuario *</Label>
          <Input name="username" defaultValue={usuario?.username} required minLength={3} maxLength={50} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Nombre completo *</Label>
          <Input name="name" defaultValue={usuario?.name} required minLength={2} maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Correo electrónico *</Label>
          <Input name="email" type="email" defaultValue={usuario?.email} required maxLength={150} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Contraseña {editando ? "(dejar vacío para mantener)" : "*"}
          </Label>
          <Input
            name="password"
            type="password"
            minLength={8}
            maxLength={100}
            placeholder={editando ? "••••••••" : ""}
            required={!editando}
          />
        </div>
        <input type="hidden" name="status" value={editando ? String(usuario!.status) : "true"} />

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
              "Crear usuario"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function UsuarioDialog({ open, onOpenChange, usuario }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <UsuarioDialogInner open={open} onOpenChange={onOpenChange} usuario={usuario} />}
    </Dialog>
  );
}
