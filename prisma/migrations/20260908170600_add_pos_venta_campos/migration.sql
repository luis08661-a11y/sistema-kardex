-- AlterEnum
ALTER TYPE "TipoComprobante" ADD VALUE 'NOTA_DE_VENTA';

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "precioVenta" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "fechaVencimiento" TIMESTAMP(3),
ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'PEN',
ADD COLUMN     "numeroOperacion" TEXT,
ADD COLUMN     "opExonerada" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "opGravada" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "opInafecta" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "recibido" DECIMAL(12,2),
ADD COLUMN     "tipoCambio" DECIMAL(12,4) NOT NULL DEFAULT 1,
ADD COLUMN     "vuelto" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "VentaDetalle" ADD COLUMN     "igv" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "importe" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "unidadMedida" TEXT;
