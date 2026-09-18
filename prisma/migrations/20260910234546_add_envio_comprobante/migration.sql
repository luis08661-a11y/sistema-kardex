-- CreateEnum
CREATE TYPE "TipoEnvio" AS ENUM ('CORREO', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PENDIENTE', 'ENVIADO', 'ERROR');

-- CreateTable
CREATE TABLE "EnvioComprobante" (
    "id" TEXT NOT NULL,
    "ventaId" TEXT NOT NULL,
    "tipo" "TipoEnvio" NOT NULL,
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'PENDIENTE',
    "destino" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "error" TEXT,
    "usuarioId" TEXT,
    "enviadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvioComprobante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnvioComprobante_ventaId_idx" ON "EnvioComprobante"("ventaId");

-- CreateIndex
CREATE INDEX "EnvioComprobante_tipo_idx" ON "EnvioComprobante"("tipo");

-- CreateIndex
CREATE INDEX "EnvioComprobante_estado_idx" ON "EnvioComprobante"("estado");

-- AddForeignKey
ALTER TABLE "EnvioComprobante" ADD CONSTRAINT "EnvioComprobante_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioComprobante" ADD CONSTRAINT "EnvioComprobante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
