# SKILL: REPORTE GENERAL BASE ACTIVA

## 1. OBJETIVO

Crear el módulo:

BASE ACTIVA (MATERIA PRIMA)
└── REPORTE GENERAL

Este módulo debe generar el reporte oficial detallado de Base Activa,
siguiendo el formato del Registro de Inventario Permanente Valorizado
mostrado en el Excel y en la imagen de referencia.

El reporte debe mostrar:

1. Reporte detallado en pantalla.
2. Vista oficial de impresión.
3. Exportación Excel.
4. Exportación PDF.
5. Impresión.

El reporte debe utilizar exclusivamente los datos reales existentes
en PostgreSQL mediante Prisma.

NO utilizar datos ficticios.
NO escribir datos de ejemplo de forma fija.
NO inventar productos.
NO inventar lotes.
NO inventar movimientos.
NO inventar responsables.
NO inventar fechas.
NO agregar información que no corresponda.

---

# 2. MÓDULOS EXISTENTES QUE NO DEBEN MODIFICARSE

NO modificar:

- Configuración
- Catálogos
- Productos
- Lotes
- Kardex Base Activa
- Registrar Movimiento BA
- Usuarios

Estos módulos ya están creados.

El nuevo desarrollo corresponde únicamente a:

BASE ACTIVA
└── Reporte General

Y a los archivos estrictamente necesarios para soportarlo.

---

# 3. RUTA

Crear:

src/app/dashboard/base-activa/reporte-general/

Por ejemplo:

src/app/dashboard/base-activa/reporte-general/
├── page.tsx
└── reporte-general-base-activa-module.tsx

Respetar la arquitectura existente del proyecto.

No crear un módulo global llamado "Reportes".

---

# 4. MENÚ

El menú debe continuar siendo:

BASE ACTIVA (MATERIA PRIMA)
├── Kardex Activa
├── Resumen Base Activa
├── Reporte General
└── Registrar Movimiento BA

No agregar:

- Reportes
- Reportes de Stock
- PEPS
- Capas PEPS
- Stock técnico

PEPS y stock son lógica interna.

---

# 5. OBJETIVO DEL REPORTE

El reporte representa:

REGISTRO DE INVENTARIO PERMANENTE VALORIZADO
- DETALLE DEL INVENTARIO VALORIZADO -
BASE ACTIVA

Debe permitir consultar el detalle de movimientos de Base Activa
en un período determinado.

No es un resumen de stock.

No sustituye al Resumen Base Activa.

---

# 6. FILTROS

Los filtros deben ser únicamente los que corresponden al reporte.

Filtros principales:

- Producto
- Lote
- Fecha desde
- Fecha hasta

Diseño:

Producto       Lote             Fecha desde       Fecha hasta

[Todos]        [Todos]          [01/08/2026]      [31/08/2026]

[ Consultar ]  [ Limpiar ]

---

# 7. FILTRO PRODUCTO

El selector Producto debe obtener productos reales de Base Activa.

No mostrar productos de Producto Terminado.

Los productos de Base Activa deben identificarse mediante:

Producto.tipoInventario = BASE_ACTIVA

No crear una lista manual.

---

# 8. FILTRO LOTE

El selector Lote debe obtener:

LoteBaseActiva

El lote debe estar relacionado con el producto seleccionado.

Si Producto = Todos:

mostrar todos los lotes Base Activa.

Si se selecciona un producto:

mostrar únicamente sus lotes.

Ejemplo:

Producto:
Metarhizium anisopliae

Lotes:

MA2601-01
MA2604-02
MA2604-03

No mostrar lotes de otros productos.

---

# 9. FILTRO FECHA

Debe existir:

Fecha desde
Fecha hasta

Ejemplo:

01/08/2026
31/08/2026

El reporte debe mostrar solamente movimientos cuya fecha esté
dentro del rango seleccionado.

Fecha >= Fecha desde

Fecha <= Fecha hasta

No incluir movimientos fuera del período.

---

# 10. VALIDACIÓN DE FECHAS

Si:

Fecha desde > Fecha hasta

mostrar error de validación.

No ejecutar la consulta.

Si no existe fecha desde:

permitir consultar desde el inicio de información disponible.

Si no existe fecha hasta:

utilizar la última fecha disponible o la fecha actual según la lógica
existente del proyecto.

No inventar fechas.

---

# 11. BOTONES

En la parte superior del reporte:

[ Excel ]
[ PDF ]
[ Imprimir ]

Todos deben utilizar exactamente los datos de la consulta actual.

No ejecutar una consulta diferente para cada formato.

---

# 12. ENCABEZADO OFICIAL

La vista del reporte debe reproducir el encabezado del Excel.

Título:

REGISTRO DE INVENTARIO PERMANENTE VALORIZADO
- DETALLE DEL INVENTARIO VALORIZADO -
BASE ACTIVA

Debajo:

PERÍODO:
RUC:
DENOMINACIÓN O RAZÓN SOCIAL:
ESTABLECIMIENTO:
CÓDIGO DE LA EXISTENCIA:
TIPO (TABLA 5):
DESCRIPCIÓN:
CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):
MÉTODO DE VALUACIÓN:

---

# 13. ORIGEN DE LOS DATOS DEL ENCABEZADO

PERÍODO:

Obtener del período seleccionado/relacionado con el reporte.

RUC:

Obtener de Empresa.ruc.

DENOMINACIÓN O RAZÓN SOCIAL:

Obtener de Empresa.razonSocial.

ESTABLECIMIENTO:

Obtener del establecimiento correspondiente.

CÓDIGO DE LA EXISTENCIA:

Obtener de Producto.codigoExistencia.

TIPO (TABLA 5):

Obtener del TipoExistencia relacionado al producto.

DESCRIPCIÓN:

Obtener de Producto.descripcion.

CÓDIGO DE LA UNIDAD DE MEDIDA (TABLA 6):

Obtener de UnidadMedida relacionada.

MÉTODO DE VALUACIÓN:

Obtener de Producto.metodoValuacion.

Actualmente debe corresponder a:

PEPS

No escribir PEPS como dato independiente si el producto ya lo tiene
registrado.

---

# 14. REGLA PARA EL ENCABEZADO

El encabezado corresponde al producto cuando el reporte está filtrado
por un producto.

Si se seleccionan múltiples productos:

NO inventar un único código de existencia o una única descripción.

En ese caso:

- mostrar información general de empresa/período/establecimiento
- permitir que el detalle contenga los diferentes productos

Si el formato oficial requiere una ficha individual por producto,
generar una sección por cada producto.

No mezclar códigos de existencia incompatibles.

---

# 15. TABLA PRINCIPAL

La tabla debe seguir la estructura del Excel.

Primer grupo:

DETALLE DEL REGISTRO

Columnas:

FECHA
CÓDIGO
DESCRIPCIÓN
OBSERVACIÓN
RESPONSABLE DEL REGISTRO

---

# 16. TIPO DE OPERACIÓN

Segundo grupo:

TIPO DE OPERACIÓN

Columna:

TIPO DE OPERACIÓN
(TABLA 12)

Utilizar el nombre de la operación existente en:

TipoOperacion

Ejemplos reales pueden incluir:

INVENTARIO INICIAL

No crear operaciones adicionales.

---

# 17. ENTRADAS

Grupo:

ENTRADAS

Columnas:

UND
PESO UNITARIO
PESO TOTAL

Para cada movimiento:

entradaUnd
entradaPesoUnitarioKg
entradaPesoTotalKg

Mostrar vacío cuando no corresponda.

No colocar 0 si el formato existente utiliza celda vacía.

Mantener la representación del Excel.

---

# 18. SALIDAS

Grupo:

SALIDAS

Columnas:

UND
PESO UNITARIO
PESO TOTAL

Utilizar:

salidaUnd
salidaPesoUnitarioKg
salidaPesoTotalKg

Mostrar solamente cuando corresponda al movimiento.

---

# 19. SALDO FINAL

Grupo:

SALDO FINAL

Columnas:

UND
PESO UNITARIO
PESO TOTAL

Utilizar el saldo correspondiente al movimiento.

El saldo debe ser coherente con Kardex Base Activa.

No calcular un saldo diferente al utilizado por el Kardex.

---

# 20. MOTIVO DE SALIDA

Grupo:

MOTIVO DE SALIDA

Subcampo:

FORMULACIÓN

Y:

Tipo

Mostrar únicamente información existente.

No agregar:

Venta
Producción
Ensayo

porque esos motivos pertenecen al Producto Terminado.

En Base Activa utilizar únicamente los datos correspondientes a
formulación/motivo existentes.

---

# 21. REGISTRO DE CANTIDAD FINAL DE BASE ACTIVA

Grupo:

REGISTRO DE CANTIDAD FINAL DE BASE ACTIVA

Columnas:

RESPONSABLE DE LA FORMULACIÓN
CANTIDAD DE PRODUCTO FORMULADO
ALMACENAMIENTO

Utilizar:

responsableFormulacion
cantidadProductoFormuladoKg
almacenamiento

No confundir:

OBSERVACIÓN

con:

ALMACENAMIENTO

Son campos diferentes.

---

# 22. OBSERVACIÓN Y ALMACENAMIENTO

Regla obligatoria:

OBSERVACIÓN ≠ ALMACENAMIENTO

Ejemplo:

Observación:
CUARTO FRIO

Almacenamiento:
CUARTO FRIO

Aunque puedan tener el mismo texto en determinados registros,
siguen siendo conceptos diferentes.

No copiar automáticamente uno sobre otro.

---

# 23. RESPONSABLE

RESPONSABLE DEL REGISTRO:

Debe provenir del usuario/responsable asociado al movimiento.

No escribir nombres fijos.

Ejemplo de referencia del Excel:

YOBER GARCIA CABRERA

Este valor solamente debe aparecer si existe realmente en la base
de datos.

---

# 24. FECHA

La fecha de cada fila debe provenir de:

MovimientoBaseActiva.fecha

No utilizar:

- fecha actual
- fecha de creación
- fecha de actualización

si no corresponde a la fecha del movimiento.

---

# 25. CÓDIGO

La columna:

CÓDIGO

debe utilizar el código del producto registrado en el sistema.

Ejemplos de Base Activa:

BB
MA
PL
IF
LL
TA
TH
TV

No agregar prefijos.

No modificar los códigos.

---

# 26. DESCRIPCIÓN

Debe mostrar la descripción real del producto.

Ejemplos:

Beauveria bassiana
Metarhizium anisopliae
Purpureocillium lilacinum
Isaria fumosorosea
Lecanicillium lecanii
Trichoderma asperellum
Trichoderma harzianum
Trichoderma viride

No escribir manualmente estas descripciones.

Obtenerlas de Producto.

---

# 27. LOTE

El Excel de referencia utiliza el lote dentro del código/detalle
del registro.

El reporte debe mostrar el lote real asociado:

MovimientoBaseActiva.lote

No crear lotes.

No modificar códigos de lote.

Ejemplos de referencia:

MA2601-01
MA2604-02
MA2604-03

---

# 28. ORDEN DE LOS MOVIMIENTOS

Ordenar cronológicamente:

fecha ASC

En caso de empate:

id ASC

Esto garantiza que el reporte tenga un orden determinístico.

---

# 29. SALDO

El saldo debe seguir la lógica del Kardex Base Activa.

Para peso:

saldoPesoTotalKg

Debe ser coherente con:

Entradas - Salidas

considerando el historial anterior cuando sea necesario para obtener
el saldo correcto a la fecha del reporte.

No calcular simplemente:

SUM(entradas del filtro) - SUM(salidas del filtro)

si eso produce un saldo incorrecto por existir stock anterior al
rango consultado.

---

# 30. STOCK FINAL

Al final del reporte mostrar:

STOCK AL DD/MM/YYYY: XXX KG

La fecha debe corresponder a:

Fecha hasta

El valor debe ser el stock real de Base Activa a esa fecha.

No usar un valor fijo.

---

# 31. FILTRO Y STOCK INICIAL

Cuando se consulte:

01/08/2026 - 31/08/2026

pero exista stock anterior al 01/08/2026:

El reporte debe considerar el saldo previo para construir correctamente
el saldo acumulado.

No perder el saldo anterior solamente porque el movimiento está fuera
del filtro visual.

La consulta de movimientos y el cálculo del saldo son conceptos
diferentes.

---

# 32. TOTALES

Al final de la tabla mostrar:

TOTALES

Los totales deben calcularse dinámicamente.

Para entradas:

Total unidades
Total peso

Para salidas:

Total unidades
Total peso

Para saldo:

Saldo final real

No escribir:

531

u otro número fijo.

---

# 33. REFERENCIA REAL DE LA IMAGEN

La imagen contiene movimientos como:

12/08/2026
MA2601-01
MA
INVENTARIO INICIAL
saldo 120 KG

12/08/2026
MA2601-01
MA
INVENTARIO INICIAL
saldo 4 KG

12/08/2026
MA2601-01
MA
INVENTARIO INICIAL
saldo 8 KG

12/08/2026
MA2604-02
MA
INVENTARIO INICIAL
saldo 216 KG

12/08/2026
MA2604-03
MA
INVENTARIO INICIAL
saldo 180 KG

12/08/2026
MA2604-03
MA
INVENTARIO INICIAL
saldo 3 KG

Estos datos sirven únicamente para validar que el diseño coincide
con el documento de referencia.

NO codificarlos como datos iniciales.

El sistema debe obtenerlos de PostgreSQL.

---

# 34. DISEÑO VISUAL

La pantalla debe seguir el patrón del prototipo existente.

Utilizar:

- fondo claro
- tarjetas blancas
- verde institucional
- bordes discretos
- tabla compacta
- encabezados agrupados
- controles de filtro
- botones de exportación
- diseño administrativo

No utilizar un CRUD genérico.

---

# 35. TABLA AGRUPADA

La tabla debe tener encabezados agrupados visualmente.

Ejemplo:

┌──────────────────────┬──────────────┬───────────────┬─────────────┐
│ DETALLE DEL REGISTRO │ TIPO OPERACIÓN│ ENTRADAS      │ SALIDAS     │
├────┬────┬────┬───────┼──────────────┼────┬────┬─────┼────┬────┬────┤
│FECHA│COD│DESC│OBSERV.│ TABLA 12     │UND │P.U.│TOTAL│UND │P.U.│TOTAL│
└────┴────┴────┴───────┴──────────────┴────┴────┴─────┴────┴────┴────┘

Continuar con:

SALDO FINAL
MOTIVO DE SALIDA
REGISTRO DE CANTIDAD FINAL DE BASE ACTIVA

---

# 36. COLORES DE LOS GRUPOS

Seguir el Excel de referencia.

DETALLE DEL REGISTRO:
verde

TIPO DE OPERACIÓN:
verde

ENTRADAS:
verde

SALIDAS:
verde

SALDO FINAL:
azul

MOTIVO DE SALIDA:
verde

REGISTRO DE CANTIDAD FINAL:
verde claro

No exagerar los colores.

La prioridad es reproducir el formato institucional.

---

# 37. LOGO

Utilizar el logo institucional existente en el proyecto.

No crear otro logo.

No utilizar un logo ficticio.

Ubicarlo en la zona superior derecha del reporte, siguiendo la
referencia del Excel.

---

# 38. INFORMACIÓN DE EMPRESA

Utilizar:

Empresa.ruc
Empresa.razonSocial

No escribir:

BIOALTERNATIVA E&F S.A.C.

como texto fijo.

Debe provenir de la configuración de empresa existente.

---

# 39. ESTABLECIMIENTO

Utilizar el establecimiento real seleccionado/asociado.

Ejemplo de referencia:

HUANCHACO - LAS LOMAS

No escribirlo fijo.

Obtenerlo de:

Establecimiento

---

# 40. MÉTODO DE VALUACIÓN

Mostrar:

PEPS

cuando el producto tenga:

MetodoValuacion.PEPS

No crear una pantalla PEPS.

La lógica PEPS continúa siendo interna.

---

# 41. EXPORTACIÓN EXCEL

Generar:

.xlsx

No generar CSV.

El Excel debe conservar la estructura del reporte.

Debe incluir:

- título
- información de empresa
- período
- establecimiento
- producto
- unidad
- método
- tabla agrupada
- movimientos
- totales
- stock final

No exportar filtros ni elementos del dashboard.

---

# 42. EXPORTACIÓN PDF

El PDF debe representar el reporte oficial.

Debe ser adecuado para:

- archivo
- impresión
- presentación institucional

Debe incluir:

logo
encabezado
tabla
totales
stock
firmas/responsables cuando existan

No agregar información inexistente.

---

# 43. IMPRESIÓN

El botón:

Imprimir

debe imprimir únicamente el reporte.

Ocultar:

- menú lateral
- filtros
- botones
- navegación
- elementos propios del dashboard

Utilizar estilos:

@media print

---

# 44. RESPONSABLE Y APROBACIÓN

Si el proyecto ya tiene datos de responsable:

mostrar:

Elaborado por:
[NOMBRE REAL]

[CARGO REAL]

Para:

Aprobado por:

mostrar solamente información existente.

Si no existe información de aprobación:

NO inventar:

Ing. Responsable

ni ningún otro nombre.

Puede dejarse el espacio institucional correspondiente.

---

# 45. SERVICIOS

Reutilizar los servicios existentes.

Preferentemente:

src/lib/services/base-activa.service.ts
src/lib/services/stock.service.ts
src/lib/services/reportes.service.ts

No duplicar consultas innecesariamente.

Si reportes.service.ts ya contiene funciones relacionadas,
extenderlas solamente cuando sea necesario.

---

# 46. PRISMA

NO crear nuevas tablas.

Utilizar los modelos existentes:

Empresa
Periodo
Establecimiento
UnidadMedida
TipoExistencia
Producto
LoteBaseActiva
MovimientoBaseActiva
TipoOperacion
Almacenamiento
CapaPEPSBase
AplicacionPEPSBase

No modificar el esquema Prisma salvo que sea estrictamente necesario
y esté justificado por una carencia real.

---

# 47. PEPS

No implementar nuevamente PEPS dentro de la interfaz.

El reporte debe consumir la información calculada por el sistema.

PEPS es lógica de negocio.

No agregar al menú:

PEPS

ni:

Capas PEPS

ni:

Aplicaciones PEPS

---

# 48. NO CONFUNDIR CON PRODUCTO TERMINADO

Este módulo es exclusivamente:

BASE ACTIVA

No incluir campos de Producto Terminado como:

- presentación
- venta
- factura
- boleta
- guía
- empresa destino
- ingeniero de campo
- motivo PRODUCCIÓN
- motivo VENTA
- motivo ENSAYO

Esos datos pertenecen al módulo Producto Terminado.

---

# 49. NO CONFUNDIR CON RESUMEN BASE ACTIVA

Resumen Base Activa:

DESCRIPCIÓN
CÓDIGO
LOTE
STOCK TOTAL EN KG
OBSERVACIONES

Reporte General:

DETALLE COMPLETO DE MOVIMIENTOS

No mezclar las dos pantallas.

---

# 50. DATOS VACÍOS

Cuando un campo no corresponda al movimiento:

mantenerlo vacío.

No mostrar:

0

N/A

-

automáticamente si el formato oficial utiliza celdas vacías.

Respetar la representación del Excel.

---

# 51. VALIDACIONES

Antes de mostrar el reporte comprobar:

- Producto existe.
- Producto pertenece a BASE_ACTIVA.
- Lote pertenece al producto.
- Fecha desde es válida.
- Fecha hasta es válida.
- Fecha desde <= Fecha hasta.
- Movimientos corresponden a Base Activa.

---

# 52. SEGURIDAD

La consulta debe respetar los permisos existentes.

No permitir que un usuario sin permiso pueda consultar información
si el sistema ya maneja permisos para este módulo.

No modificar el sistema de permisos existente.

---

# 53. AUDITORÍA

Consultar/reportar no debe generar una mutación de inventario.

No crear AuditLog por cada lectura salvo que la arquitectura existente
defina explícitamente auditoría de consultas.

Las operaciones de creación/modificación de movimientos continúan
siendo responsabilidad del módulo Registrar Movimiento BA.

---

# 54. RENDIMIENTO

No cargar todos los movimientos innecesariamente.

Aplicar filtros directamente en Prisma cuando sea posible.

Filtrar por:

producto
lote
fecha

antes de procesar el resultado.

Si el cálculo de saldo requiere movimientos anteriores,
consultar únicamente la información necesaria.

---

# 55. RESPONSIVE

La pantalla debe funcionar en escritorio.

La tabla oficial puede requerir desplazamiento horizontal en pantallas
pequeñas.

No destruir la estructura del reporte para hacerlo responsive.

Para impresión utilizar formato horizontal cuando sea necesario.

---

# 56. RESULTADO VISUAL ESPERADO

La pantalla debe seguir esta estructura:

BASE ACTIVA (MATERIA PRIMA)
>
REPORTE GENERAL

┌─────────────────────────────────────────────────────────────┐
│ Producto │ Lote │ Fecha desde │ Fecha hasta │ Consultar    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ REPORTE GENERAL BASE ACTIVA             Excel PDF Imprimir  │
│                                                             │
│ REGISTRO DE INVENTARIO PERMANENTE VALORIZADO                │
│ - DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA           │
│                                                             │
│ PERÍODO:                    2026                             │
│ RUC:                        [real]                           │
│ DENOMINACIÓN:               [real]                           │
│ ESTABLECIMIENTO:            [real]                           │
│ CÓDIGO EXISTENCIA:          [real]                           │
│ TIPO TABLA 5:               [real]                           │
│ DESCRIPCIÓN:                [real]                           │
│ UNIDAD TABLA 6:             [real]                           │
│ MÉTODO VALUACIÓN:           PEPS                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DETALLE │ OPERACIÓN │ ENTRADAS │ SALIDAS │ SALDO │ ... │ │
│ ├─────────┼───────────┼──────────┼─────────┼───────┼─────┤ │
│ │ ...     │ ...       │ ...      │ ...     │ ...   │ ... │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ TOTALES                                                     │
│                                                             │
│ STOCK AL DD/MM/YYYY: XXXX KG                                │
│                                                             │
│ Elaborado por:                  Aprobado por:               │
└─────────────────────────────────────────────────────────────┘

---

# 57. CRITERIO PRINCIPAL

El Excel y la imagen son la referencia visual y estructural.

La base de datos es la fuente de verdad de los datos.

Por lo tanto:

IMAGEN
→ define formato

EXCEL
→ define estructura y columnas

PRISMA / POSTGRESQL
→ define los datos reales

KARDEX BASE ACTIVA
→ define la coherencia del saldo

PEPS
→ define la valorización interna

---

# 58. NO HACER

NO:

- crear datos demo
- crear productos adicionales
- crear lotes adicionales
- modificar códigos
- modificar módulos existentes
- crear tablas nuevas sin necesidad
- crear menú Reportes
- crear menú PEPS
- agregar campos de PT
- agregar campos fiscales que no correspondan
- agregar precios
- agregar proveedores
- agregar clientes
- agregar categorías
- agregar marcas
- agregar Tipo de Afectación
- inventar responsables
- inventar firmas
- inventar cargos
- escribir fechas fijas
- escribir stocks fijos
- escribir totales fijos
- exportar CSV en lugar de Excel

---

# 59. PRUEBAS OBLIGATORIAS

Probar:

1. Todos los productos + todos los lotes.
2. Un producto específico.
3. Un lote específico.
4. Rango de fechas.
5. Producto + lote.
6. Producto + fechas.
7. Producto + lote + fechas.
8. Sin resultados.
9. Fecha inválida.
10. Fecha desde mayor que fecha hasta.
11. Stock anterior al rango.
12. Movimiento de entrada.
13. Movimiento de salida.
14. Movimiento con formulación.
15. Movimiento sin formulación.
16. Excel.
17. PDF.
18. Impresión.

---

# 60. VALIDACIÓN FINAL

Antes de terminar comprobar:

[ ] Ruta correcta.
[ ] Menú correcto.
[ ] No se modificaron módulos terminados.
[ ] Filtros funcionan.
[ ] Producto filtra correctamente.
[ ] Lote depende del producto.
[ ] Fecha desde funciona.
[ ] Fecha hasta funciona.
[ ] Solo aparecen movimientos Base Activa.
[ ] Los datos vienen de PostgreSQL.
[ ] Encabezado coincide con Excel.
[ ] Columnas coinciden con Excel.
[ ] Entradas correctas.
[ ] Salidas correctas.
[ ] Saldo correcto.
[ ] Formulación correcta.
[ ] Almacenamiento correcto.
[ ] Observación independiente de almacenamiento.
[ ] Totales dinámicos.
[ ] Stock final dinámico.
[ ] Excel funciona.
[ ] PDF funciona.
[ ] Imprimir funciona.
[ ] No existen datos fijos de la imagen.
[ ] No existen datos ficticios.
[ ] No se crean tablas innecesarias.
[ ] No se duplica la lógica PEPS.
[ ] No se duplica la lógica de Stock.
[ ] El resultado coincide con Kardex Base Activa.