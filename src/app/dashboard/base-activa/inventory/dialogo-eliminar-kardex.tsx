"use client"

import { Loader2, PackageSearch } from "lucide-react"
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

import type { KardexRowType } from "./kardex-types"

type Props = {
  eliminando: KardexRowType | null
  isDeleting: boolean
  onCancelar: () => void
  onConfirmar: () => void
}

export function DialogoEliminarKardex({
  eliminando,
  isDeleting,
  onCancelar,
  onConfirmar,
}: Props) {
  return (
    <AlertDialog open={Boolean(eliminando)} onOpenChange={(open) => !open && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-orange-500" />
            ¿Eliminar este registro?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará el movimiento del{" "}
            <strong className="text-foreground">{eliminando?.fecha}</strong> para
            el lote <strong className="text-foreground">{eliminando?.codigo}</strong>{" "}
            y se recalculará el Saldo Final de todo el lote (método PEPS). Esta
            acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirmar}
            disabled={isDeleting}
            className="gap-1.5">
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
