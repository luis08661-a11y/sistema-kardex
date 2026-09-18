# SKILL OFICIAL — KARDEX PRODUCTO TERMINADO
## Integración real del prototipo con Next.js + Prisma + PostgreSQL + PEPS

**Versión:** 2.0  
**Estado:** SKILL DEFINITIVO  
**Objetivo:** integrar el Kardex de Producto Terminado del proyecto existente, conservando el diseño del prototipo y conectándolo a los datos reales.

---

# 1. REGLA PRINCIPAL

Este SKILL se debe ejecutar **sobre el proyecto existente**.

NO rehacer el sistema.

NO crear un Kardex genérico.

NO reemplazar el diseño del prototipo.

La implementación final debe ser:

```text
PROTOTIPO ENTREGADO
       +
PRISMA EXISTENTE
       +
SERVER ACTIONS
       +
SERVICES
       +
PEPS
       +
STOCK
       +
REPORTES
       ↓
KARDEX PRODUCTO TERMINADO REAL
```

Las dos imágenes entregadas por el usuario son referencia visual obligatoria:

1. Modal **“Registrar Nuevo Movimiento Kardex”**.
2. Pantalla principal del **Kardex de Producto Terminado**.

El diseño debe conservar estructura, jerarquía, colores, tarjetas, botones, modal, tabla agrupada, filtros y distribución general.

---

# 2. STACK

Mantener:

```text
Next.js
React
TypeScript
Prisma 7.9.1
PostgreSQL
pnpm
Server Actions
Zod
PEPS
shadcn/ui
TanStack Table
```

No cambiar de stack para implementar este módulo.

---

# 3. MODELOS EXISTENTES QUE SE DEBEN UTILIZAR

Utilizar los modelos actuales:

```text
Producto
Presentacion
MovimientoProductoTerminado
CapaPEPSPT
AplicacionPEPSPT
Periodo
Establecimiento
TipoOperacion
User
Empresa
```

NO crear:

```text
ProductoTerminado
LoteProductoTerminado
StockProductoTerminado
KardexProductoTerminado
```

si ya existe la funcionalidad mediante los modelos actuales.

---

# 4. REGLA FUNDAMENTAL: PRODUCTO TERMINADO NO USA LOTE

Producto Terminado NO maneja lotes como Base Activa.

La identificación correcta es:

```text
Producto + Presentación
```

Ejemplo:

```text
Código: 02200
Producto: BIO BASIANA
Presentación: 200 GRAMOS
```

No crear:

```text
Lote PT
```

No agregar prefijos:

```text
PT-02
PT-02200
```

si el código real es:

```text
02
02200
```

Los códigos existentes deben conservarse.

---

# 5. PRODUCTOS PT

Mantener los códigos existentes:

```text
01
01250
01300

02
02200
02250
02500

03
03200
03250
03500

04
04200

05

06
06500

08
08200
08250
08500

09
10
15P
1518
16
```

No duplicar productos para solucionar problemas visuales.

---

# 6. RELACIÓN DE DATOS

La conexión real debe ser:

```text
Producto
   │
   └── Presentación
          │
          ▼
MovimientoProductoTerminado
          │
          ├── Entrada
          │      ↓
          │   CapaPEPSPT
          │
          └── Salida
                 ↓
           AplicacionPEPSPT
                 ↓
                PEPS
                 ↓
               Stock
                 ↓
              Kardex PT
```

---

# 7. ARCHIVOS A REVISAR

PRIMERO revisar los archivos existentes.

## UI

```text
src/app/dashboard/producto-terminado/page.tsx
src/app/dashboard/producto-terminado/producto-terminado-module.tsx
```

## Actions

```text
src/actions/producto-terminado.actions.ts
```

## Service

```text
src/lib/services/producto-terminado.service.ts
```

## Validator

```text
src/lib/validators/producto-terminado.schema.ts
```

## PEPS

```text
src/lib/services/peps.service.ts
```

## Stock

```text
src/lib/services/stock.service.ts
```

## Reportes

```text
src/lib/services/reportes.service.ts
src/actions/reportes.actions.ts
```

NO crear archivos duplicados si ya existen con otra organización.

---

# 8. MODAL — REGISTRAR NUEVO MOVIMIENTO KARDEX

La primera imagen es la referencia visual.

Título:

```text
Registrar Nuevo Movimiento Kardex
```

Debe conservar:

- encabezado oscuro;
- icono;
- título blanco;
- botón X;
- bordes redondeados;
- tarjetas/secciones;
- fondo claro;
- botones inferiores;
- distribución de columnas.

---

# 9. SECCIÓN PRODUCTO

Título:

```text
Producto PT / Presentación *
```

Debe ser un selector.

Ejemplo visual:

```text
[01] BIO INSECT PW - Bolsa 1 Kg
```

Al seleccionar producto/presentación debe aparecer:

```text
Stock disponible actual:
1015 Kilogramos
```

Este número NO puede ser estático.

Debe provenir de:

```text
Stock real
↓
Producto + Presentación
```

La unidad mostrada debe corresponder a la unidad real del producto/presentación.

---

# 10. DOCUMENTO DE TRASLADO Y RESPONSABLE

Conservar la sección:

```text
DOCUMENTO DE TRASLADO Y RESPONSABLE
```

Campos:

```text
Fecha *
Serie
Número

Observación (Área)
Responsable
```

No eliminar:

```text
Observación (Área)
```

No mezclar observación con empresa, ubicación o responsable.

---

# 11. TIPO DE OPERACIÓN Y DETALLE

Conservar:

```text
TIPO DE OPERACIÓN Y DETALLE
```

Campos:

```text
Tipo de Operación *
Cantidad (CAN) *
Costo Unitario (S/)
```

La cantidad PT se maneja como:

```text
CAN
```

No como Kg salvo que la unidad del producto sea realmente Kg.

---

# 12. ENTRADA

Cuando sea entrada:

```text
Tipo de operación = ENTRADA
```

registrar:

```text
cantidad
costoUnitario
costoTotal
```

Cálculo:

```text
costoTotal = cantidad × costoUnitario
```

La entrada debe generar:

```text
MovimientoProductoTerminado
        ↓
CapaPEPSPT
```

---

# 13. SALIDA

Cuando sea salida:

```text
Tipo de operación = SALIDA
```

validar stock antes de guardar.

Regla:

```text
cantidad solicitada <= stock disponible
```

Si no cumple:

```text
Stock insuficiente para el producto y presentación seleccionados.
```

No guardar movimientos inválidos.

---

# 14. DETALLE DE SALIDA Y COMPROBANTE

Conservar la sección:

```text
DETALLE DE SALIDA Y COMPROBANTE
```

Campos:

```text
Motivo de Salida
Factura / Guía
Ing. de Campo
Empresa
```

Motivos:

```text
PRODUCCION
VENTA
ENSAYO
```

Mostrar en pantalla:

```text
Producción
Venta
Ensayo
```

No crear otros motivos si no existen en el modelo.

---

# 15. PEPS PT

Las entradas generan capas.

Las salidas consumen capas en orden cronológico:

```text
CAPA MÁS ANTIGUA
      ↓
SIGUIENTE CAPA
      ↓
SIGUIENTE CAPA
```

Ejemplo:

```text
Entrada 1
100 und × S/ 2.00

Entrada 2
50 und × S/ 2.50

Salida
120 und
```

Resultado:

```text
100 × 2.00 = 200.00
20 × 2.50  =  50.00

Costo salida = 250.00
```

Registrar el consumo en:

```text
AplicacionPEPSPT
```

No usar promedio.

---

# 16. SALDO

El saldo debe ser real:

```text
Entradas acumuladas - Salidas acumuladas
```

La valorización debe respetar las capas PEPS.

NO hacer:

```text
saldo × último costo
```

cuando existen varias capas.

---

# 17. TABLA PRINCIPAL

La segunda imagen es referencia visual obligatoria.

Conservar:

```text
MÉTODO DE VALUACIÓN: PEPS
```

y la tabla con encabezados agrupados.

---

# 18. ENCABEZADOS AGRUPADOS

## DOCUMENTO DE TRASLADO / COMPROBANTE DE PAGO

```text
FECHA
SERIE
NÚM
OBSERVACIÓN
RESPONSABLE
```

## TIPO DE OPERACIÓN

```text
TIPO DE OPERACIÓN
(TABLA 12)
```

El código/nombre debe salir de:

```text
TipoOperacion
```

No inventar códigos.

## ENTRADAS

```text
CAN
C.UNT
COSTO TOTAL
```

## SALIDAS

```text
CAN
C.UNT
C.TOTAL
```

## SALDO FINAL

```text
CAN
C.UNT
C.TOTAL
```

## MOTIVO DE SALIDA

```text
PRODUCCIÓN
VENTA
ENSAYO
```

## FACTURA O BOLETA / RECIBO Y GUÍA

## EMPRESA

## ING. DE CAMPO

## ACC.

El botón de acción puede mantenerse visualmente, pero NO debe borrar sin respetar PEPS y auditoría.

---

# 19. TIPO T10

NO mostrar:

```text
TIPO (T.10)
```

Aunque pueda formar parte del formato normativo original.

Este proyecto tiene como regla explícita:

```text
T10 NO SE MUESTRA
```

No agregarlo al formulario ni a la tabla.

---

# 20. TARJETAS SUPERIORES

Conservar las cuatro tarjetas del prototipo:

```text
TOTAL ENTRADAS (UND)
TOTAL SALIDAS (UND)
STOCK SALDO ACTUAL (UND)
COSTO VALORIZADO TOTAL
```

Los valores deben salir del backend.

NO utilizar:

```text
1030
28
1669
S/ 16.94
```

como datos fijos.

Esos valores de la imagen son solamente referencia visual/datos del prototipo.

---

# 21. FILTROS

Conservar visualmente:

```text
Mostrar Todos los Productos PT
Todos los Tipos
Buscar
Restablecer
```

La búsqueda debe poder encontrar, según los datos existentes:

```text
cliente/empresa
comprobante
código
```

Puede incorporar:

```text
Periodo
Establecimiento
Presentación
```

si ya están disponibles en el backend.

---

# 22. BOTONES

Conservar:

```text
Excel
PDF
Imprimir
```

No utilizar CSV como exportación principal.

El botón:

```text
Simular Movimientos (Demo)
```

NO debe estar disponible en producción.

No migrar:

```text
simulatePtActivity()
```

---

# 23. LOCALSTORAGE

NO utilizar:

```text
localStorage
bio_pt_stocks_v3
bio_pt_movements_v3
```

El prototipo puede utilizar almacenamiento local para demostración, pero el sistema real debe usar:

```text
PostgreSQL
Prisma
Server Actions
Services
```

---

# 24. STOCK PT

Utilizar el servicio Stock existente.

Stock PT debe calcularse por:

```text
Producto + Presentación
```

Ejemplo:

```text
BIO BASIANA
200 g → 120 und
500 g → 80 und
```

No mezclar ambas presentaciones.

---

# 25. KARDEX Y STOCK

Diferenciar:

```text
Stock actual
```

de:

```text
totales de movimientos filtrados
```

Los filtros no deben alterar el stock real.

---

# 26. CUADRO RESUMEN PT

Conservar el concepto del prototipo:

```text
CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO
```

Columnas:

```text
DESCRIPCIÓN
CÓDIGO
PRESENTACIÓN
STOCK TOTAL
OBSERVACIONES
```

Agrupar correctamente por producto/presentación.

---

# 27. OBSERVACIÓN

Mantener como campo independiente:

```text
observacion
```

No mezclar con:

```text
empresa
factura
guia
responsable
```

---

# 28. EMPRESA

Distinguir:

```text
Empresa propietaria del sistema
```

de:

```text
Empresa relacionada con el despacho
```

No cambiar el significado del campo existente.

Si el movimiento actual maneja empresa destino como texto, conservarlo.

---

# 29. ING. DE CAMPO

Mantener:

```text
Ing. de Campo
```

como dato del movimiento según el modelo existente.

No convertirlo automáticamente en usuario del sistema.

---

# 30. RESPONSABLE

Mantener:

```text
Responsable
```

como responsable del movimiento.

No confundirlo con:

```text
responsableReporte
```

que pertenece a la plantilla institucional.

---

# 31. SERVER ACTION

Arquitectura obligatoria:

```text
Formulario
   ↓
Server Action
   ↓
Zod
   ↓
Service
   ↓
Prisma
   ↓
PEPS
   ↓
Respuesta
```

La UI NO debe:

```text
consultar Prisma directamente
calcular PEPS
guardar movimientos
```

---

# 32. SERVICE

`producto-terminado.service.ts` debe encargarse de:

```text
validar producto
validar presentación
validar periodo
validar establecimiento
validar operación
registrar entrada
registrar salida
validar stock
crear capa PEPS
aplicar PEPS
obtener Kardex
```

No duplicar lógica en el componente.

---

# 33. VALIDADORES

Utilizar:

```text
src/lib/validators/producto-terminado.schema.ts
```

Validar:

```text
producto
presentación
fecha
tipo operación
cantidad
costo
motivo
documentos
```

No confiar solamente en validaciones del navegador.

---

# 34. AUDITORÍA

Reutilizar:

```text
AuditLog
```

si ya está integrado.

Registrar operaciones importantes:

```text
crear movimiento
modificar
anular
```

No crear otro sistema de auditoría.

---

# 35. PERMISOS

Reutilizar el sistema existente.

No crear permisos duplicados.

Controlar al menos:

```text
consultar Kardex PT
registrar movimiento PT
anular movimiento PT
exportar reportes
```

según los permisos disponibles.

---

# 36. EXPORTACIÓN EXCEL

Debe generar:

```text
.xlsx
```

Con columnas equivalentes al Kardex.

Como mínimo:

```text
Fecha
Serie
Número
Observación
Responsable
Tipo de Operación
Entrada CAN
Entrada C.UNT
Entrada Costo Total
Salida CAN
Salida C.UNT
Salida C.Total
Saldo CAN
Saldo C.UNT
Saldo C.Total
Producción
Venta
Ensayo
Factura/Guía
Empresa
Ing. de Campo
```

No incluir la columna:

```text
ACC.
```

---

# 37. PDF

Debe existir:

```text
Exportar PDF
```

El PDF normal debe representar correctamente el Kardex.

No tomar una captura de pantalla.

Debe conservar:

```text
título
filtros aplicados si corresponde
método PEPS
tabla
totales
```

Si se utiliza plantilla institucional, reutilizar el componente de reportes existente.

---

# 38. IMPRESIÓN

Debe existir:

```text
Imprimir
```

Durante impresión ocultar:

```text
sidebar
menús
filtros innecesarios
botones
acciones
```

Mostrar:

```text
Kardex
tabla
totales
```

Preparar para A4.

---

# 39. DISEÑO

NO reemplazar el diseño por un CRUD genérico.

Mantener:

```text
colores del prototipo
bordes
espaciado
tarjetas
botones
modal
tabla compacta
encabezados agrupados
badges
jerarquía visual
```

La implementación debe parecer una evolución del prototipo, no otra aplicación.

---

# 40. ELIMINACIÓN

No borrar físicamente movimientos si esto rompe:

```text
PEPS
Stock
Kardex
Auditoría
```

Preferir:

```text
anulación/reversión
```

si la arquitectura existente lo permite.

---

# 41. PRISMA

NO modificar `schema.prisma` solamente por razones visuales.

El proyecto ya dispone de:

```text
MovimientoProductoTerminado
CapaPEPSPT
AplicacionPEPSPT
```

Solo modificar Prisma si el diagnóstico demuestra una necesidad real.

Después de cualquier cambio:

```bash
pnpm prisma format
pnpm prisma validate
pnpm prisma generate
```

---

# 42. ORDEN EXACTO DE EJECUCIÓN

## FASE 1 — Diagnóstico

Revisar primero:

```text
schema.prisma
producto-terminado-module.tsx
producto-terminado.actions.ts
producto-terminado.service.ts
producto-terminado.schema.ts
peps.service.ts
stock.service.ts
reportes.service.ts
```

No modificar todavía.

## FASE 2 — Producto + Presentación

Comprobar que el selector utiliza datos reales.

## FASE 3 — Entrada

Registrar una entrada real.

Comprobar:

```text
MovimientoProductoTerminado
CapaPEPSPT
Stock
```

## FASE 4 — Salida

Probar:

```text
VENTA
PRODUCCION
ENSAYO
```

Comprobar PEPS.

## FASE 5 — Kardex

Adaptar la UI del prototipo.

## FASE 6 — Filtros y tarjetas

Conectar todos los valores al backend.

## FASE 7 — Cuadro resumen

Integrar resumen PT.

## FASE 8 — Excel

Probar `.xlsx`.

## FASE 9 — PDF e impresión

Probar salida.

## FASE 10 — Validación

Ejecutar todo.

---

# 43. PRUEBA PEPS OBLIGATORIA

Producto:

```text
Código: 02200
Producto: BIO BASIANA
Presentación: 200 GRAMOS
```

Entrada 1:

```text
100 und
Costo unitario: S/ 10.00
```

Entrada 2:

```text
50 und
Costo unitario: S/ 12.00
```

Salida:

```text
120 und
Motivo: VENTA
```

PEPS esperado:

```text
100 × 10 = 1000
20 × 12 = 240
----------------
Costo salida = 1240
```

Saldo:

```text
30 und
```

Valorización:

```text
30 × 12 = 360
```

La prueba debe verificarse en:

```text
MovimientoProductoTerminado
CapaPEPSPT
AplicacionPEPSPT
Stock
Kardex
```

---

# 44. PRUEBA VISUAL OBLIGATORIA

Comprobar que el resultado conserve:

```text
✓ Modal similar al prototipo
✓ Encabezado oscuro
✓ Selector Producto PT / Presentación
✓ Stock disponible
✓ Secciones del formulario
✓ Tarjetas superiores
✓ Filtros
✓ Botones Excel/PDF/Imprimir
✓ Encabezado PEPS
✓ Tabla agrupada
✓ Totales
✓ Botón de acción
```

---

# 45. PRUEBAS TÉCNICAS OBLIGATORIAS

Ejecutar:

```bash
pnpm prisma format
pnpm prisma validate
pnpm prisma generate
pnpm exec tsc --noEmit
pnpm build
```

No considerar terminado mientras exista:

```text
error TypeScript
error Prisma
error de build
error de runtime
```

---

# 46. ERRORES QUE DEBEN EVITARSE

NO:

```text
crear otro Producto
crear otro modelo PT
crear lotes PT
crear otro Stock
crear otro PEPS
crear otro servicio
usar localStorage
usar datos demo
usar simulatePtActivity
usar CSV como salida principal
mostrar T10
mezclar presentaciones
mezclar observación con empresa
mezclar empresa propietaria con empresa destino
calcular PEPS en la UI
guardar stock manual
cambiar códigos existentes
romper Base Activa
romper PEPS
romper Stock
crear un CRUD genérico
```

---

# 47. CRITERIOS FINALES DE ACEPTACIÓN

El Kardex PT se considera terminado cuando:

```text
✓ Usa Producto real
✓ Usa Presentación real
✓ No usa lote PT
✓ Conserva códigos reales
✓ Usa MovimientoProductoTerminado
✓ Usa CapaPEPSPT
✓ Usa AplicacionPEPSPT
✓ Entrada funciona
✓ Salida funciona
✓ Producción funciona
✓ Venta funciona
✓ Ensayo funciona
✓ Stock se valida
✓ PEPS funciona
✓ Saldo funciona
✓ Costos funcionan
✓ Observación funciona
✓ Responsable funciona
✓ Empresa funciona
✓ Ing. de Campo funciona
✓ Factura/Guía funciona
✓ Tabla 12 funciona
✓ T10 no aparece
✓ Filtros funcionan
✓ Tarjetas muestran datos reales
✓ Totales funcionan
✓ Cuadro resumen funciona
✓ Excel funciona
✓ PDF funciona
✓ Impresión funciona
✓ Diseño conserva el prototipo
✓ No existe localStorage de producción
✓ No existe simulación demo en producción
✓ No hay modelos duplicados
✓ No hay servicios duplicados
✓ Base Activa sigue funcionando
✓ Stock sigue funcionando
✓ PEPS sigue funcionando
✓ Prisma valida
✓ TypeScript no tiene errores
✓ Build exitoso
```

---

# 48. REGLA FINAL DEL SKILL

La prioridad es:

```text
1. DATOS REALES
2. INTEGRIDAD PEPS
3. STOCK CORRECTO
4. KARDEX CORRECTO
5. DISEÑO DEL PROTOTIPO
6. EXPORTACIONES
7. IMPRESIÓN
```

Nunca sacrificar la integridad de:

```text
Movimiento
PEPS
Stock
Kardex
```

para conseguir solamente una apariencia visual.

La pantalla final debe verse como el prototipo, pero funcionar completamente con:

```text
Next.js
+
Prisma
+
PostgreSQL
+
PEPS
+
Stock
```

Este documento es el **SKILL oficial y único para la implementación del Kardex Producto Terminado**.
