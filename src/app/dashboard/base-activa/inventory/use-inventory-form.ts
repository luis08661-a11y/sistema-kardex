"use client"

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  crearRegistroInventario,
  actualizarRegistroInventario,
  type InventoryState,
} from "@/actions/inventory.actions"
import type { ContextoForm, InitialData } from "./inventory-form-types"
import type { ProductoConLotes } from "./kardex-types"

const initialState: InventoryState = { success: false, message: "" }

const CAMPOS_EN_MAYUSCULAS = [
  "observacion",
  "responsable",
  "formulacion",
  "responsableFormulacion",
  "almacenamientoNombre",
] as const

const normalizarCamposMayusculas = (formData: FormData) => {
  for (const campo of CAMPOS_EN_MAYUSCULAS) {
    const valor = String(formData.get(campo) ?? "")
    formData.set(campo, valor ? valor.toUpperCase() : valor)
  }
}

const calcularPesoTotal = (
  unidades: number | "",
  pesoUnitario: number | "",
) =>
  typeof unidades === "number" && typeof pesoUnitario === "number"
    ? (unidades * pesoUnitario).toFixed(2)
    : "0.00"

const completarFormDataInventario = (
  formData: FormData,
  valores: {
    productoId: string
    loteId: string
    periodoId: string
    establecimientoId: string
    almacenamientoId: string
    tipoOperacionId: string
    tipoMovimiento: string
    pesoTotal: string
    unidades: number | ""
    pesoUnitario: number | ""
    movimientoId?: string
    isEditing: boolean
  },
) => {
  formData.set("productoId", valores.productoId)
  formData.set("loteId", valores.loteId)
  formData.set("periodoId", valores.periodoId)
  formData.set("establecimientoId", valores.establecimientoId)
  formData.set("almacenamientoId", valores.almacenamientoId)
  formData.set("tipoOperacionId", valores.tipoOperacionId)
  formData.set("tipoMovimiento", valores.tipoMovimiento)
  formData.set("pesoTotal", valores.pesoTotal)
  formData.set("unidades", String(valores.unidades ?? ""))
  formData.set("pesoUnitario", String(valores.pesoUnitario ?? ""))

  normalizarCamposMayusculas(formData)

  if (valores.isEditing && valores.movimientoId) {
    formData.set("movimientoId", valores.movimientoId)
  }
}

function useAvisoGuardado({
  state,
  isEditing,
  open,
  onOpenChange,
  onGuardado,
}: {
  state: InventoryState
  isEditing: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuardado?: () => void
}) {
  const router = useRouter()
  const successHandledRef = useRef(false)

  useEffect(() => {
    successHandledRef.current = false
  }, [open])

  useEffect(() => {
    if (successHandledRef.current) return

    if (state.success) {
      successHandledRef.current = true
      toast.success(isEditing ? "Registro actualizado" : "Registro creado")
      router.refresh()
      onOpenChange(false)
      onGuardado?.()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state, isEditing, onOpenChange, onGuardado, router])
}

export function useInventoryForm({
  movimientoId,
  productos,
  contexto,
  initialData,
  onOpenChange,
  onGuardado,
  open,
}: {
  movimientoId?: string
  productos: ProductoConLotes[]
  contexto?: ContextoForm
  initialData?: InitialData
  onOpenChange: (open: boolean) => void
  onGuardado?: () => void
  open: boolean
}) {
  const isEditing = Boolean(movimientoId)

  const action = isEditing
    ? actualizarRegistroInventario
    : crearRegistroInventario

  const [state, formAction, pending] = useActionState(action, initialState)

  const [productoId, setProductoId] = useState(initialData?.productoId ?? "")
  const [loteId, setLoteId] = useState(initialData?.loteId ?? "")
  const [periodoId, setPeriodoId] = useState(
    initialData?.periodoId ?? contexto?.periodos[0]?.id ?? "",
  )
  const [establecimientoId, setEstablecimientoId] = useState(
    initialData?.establecimientoId ?? contexto?.establecimientos[0]?.id ?? "",
  )
  const [almacenamientoId, setAlmacenamientoId] = useState(
    initialData?.almacenamientoId ?? "",
  )
  const [tipoOperacionId, setTipoOperacionId] = useState(
    initialData?.tipoOperacionId ?? "",
  )
  const [tipoMovimiento, setTipoMovimiento] = useState(
    initialData?.tipoMovimiento ?? "ENTRADA",
  )
  const [unidades, setUnidades] = useState<number | "">(
    initialData?.unidades ? Number(initialData.unidades) : "",
  )
  const [pesoUnitario, setPesoUnitario] = useState<number | "">(
    initialData?.pesoUnitario ? Number(initialData.pesoUnitario) : "",
  )

  useAvisoGuardado({ state, isEditing, open, onOpenChange, onGuardado })

  const hoyInput = useMemo(() => {
    const d = new Date()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${d.getFullYear()}-${m}-${day}`
  }, [])

  const productoSeleccionado = productos.find((p) => p.id === productoId)
  const lotesDelProducto = useMemo(
    () => productoSeleccionado?.lotesBase ?? [],
    [productoSeleccionado],
  )
  const abrevCodigo = productoSeleccionado?.codigo ?? ""
  const operacionSeleccionada = contexto?.operaciones.find(
    (op) => op.id === tipoOperacionId,
  )
  const esInventarioInicial = operacionSeleccionada?.codigo === "INVENTARIO_INICIAL"

  const pesoTotal = calcularPesoTotal(unidades, pesoUnitario)

  const cambiarProducto = (v: string) => {
    setProductoId(v)
    const lotes = productos.find((p) => p.id === v)?.lotesBase ?? []
    setLoteId(lotes.length > 0 ? lotes[0].id : "")
  }

  const cambiarOperacion = (v: string) => {
    setTipoOperacionId(v)
    const nuevaOp = contexto?.operaciones.find((op) => op.id === v)
    if (nuevaOp?.codigo === "INVENTARIO_INICIAL") {
      setTipoMovimiento("ENTRADA")
    }
  }

  const handleSubmit = (formData: FormData) => {
    completarFormDataInventario(formData, {
      productoId,
      loteId,
      periodoId,
      establecimientoId,
      almacenamientoId,
      tipoOperacionId,
      tipoMovimiento: esInventarioInicial ? "ENTRADA" : tipoMovimiento,
      pesoTotal,
      unidades,
      pesoUnitario,
      movimientoId,
      isEditing,
    })

    formAction(formData)
  }

  return {
    isEditing,
    pending,
    handleSubmit,
    productoId,
    cambiarProducto,
    loteId,
    setLoteId,
    lotesDelProducto,
    abrevCodigo,
    periodoId,
    setPeriodoId,
    almacenamientoId,
    setAlmacenamientoId,
    establecimientoId,
    setEstablecimientoId,
    tipoOperacionId,
    cambiarOperacion,
    tipoMovimiento,
    setTipoMovimiento,
    esInventarioInicial,
    unidades,
    setUnidades,
    pesoUnitario,
    setPesoUnitario,
    pesoTotal,
    hoyInput,
  }
}
