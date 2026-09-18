/*
  Warnings:

  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA');

-- DropTable
DROP TABLE "Cliente";

-- CreateTable
CREATE TABLE "Operacion" (
    "codigo" VARCHAR(2) NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo_movimiento" "TipoMovimiento" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Operacion_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "abreviatura" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" TEXT NOT NULL DEFAULT 'UND',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "codigo_lote" TEXT NOT NULL,
    "fecha_apertura" DATE NOT NULL,
    "responsable" TEXT NOT NULL,
    "observacion_ubicacion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" BIGSERIAL NOT NULL,
    "lote_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "operacion_codigo" VARCHAR(2) NOT NULL,
    "tipo_movimiento" "TipoMovimiento" NOT NULL,
    "entrada_und" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "entrada_peso_kg" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "entrada_peso_total" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "salida_und" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "salida_peso_unitario" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "salida_peso_total" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "saldo_und" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saldo_peso_kg" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "saldo_peso_total" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "motivo_salida_formulacion" TEXT,
    "responsable_registro" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formulacion" (
    "id" SERIAL NOT NULL,
    "movimiento_id" BIGINT NOT NULL,
    "responsable_formulacion" TEXT,
    "cantidad_producto_formulado" DECIMAL(12,3),
    "almacenamiento" TEXT,

    CONSTRAINT "Formulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PepsCapa" (
    "id" BIGSERIAL NOT NULL,
    "lote_id" INTEGER NOT NULL,
    "movimiento_entrada_id" BIGINT NOT NULL,
    "fecha" DATE NOT NULL,
    "peso_unitario" DECIMAL(12,3) NOT NULL,
    "und_restante" DECIMAL(12,2) NOT NULL,
    "peso_restante" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "PepsCapa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_abreviatura_key" ON "Producto"("abreviatura");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_producto_id_codigo_lote_key" ON "Lote"("producto_id", "codigo_lote");

-- CreateIndex
CREATE INDEX "MovimientoInventario_lote_id_fecha_idx" ON "MovimientoInventario"("lote_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Formulacion_movimiento_id_key" ON "Formulacion"("movimiento_id");

-- CreateIndex
CREATE INDEX "PepsCapa_lote_id_fecha_idx" ON "PepsCapa"("lote_id", "fecha");

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_operacion_codigo_fkey" FOREIGN KEY ("operacion_codigo") REFERENCES "Operacion"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulacion" ADD CONSTRAINT "Formulacion_movimiento_id_fkey" FOREIGN KEY ("movimiento_id") REFERENCES "MovimientoInventario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PepsCapa" ADD CONSTRAINT "PepsCapa_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PepsCapa" ADD CONSTRAINT "PepsCapa_movimiento_entrada_id_fkey" FOREIGN KEY ("movimiento_entrada_id") REFERENCES "MovimientoInventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
