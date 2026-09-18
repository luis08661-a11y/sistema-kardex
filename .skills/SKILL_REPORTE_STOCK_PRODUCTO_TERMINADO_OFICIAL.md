# SKILL OFICIAL — REPORTE STOCK PRODUCTO TERMINADO
## Plantilla institucional exacta — Logo + firma + PDF + impresión + Excel

**Versión:** 1.0  
**Estado:** SKILL DEFINITIVO  
**Módulo:** Reportes / Stock / Producto Terminado

---

# 1. OBJETIVO

Implementar el **Reporte de Stock de Producto Terminado** del sistema tomando como referencia exacta las plantillas proporcionadas por el usuario.

El reporte debe conservar la estructura visual de las imágenes:

- Logo institucional.
- Título verde.
- Tabla con bordes.
- Descripción.
- Código.
- Presentación.
- Stock total.
- Observaciones.
- Texto inferior.
- Fecha del informe.
- Firma.
- Nombre del responsable.
- Razón social.

Debe permitir:

```text
Vista previa
     ↓
Imprimir
     ↓
Exportar PDF
     ↓
Exportar Excel
```

El reporte debe utilizar datos reales de PostgreSQL mediante Prisma.

---

# 2. REGLA PRINCIPAL

NO crear un reporte genérico.

NO generar una tabla CRUD.

NO copiar datos estáticos de la imagen.

La imagen es la **plantilla visual**.

Los datos deben salir del sistema:

```text
Empresa
   +
Periodo
   +
Establecimiento
   +
Producto
   +
Presentación
   +
Movimientos PT
   +
PEPS PT
   ↓
STOCK PT
   ↓
REPORTE
```

---

# 3. LAS DOS PLANTILLAS PROPORCIONADAS

Existen dos variantes del reporte.

## Plantilla A — Presentaciones principales

Ejemplo:

```text
CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO

DESCRIPCIÓN | CODIGO | PRESENTACIÓN | STOCK TOTAL | OBSERVACIONES

BIO INSECT PW       | 01   | Bolsa 1 Kg             | 4   | Kilogramos
BIO BASIANA         | 02   | Bolsa 1 Kg             | 21  | Kilogramos
BIO METARRIL        | 03   | Bolsa 1 Kg             | 43  | Kilogramos
BIO LILACINUS       | 04   | Bolsa 1 Kg             | 105 | Kilogramos
BIO FUMOSO         | 05   | Bolsa 1 Kg             | 4   | Kilogramos
BIO LECANII        | 07   | Bolsa 1 Kg             | 2   | Kilogramos
BIO TRIX           | 08   | Bolsa 1 Kg             | 30  | Kilogramos
BIO INSECT POWER   | 15P  | Pomo de 1 Litro        | 29  | Litros
BIO INSECT POWER   | 1518 | Bidón de 18 Litros      | 6   | Bidones
BIO SUBTILIS       | 09   | Pomo de 1 Litro        | 154 | Litros
PROMOBIOL          | 10   | Pomo de 1 Litro        | 80  | Litros
BIO-BT             | 16   | Pomo de 1 Litro        | 1   | Litros
```

Texto inferior:

```text
Producto listo para etiquetar y despachar.
```

Fecha:

```text
Informe al 21-08-2026
```

La fecha debe ser dinámica en el sistema.

---

# 4. PLANTILLA B — PRESENTACIONES PEQUEÑAS

Ejemplo:

```text
CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO

DESCRIPCIÓN | CODIGO | PRESENTACIÓN | STOCK TOTAL | OBSERVACIONES

BIO INSECT PW | 01250 | Bolsa 250 gramos | 21 | Bolsas
BIO INSECT PW | 01300 | Bolsa 300 gramos | 6  | Bolsas
BIO BASIANA   | 02200 | Bolsa 200 gramos | 36 | Bolsas
BIO BASIANA   | 02250 | Bolsa 250 gramos | 6  | Bolsas
BIO BASIANA   | 02500 | Bolsa 500 gramos | 9  | Bolsas
BIO METARRIL  | 03200 | Bolsa 200 gramos | 43 | Bolsas
BIO METARRIL  | 03250 | Bolsa 250 gramos | 50 | Bolsas
BIO METARRIL  | 03500 | Bolsa 500 gramos | 13 | Bolsas
BIO LILACINUS | 04200 | Bolsa 200 gramos | 2  | Bolsas
BIO FUMOSO    | 06500 | Bolsa 500 gramos | 1  | Bolsas
BIO TRIX      | 08200 | Bolsa 200 gramos | 2  | Bolsas
BIO TRIX      | 08250 | Bolsa 250 gramos | 24 | Bolsas
BIO TRIX      | 08500 | Bolsa 500 gramos | 81 | Bolsas
```

Texto inferior:

```text
Producto listo para etiquetar y despachar.
```

Fecha:

```text
Informe al 21-08-2026
```

La fecha debe ser dinámica.

---

# 5. REGLA CRÍTICA: LAS PRESENTACIONES SON EXISTENCIAS DIFERENTES

NO sumar diferentes presentaciones.

Ejemplo:

```text
BIO BASIANA 200 g
BIO BASIANA 250 g
BIO BASIANA 500 g
```

son registros independientes.

El stock se obtiene por:

```text
Producto + Presentación
```

Por tanto:

```text
BIO BASIANA 200 g → 36
BIO BASIANA 250 g → 6
BIO BASIANA 500 g → 9
```

NO:

```text
BIO BASIANA → 51
```

salvo que exista explícitamente otro reporte consolidado solicitado.

---

# 6. CÓDIGOS REALES

Conservar exactamente los códigos existentes.

Presentaciones principales:

```text
01
02
03
04
05
07
08
09
10
15P
1518
16
```

Presentaciones pequeñas:

```text
01250
01300
02200
02250
02500
03200
03250
03500
04200
06500
08200
08250
08500
```

NO agregar:

```text
PT-
PT01
PT-01
```

NO modificar códigos.

---

# 7. ORIGEN DE LOS DATOS

El reporte se construye desde los modelos existentes.

Usar:

```text
Producto
Presentacion
MovimientoProductoTerminado
CapaPEPSPT
AplicacionPEPSPT
Periodo
Establecimiento
Empresa
```

El stock debe reutilizar el servicio existente.

NO crear un stock paralelo solamente para el reporte.

---

# 8. MAPEO DEL REPORTE

## DESCRIPCIÓN

Origen:

```text
Producto.descripcion
```

Ejemplo:

```text
BIO BASIANA
```

---

## CÓDIGO

Origen:

```text
Producto.codigo
```

Ejemplo:

```text
02
02200
```

---

## PRESENTACIÓN

Origen:

```text
Presentacion.nombre
```

Ejemplo:

```text
Bolsa 1 Kg
Bolsa 200 gramos
Pomo de 1 Litro
Bidón de 18 Litros
```

---

## STOCK TOTAL

Origen:

```text
Stock PT
```

calculado por:

```text
Producto + Presentación
```

No introducir manualmente.

---

## OBSERVACIONES

Debe representar la unidad de presentación/stock correspondiente.

Ejemplos de la plantilla:

```text
Kilogramos
Litros
Bidones
Bolsas
```

No confundir con:

```text
MovimientoProductoTerminado.observacion
```

Son conceptos diferentes.

---

# 9. UNIDAD DE REPORTE

La observación de la plantilla representa la unidad en que se presenta el stock.

Ejemplos:

```text
Bolsa 1 Kg → Kilogramos
Bolsa 200 gramos → Bolsas
Pomo de 1 Litro → Litros
Bidón de 18 Litros → Bidones
```

La regla de conversión debe implementarse de manera explícita y consistente.

NO inferir una unidad incorrecta solamente a partir del texto visual.

Si el modelo de presentación/unidad existente permite determinarla, utilizar ese dato.

---

# 10. PLANTILLA INSTITUCIONAL

El reporte debe tener una plantilla independiente del cálculo.

Separar:

```text
DATOS
```

de:

```text
PRESENTACIÓN
```

Arquitectura:

```text
StockService
     ↓
Datos del reporte
     ↓
StockPTReportTemplate
     ↓
PDF / Print
```

El diseño no debe contener consultas Prisma.

---

# 11. ENCABEZADO

Mantener el estilo de las imágenes:

```text
[LOGO]

CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO
```

El título debe estar centrado.

La franja del título debe conservar el estilo verde del prototipo.

No sustituir por una cabecera genérica.

---

# 12. LOGO

El logo debe ser configurable.

NO codificarlo directamente en el servicio de stock.

Debe existir una fuente institucional para:

```text
logo
```

La plantilla debe poder cargarlo.

Si el proyecto ya tiene configuración de empresa/logo, reutilizarla.

NO duplicar configuración.

---

# 13. FIRMA

La firma debe aparecer al pie del reporte.

Debe soportar:

```text
Imagen de firma
Nombre del responsable
Razón social
```

Ejemplo visual:

```text
                         [FIRMA]

                    __________________
                    Yober N. Garcia Cabrera

                    BIOALTERNATIVA E&F S.A.C.
```

La firma NO pertenece a:

```text
MovimientoProductoTerminado
```

Es información de la plantilla institucional.

---

# 14. RESPONSABLE DEL REPORTE

Distinguir:

```text
Responsable del movimiento
```

de:

```text
Responsable que firma el reporte
```

No mezclarlos.

La plantilla debe obtener el responsable de reporte desde la configuración institucional existente o desde la configuración de reportes.

---

# 15. RAZÓN SOCIAL

Debe salir de:

```text
Empresa.razonSocial
```

No escribir:

```text
BIOALTERNATIVA E&F S.A.C.
```

como texto fijo.

---

# 16. FECHA DEL INFORME

Mostrar:

```text
Informe al DD-MM-YYYY
```

Ejemplo de la imagen:

```text
Informe al 21-08-2026
```

Pero debe ser dinámica.

Puede ser:

```text
fecha seleccionada por el usuario
```

o:

```text
fecha actual
```

según la pantalla desde donde se genera.

La fecha del reporte no debe depender de una fecha fija de la plantilla.

---

# 17. STOCK A UNA FECHA

El reporte debe soportar:

```text
Stock al día
```

Por ejemplo:

```text
Informe al 21-08-2026
```

significa:

```text
considerar movimientos <= 21-08-2026
```

No incluir movimientos posteriores.

Esto es obligatorio para que el informe histórico sea correcto.

---

# 18. PERIODO Y ESTABLECIMIENTO

Cuando el reporte lo requiera, filtrar por:

```text
Periodo
Establecimiento
```

No mezclar stocks de establecimientos diferentes.

La consulta debe respetar:

```text
empresa
periodo
establecimiento
fecha de corte
```

según los filtros disponibles.

---

# 19. CUADRO PRINCIPAL

Crear una tabla visual:

```text
┌────────────────────────────────────────────────────────────┐
│ CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO           │
├────────────────┬────────┬────────────────┬───────┬─────────┤
│ DESCRIPCIÓN    │ CÓDIGO │ PRESENTACIÓN   │ STOCK │ OBS.    │
├────────────────┼────────┼────────────────┼───────┼─────────┤
│ BIO BASIANA    │ 02     │ Bolsa 1 Kg     │ 21    │ Kg      │
│ ...            │ ...    │ ...            │ ...   │ ...     │
└────────────────┴────────┴────────────────┴───────┴─────────┘
```

Mantener:

- bordes;
- alineación;
- tipografía;
- proporciones;
- encabezado verde;
- filas compactas;
- apariencia institucional.

---

# 20. ORDEN DE PRODUCTOS

El orden debe ser estable.

Preferencia:

```text
Producto.codigo
```

y luego:

```text
Presentacion
```

No ordenar aleatoriamente.

Si el prototipo tiene un orden específico ya definido por catálogo, conservar ese orden cuando exista.

---

# 21. PRODUCTOS SIN STOCK

Mantener el comportamiento definido por el reporte actual.

Si el reporte debe mostrar catálogo completo:

```text
stock = 0
```

debe aparecer.

Si existe un filtro:

```text
Solo con stock
```

debe ocultarse.

No eliminar silenciosamente productos de la base.

---

# 22. TEXTO INFERIOR

Conservar:

```text
Producto listo para etiquetar y despachar.
```

Debe estar separado de la tabla.

No incluirlo como una fila de datos.

---

# 23. PDF

Debe existir botón:

```text
PDF
```

El PDF debe ser un documento real, no una captura de pantalla.

Debe contener:

```text
Logo
Título
Tabla
Texto inferior
Fecha
Firma
Responsable
Razón social
```

La distribución debe respetar la plantilla.

---

# 24. IMPRESIÓN

Debe existir:

```text
Imprimir
```

Preparar el documento para impresión.

Ocultar:

```text
botones
sidebar
filtros de pantalla
controles administrativos
```

Mostrar únicamente:

```text
plantilla
```

---

# 25. EXCEL

Debe existir:

```text
Excel
```

Formato:

```text
.xlsx
```

Columnas:

```text
DESCRIPCIÓN
CODIGO
PRESENTACIÓN
STOCK TOTAL
OBSERVACIONES
```

El Excel debe representar los datos reales del reporte.

La plantilla gráfica de logo/firma no necesita replicarse exactamente dentro del Excel si la implementación existente no lo soporta; la prioridad visual institucional es PDF/impresión.

---

# 26. PREVISUALIZACIÓN

Antes de exportar debe existir una vista previa.

Flujo:

```text
Filtros
   ↓
Generar reporte
   ↓
Vista previa
   ↓
PDF / Imprimir / Excel
```

No recalcular datos de manera diferente entre vista previa y PDF.

---

# 27. COMPONENTES

Revisar primero la estructura existente.

Buscar:

```text
src/app/dashboard/reportes/
src/lib/services/reportes.service.ts
src/actions/reportes.actions.ts
```

y cualquier componente de plantilla institucional existente.

Si ya existe una plantilla de:

```text
Logo + Firma
```

REUTILIZARLA.

NO crear otra plantilla paralela.

---

# 28. ARCHIVOS PROPUESTOS

Solo si no existen equivalentes:

```text
src/app/dashboard/reportes/
└── stock-producto-terminado/
    ├── page.tsx
    └── stock-producto-terminado-report.tsx

src/lib/services/
└── reportes.service.ts

src/actions/
└── reportes.actions.ts

src/lib/validators/
└── reportes.schema.ts
```

Si ya existen estos archivos, adaptar los existentes.

---

# 29. SEPARACIÓN DE RESPONSABILIDADES

## Service

Obtiene:

```text
productos
presentaciones
movimientos
stock
empresa
periodo
establecimiento
```

## Report Template

Se encarga de:

```text
logo
título
tabla
fecha
firma
razón social
```

## Exportador

Se encarga de:

```text
PDF
Excel
Print
```

No mezclar todo en un solo componente.

---

# 30. NO USAR DATOS FIJOS

NO:

```text
BIO BASIANA
21
Bolsa 1 Kg
Kilogramos
```

como valores hardcodeados.

Los valores de las imágenes son ejemplos de referencia.

El sistema debe producir los valores actuales de la base de datos.

---

# 31. NO USAR LOCALSTORAGE

No utilizar:

```text
localStorage
```

para almacenar el stock.

El reporte debe leer PostgreSQL.

---

# 32. NO CREAR STOCK NUEVO

No crear:

```text
StockProductoTerminado
```

si el sistema ya tiene servicio de stock.

Reutilizar:

```text
stock.service.ts
```

---

# 33. NO DUPLICAR PEPS

El reporte no debe implementar otra versión de PEPS.

Debe consultar el resultado de:

```text
PEPS PT
```

El cálculo de capas pertenece al servicio PEPS.

---

# 34. CONSISTENCIA CON KARDEX PT

El stock del reporte debe coincidir con el Kardex.

Para el mismo:

```text
producto
presentación
periodo
establecimiento
fecha de corte
```

el resultado debe ser idéntico.

Ejemplo:

```text
Kardex PT
BIO BASIANA / 200 g
Saldo = 36

Reporte Stock PT
BIO BASIANA / 200 g
Stock = 36
```

No puede existir:

```text
Kardex = 36
Reporte = 41
```

---

# 35. PRUEBA OBLIGATORIA

Probar:

```text
Producto: BIO BASIANA
Código: 02200
Presentación: Bolsa 200 gramos
```

Movimientos:

```text
Entrada 100
Salida 30
Salida 34
```

Resultado esperado:

```text
Stock = 36
```

El reporte debe mostrar:

```text
BIO BASIANA | 02200 | Bolsa 200 gramos | 36 | Bolsas
```

---

# 36. PRUEBA DE PRESENTACIONES

Registrar:

```text
02200 → 36
02250 → 6
02500 → 9
```

El reporte debe mostrar tres filas.

NO:

```text
BIO BASIANA → 51
```

---

# 37. PRUEBA DE FECHA DE CORTE

Si existen:

```text
21-08 → entrada 100
25-08 → salida 20
30-08 → entrada 50
```

Reporte:

```text
21-08
```

debe mostrar:

```text
100
```

Reporte:

```text
25-08
```

debe mostrar:

```text
80
```

Reporte:

```text
30-08
```

debe mostrar:

```text
130
```

---

# 38. VALIDACIÓN VISUAL

Comparar la implementación con las imágenes proporcionadas.

Debe coincidir conceptualmente:

```text
✓ Logo
✓ Título verde
✓ Tabla compacta
✓ Encabezados
✓ Bordes
✓ Columnas
✓ Texto inferior
✓ Fecha
✓ Firma
✓ Responsable
✓ Razón social
```

No reemplazar por tarjetas modernas ni dashboard.

Este reporte es un **documento institucional**, no una pantalla CRUD.

---

# 39. VALIDACIÓN TÉCNICA

Ejecutar:

```bash
pnpm prisma validate
pnpm prisma generate
pnpm exec tsc --noEmit
pnpm build
```

No considerar terminado si existen errores.

---

# 40. VALIDACIÓN FUNCIONAL

Comprobar:

```text
✓ Stock real
✓ Producto correcto
✓ Presentación correcta
✓ Código correcto
✓ Unidad correcta
✓ Fecha de corte
✓ Empresa
✓ Establecimiento
✓ PDF
✓ Excel
✓ Impresión
✓ Logo
✓ Firma
✓ Responsable
✓ Razón social
```

---

# 41. REGLA DE INTEGRACIÓN

Este reporte debe integrarse con:

```text
Producto Terminado
        ↓
Stock
        ↓
Reportes
```

No modificar innecesariamente:

```text
Base Activa
PEPS Base
Kardex Base
```

---

# 42. RESULTADO FINAL

El sistema debe permitir:

```text
Dashboard
   ↓
Reportes
   ↓
Stock Producto Terminado
   ↓
Seleccionar fecha
   ↓
Seleccionar periodo/establecimiento si corresponde
   ↓
Generar
   ↓
Vista previa institucional
   ↓
┌──────────┬──────────┬────────────┐
│   PDF    │ IMPRIMIR │   EXCEL    │
└──────────┴──────────┴────────────┘
```

El resultado PDF/impreso debe conservar la identidad de las plantillas proporcionadas.

---

# 43. REGLA FINAL

El objetivo NO es solamente:

```text
mostrar stock
```

El objetivo es generar el **documento institucional de Stock de Producto Terminado** que actualmente se maneja en las plantillas proporcionadas.

Debe conservar:

```text
IDENTIDAD VISUAL
+
DATOS REALES
+
STOCK CORRECTO
+
FECHA DE CORTE
+
LOGO
+
FIRMA
+
PDF
+
IMPRESIÓN
+
EXCEL
```

Y debe reutilizar la arquitectura existente:

```text
Next.js
+
Prisma
+
PostgreSQL
+
Stock PT
+
PEPS PT
+
Reportes
```

No crear una implementación paralela.
