# SKILL: REPORTE GENERAL PRODUCTO TERMINADO

## 1. OBJETIVO

Crear el módulo:

PRODUCTO TERMINADO
└── REPORTE GENERAL

El módulo debe generar el reporte oficial detallado de Producto
Terminado, siguiendo la estructura del Excel de Producto Terminado
proporcionado como referencia.

Debe existir:

1. Reporte detallado normal.
2. Vista de plantilla / formato institucional.
3. Exportación Excel.
4. Exportación PDF.
5. Impresión.

Los datos deben provenir exclusivamente de PostgreSQL mediante Prisma.

NO utilizar datos ficticios.
NO utilizar datos de ejemplo como valores fijos.
NO inventar productos.
NO inventar presentaciones.
NO inventar movimientos.
NO inventar documentos.
NO inventar responsables.
NO inventar fechas.
NO agregar columnas que no correspondan al Excel de Producto Terminado.

---

# 2. MÓDULOS EXISTENTES

NO modificar:

- Configuración
- Catálogos
- Productos
- Lotes
- Kardex Producto Terminado
- Registrar Movimiento PT
- Usuarios
- Base Activa
- Resumen Producto Terminado

Crear solamente:

PRODUCTO TERMINADO
└── Reporte General

---

# 3. RUTA

Crear:

src/app/dashboard/producto-terminado/reporte-general/

Estructura sugerida:

src/app/dashboard/producto-terminado/reporte-general/
├── page.tsx
└── reporte-general-producto-terminado-module.tsx

Respetar la arquitectura existente del proyecto.

---

# 4. MENÚ

Mantener:

PRODUCTO TERMINADO
├── Kardex Producto Terminado
├── Resumen Producto Terminado
├── Reporte General
└── Registrar Movimiento PT

NO crear:

- menú Reportes
- menú Reportes de Stock
- menú PEPS
- menú Capas PEPS
- menú Stock técnico

---

# 5. CONCEPTO

Este módulo es el:

REPORTE GENERAL PRODUCTO TERMINADO

Representa el detalle oficial de inventario permanente valorizado
de Producto Terminado.

NO es el Resumen Producto Terminado.

NO es el Kardex interactivo.

El Resumen muestra:

DESCRIPCIÓN
CÓDIGO
PRESENTACIÓN
STOCK TOTAL
OBSERVACIONES

El Reporte General muestra el detalle de movimientos.

---

# 6. FILTROS

Los filtros deben corresponder a Producto Terminado.

Utilizar:

- Producto
- Fecha desde
- Fecha hasta

Diseño:

Producto
[Todos los productos]

Fecha desde
[DD/MM/YYYY]

Fecha hasta
[DD/MM/YYYY]

[Consultar]
[Limpiar]

---

# 7. NO USAR FILTRO DE LOTE

Producto Terminado NO utiliza lotes.

NO agregar:

- Lote
- Número de lote
- LoteBaseActiva

Este concepto pertenece exclusivamente a Base Activa.

---

# 8. FILTRO PRODUCTO

Mostrar únicamente:

Producto.tipoInventario = PRODUCTO_TERMINADO

Utilizar productos reales de PostgreSQL.

No crear listas manuales.

---

# 9. FILTRO DE FECHA

Utilizar:

Fecha desde
Fecha hasta

Los movimientos incluidos deben cumplir:

fecha >= fechaDesde

y

fecha <= fechaHasta

No mostrar movimientos fuera del período seleccionado.

---

# 10. VALIDACIÓN DE FECHAS

Si:

Fecha desde > Fecha hasta

mostrar mensaje de validación.

No ejecutar la consulta.

Las fechas deben ser dinámicas.

No utilizar fechas fijas del Excel.

---

# 11. ENCABEZADO OFICIAL

El reporte debe conservar el patrón del Registro de Inventario
Permanente Valorizado.

Título:

REGISTRO DE INVENTARIO PERMANENTE VALORIZADO
- DETALLE DEL INVENTARIO VALORIZADO -
PRODUCTO TERMINADO

El contenido debe utilizar los datos reales de empresa,
establecimiento y período.

---

# 12. INFORMACIÓN DEL ENCABEZADO

Mostrar los datos institucionales que correspondan al formato:

PERÍODO
RUC
DENOMINACIÓN O RAZÓN SOCIAL
ESTABLECIMIENTO
CÓDIGO DE LA EXISTENCIA
TIPO (TABLA 5)
DESCRIPCIÓN
CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6)
MÉTODO DE VALUACIÓN

Los datos deben obtenerse desde:

Empresa
Periodo
Establecimiento
Producto
TipoExistencia
UnidadMedida

No escribirlos manualmente.

---

# 13. EMPRESA

RUC:

Empresa.ruc

DENOMINACIÓN O RAZÓN SOCIAL:

Empresa.razonSocial

No colocar la razón social como texto fijo.

---

# 14. ESTABLECIMIENTO

Utilizar el establecimiento real asociado al movimiento/período.

No escribir:

HUANCHACO - LAS LOMAS

u otro establecimiento de manera fija.

---

# 15. PERÍODO

El período debe corresponder al año del reporte.

Ejemplo:

2026

Debe ser dinámico.

---

# 16. CÓDIGO DE EXISTENCIA

Utilizar:

Producto.codigoExistencia

No modificar el código.

No agregar prefijos.

No generar códigos automáticamente.

---

# 17. TIPO TABLA 5

Obtener desde:

Producto.tipoExistenciaId
→ TipoExistencia

Mostrar el valor real.

No inventar valores.

---

# 18. DESCRIPCIÓN

Obtener:

Producto.descripcion

No utilizar nombres escritos manualmente.

---

# 19. UNIDAD DE MEDIDA

Obtener:

Producto.unidadMedidaId
→ UnidadMedida

Mostrar el valor correspondiente.

---

# 20. MÉTODO DE VALUACIÓN

Obtener:

Producto.metodoValuacion

Actualmente el sistema utiliza:

PEPS

No crear un módulo visual de PEPS.

---

# 21. TABLA PRINCIPAL

La tabla debe reproducir el Excel de Producto Terminado.

Debe contener los grupos correspondientes.

## DOCUMENTO DE TRASLADO / COMPROBANTE DE PAGO

## TIPO DE OPERACIÓN

## ENTRADAS

## SALIDAS

## SALDO FINAL

## MOTIVO DE SALIDA

Y los datos adicionales del registro.

---

# 22. DOCUMENTO DE TRASLADO / COMPROBANTE DE PAGO

Utilizar el documento real asociado al movimiento.

No inventar números.

No generar documentos automáticamente.

---

# 23. TIPO DE OPERACIÓN

Mostrar:

TIPO DE OPERACIÓN
(TABLA 12)

Utilizar:

TipoOperacion

Debe corresponder a la operación registrada.

No inventar operaciones.

---

# 24. ENTRADAS

Grupo:

ENTRADAS

Columnas:

CAN
C. UNT
COSTO TOTAL

Utilizar los valores reales de entrada.

La cantidad corresponde a:

entradaCan

El costo unitario corresponde al valor real registrado/calculado.

El costo total corresponde al valor real del movimiento.

No utilizar peso en kilogramos.

---

# 25. SALIDAS

Grupo:

SALIDAS

Columnas:

CAN
C. UNT
C. TOTAL

Utilizar:

salidaCan
costo unitario de salida
costo total de salida

No utilizar:

salidaPesoTotalKg

porque ese campo pertenece a Base Activa.

---

# 26. SALDO FINAL

Grupo:

SALDO FINAL

Columnas:

CAN
C. UNT
C. TOTAL

El saldo debe ser coherente con el Kardex Producto Terminado.

Debe considerar el historial anterior cuando corresponda.

No calcular simplemente:

Entradas del filtro - Salidas del filtro

si existe saldo anterior al período.

---

# 27. MOTIVO DE SALIDA

Mostrar:

MOTIVO DE SALIDA

Los valores permitidos corresponden a:

PRODUCCION
VENTA
ENSAYO

Utilizar el enum existente:

TipoMotivoPT

No agregar otros motivos.

---

# 28. FACTURA / BOLETA / RECIBO Y GUÍA

Mostrar los datos reales correspondientes:

FACTURA O BOLETA / RECIBO
GUIA

Utilizar los campos existentes en:

MovimientoProductoTerminado

No inventar documentos.

---

# 29. EMPRESA

Mostrar la empresa relacionada con el movimiento cuando corresponda.

No confundir:

Empresa del sistema

con:

Empresa destino del Producto Terminado.

Utilizar el campo real del movimiento.

---

# 30. ING. DE CAMPO

Mostrar:

ING. DE CAMPO

Únicamente cuando exista información real.

No inventar nombres.

---

# 31. FECHA

Utilizar:

MovimientoProductoTerminado.fecha

No utilizar:

createdAt

ni fecha actual.

---

# 32. SERIE

Mostrar:

SERIE

desde el movimiento real.

No generar valores automáticamente.

---

# 33. NÚMERO

Mostrar:

NÚM

desde el movimiento real.

No inventar numeración.

---

# 34. OBSERVACIÓN

Mostrar:

Observación

desde:

MovimientoProductoTerminado.observacion

Mantener el campo independiente de:

- empresa
- responsable
- factura
- guía
- motivo

---

# 35. RESPONSABLE DE DESPACHO

Mostrar:

Responsable de despacho

utilizando el valor real del movimiento.

No inventar responsables.

---

# 36. TIPO T.10

REGLA OBLIGATORIA:

NO mostrar:

TIPO (T.10)

en el formulario.

NO mostrarlo como filtro.

NO agregarlo como columna del nuevo sistema.

El campo aparece en el documento histórico como referencia,
pero el usuario ha definido que NO debe formar parte del sistema.

---

# 37. PRESENTACIÓN

Producto Terminado puede tener presentación.

La presentación debe obtenerse desde:

Presentacion

cuando corresponda.

No utilizar lotes.

No crear presentación automáticamente.

---

# 38. CÓDIGOS DE PRODUCTO

Conservar exactamente los códigos reales de Producto Terminado.

Ejemplos:

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

NO agregar:

PT-
PROD-
TER-

No modificar los códigos.

---

# 39. PRODUCTOS Y PRESENTACIONES

No fusionar códigos diferentes.

Ejemplo:

01
01250
01300

son registros distintos.

Igualmente:

02
02200
02250
02500

son registros diferentes.

No sumar sus stocks como si fueran un único producto.

---

# 40. ORDEN DE MOVIMIENTOS

Ordenar:

fecha ASC

y como segundo criterio:

id ASC

Esto mantiene el orden cronológico.

---

# 41. SALDO

El saldo debe coincidir con Kardex Producto Terminado.

Debe respetar:

ENTRADAS
-
SALIDAS
=
SALDO

y considerar el saldo previo cuando corresponda.

---

# 42. PEPS

El costo de salida debe utilizar la lógica PEPS existente.

No crear una nueva implementación de PEPS.

Utilizar:

CapaPEPSPT
AplicacionPEPSPT

cuando corresponda.

El usuario no debe tener que ejecutar PEPS manualmente desde esta
pantalla.

---

# 43. TOTALES

Al final mostrar:

TOTALES

Calcular dinámicamente:

Total entradas
Total salidas
Saldo final

No escribir valores fijos.

---

# 44. STOCK FINAL

Mostrar:

STOCK AL DD/MM/YYYY: XXXX

La fecha debe corresponder a:

Fecha hasta

La cantidad debe representar el stock real de Producto Terminado
a dicha fecha.

No utilizar valores de ejemplo del Excel.

---

# 45. PLANTILLA / VISTA PRELIMINAR

La pantalla debe incluir:

REPORTE GENERAL PRODUCTO TERMINADO

y una representación de plantilla institucional.

La plantilla debe mantener:

- logo
- razón social
- título
- fecha
- encabezado
- tabla
- totales
- stock
- elaborado por
- aprobado por

cuando estos datos existan.

---

# 46. LOGO

Utilizar el logo institucional existente.

No crear un logo ficticio.

Ubicarlo de acuerdo con el patrón visual del reporte institucional.

---

# 47. BOTONES

Mostrar:

[ Excel ]
[ PDF ]
[ Imprimir ]

Estos botones deben trabajar sobre la consulta actual.

---

# 48. EXCEL

Generar:

.xlsx

No CSV.

El Excel debe representar el reporte oficial.

Debe incluir:

- encabezado
- datos de empresa
- producto
- unidad
- período
- método
- movimientos
- entradas
- salidas
- saldo
- motivo
- documentos
- responsables
- totales

No incluir controles del dashboard.

---

# 49. PDF

Generar PDF institucional.

Debe conservar la estructura del reporte.

Debe ser apto para:

- impresión
- archivo
- presentación

No agregar información inexistente.

---

# 50. IMPRESIÓN

El botón:

Imprimir

debe imprimir solamente el reporte.

Ocultar:

- sidebar
- filtros
- botones
- navegación
- controles del dashboard

Utilizar:

@media print

---

# 51. RESPONSABLE

Si existe información real:

Elaborado por:

[NOMBRE REAL]

[CARGO REAL]

No escribir nombres fijos.

---

# 52. APROBACIÓN

Si existe información real:

Aprobado por:

[NOMBRE / CARGO]

Si no existe:

dejar el espacio correspondiente.

No inventar nombres.

---

# 53. FILTROS Y REPORTE

La consulta realizada debe alimentar:

Reporte Normal
+
Plantilla
+
Excel
+
PDF
+
Impresión

Todos deben mostrar exactamente el mismo conjunto de datos.

---

# 54. SERVICIOS

Reutilizar:

src/lib/services/producto-terminado.service.ts

src/lib/services/stock.service.ts

src/lib/services/peps.service.ts

src/lib/services/reportes.service.ts

según la arquitectura existente.

No duplicar lógica.

---

# 55. PRISMA

No crear nuevas tablas.

Utilizar los modelos existentes:

Producto
Presentacion
MovimientoProductoTerminado
CapaPEPSPT
AplicacionPEPSPT
Empresa
Periodo
Establecimiento
UnidadMedida
TipoExistencia
TipoOperacion

---

# 56. NO USAR MODELOS DE BASE ACTIVA

No utilizar para este reporte:

LoteBaseActiva
MovimientoBaseActiva
CapaPEPSBase
AplicacionPEPSBase

Este reporte es exclusivamente Producto Terminado.

---

# 57. NO MEZCLAR CAMPOS DE BASE ACTIVA

NO mostrar:

- lote
- peso en Kg
- peso unitario Kg
- peso total Kg
- responsable de formulación
- cantidad formulada
- almacenamiento de Base Activa
- motivo de formulación

Estos campos pertenecen a Base Activa.

---

# 58. DIFERENCIA CON RESUMEN PT

Resumen PT:

DESCRIPCIÓN
CÓDIGO
PRESENTACIÓN
STOCK TOTAL
OBSERVACIONES

Reporte General PT:

DETALLE DE MOVIMIENTOS
+
ENTRADAS
+
SALIDAS
+
SALDO
+
MOTIVO
+
DOCUMENTOS
+
RESPONSABLES

No mezclar.

---

# 59. DIFERENCIA CON KARDEX PT

Kardex PT es la consulta operativa de movimientos.

Reporte General PT es la salida formal/oficial del inventario.

Ambos deben utilizar la misma fuente de datos y mantener los mismos
saldos.

---

# 60. DATOS REALES DEL EXCEL

El Excel de referencia contiene productos como:

01 BIO INSECT PW KILOGRAMOS
01250 BIO INSECT PW 250 GRAMOS
01300 BIO INSECT PW 300 GRAMOS

02 BIO BASIANA KILOGRAMOS
02200 BIO BASIANA 200 GRAMOS
02250 BIO BASIANA 250 GRAMOS
02500 BIO BASIANA 500 GRAMOS

03 BIO METARRIL KILOGRAMOS
03200 BIO METARRIL 200 GRAMOS
03250 BIO METARRIL 200 GRAMOS
03500 BIO METARRIL 200 GRAMOS

04 BIO-LILACINUS KILOGRAMOS
04200 BIO LILACINUS 200 GRAMOS

05 BIO FUMOSO KILOGRAMOS

06 BIO LECANII KILOGRAMOS
06500 BIO LECANII 500 GRAMOS

08 BIO TRIX KILOGRAMOS
08200 BIO TRIX 200 GRAMOS
08250 BIO TRIX BOLSA 250 GRAMOS
08500 BIO TRIX BOLSA 500 GRAMOS

09 BIO SUBTILIS POMO DE 1 LITRO
10 PROMOBIOL POMO DE 1 LITRO

15P BIO INSECT POWER POMO DE 1 LITRO
1518 BIO INSECT POWER BIDON 18 LITROS

16 BIO BT POMO DE 1 LITRO

Estos nombres son referencia del Excel.

NO introducirlos como datos fijos.

Deben obtenerse de Producto y Presentacion.

---

# 61. AGRUPACIÓN

La presentación debe mostrarse correctamente.

No agrupar:

01
01250
01300

como un único registro.

Cada código representa un producto registrado.

---

# 62. CAMPOS VACÍOS

Cuando un campo no corresponda:

dejarlo vacío.

No convertir automáticamente a:

0
N/A
-

si el formato oficial utiliza celdas vacías.

---

# 63. COSTOS

Los costos mostrados deben corresponder a los valores reales del
sistema y a la lógica PEPS existente.

No inventar:

- costo unitario
- costo total
- precio
- valor de venta

No utilizar precio de venta como costo.

---

# 64. NO AGREGAR CAMPOS COMERCIALES

No agregar:

- precio de venta
- margen
- utilidad
- descuento
- IGV
- proveedor
- costo comercial

salvo que formen parte explícita del modelo/reporte existente.

---

# 65. RENDIMIENTO

Aplicar filtros directamente en Prisma cuando sea posible.

Filtrar por:

Producto
Fecha

No cargar información innecesaria.

El cálculo del saldo debe considerar únicamente el historial necesario.

---

# 66. SEGURIDAD

Respetar los permisos existentes.

No modificar el sistema de permisos.

No crear permisos nuevos salvo que sean estrictamente necesarios
para el acceso a esta pantalla.

---

# 67. AUDITORÍA

La consulta del reporte no debe modificar inventario.

No crear movimientos.

No modificar capas PEPS.

No modificar stock.

---

# 68. DISEÑO VISUAL

Mantener el mismo patrón del:

Resumen Base Activa
+
Reporte General Base Activa

Utilizar:

- fondo claro
- tarjetas blancas
- verde institucional
- tabla compacta
- encabezados agrupados
- bordes discretos
- botones Excel/PDF/Imprimir
- vista institucional

No utilizar un CRUD genérico.

---

# 69. ESTRUCTURA VISUAL

PRODUCTO TERMINADO
>
REPORTE GENERAL

┌──────────────────────────────────────────────────────────────┐
│ Producto │ Fecha desde │ Fecha hasta │ Consultar │ Limpiar  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ REPORTE GENERAL PRODUCTO TERMINADO    Excel PDF Imprimir    │
│                                                              │
│ REGISTRO DE INVENTARIO PERMANENTE VALORIZADO                 │
│ - DETALLE DEL INVENTARIO VALORIZADO - PRODUCTO TERMINADO     │
│                                                              │
│ PERÍODO:                         2026                         │
│ RUC:                             [REAL]                       │
│ DENOMINACIÓN:                    [REAL]                       │
│ ESTABLECIMIENTO:                 [REAL]                       │
│ CÓDIGO EXISTENCIA:               [REAL]                       │
│ TIPO TABLA 5:                    [REAL]                       │
│ DESCRIPCIÓN:                     [REAL]                       │
│ UNIDAD TABLA 6:                  [REAL]                       │
│ MÉTODO VALUACIÓN:                PEPS                         │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ DOCUMENTO │ OPERACIÓN │ ENTRADAS │ SALIDAS │ SALDO │... │ │
│ ├───────────┼───────────┼──────────┼─────────┼───────┼────┤ │
│ │ ...       │ ...       │ ...      │ ...     │ ...   │... │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ TOTALES                                                      │
│                                                              │
│ STOCK AL DD/MM/YYYY: XXXX                                    │
│                                                              │
│ Elaborado por:                     Aprobado por:             │
└──────────────────────────────────────────────────────────────┘

---

# 70. REGLA DE FUENTES

EXCEL:

define las columnas y estructura oficial.

IMAGEN:

define el aspecto visual.

POSTGRESQL:

define los datos reales.

PRISMA:

define las relaciones.

KARDEX PT:

define la coherencia de movimientos y saldos.

PEPS:

define la valorización.

No reemplazar estas fuentes entre sí.

---

# 71. NO HACER

NO:

- crear lotes
- utilizar lotes Base Activa
- utilizar peso Kg de Base Activa
- utilizar formulación Base Activa
- agregar T.10
- inventar documentos
- inventar facturas
- inventar guías
- inventar responsables
- inventar ingenieros
- inventar empresas
- inventar fechas
- inventar costos
- inventar stock
- copiar valores de imágenes como datos
- modificar códigos
- crear productos
- crear presentaciones
- modificar Kardex PT
- modificar Registrar Movimiento PT
- modificar Productos
- modificar Configuración
- modificar Catálogos
- crear menú Reportes
- crear menú PEPS
- crear tablas Prisma innecesarias
- duplicar PEPS
- duplicar cálculo de stock
- exportar CSV

---

# 72. PRUEBAS OBLIGATORIAS

Probar:

1. Todos los productos.
2. Un producto.
3. Fecha completa.
4. Rango de fechas.
5. Producto + rango.
6. Sin resultados.
7. Movimiento de entrada.
8. Movimiento de salida.
9. Producción.
10. Venta.
11. Ensayo.
12. Documentos.
13. Serie.
14. Número.
15. Observación.
16. Responsable.
17. Saldo anterior al período.
18. PEPS.
19. Excel.
20. PDF.
21. Impresión.
22. Reporte Normal.
23. Plantilla.

---

# 73. VALIDACIÓN FINAL

[ ] Ruta correcta.

[ ] Menú correcto.

[ ] No se modificaron módulos existentes.

[ ] Solo aparecen productos PT.

[ ] No aparece lote.

[ ] No aparece T.10.

[ ] Producto filtra correctamente.

[ ] Fecha desde funciona.

[ ] Fecha hasta funciona.

[ ] Movimientos correctos.

[ ] Entradas correctas.

[ ] Salidas correctas.

[ ] Saldo correcto.

[ ] PEPS correcto.

[ ] Producción correcta.

[ ] Venta correcta.

[ ] Ensayo correcto.

[ ] Factura/boleta/recibo correcto.

[ ] Guía correcta.

[ ] Empresa correcta.

[ ] Ingeniero de campo correcto.

[ ] Serie correcta.

[ ] Número correcto.

[ ] Observación correcta.

[ ] Responsable de despacho correcto.

[ ] Totales dinámicos.

[ ] Stock final correcto.

[ ] Reporte Normal correcto.

[ ] Plantilla correcta.

[ ] Excel correcto.

[ ] PDF correcto.

[ ] Impresión correcta.

[ ] Logo real.

[ ] Empresa real.

[ ] Fechas dinámicas.

[ ] No existen datos fijos.

[ ] No existen datos ficticios.

[ ] No se crean tablas nuevas innecesarias.

[ ] No se duplica PEPS.

[ ] No se duplica Stock.