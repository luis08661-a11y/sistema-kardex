# SKILL: RESUMEN PRODUCTO TERMINADO
# REPORTE NORMAL + PLANTILLA / VISTA PRELIMINAR

## 1. OBJETIVO

Crear el módulo:

PRODUCTO TERMINADO
└── Resumen Producto Terminado

El módulo debe mostrar el inventario actual de Producto Terminado
en dos formatos:

1. REPORTE NORMAL
2. PLANTILLA / VISTA PRELIMINAR

Ambos deben utilizar exactamente los mismos datos reales obtenidos
desde PostgreSQL mediante Prisma.

NO utilizar datos ficticios.
NO escribir stocks fijos.
NO escribir productos fijos.
NO escribir fechas fijas.
NO inventar presentaciones.
NO inventar observaciones.

---

# 2. MÓDULOS QUE NO DEBEN MODIFICARSE

NO modificar:

- Configuración
- Catálogos
- Productos
- Lotes
- Kardex Producto Terminado
- Registrar Movimiento PT
- Usuarios
- Base Activa

Crear solamente el nuevo:

PRODUCTO TERMINADO
└── Resumen Producto Terminado

---

# 3. RUTA

Crear:

src/app/dashboard/producto-terminado/resumen/

Estructura sugerida:

src/app/dashboard/producto-terminado/resumen/
├── page.tsx
└── resumen-producto-terminado-module.tsx

Respetar la estructura real del proyecto si es diferente.

---

# 4. MENÚ

El menú debe mantenerse:

PRODUCTO TERMINADO
├── Kardex Producto Terminado
├── Resumen Producto Terminado
├── Reporte General
└── Registrar Movimiento PT

No crear:

- Reportes
- Reportes de Stock
- PEPS
- Capas PEPS
- Stock técnico

---

# 5. CONCEPTO

Este módulo representa un:

CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO

No es el Kardex.

No es el Reporte General.

No es el reporte detallado de movimientos.

Su objetivo es mostrar:

PRODUCTO
+
CÓDIGO
+
PRESENTACIÓN
+
STOCK TOTAL
+
OBSERVACIONES

---

# 6. FILTROS

Utilizar filtros que correspondan al resumen de Producto Terminado.

Filtros:

- Producto
- Fecha a consultar

Diseño:

Producto                    Fecha a consultar

[Todos los productos]       [DD/MM/YYYY]

[ Consultar ] [ Limpiar ]

No agregar:

- Lote
- Fecha desde
- Fecha hasta

El resumen PT no utiliza lote porque Producto Terminado
NO maneja lotes en este sistema.

---

# 7. FILTRO PRODUCTO

Mostrar únicamente productos:

tipoInventario = PRODUCTO_TERMINADO

Utilizar los productos existentes en Producto.

No crear una lista manual.

---

# 8. FECHA A CONSULTAR

La fecha representa:

"Stock de Producto Terminado a esta fecha".

Ejemplo:

21/08/2026

El stock debe considerar todos los movimientos PT hasta esa fecha.

No incluir movimientos posteriores.

---

# 9. TABLA DEL REPORTE NORMAL

Mostrar:

REPORTE NORMAL

Columnas EXACTAS:

DESCRIPCIÓN
CÓDIGO
PRESENTACIÓN
STOCK TOTAL
OBSERVACIONES

No agregar:

- lote
- costo PEPS
- usuario
- proveedor
- cliente
- factura
- guía
- ingeniero de campo
- fecha de movimiento
- motivo de salida
- serie
- número

Esos datos corresponden al Kardex o Reporte General.

---

# 10. DESCRIPCIÓN

Obtener:

Producto.descripcion

No escribir nombres manualmente.

---

# 11. CÓDIGO

Obtener:

Producto.codigo

Conservar exactamente los códigos registrados.

Los códigos PT existentes incluyen referencias como:

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

NO modificar.

NO agregar prefijo PT-.

NO convertir códigos.

---

# 12. PRESENTACIÓN

Obtener la presentación real relacionada al producto.

Utilizar:

Presentacion

No inventar presentaciones.

Las presentaciones pueden corresponder a:

Kilogramos
250 gramos
300 gramos
200 gramos
500 gramos
1 litro
18 litros

pero solamente mostrar el valor que realmente esté registrado.

---

# 13. STOCK TOTAL

El stock debe calcularse con los movimientos reales de Producto Terminado
hasta la fecha seleccionada.

Regla:

ENTRADAS - SALIDAS

La unidad debe corresponder al producto.

Para PT el stock se maneja por cantidad:

entradaCan
-
salidaCan

No utilizar:

peso de Base Activa.

---

# 14. STOCK Y PRESENTACIÓN

El stock debe agruparse correctamente por:

Producto
+
Presentación

No mezclar productos diferentes.

No mezclar presentaciones diferentes.

Ejemplo:

BIO INSECT PW KILOGRAMOS

y:

BIO INSECT PW 250 GRAMOS

son productos/presentaciones diferentes.

No sumarlos como uno solo.

---

# 15. OBSERVACIONES

Mostrar únicamente la observación correspondiente cuando exista.

No utilizar Observaciones para almacenar:

- empresa
- factura
- guía
- ingeniero
- responsable
- motivo
- presentación

No mezclar campos.

---

# 16. REPORTE NORMAL

Diseño:

REPORTE NORMAL

[ Excel ] [ PDF ] [ Imprimir ]

TABLA:

DESCRIPCIÓN | CÓDIGO | PRESENTACIÓN | STOCK TOTAL | OBSERVACIONES

Al final:

TOTAL GENERAL

El total debe calcularse dinámicamente.

---

# 17. PLANTILLA / VISTA PRELIMINAR

Debajo del reporte normal mostrar:

PLANTILLA / VISTA PRELIMINAR

Debe representar el formato institucional mostrado en las referencias
del sistema.

Encabezado:

LOGO

BIOALTERNATIVA E&F S.A.C.

CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO

Fecha: DD/MM/YYYY

---

# 18. TABLA DE LA PLANTILLA

Columnas:

DESCRIPCIÓN
CODIGO
PRESENTACIÓN
STOCK TOTAL
OBSERVACIONES

No agregar columnas.

No agregar lotes.

---

# 19. PRESENTACIONES

Respetar la diferencia entre productos principales y presentaciones
pequeñas.

Ejemplos de productos principales:

01
02
03
04
05
06
08
09
10
15P
1518
16

Y presentaciones:

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

Estos valores son referencias de los datos existentes.

No codificarlos manualmente.

---

# 20. OBSERVACIONES INSTITUCIONALES

Las observaciones deben salir de los datos reales.

Ejemplos visuales del formato pueden mostrar:

Kilogramos
Litros
Bidones
Bolsas

Pero NO escribir estos textos como valores fijos.

Deben proceder de la información real de presentación/unidad
correspondiente.

---

# 21. TOTAL GENERAL

Mostrar:

TOTAL GENERAL

El valor debe ser dinámico.

No usar valores fijos provenientes de la imagen.

---

# 22. FECHA DEL INFORME

Mostrar:

Informe al DD-MM-YYYY

La fecha debe corresponder a:

Fecha a consultar.

No usar una fecha fija.

---

# 23. LOGO

Utilizar el logo institucional existente.

No crear un logo nuevo.

No utilizar un logo ficticio.

---

# 24. EMPRESA

Obtener la información real de:

Empresa

Utilizar:

ruc
razonSocial

No escribir la razón social directamente en el componente.

---

# 25. ESTABLECIMIENTO

Si la plantilla existente requiere establecimiento,
utilizar el establecimiento real.

No inventar:

HUANCHACO - LAS LOMAS

ni ningún otro establecimiento.

---

# 26. ELABORADO POR

Si existe información real del responsable:

mostrar:

Elaborado por:
[NOMBRE]

[CARGO]

No inventar nombres.

Si no existe información:

mantener el espacio institucional correspondiente.

---

# 27. APROBADO POR

Mostrar solamente si existe información real.

No inventar:

Ing. Responsable

No inventar nombres ni cargos.

---

# 28. BOTONES

Reporte Normal:

[ Excel ]
[ PDF ]
[ Imprimir ]

Plantilla:

[ Excel ]
[ PDF ]
[ Imprimir ]

---

# 29. EXCEL

Exportar:

.xlsx

No CSV.

El Excel debe contener:

- título
- fecha
- empresa
- tabla
- total

Debe representar los datos actuales de la consulta.

No incluir menú ni controles de pantalla.

---

# 30. PDF

Generar PDF institucional.

Debe contener:

- logo
- razón social
- título
- fecha
- tabla
- total
- responsable cuando exista
- aprobación cuando exista

---

# 31. IMPRESIÓN

Imprimir solamente la plantilla/reporte.

Ocultar:

- sidebar
- filtros
- botones
- navegación
- elementos del dashboard

Utilizar:

@media print

---

# 32. SERVICIOS

Reutilizar los servicios existentes.

Preferentemente:

src/lib/services/stock.service.ts

src/lib/services/producto-terminado.service.ts

src/lib/services/reportes.service.ts

No duplicar la lógica de stock.

---

# 33. PRISMA

NO crear tablas.

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

---

# 34. PEPS

No implementar PEPS en la interfaz.

El stock debe utilizar la lógica existente.

No crear pantalla PEPS.

No agregar PEPS al menú.

---

# 35. PRODUCTO TERMINADO NO USA LOTE

Regla obligatoria:

NO mostrar Lote en este módulo.

No utilizar:

LoteBaseActiva

para calcular Producto Terminado.

---

# 36. NO MEZCLAR BASE ACTIVA

No mostrar productos:

BB
MA
PL
IF
LL
TA
TH
TV

como productos Base Activa dentro de este resumen.

Este módulo debe consultar:

PRODUCTO_TERMINADO

---

# 37. DIFERENCIA CON KARDEX PT

Kardex PT:

- movimientos
- entradas
- salidas
- saldo
- documentos
- motivos
- responsables

Resumen PT:

- descripción
- código
- presentación
- stock
- observaciones

No mezclar.

---

# 38. DIFERENCIA CON REPORTE GENERAL PT

Resumen:

DESCRIPCIÓN
CÓDIGO
PRESENTACIÓN
STOCK TOTAL
OBSERVACIONES

Reporte General:

DETALLE COMPLETO DE MOVIMIENTOS

El Reporte General se implementará posteriormente.

---

# 39. ORDEN

Ordenar por:

DESCRIPCIÓN
CÓDIGO

Mantener un orden estable.

---

# 40. DATOS VACÍOS

Si no existe observación:

dejar vacío.

No mostrar automáticamente:

N/A
-
Sin observación

salvo que ese texto esté realmente registrado.

---

# 41. FILTROS Y CONSULTA

Al presionar:

Consultar

la pantalla debe actualizar:

Reporte Normal
+
Plantilla

con la misma consulta.

No tener resultados diferentes entre ambas vistas.

---

# 42. LIMPIAR

El botón:

Limpiar

debe regresar:

Producto = Todos
Fecha = valor predeterminado correspondiente

y limpiar la consulta.

No borrar datos de la base de datos.

---

# 43. RENDIMIENTO

Aplicar filtros desde la consulta siempre que sea posible.

No cargar todos los movimientos si no son necesarios.

La consulta debe limitarse a:

Producto Terminado
+
Fecha seleccionada

---

# 44. VALIDACIONES

Validar:

- producto existente
- producto pertenece a PT
- fecha válida
- presentación válida

No permitir productos Base Activa.

---

# 45. DISEÑO

Mantener el mismo patrón visual utilizado en:

Resumen Base Activa

Utilizar:

- fondo claro
- tarjetas blancas
- verde institucional
- tablas compactas
- botones de exportación
- vista previa institucional
- bordes discretos

No convertir la pantalla en CRUD genérico.

---

# 46. RESULTADO ESPERADO

PRODUCTO TERMINADO > RESUMEN PRODUCTO TERMINADO

┌──────────────────────────────────────────────────────────────┐
│ Producto                    Fecha a consultar                │
│ [Todos]                     [DD/MM/YYYY]                     │
│                                                              │
│              [Consultar] [Limpiar]                           │
└──────────────────────────────────────────────────────────────┘


REPORTE NORMAL

┌──────────────────────────────────────────────────────────────┐
│                         Excel  PDF  Imprimir                  │
│                                                              │
│ DESCRIPCIÓN | CÓDIGO | PRESENTACIÓN | STOCK TOTAL | OBSERV. │
│                                                              │
│ ...                                                          │
│                                                              │
│ TOTAL GENERAL                         XXXX                    │
└──────────────────────────────────────────────────────────────┘


PLANTILLA / VISTA PRELIMINAR

┌──────────────────────────────────────────────────────────────┐
│ LOGO                                                         │
│                                                              │
│              BIOALTERNATIVA E&F S.A.C.                       │
│      CUADRO RESUMEN DE INVENTARIO PRODUCTO TERMINADO         │
│                                      Fecha: DD/MM/YYYY       │
│                                                              │
│ DESCRIPCIÓN | CODIGO | PRESENTACIÓN | STOCK TOTAL | OBSERV. │
│                                                              │
│ ...                                                          │
│                                                              │
│ Informe al DD-MM-YYYY                                        │
│                                                              │
│       Elaborado por:              Aprobado por:              │
└──────────────────────────────────────────────────────────────┘

---

# 47. REGLA PRINCIPAL

FORMATO:

Excel + imágenes de referencia

FUENTE DE DATOS:

PostgreSQL + Prisma

STOCK:

Lógica existente de Producto Terminado

PRESENTACIÓN:

Producto + Presentacion

No utilizar datos escritos manualmente.

---

# 48. NO HACER

NO:

- crear datos demo
- crear productos
- crear presentaciones ficticias
- crear lotes
- usar lotes Base Activa
- modificar Kardex PT
- modificar Registrar Movimiento PT
- modificar Productos
- modificar Catálogos
- crear menú Reportes
- crear menú PEPS
- agregar campos de Base Activa
- agregar costos si no corresponden al resumen
- agregar facturas
- agregar guías
- agregar clientes
- agregar proveedores
- inventar responsables
- inventar firmas
- inventar fechas
- inventar stock
- copiar valores de la imagen como datos
- exportar CSV

---

# 49. PRUEBAS

Probar:

1. Todos los productos PT.
2. Un producto.
3. Fecha actual.
4. Fecha histórica.
5. Producto + fecha.
6. Sin resultados.
7. Producto inexistente.
8. Stock antes y después de movimientos.
9. Productos con diferentes presentaciones.
10. Excel.
11. PDF.
12. Impresión.
13. Reporte Normal.
14. Plantilla.

---

# 50. VALIDACIÓN FINAL

[ ] Ruta correcta.

[ ] Menú no modificado innecesariamente.

[ ] Productos PT cargados desde BD.

[ ] No aparecen productos Base Activa.

[ ] No aparece Lote.

[ ] Producto filtra correctamente.

[ ] Fecha filtra correctamente.

[ ] Stock coincide con Kardex PT.

[ ] Presentación correcta.

[ ] Observaciones correctas.

[ ] Total correcto.

[ ] Reporte Normal correcto.

[ ] Plantilla correcta.

[ ] Excel funciona.

[ ] PDF funciona.

[ ] Imprimir funciona.

[ ] Logo real.

[ ] Empresa real.

[ ] Fecha dinámica.

[ ] No existen datos fijos.

[ ] No existen datos ficticios.

[ ] No se modificaron módulos terminados.

[ ] No se crearon tablas nuevas innecesarias.