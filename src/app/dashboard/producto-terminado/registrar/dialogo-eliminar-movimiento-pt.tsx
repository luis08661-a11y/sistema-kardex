"use client"

import { useMemo } from "react"
import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { MovimientoPT } from "./producto-terminado-types"

type Props = {
  eliminando: MovimientoPT | null
  isDeleting: boolean
  onCancelar: () => void
  onConfirmar: () => void
}

export function DialogoEliminarMovimientoPT({
  eliminando,
  isDeleting,
  onCancelar,
  onConfirmar,
}: Props) {
  const fecha = useMemo(
    () =>
      eliminando
        ? new Date(eliminando.fecha).toLocaleDateString("es-PE", {
            timeZone: "UTC",
          })
        : "",
    [eliminando],
  )

  return (
    <AlertDialog
      open={Boolean(eliminando)}
      onOpenChange={(open) => !open && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Eliminar movimiento
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará el movimiento del{" "}
            <strong className="text-foreground">{fecha}</strong> para el
            producto{" "}
            <strong className="text-foreground">
              {eliminando?.producto?.descripcion ?? ""}
            </strong>
            . Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirmar}>
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
