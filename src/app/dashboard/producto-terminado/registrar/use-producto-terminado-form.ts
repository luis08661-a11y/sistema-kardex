"use client"

import { useCallback, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  registrarMovimientoPT,
  obtenerStockPT,
  eliminarMovimientoPT,
  actualizarMovimientoPT,
} from "@/actions/producto-terminado.actions"

import type {
  MovimientoPT,
  ProductoTerminadoData,
  StockInfoPT,
  TipoMovimientoPT,
  TipoMovimientoRegistro,
} from "./producto-terminado-types"

const FECHA_SIN_HORA = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`

export function useProductoTerminadoForm(data: ProductoTerminadoData) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [editando, setEditando] = useState<MovimientoPT | null>(null)
  const [eliminando, setEliminando] = useState<MovimientoPT | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [tipo, setTipo] = useState<TipoMovimientoRegistro>("ENTRADA")
  const [productoId, setProductoId] = useState("")
  const [presentacionId, setPresentacionId] = useState("")
  const periodoIdRef = useRef("")
  const establecimientoIdRef = useRef("")
  const tipoOperacionIdRef = useRef("")
  const [motivo, setMotivo] = useState("seleccionar")
  const [stockInfo, setStockInfo] = useState<StockInfoPT | null>(null)
  const [message, setMessage] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [costoUnitario, setCostoUnitario] = useState("0")
  const [ingCampo, setIngCampo] = useState("seleccionar")

  const hoyStr = useMemo(() => FECHA_SIN_HORA(new Date()), [])

  function resolverTipoOperacionId(tipoMovimiento: TipoMovimientoPT) {
    const codigoPreferido = tipoMovimiento === "SALIDA" ? "SALIDA" : "INGRESO"
    const operacionPreferida = data.operaciones.find(
      (operacion) => operacion.codigo === codigoPreferido,
    )
    if (operacionPreferida) return operacionPreferida.id

    return (
      data.operaciones.find((operacion) => {
        const esSalida = /salida/i.test(
          `${operacion.codigo ?? ""} ${operacion.nombre ?? ""}`,
        )
        return tipoMovimiento === "SALIDA" ? esSalida : !esSalida
      })?.id ?? ""
    )
  }

  const handleProductoChange = useCallback(
    async (id: string | null) => {
      const idv = id ?? ""
      const presentacion = data.presentaciones.find(
        (p) => String(p.productoId) === idv,
      )
      const presId = presentacion?.id ?? ""
      setProductoId(idv)
      setPresentacionId(presId)
      setStockInfo(null)
      if (idv) {
        const result = await obtenerStockPT(idv, presId || null)
        if (result.ok) {
          setStockInfo({
            stock: result.stock,
            costoValorizado: result.costoValorizado,
          })
        }
      } else {
        setStockInfo(null)
      }
    },
    [data.presentaciones],
  )

  function openModal(row?: MovimientoPT) {
    if (row) {
      setEditando(row)
      setTipo(row.tipoMovimiento)
      setProductoId(row.productoId)
      setPresentacionId(row.presentacionId ?? "")
      periodoIdRef.current = row.periodoId
      establecimientoIdRef.current = row.establecimientoId
      tipoOperacionIdRef.current = row.tipoOperacionId ?? ""
      setMotivo(row.motivo ?? "seleccionar")
      setMessage("")
      setStockInfo(null)
      obtenerStockPT(row.productoId, row.presentacionId ?? null).then(
        (result) => {
          if (result.ok) {
            setStockInfo({
              stock: result.stock,
              costoValorizado: result.costoValorizado,
            })
          }
        },
      )
      setCantidad(
        String(
          row.tipoMovimiento === "ENTRADA" ? row.entradaCan : row.salidaCan,
        ),
      )
      setCostoUnitario(
        String(
          row.tipoMovimiento === "ENTRADA" ? row.entradaCostoUnitario : "0",
        ),
      )
      setIngCampo(row.ingCampo ?? "seleccionar")
    } else {
      setEditando(null)
      setTipo("ENTRADA")
      setProductoId("")
      setPresentacionId("")
      periodoIdRef.current = ""
      establecimientoIdRef.current = ""
      tipoOperacionIdRef.current = resolverTipoOperacionId("ENTRADA")
      setMotivo("seleccionar")
      setStockInfo(null)
      setMessage("")
      setCantidad("")
      setCostoUnitario("0")
      setIngCampo("seleccionar")
      periodoIdRef.current = data.periodos[0]?.id ?? ""
      establecimientoIdRef.current = data.establecimientos[0]?.id ?? ""
    }
    setModalOpen(true)
  }

  function submit(form: HTMLFormElement) {
    setMessage("")
    const fd = new FormData(form)
    fd.set("productoId", productoId)
    fd.set("presentacionId", presentacionId || "")
    fd.set("periodoId", periodoIdRef.current)
    fd.set("establecimientoId", establecimientoIdRef.current)
    fd.set("tipoOperacionId", tipoOperacionIdRef.current || "")
    fd.set("tipoMovimiento", tipo)
    fd.set("cantidad", cantidad)
    fd.set("costoUnitario", costoUnitario)
    if (ingCampo === "seleccionar") {
      fd.delete("ingCampo")
    } else {
      fd.set("ingCampo", ingCampo)
    }
    if (tipo === "SALIDA" && motivo && motivo !== "seleccionar") {
      fd.set("motivo", motivo)
    } else {
      fd.delete("motivo")
    }
    startTransition(async () => {
      const result = editando
        ? await actualizarMovimientoPT(editando.id, fd)
        : await registrarMovimientoPT(fd)
      setMessage(result.message)
      if (result.ok) {
        setEditando(null)
        setModalOpen(false)
        toast.success(result.message)
        router.refresh()
      }
    })
  }

  function confirmarEliminar() {
    if (!eliminando) return
    startDeleteTransition(async () => {
      const result = await eliminarMovimientoPT(eliminando.id)
      if (result.ok) {
        toast.success(result.message)
        setEliminando(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  const selectedProduct = data.productos.find((p) => p.id === productoId)
  const selectedPres = data.presentaciones.find((p) => p.id === presentacionId)

  return {
    isPending,
    isDeleting,
    formRef,
    editando,
    setEditando,
    eliminando,
    setEliminando,
    modalOpen,
    setModalOpen,
    tipo,
    setTipo,
    productoId,
    presentacionId,
    tipoOperacionIdRef,
    motivo,
    setMotivo,
    stockInfo,
    message,
    cantidad,
    setCantidad,
    costoUnitario,
    setCostoUnitario,
    ingCampo,
    setIngCampo,
    hoyStr,
    resolverTipoOperacionId,
    handleProductoChange,
    openModal,
    submit,
    confirmarEliminar,
    selectedProduct,
    selectedPres,
  }
}

export type ProductoTerminadoForm = ReturnType<typeof useProductoTerminadoForm>
