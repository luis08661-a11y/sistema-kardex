-- Tabla 5 = tipo de afectación
-- Reemplaza el catálogo de existencias por las dos modalidades operativas:
--   1 -> PRODUCTO TERMINADO
--   2 -> PRODUCTO EN PROCESO
-- codigoExistencia de cada producto queda sin cambios.

INSERT INTO "TipoExistencia" (id, codigo, nombre, activo)
VALUES
  (gen_random_uuid()::text, '1', 'PRODUCTO TERMINADO', true),
  (gen_random_uuid()::text, '2', 'PRODUCTO EN PROCESO', true)
ON CONFLICT (codigo) DO NOTHING;

UPDATE "Producto"
SET "tipoExistenciaId" = (SELECT id FROM "TipoExistencia" WHERE codigo = '1')
WHERE "tipoInventario" = 'PRODUCTO_TERMINADO';

UPDATE "Producto"
SET "tipoExistenciaId" = (SELECT id FROM "TipoExistencia" WHERE codigo = '2')
WHERE "tipoInventario" = 'BASE_ACTIVA';

DELETE FROM "TipoExistencia" WHERE codigo IN ('02', '03', '08');