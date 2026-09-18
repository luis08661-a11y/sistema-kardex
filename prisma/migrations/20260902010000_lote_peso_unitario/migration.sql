-- Gestión y Generación de Lotes
-- Peso unitario opcional del lote (default 0), no afecta PEPS/Kardex/Stock
-- que se calculan desde los movimientos de Base Activa.
ALTER TABLE "LoteBaseActiva" ADD COLUMN "pesoUnitarioKg" DECIMAL(18, 6) NOT NULL DEFAULT 0;