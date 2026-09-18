-- CreateIndex
CREATE INDEX "Producto_activo_tipoInventario_idx" ON "Producto"("activo", "tipoInventario");

-- CreateIndex
CREATE INDEX "Venta_empresaId_tipoComprobante_serie_idx" ON "Venta"("empresaId", "tipoComprobante", "serie");
