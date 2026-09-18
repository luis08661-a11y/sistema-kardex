/*
  Warnings:

  - The primary key for the `Producto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `abreviatura` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `creado_en` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `unidad_medida` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the `Formulacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MovimientoInventario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Operacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PepsCapa` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoInventario` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadMedidaId` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Made the column `descripcion` on table `Producto` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TipoInventario" AS ENUM ('BASE_ACTIVA', 'PRODUCTO_TERMINADO');

-- CreateEnum
CREATE TYPE "MetodoValuacion" AS ENUM ('PEPS');

-- CreateEnum
CREATE TYPE "TipoMotivoPT" AS ENUM ('PRODUCCION', 'VENTA', 'ENSAYO');

-- AlterEnum
ALTER TYPE "TipoMovimiento" ADD VALUE 'AJUSTE';

-- DropForeignKey
ALTER TABLE "Formulacion" DROP CONSTRAINT "Formulacion_movimiento_id_fkey";

-- DropForeignKey
ALTER TABLE "Lote" DROP CONSTRAINT "Lote_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "MovimientoInventario" DROP CONSTRAINT "MovimientoInventario_lote_id_fkey";

-- DropForeignKey
ALTER TABLE "MovimientoInventario" DROP CONSTRAINT "MovimientoInventario_operacion_codigo_fkey";

-- DropForeignKey
ALTER TABLE "PepsCapa" DROP CONSTRAINT "PepsCapa_lote_id_fkey";

-- DropForeignKey
ALTER TABLE "PepsCapa" DROP CONSTRAINT "PepsCapa_movimiento_entrada_id_fkey";

-- DropIndex
DROP INDEX "Producto_abreviatura_key";

-- AlterTable
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_pkey",
DROP COLUMN "abreviatura",
DROP COLUMN "creado_en",
DROP COLUMN "nombre",
DROP COLUMN "unidad_medida",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "categoriaId" TEXT,
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "codigoExistencia" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "marcaId" TEXT,
ADD COLUMN     "metodoValuacion" "MetodoValuacion" NOT NULL DEFAULT 'PEPS',
ADD COLUMN     "tipoAfectacionId" TEXT,
ADD COLUMN     "tipoExistenciaId" TEXT,
ADD COLUMN     "tipoInventario" "TipoInventario" NOT NULL,
ADD COLUMN     "unidadMedidaId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "descripcion" SET NOT NULL,
ADD CONSTRAINT "Producto_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Producto_id_seq";

-- DropTable
DROP TABLE "Formulacion";

-- DropTable
DROP TABLE "Lote";

-- DropTable
DROP TABLE "MovimientoInventario";

-- DropTable
DROP TABLE "Operacion";

-- DropTable
DROP TABLE "PepsCapa";

-- DropEnum
DROP TYPE "TipoDocumento";

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periodo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Periodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Establecimiento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadMedida" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UnidadMedida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoExistencia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoExistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marca" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoAfectacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoAfectacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoOperacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoOperacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Almacenamiento" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "establecimientoId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Almacenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presentacion" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidadMedidaId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Presentacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoteBaseActiva" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3),
    "observaciones" TEXT,
    "almacenamientoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoteBaseActiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoBaseActiva" (
    "id" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "establecimientoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "almacenamientoId" TEXT,
    "usuarioId" TEXT,
    "tipoOperacionId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipoMovimiento" "TipoMovimiento" NOT NULL,
    "observacion" TEXT,
    "responsableRegistro" TEXT,
    "entradaUnd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "entradaPesoKg" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "entradaPesoTotalKg" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "salidaUnd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "salidaPesoUnitarioKg" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "salidaPesoTotalKg" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "formulacion" TEXT,
    "responsableFormulacion" TEXT,
    "cantidadProductoFormulado" DECIMAL(18,6),
    "almacenamientoNombre" TEXT,
    "costoUnitarioKg" DECIMAL(18,6),
    "costoTotalEntrada" DECIMAL(18,6),
    "costoTotalSalida" DECIMAL(18,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoBaseActiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapaPEPSBase" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "movimientoEntradaId" TEXT NOT NULL,
    "fechaEntrada" TIMESTAMP(3) NOT NULL,
    "cantidadKgInicial" DECIMAL(18,6) NOT NULL,
    "cantidadKgRestante" DECIMAL(18,6) NOT NULL,
    "costoUnitarioKg" DECIMAL(18,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapaPEPSBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AplicacionPEPSBase" (
    "id" TEXT NOT NULL,
    "movimientoSalidaId" TEXT NOT NULL,
    "capaId" TEXT NOT NULL,
    "cantidadKg" DECIMAL(18,6) NOT NULL,
    "costoUnitarioKg" DECIMAL(18,6),
    "costoTotal" DECIMAL(18,6),

    CONSTRAINT "AplicacionPEPSBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoProductoTerminado" (
    "id" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "establecimientoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "presentacionId" TEXT,
    "usuarioId" TEXT,
    "tipoOperacionId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipoMovimiento" "TipoMovimiento" NOT NULL,
    "documentoTraslado" TEXT,
    "serie" TEXT,
    "numero" TEXT,
    "observacion" TEXT,
    "responsableDespacho" TEXT,
    "entradaCan" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "entradaCostoUnitario" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "entradaCostoTotal" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "salidaCan" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "salidaCostoUnitario" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "salidaCostoTotal" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "motivo" "TipoMotivoPT",
    "facturaGuia" TEXT,
    "empresaDestino" TEXT,
    "ingCampo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoProductoTerminado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapaPEPSPT" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "presentacionId" TEXT,
    "movimientoEntradaId" TEXT NOT NULL,
    "fechaEntrada" TIMESTAMP(3) NOT NULL,
    "cantidadInicial" DECIMAL(18,6) NOT NULL,
    "cantidadRestante" DECIMAL(18,6) NOT NULL,
    "costoUnitario" DECIMAL(18,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapaPEPSPT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AplicacionPEPSPT" (
    "id" TEXT NOT NULL,
    "movimientoSalidaId" TEXT NOT NULL,
    "capaId" TEXT NOT NULL,
    "cantidad" DECIMAL(18,6) NOT NULL,
    "costoUnitario" DECIMAL(18,6) NOT NULL,
    "costoTotal" DECIMAL(18,6) NOT NULL,

    CONSTRAINT "AplicacionPEPSPT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "ruc" TEXT,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_ruc_key" ON "Empresa"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "Periodo_empresaId_anio_key" ON "Periodo"("empresaId", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "Establecimiento_empresaId_nombre_key" ON "Establecimiento"("empresaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadMedida_codigo_key" ON "UnidadMedida"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadMedida_nombre_key" ON "UnidadMedida"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "TipoExistencia_codigo_key" ON "TipoExistencia"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Marca_nombre_key" ON "Marca"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "TipoAfectacion_codigo_key" ON "TipoAfectacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TipoOperacion_codigo_key" ON "TipoOperacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TipoOperacion_nombre_key" ON "TipoOperacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Almacenamiento_codigo_key" ON "Almacenamiento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Presentacion_productoId_key" ON "Presentacion"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "LoteBaseActiva_codigo_key" ON "LoteBaseActiva"("codigo");

-- CreateIndex
CREATE INDEX "LoteBaseActiva_productoId_idx" ON "LoteBaseActiva"("productoId");

-- CreateIndex
CREATE INDEX "MovimientoBaseActiva_periodoId_productoId_fecha_idx" ON "MovimientoBaseActiva"("periodoId", "productoId", "fecha");

-- CreateIndex
CREATE INDEX "MovimientoBaseActiva_loteId_fecha_idx" ON "MovimientoBaseActiva"("loteId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CapaPEPSBase_movimientoEntradaId_key" ON "CapaPEPSBase"("movimientoEntradaId");

-- CreateIndex
CREATE INDEX "CapaPEPSBase_productoId_fechaEntrada_idx" ON "CapaPEPSBase"("productoId", "fechaEntrada");

-- CreateIndex
CREATE UNIQUE INDEX "AplicacionPEPSBase_movimientoSalidaId_capaId_key" ON "AplicacionPEPSBase"("movimientoSalidaId", "capaId");

-- CreateIndex
CREATE INDEX "MovimientoProductoTerminado_periodoId_productoId_fecha_idx" ON "MovimientoProductoTerminado"("periodoId", "productoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CapaPEPSPT_movimientoEntradaId_key" ON "CapaPEPSPT"("movimientoEntradaId");

-- CreateIndex
CREATE INDEX "CapaPEPSPT_productoId_fechaEntrada_idx" ON "CapaPEPSPT"("productoId", "fechaEntrada");

-- CreateIndex
CREATE UNIQUE INDEX "AplicacionPEPSPT_movimientoSalidaId_capaId_key" ON "AplicacionPEPSPT"("movimientoSalidaId", "capaId");

-- CreateIndex
CREATE INDEX "Cliente_empresaId_idx" ON "Cliente"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- CreateIndex
CREATE INDEX "Producto_tipoInventario_idx" ON "Producto"("tipoInventario");

-- CreateIndex
CREATE INDEX "Producto_codigoExistencia_idx" ON "Producto"("codigoExistencia");

-- CreateIndex
CREATE INDEX "Producto_descripcion_idx" ON "Producto"("descripcion");

-- AddForeignKey
ALTER TABLE "Periodo" ADD CONSTRAINT "Periodo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Establecimiento" ADD CONSTRAINT "Establecimiento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Almacenamiento" ADD CONSTRAINT "Almacenamiento_establecimientoId_fkey" FOREIGN KEY ("establecimientoId") REFERENCES "Establecimiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_tipoExistenciaId_fkey" FOREIGN KEY ("tipoExistenciaId") REFERENCES "TipoExistencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "UnidadMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_tipoAfectacionId_fkey" FOREIGN KEY ("tipoAfectacionId") REFERENCES "TipoAfectacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentacion" ADD CONSTRAINT "Presentacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentacion" ADD CONSTRAINT "Presentacion_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteBaseActiva" ADD CONSTRAINT "LoteBaseActiva_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteBaseActiva" ADD CONSTRAINT "LoteBaseActiva_almacenamientoId_fkey" FOREIGN KEY ("almacenamientoId") REFERENCES "Almacenamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBaseActiva" ADD CONSTRAINT "MovimientoBaseActiva_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBaseActiva" ADD CONSTRAINT "MovimientoBaseActiva_establecimientoId_fkey" FOREIGN KEY ("establecimientoId") REFERENCES "Establecimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBaseActiva" ADD CONSTRAINT "MovimientoBaseActiva_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBaseActiva" ADD CONSTRAINT "MovimientoBaseActiva_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "LoteBaseActiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBaseActiva" ADD CONSTRAINT "MovimientoBaseActiva_almacenamientoId_fkey" FOREIGN KEY ("almacenamientoId") REFERENCES "Almacenamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBaseActiva" ADD CONSTRAINT "MovimientoBaseActiva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBaseActiva" ADD CONSTRAINT "MovimientoBaseActiva_tipoOperacionId_fkey" FOREIGN KEY ("tipoOperacionId") REFERENCES "TipoOperacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapaPEPSBase" ADD CONSTRAINT "CapaPEPSBase_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapaPEPSBase" ADD CONSTRAINT "CapaPEPSBase_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "LoteBaseActiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapaPEPSBase" ADD CONSTRAINT "CapaPEPSBase_movimientoEntradaId_fkey" FOREIGN KEY ("movimientoEntradaId") REFERENCES "MovimientoBaseActiva"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionPEPSBase" ADD CONSTRAINT "AplicacionPEPSBase_movimientoSalidaId_fkey" FOREIGN KEY ("movimientoSalidaId") REFERENCES "MovimientoBaseActiva"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionPEPSBase" ADD CONSTRAINT "AplicacionPEPSBase_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "CapaPEPSBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProductoTerminado" ADD CONSTRAINT "MovimientoProductoTerminado_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProductoTerminado" ADD CONSTRAINT "MovimientoProductoTerminado_establecimientoId_fkey" FOREIGN KEY ("establecimientoId") REFERENCES "Establecimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProductoTerminado" ADD CONSTRAINT "MovimientoProductoTerminado_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProductoTerminado" ADD CONSTRAINT "MovimientoProductoTerminado_presentacionId_fkey" FOREIGN KEY ("presentacionId") REFERENCES "Presentacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProductoTerminado" ADD CONSTRAINT "MovimientoProductoTerminado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProductoTerminado" ADD CONSTRAINT "MovimientoProductoTerminado_tipoOperacionId_fkey" FOREIGN KEY ("tipoOperacionId") REFERENCES "TipoOperacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapaPEPSPT" ADD CONSTRAINT "CapaPEPSPT_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapaPEPSPT" ADD CONSTRAINT "CapaPEPSPT_presentacionId_fkey" FOREIGN KEY ("presentacionId") REFERENCES "Presentacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapaPEPSPT" ADD CONSTRAINT "CapaPEPSPT_movimientoEntradaId_fkey" FOREIGN KEY ("movimientoEntradaId") REFERENCES "MovimientoProductoTerminado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionPEPSPT" ADD CONSTRAINT "AplicacionPEPSPT_movimientoSalidaId_fkey" FOREIGN KEY ("movimientoSalidaId") REFERENCES "MovimientoProductoTerminado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionPEPSPT" ADD CONSTRAINT "AplicacionPEPSPT_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "CapaPEPSPT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
