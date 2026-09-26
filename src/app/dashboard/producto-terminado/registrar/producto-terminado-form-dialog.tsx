"use client"

import { ClipboardList, Loader2, Save, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { ProductoPT } from "./producto-terminado-types"
import type { ProductoTerminadoForm } from "./use-producto-terminado-form"
import {
  SeccionDestinoComprobante,
  SeccionDocumentoResponsable,
  SeccionOperacionCantidad,
  SeccionProductoTerminado,
} from "./producto-terminado-form-secciones"

type Props = {
  form: ProductoTerminadoForm
  productos: ProductoPT[]
}

export function ProductoTerminadoFormDialog({ form, productos }: Props) {
  const {
    editando,
    modalOpen,
    setModalOpen,
    setEditando,
    tipo,
    isPending,
    message,
    hoyStr,
    submit,
  } = form

  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(open) => {
        setModalOpen(open)
        if (!open) setEditando(null)
      }}>
      <DialogContent
        key="pt-modal"
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-200! flex-col gap-0 overflow-hidden rounded-xl border-none bg-card p-0 shadow-2xl">
        <DialogHeader className="shrink-0 flex-row items-center justify-between gap-3 space-y-1 border-b px-3 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-primary-foreground sm:text-base">
                {editando ? "Editar movimiento" : "Registrar movimiento"}
              </DialogTitle>
              <p className="mt-0.5 text-[11px] text-primary-foreground/75">
                Kardex de producto terminado · Método PEPS
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge
              className={`shrink-0 border rounded-lg px-6 py-3 text-sm font-semibold ${
                tipo === "SALIDA"
                  ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-red-400 dark:hover:bg-rose-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-950"
              }`}>
              {tipo === "SALIDA" ? "Salida" : "Entrada"}
            </Badge>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400"
                />
              }>
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </div>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault()
            submit(e.currentTarget)
          }}>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-card p-5 text-xs text-foreground sm:p-5">
            <SeccionProductoTerminado form={form} productos={productos} />
            <SeccionDocumentoResponsable hoyStr={hoyStr} editando={editando} />
            <SeccionOperacionCantidad form={form} />
            <SeccionDestinoComprobante form={form} />
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-card px-4 py-3 sm:px-6 dark:border-slate-800">
            <span className="text-xs text-destructive">{message}</span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditando(null)
                  setModalOpen(false)
                }}
                disabled={isPending}
                className="h-10 px-5">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 bg-emerald-600 px-5 font-semibold hover:bg-emerald-700 shadow-sm">
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isPending
                  ? "Guardando..."
                  : editando
                    ? "Actualizar"
                    : tipo === "SALIDA"
                      ? "Registrar Salida"
                      : "Registrar Ingreso"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
