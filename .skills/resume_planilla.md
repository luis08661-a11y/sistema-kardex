# SKILL: RESUMEN BASE ACTIVA — REPORTE NORMAL + PLANTILLA INSTITUCIONAL

## 1. OBJETIVO

Crear el módulo:

BASE ACTIVA (MATERIA PRIMA)
└── Resumen Base Activa

El módulo debe mostrar dos representaciones del mismo resultado:

1. REPORTE NORMAL
2. PLANTILLA / VISTA PRELIMINAR

Ambas deben utilizar exactamente los mismos datos obtenidos del sistema.

NO crear información ficticia.
NO agregar columnas que no correspondan.
NO modificar módulos existentes.
NO modificar el Kardex Base Activa.
NO modificar Registrar Movimiento BA.
NO modificar Productos, Lotes, Configuración ni Catálogos.

El nuevo módulo debe integrarse con la información existente de:

- Producto
- LoteBaseActiva
- MovimientoBaseActiva
- Stock calculado
- Establecimiento
- Empresa
- Periodo

---

# 2. UBICACIÓN

Crear solamente el nuevo módulo:

src/app/dashboard/base-activa/resumen/

Estructura:

src/app/dashboard/base-activa/resumen/
├── page.tsx
└── resumen-base-activa-module.tsx

Si el proyecto utiliza una estructura diferente, respetar la arquitectura existente.

No crear otro módulo global de reportes.

---

# 3. RUTA

La pantalla debe quedar disponible en:

/dashboard/base-activa/resumen

Y debe corresponder al menú:

BASE ACTIVA (MATERIA PRIMA)
├── Kardex Activa
├── Resumen Base Activa   ← NUEVO
├── Reporte General
└── Registrar Movimiento BA

---

# 4. CONCEPTO DEL MÓDULO

El Resumen Base Activa NO es el Reporte General.

El Resumen muestra únicamente la situación resumida de existencias por producto/lote.

El Reporte General será otra pantalla independiente y reproducirá el formato detallado del Excel.

Por lo tanto:

RESUMEN BASE ACTIVA
→ existencias/lotes/stock

REPORTE GENERAL
→ detalle oficial de movimientos

No mezclar ambos conceptos.

---

# 5. FILTROS

Los filtros deben ser únicamente los necesarios para este resumen.

Filtros:

- Producto
- Lote
- Fecha a consultar

Diseño:

┌──────────────────────────────────────────────────────────────┐
│ Producto        │ Lote            │ Fecha a consultar        │
│ [Todos]         │ [Todos]         │ [31/08/2026]             │
│                                                              │
│                  [ Consultar ] [ Limpiar ]                   │
└──────────────────────────────────────────────────────────────┘

## Producto

Debe utilizar los productos existentes en la base de datos.

No crear productos manualmente.

## Lote

Debe depender de los lotes existentes de Base Activa.

Si se selecciona un producto, mostrar solamente los lotes correspondientes a dicho producto.

## Fecha

Permitir seleccionar la fecha hasta la cual se desea consultar el stock.

Ejemplo:

31/08/2026

El stock mostrado debe corresponder a la situación existente a esa fecha.

No mostrar movimientos posteriores a la fecha seleccionada.

---

# 6. REPORTE NORMAL

Mostrar una sección denominada:

REPORTE NORMAL

Debe utilizar una tarjeta/panel blanco con bordes suaves.

Encabezado:

REPORTE NORMAL

En la parte superior derecha:

[ Excel ] [ PDF ] [ Imprimir ]

La tabla debe contener exactamente:

| DESCRIPCIÓN | CÓDIGO | LOTE | STOCK TOTAL EN KG | OBSERVACIONES |
|-------------|--------|------|-------------------|---------------|

No agregar:

- categoría
- marca
- tipo de afectación
- costo
- precio
- usuario
- fecha de ingreso
- almacén adicional
- PEPS
- documento
- proveedor
- cliente

Esos datos no corresponden a este resumen.

---

# 7. DATOS DEL REPORTE NORMAL

DESCRIPCIÓN:

Debe provenir de Producto.descripcion.

CÓDIGO:

Debe provenir del código del producto.

Ejemplos reales:

BB
MA
PL
IF
LL
TA
TH
TV

LOTE:

Debe provenir de LoteBaseActiva.codigo.

Ejemplos:

BB2607-09
MA2601-01
MA2604-02
MA2604-03
PL2510-03
PL2601-01
IF2605-01
LL2512-03
TA2606-07
TH2606-08

STOCK TOTAL EN KG:

Debe calcularse a partir de los movimientos Base Activa hasta la fecha seleccionada.

No almacenar un stock ficticio.

El cálculo debe considerar:

ENTRADAS - SALIDAS

respetando la lógica existente del sistema.

OBSERVACIONES:

Debe mostrar únicamente la observación correspondiente cuando exista.

No utilizar este campo para almacenar:

- ubicación
- almacenamiento
- responsable
- motivo
- formulación

Esos conceptos son diferentes.

---

# 8. ORDEN DEL REPORTE

Ordenar los resultados de manera consistente.

Primero:

DESCRIPCIÓN

Luego:

CÓDIGO

Luego:

LOTE

No cambiar arbitrariamente el orden.

---

# 9. TOTAL GENERAL

Al final de la tabla mostrar:

TOTAL GENERAL

Y el total de:

STOCK TOTAL EN KG

Ejemplo:

TOTAL GENERAL | | | 1,305.22 KG |

El valor debe calcularse dinámicamente.

Nunca escribir valores fijos.

---

# 10. PLANTILLA / VISTA PRELIMINAR

Debajo del reporte normal mostrar:

PLANTILLA / VISTA PRELIMINAR

Esta sección representa el formato institucional.

Debe parecerse a la segunda imagen proporcionada.

Debe contener:

- logo
- razón social
- título del cuadro
- fecha
- tabla
- subtotales por producto cuando corresponda
- total general
- informe al
- elaborado por
- aprobado por

No inventar datos.

---

# 11. ENCABEZADO INSTITUCIONAL

El encabezado debe mostrar:

BIOALTERNATIVA E&F S.A.C.

Título:

CUADRO RESUMEN DE INVENTARIO BASE ACTIVA

Fecha:

Fecha seleccionada por el usuario.

No utilizar automáticamente la fecha actual si el usuario seleccionó otra fecha.

---

# 12. LOGO

Utilizar el logo institucional existente en el proyecto si ya está disponible.

No crear un logo nuevo.

Si existe:

public/logo.*

o una ruta equivalente,

utilizar ese recurso.

Si no existe logo institucional, dejar preparado el espacio sin inventar uno diferente.

---

# 13. TABLA DE PLANTILLA

La tabla debe tener exactamente:

| DESCRIPCIÓN | CODIGO | LOTE | STOCK TOTAL EN KG | OBSERVACIONES |
|-------------|--------|------|-------------------|---------------|

Mantener el estilo visual de la imagen:

- encabezado verde
- líneas de tabla
- fondo blanco
- texto compacto
- código centrado
- lote centrado
- stock alineado numéricamente
- descripción con presentación visual similar al Excel

---

# 14. AGRUPACIÓN DE PRODUCTOS

La plantilla institucional puede agrupar los lotes pertenecientes al mismo producto.

Ejemplo:

Metarhizium anisopliae

MA2601-01 → 132
MA2604-02 → 216
MA2604-03 → 183

Después mostrar:

Total → 531

Y:

Kilogramos

La agrupación debe hacerse únicamente cuando existan varios lotes del mismo producto.

No crear agrupaciones artificiales.

---

# 15. PRODUCTOS REALES DE BASE ACTIVA

Utilizar únicamente los productos Base Activa registrados.

Los códigos de Base Activa son:

BB
MA
PL
IF
LL
TA
TH
TV

No transformar los códigos.

NO usar:

BA-BB
PT-BB
BASE-BB

El código debe conservarse tal como está registrado.

---

# 16. DATOS DE REFERENCIA DE LA IMAGEN

La segunda imagen contiene ejemplos reales como:

Beauveria bassiana
BB
BB2607-09
180.00

Metarhizium anisopliae
MA
MA2601-01
132.00

Metarhizium anisopliae
MA
MA2604-02
216.00

Metarhizium anisopliae
MA
MA2604-03
183.00

Purpureocillium lilacinum
PL
PL2510-03
64.00

Purpureocillium lilacinum
PL
PL2601-01
139.00

Isaria fumosorosea
IF
IF2605-01
94.44

Lecanicillium lecanii
LL
LL2512-03
5.78

Trichoderma asperellum
TA
TA2606-07
40.00

Trichoderma harzianum
TH
TH2606-08
251.00

Trichoderma viride
TV
0.00

IMPORTANTE:

Estos valores son únicamente referencia de la imagen.

NO escribirlos como datos fijos en el código.

El sistema debe obtener los valores desde PostgreSQL mediante Prisma.

---

# 17. SUBTOTALES

Cuando un producto tenga varios lotes:

Producto:
Metarhizium anisopliae

Mostrar:

MA2601-01    132
MA2604-02    216
MA2604-03    183

Subtotal:

531

Observación:

Kilogramos

Lo mismo para:

Purpureocillium lilacinum

Si solamente existe un lote para un producto, no es obligatorio mostrar un subtotal independiente.

---

# 18. TOTAL GENERAL

Al final de la plantilla:

TOTAL GENERAL

Debe sumar todos los stocks mostrados.

No sumar movimientos.

No sumar entradas históricas.

No sumar salidas históricas.

Debe sumar el stock vigente a la fecha consultada.

---

# 19. TEXTO INSTITUCIONAL INFERIOR

En la parte inferior izquierda:

Informe al DD-MM-YYYY

La fecha debe corresponder a la fecha seleccionada.

No usar una fecha fija.

En la parte inferior central:

Elaborado por:

[NOMBRE DEL RESPONSABLE]

[ CARGO ]

El nombre debe provenir del usuario/responsable disponible en el sistema cuando corresponda.

No inventar nombres.

En la parte inferior derecha:

Aprobado por:

[ RESPONSABLE ]

No inventar una persona si no existe información registrada.

---

# 20. BOTONES

El reporte normal debe tener:

[ Excel ]
[ PDF ]
[ Imprimir ]

La plantilla debe tener:

[ Excel ]
[ PDF ]
[ Imprimir ]

Los tres deben funcionar.

---

# 21. EXCEL

No exportar CSV.

El usuario solicitó Excel.

Generar archivo:

.xlsx

La estructura debe conservar:

- encabezados
- columnas
- datos
- totales
- agrupaciones cuando correspondan

La exportación debe utilizar los mismos datos mostrados en pantalla.

No crear una segunda consulta diferente para Excel.

---

# 22. PDF

El PDF debe representar la plantilla institucional.

Debe contener:

- logo
- razón social
- título
- fecha
- tabla
- subtotales
- total
- elaborado por
- aprobado por

La salida debe estar preparada para impresión.

No incluir información que no aparezca en la plantilla.

---

# 23. IMPRESIÓN

El botón Imprimir debe imprimir únicamente el reporte correspondiente.

No imprimir:

- menú lateral
- filtros
- botones
- dashboard
- navegación

Para impresión:

@media print

ocultar los elementos de navegación y controles.

---

# 24. ARQUITECTURA

No crear nuevas tablas.

Utilizar:

Producto
LoteBaseActiva
MovimientoBaseActiva
Empresa
Periodo
Establecimiento
Almacenamiento

y los servicios existentes.

Si ya existe:

src/lib/services/stock.service.ts

utilizarlo para obtener el stock.

Si ya existe:

src/lib/services/reportes.service.ts

reutilizarlo o extenderlo únicamente si es necesario.

No duplicar la lógica de stock.

---

# 25. REGLA DE STOCK

El stock debe ser consistente con Kardex Base Activa.

La pantalla Resumen Base Activa y Kardex Base Activa deben representar la misma información.

Si Kardex muestra:

ENTRADA 100 KG
SALIDA 20 KG

el resumen debe mostrar:

80 KG

No implementar un cálculo diferente.

---

# 26. FILTRO POR FECHA

La fecha seleccionada representa:

"Stock existente hasta esta fecha".

Por ejemplo:

Fecha:
24/08/2026

Solo considerar movimientos:

<= 24/08/2026

No incluir movimientos del:

25/08/2026
26/08/2026
27/08/2026

etc.

---

# 27. FILTRO POR PRODUCTO

Si:

Producto = Todos

mostrar todos los productos Base Activa.

Si:

Producto = Metarhizium anisopliae

mostrar únicamente:

MA

y sus lotes correspondientes.

---

# 28. FILTRO POR LOTE

Si:

Lote = Todos

mostrar todos los lotes correspondientes.

Si:

Lote = MA2604-02

mostrar únicamente ese lote.

---

# 29. INTERFAZ

Mantener el patrón visual mostrado:

- fondo claro
- tarjetas blancas
- verde institucional
- bordes suaves
- botones compactos
- tablas con bordes
- títulos en mayúsculas donde corresponda
- diseño administrativo
- responsive

No convertirlo en un CRUD genérico.

Debe parecer un módulo de sistema de inventario.

---

# 30. NO AGREGAR INFORMACIÓN

NO agregar a este resumen:

- precio de venta
- proveedor
- cliente
- factura
- guía
- costo PEPS
- categoría
- marca
- tipo de afectación
- usuario de cada movimiento
- responsable de formulación
- cantidad formulada
- documento de traslado
- motivo de salida

Estos datos corresponden a otros módulos/reportes.

---

# 31. DIFERENCIA CON REPORTE GENERAL

Resumen Base Activa:

DESCRIPCIÓN
CÓDIGO
LOTE
STOCK TOTAL EN KG
OBSERVACIONES

Reporte General Base Activa:

PERÍODO
RUC
RAZÓN SOCIAL
ESTABLECIMIENTO
CÓDIGO DE EXISTENCIA
TIPO
DESCRIPCIÓN
UNIDAD
MÉTODO PEPS

DETALLE DEL REGISTRO
OPERACIÓN
ENTRADAS
SALIDAS
SALDO
MOTIVO
FORMULACIÓN
ALMACENAMIENTO

NO mezclar las dos estructuras.

---

# 32. REGLAS DE INTEGRACIÓN

Antes de crear archivos nuevos:

1. Revisar los imports existentes.
2. Revisar los servicios existentes.
3. Revisar los tipos existentes.
4. Revisar el modelo Prisma.
5. Reutilizar funciones existentes.
6. No duplicar modelos.
7. No duplicar servicios.
8. No modificar módulos marcados como terminados.

---

# 33. ARCHIVOS A CREAR

Crear únicamente los archivos necesarios para:

Resumen Base Activa.

Por ejemplo:

src/app/dashboard/base-activa/resumen/page.tsx

src/app/dashboard/base-activa/resumen/resumen-base-activa-module.tsx

Si la arquitectura existente separa:

actions
services
validators

crear solamente los archivos específicos que sean realmente necesarios.

No crear módulos duplicados.

---

# 34. RESULTADO FINAL

La pantalla debe quedar conceptualmente así:

BASE ACTIVA (MATERIA PRIMA) > RESUMEN BASE ACTIVA

┌───────────────────────────────────────────────────────────────┐
│ Producto        Lote          Fecha a consultar               │
│ [Todos]         [Todos]       [24/08/2026]                    │
│                         [Consultar] [Limpiar]                 │
└───────────────────────────────────────────────────────────────┘


REPORTE NORMAL

┌───────────────────────────────────────────────────────────────┐
│                              Excel   PDF   Imprimir            │
│                                                               │
│ DESCRIPCIÓN | CÓDIGO | LOTE | STOCK TOTAL EN KG | OBSERV.   │
│                                                               │
│ ...                                                           │
│                                                               │
│ TOTAL GENERAL                         XXXX KG                 │
└───────────────────────────────────────────────────────────────┘


PLANTILLA / VISTA PRELIMINAR

┌───────────────────────────────────────────────────────────────┐
│                    LOGO                                       │
│             BIOALTERNATIVA E&F S.A.C.                         │
│      CUADRO RESUMEN DE INVENTARIO BASE ACTIVA                 │
│                                             Fecha: XX/XX/XXXX │
│                                                               │
│ DESCRIPCIÓN | CODIGO | LOTE | STOCK TOTAL EN KG | OBSERV.   │
│                                                               │
│ ...                                                           │
│                                                               │
│ Informe al XX-XX-XXXX                                         │
│                                                               │
│              Elaborado por:        Aprobado por:              │
│              Responsable           Responsable                │
└───────────────────────────────────────────────────────────────┘

---

# 35. VALIDACIÓN FINAL

Antes de finalizar verificar:

[ ] El menú existente no fue modificado innecesariamente.

[ ] Kardex Base Activa sigue funcionando.

[ ] Registrar Movimiento BA sigue funcionando.

[ ] Productos sigue funcionando.

[ ] Lotes sigue funcionando.

[ ] El resumen obtiene datos reales de PostgreSQL.

[ ] Producto filtra correctamente.

[ ] Lote filtra correctamente.

[ ] Fecha filtra correctamente.

[ ] El stock coincide con Kardex.

[ ] No aparecen productos PT.

[ ] No aparecen códigos PT.

[ ] No se inventan datos.

[ ] Reporte Normal funciona.

[ ] Plantilla funciona.

[ ] Excel funciona.

[ ] PDF funciona.

[ ] Imprimir funciona.

[ ] La plantilla conserva el formato institucional.

[ ] El total general es dinámico.

[ ] Los subtotales son dinámicos.

[ ] No existen valores fijos de la imagen en el código.

[ ] No se crean tablas Prisma nuevas.

[ ] No se modifica PEPS innecesariamente.

[ ] No se modifica ningún módulo terminado.