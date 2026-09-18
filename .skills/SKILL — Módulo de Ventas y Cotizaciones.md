# SKILL: Módulo Profesional de Ventas y Cotizaciones

## 1. OBJETIVO

Crear un módulo completo, profesional y mantenible de:

- Ventas
- Cotizaciones
- Clientes
- Detalle de venta
- Historial de ventas y cotizaciones
- Reimpresión de comprobantes
- Recarga de comprobantes anteriores
- Cálculo automático de subtotal, IGV y total

El módulo debe integrarse al proyecto existente desarrollado con:

- Next.js
- TypeScript
- Prisma ORM
- PostgreSQL
- shadcn/ui
- TanStack Table
- Zod
- Server Actions
- Services
- Validators

NO crear lógica de negocio directamente dentro de los componentes React.

La arquitectura debe separar claramente:

UI
↓
Server Action
↓
Validator
↓
Service
↓
Prisma
↓
PostgreSQL

================================================== 2. DISEÑO VISUAL
==================================================

Tomar como referencia visual los diseños proporcionados:

A. Pantalla principal de Venta/Cotización

Debe tener una distribución de dos columnas:

---

## | CABECERA |

| |
| PRODUCTOS | COMPROBANTE |
| | |
| Buscar producto | Tipo |
| | Serie |
| Detalle productos | Número |
| | Fecha |
| | |
| | Datos Cliente |
| | RUC/DNI |
| | Razón Social |
| | Dirección |
| | |
| | Forma Pago |
| | Método Pago |
| | |
| | Subtotal |
| | IGV |
| | TOTAL |
| | |
| | Guardar |
| | Imprimir |

---

B. Modal Historial

Debe mostrar:

- Buscar cliente
- Buscar RUC/DNI
- Buscar número de comprobante
- Filtro por tipo de comprobante
- Tabla de comprobantes
- Fecha/hora
- Comprobante
- Cliente
- Forma de pago
- Total
- Acciones

Acciones:

- Recargar
- Imprimir
- Eliminar/anular

================================================== 3. MODELO DE DATOS
==================================================

Crear solamente las tablas principales:

1. Cliente
2. Venta
3. VentaDetalle

La tabla VentaDetalle debe relacionarse con Producto existente.

No duplicar la tabla Producto si ya existe en el proyecto.

================================================== 4. MODELO CLIENTE
==================================================

Crear:

model Cliente {

id String @id @default(cuid())

tipoDocumento TipoDocumento
numeroDocumento String
razonSocial String
direccion String?

telefono String?
email String?

activo Boolean @default(true)

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

ventas Venta[]

@@unique([tipoDocumento, numeroDocumento])
@@index([numeroDocumento])
@@index([razonSocial])
@@index([activo])
}

ENUM:

enum TipoDocumento {
DNI
RUC
CE
PASAPORTE
OTRO
}

================================================== 5. MODELO VENTA
==================================================

Crear:

model Venta {

id String @id @default(cuid())

tipoComprobante TipoComprobante

serie String
numero Int

fecha DateTime @default(now())

clienteId String?
cliente Cliente? @relation(fields: [clienteId], references: [id], onDelete: Restrict)

formaPago FormaPago
metodoPago MetodoPago

subtotal Decimal @db.Decimal(12, 2)
igv Decimal @db.Decimal(12, 2)
total Decimal @db.Decimal(12, 2)

estado EstadoVenta @default(EMITIDA)

observacion String?

detalles VentaDetalle[]

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([tipoComprobante, serie, numero])
@@index([fecha])
@@index([clienteId])
@@index([tipoComprobante])
@@index([estado])
}

ENUM:

enum TipoComprobante {
COTIZACION
FACTURA
BOLETA
}

ENUM:

enum FormaPago {
CONTADO
CREDITO
}

ENUM:

enum MetodoPago {
EFECTIVO
YAPE
PLIN
TRANSFERENCIA
TARJETA
DEPOSITO
OTRO
}

ENUM:

enum EstadoVenta {
EMITIDA
ANULADA
}

================================================== 6. MODELO VENTA DETALLE
==================================================

Crear:

model VentaDetalle {

id String @id @default(cuid())

ventaId String
venta Venta @relation(
fields: [ventaId],
references: [id],
onDelete: Cascade
)

productoId String
producto Producto @relation(
fields: [productoId],
references: [id],
onDelete: Restrict
)

cantidad Decimal @db.Decimal(12, 3)

precioUnitario Decimal @db.Decimal(12, 2)

subtotal Decimal @db.Decimal(12, 2)

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([ventaId])
@@index([productoId])
}

IMPORTANTE:

Si el proyecto maneja cantidades únicamente enteras,
usar:

cantidad Int

Si maneja productos vendidos por peso/fracción,
mantener:

cantidad Decimal @db.Decimal(12, 3)

================================================== 7. RELACIÓN CON PRODUCTO
==================================================

Si Producto ya existe:

model Producto {

...

ventasDetalle VentaDetalle[]

}

NO crear una segunda tabla Producto.

================================================== 8. MIGRACIÓN PRISMA
==================================================

Después de modificar schema.prisma:

Ejecutar:

pnpm prisma format

Luego:

pnpm prisma validate

Crear migración:

pnpm prisma migrate dev --name create_ventas_cotizaciones

Verificar:

pnpm prisma generate

================================================== 9. VALIDADORES ZOD
==================================================

Crear:

src/modules/ventas/validators/venta.validator.ts

Debe validar:

- tipoComprobante
- serie
- numero
- fecha
- clienteId
- tipoDocumento
- numeroDocumento
- formaPago
- metodoPago
- detalles
- cantidad
- precioUnitario

Ejemplo conceptual:

const ventaDetalleSchema = z.object({
productoId: z.string().min(1),
cantidad: z.number().positive(),
precioUnitario: z.number().nonnegative(),
});

const ventaSchema = z.object({
tipoComprobante: z.enum([
"COTIZACION",
"FACTURA",
"BOLETA"
]),

serie: z.string().min(1),

numero: z.number().int().positive(),

clienteId: z.string().optional(),

formaPago: z.enum([
"CONTADO",
"CREDITO"
]),

metodoPago: z.enum([
"EFECTIVO",
"YAPE",
"PLIN",
"TRANSFERENCIA",
"TARJETA",
"DEPOSITO",
"OTRO"
]),

detalles: z.array(
ventaDetalleSchema
).min(1)
});

================================================== 10. REGLAS DE NEGOCIO
==================================================

La lógica de cálculo debe estar en el Service.

NO calcular valores importantes únicamente en React.

Por cada detalle:

importeDetalle =
cantidad \* precioUnitario

Subtotal:

subtotal =
suma de todos los importes

IGV:

igv =
subtotal \* 0.18

Total:

total =
subtotal + igv

Los valores enviados desde frontend deben ser considerados
datos de entrada, pero el servidor debe recalcular:

- subtotal
- igv
- total

para evitar manipulación desde el navegador.

================================================== 11. SERVICES
==================================================

Crear:

src/modules/ventas/services/venta.service.ts

Funciones mínimas:

createVenta()

getVentaById()

getVentas()

updateVenta()

anularVenta()

deleteVenta()

getHistorialVentas()

getVentaWithDetails()

Crear también:

src/modules/clientes/services/cliente.service.ts

Funciones:

createCliente()

getClienteById()

getClienteByDocumento()

searchClientes()

updateCliente()

deleteCliente()

================================================== 12. SERVER ACTIONS
==================================================

Crear:

src/modules/ventas/actions/venta.actions.ts

Actions:

createVentaAction()

getVentaAction()

getVentasAction()

anularVentaAction()

deleteVentaAction()

Crear:

src/modules/clientes/actions/cliente.actions.ts

Actions:

createClienteAction()

getClienteByDocumentoAction()

searchClientesAction()

updateClienteAction()

REGLA:

Server Actions solamente coordinan:

1. Recepción de datos
2. Validación
3. Llamada al Service
4. Manejo de errores
5. Retorno serializable

NO colocar consultas Prisma directamente en los componentes.

================================================== 13. REPOSITORIOS
==================================================

Si el proyecto utiliza patrón Repository:

src/modules/ventas/repositories/venta.repository.ts

src/modules/clientes/repositories/cliente.repository.ts

El Repository será responsable exclusivamente
de interactuar con Prisma.

Arquitectura:

Action
↓
Validator
↓
Service
↓
Repository
↓
Prisma

Si el proyecto actual no utiliza Repository,
el Service puede utilizar Prisma directamente.

================================================== 14. PANTALLA PRINCIPAL
==================================================

Crear:

app/(dashboard)/ventas/page.tsx

Componentes:

components/ventas/venta-form.tsx

components/ventas/product-search.tsx

components/ventas/venta-detalle-table.tsx

components/ventas/cliente-form.tsx

components/ventas/comprobante-form.tsx

components/ventas/resumen-venta.tsx

components/ventas/venta-actions.tsx

================================================== 15. BUSCADOR DE PRODUCTOS
==================================================

Debe permitir buscar por:

- código
- código de barras
- nombre

Usar búsqueda optimizada.

No cargar todos los productos.

Ejemplo:

Buscar:

"Bio"

Debe devolver únicamente productos relevantes.

Mostrar:

Producto
Código
Precio
Stock

Al seleccionar:

Agregar automáticamente al detalle.

================================================== 16. TABLA DE DETALLE
==================================================

Usar:

TanStack Table

Columnas:

- Producto
- Precio U.
- Cantidad
- Importe
- Acción

Ejemplo:

---

## Producto Precio U. Cantidad Importe

Paracetamol S/ 5.00 2 S/ 10.00
Bio Trak S/ 8.50 3 S/ 25.50

---

Acciones:

- Aumentar cantidad
- Disminuir cantidad
- Editar cantidad
- Eliminar producto

================================================== 17. CLIENTE
==================================================

La sección debe permitir:

RUC / DNI / CÉDULA

[ Ingrese Nº de documento... ] [Consultar]

Al consultar:

buscar Cliente en PostgreSQL.

Si existe:

cargar:

- número documento
- razón social/nombre
- dirección

Si no existe:

permitir registrar cliente.

Campos:

Tipo documento
Número documento
Razón social / Nombre
Dirección
Teléfono
Email

================================================== 18. COMPROBANTE
==================================================

Mostrar:

Tipo:

COTIZACIÓN
FACTURA
BOLETA

Serie:

F001

Número:

000001

Fecha:

08/09/2026

El número debe ser generado/controlado
por el servidor.

Nunca confiar en el número enviado desde el frontend
para evitar duplicados.

================================================== 19. FORMA DE PAGO
==================================================

Mostrar:

CONTADO
CRÉDITO

Método:

EFECTIVO
YAPE
PLIN
TRANSFERENCIA
TARJETA
DEPOSITO
OTRO

Si:

CONTADO

permitir todos los métodos.

Si:

CRÉDITO

mantener el método correspondiente según las reglas
del negocio.

================================================== 20. RESUMEN
==================================================

Mostrar:

Subtotal:
S/ 0.00

Impuesto (IGV 18%):
S/ 0.00

TOTAL:
S/ 0.00

El total debe actualizarse inmediatamente cuando:

- se agrega producto
- se elimina producto
- cambia cantidad
- cambia precio

Pero al guardar:

el servidor debe recalcular nuevamente.

================================================== 21. HISTORIAL
==================================================

Crear:

components/ventas/ventas-history-modal.tsx

Usar:

TanStack Table

Columnas:

FECHA / HORA
COMPROBANTE
CLIENTE
PAGO
TOTAL
ACCIONES

Ejemplo:

---

## FECHA COMPROBANTE CLIENTE PAGO TOTAL

2026-03-06 COTIZACIÓN FARMACIA Crédito 1516.35
COT-001-152541

---

2026-03-07 FACTURA BOTICAS Contado 260.00
F001-0004511

---

================================================== 22. FILTROS
==================================================

El historial debe permitir:

Buscar por:

- cliente
- RUC
- DNI
- número comprobante

Filtro:

Todos los comprobantes

Opciones:

Todos
Cotizaciones
Facturas
Boletas

Agregar filtros opcionales:

- fecha desde
- fecha hasta
- estado
- forma de pago

================================================== 23. PAGINACIÓN
==================================================

NO cargar miles de ventas de PostgreSQL
en una sola consulta.

Usar paginación server-side.

Parámetros:

page
pageSize
search
tipoComprobante
fechaDesde
fechaHasta
estado

Ejemplo:

getVentas({
page: 1,
pageSize: 20,
search: "",
tipoComprobante: "TODOS"
})

La consulta Prisma debe utilizar:

skip
take

================================================== 24. TANSTACK TABLE
==================================================

Configurar:

manualPagination: true

manualFiltering: true

El servidor devuelve:

{
data: [],
total: 1000,
page: 1,
pageSize: 20
}

No descargar los 1000 registros
para filtrarlos en el navegador.

================================================== 25. SHADCN/UI
==================================================

Utilizar componentes shadcn/ui:

Button
Input
Label
Select
Dialog
Table
Badge
Card
DropdownMenu
Separator
Tooltip
AlertDialog
Command
Popover
Calendar
Form

Evitar crear componentes visuales duplicados
si shadcn ya proporciona la funcionalidad.

================================================== 26. MODALES
==================================================

Crear modal para:

Nuevo cliente

Editar cliente

Historial

Confirmación de eliminación

Confirmación de anulación

Usar:

Dialog
AlertDialog

================================================== 27. ESTADOS
==================================================

La interfaz debe manejar:

loading
saving
error
success
empty

Ejemplo:

Guardando...

Venta registrada correctamente.

No hay productos agregados.

No se encontró el cliente.

Utilizar:

Skeleton
Alert
Toast / Sonner

================================================== 28. TRANSACCIÓN PRISMA
==================================================

Guardar una venta y sus detalles dentro de:

prisma.$transaction()

Flujo:

1. Validar datos
2. Obtener cliente
3. Obtener productos
4. Validar productos
5. Validar stock si corresponde
6. Calcular subtotal
7. Calcular IGV
8. Calcular total
9. Generar número
10. Crear Venta
11. Crear VentaDetalle
12. Actualizar stock si corresponde
13. Confirmar transacción

Si algún paso falla:

ROLLBACK

================================================== 29. SEGURIDAD
==================================================

Nunca confiar en:

precio enviado desde frontend
subtotal enviado desde frontend
igv enviado desde frontend
total enviado desde frontend
número de comprobante enviado desde frontend

El servidor debe verificar:

Producto
Precio
Cantidad
Cliente
Comprobante

================================================== 30. MANEJO DE DECIMALES
==================================================

Prisma utiliza:

Decimal

No utilizar:

Float

para:

precio
subtotal
igv
total

Para cálculos monetarios usar Decimal.js
si el proyecto lo requiere.

Evitar errores como:

0.1 + 0.2 = 0.30000000000000004

================================================== 31. NÚMERO DE COMPROBANTE
==================================================

No generar el número utilizando:

array.length
count()
frontend state

Debe existir un mecanismo seguro
para evitar duplicados concurrentes.

La restricción:

@@unique([
tipoComprobante,
serie,
numero
])

debe permanecer.

================================================== 32. RECARGAR COMPROBANTE
==================================================

Desde Historial:

botón Recargar

Debe:

1. Obtener Venta
2. Obtener Cliente
3. Obtener Detalles
4. Obtener Productos
5. Cargar formulario
6. Permitir modificar
7. Crear nueva operación según la regla del negocio

NO modificar automáticamente una venta emitida
si el objetivo es generar una nueva venta/cotización.

================================================== 33. IMPRIMIR
==================================================

Crear componente:

components/ventas/venta-print.tsx

Debe permitir imprimir:

- Datos empresa
- Tipo comprobante
- Serie
- Número
- Fecha
- Cliente
- Documento
- Dirección
- Detalles
- Subtotal
- IGV
- Total
- Forma de pago
- Método de pago

La impresión debe utilizar un diseño
independiente del formulario.

================================================== 34. ANULAR
==================================================

No eliminar físicamente una venta emitida
si ya forma parte del historial contable.

Usar:

estado = ANULADA

La acción:

anularVenta()

debe realizarse en Server Action.

Solicitar confirmación mediante:

AlertDialog.

================================================== 35. ELIMINACIÓN
==================================================

Solo permitir eliminar físicamente:

- cotizaciones no utilizadas
- registros creados por error
- según permisos del usuario

Para ventas emitidas:

preferir ANULADA.

================================================== 36. ESTRUCTURA DE CARPETAS
==================================================

Propuesta:

src/

├── app/
│ └── (dashboard)/
│ └── ventas/
│ └── page.tsx
│
├── modules/
│ ├── ventas/
│ │ ├── actions/
│ │ │ └── venta.actions.ts
│ │ │
│ │ ├── services/
│ │ │ └── venta.service.ts
│ │ │
│ │ ├── repositories/
│ │ │ └── venta.repository.ts
│ │ │
│ │ ├── validators/
│ │ │ └── venta.validator.ts
│ │ │
│ │ ├── types/
│ │ │ └── venta.types.ts
│ │ │
│ │ └── utils/
│ │ └── venta-calculations.ts
│ │
│ └── clientes/
│ ├── actions/
│ │ └── cliente.actions.ts
│ │
│ ├── services/
│ │ └── cliente.service.ts
│ │
│ ├── repositories/
│ │ └── cliente.repository.ts
│ │
│ ├── validators/
│ │ └── cliente.validator.ts
│ │
│ └── types/
│ └── cliente.types.ts
│
├── components/
│ └── ventas/
│ ├── venta-form.tsx
│ ├── product-search.tsx
│ ├── venta-detalle-table.tsx
│ ├── cliente-form.tsx
│ ├── cliente-search.tsx
│ ├── comprobante-form.tsx
│ ├── resumen-venta.tsx
│ ├── venta-actions.tsx
│ ├── ventas-history-modal.tsx
│ └── venta-print.tsx
│
├── lib/
│ ├── prisma.ts
│ └── utils.ts
│
└── prisma/
└── schema.prisma

================================================== 37. FLUJO PARA CREAR VENTA
==================================================

Usuario:

Busca producto
↓
Selecciona producto
↓
Producto aparece en detalle
↓
Modifica cantidad
↓
Sistema calcula importe
↓
Busca/selecciona cliente
↓
Selecciona tipo comprobante
↓
Selecciona forma de pago
↓
Selecciona método de pago
↓
Sistema muestra subtotal
↓
Sistema muestra IGV
↓
Sistema muestra total
↓
Usuario pulsa Guardar
↓
Zod valida
↓
Server Action
↓
Service
↓
Prisma Transaction
↓
Venta creada
↓
Detalles creados
↓
Actualizar stock
↓
Mostrar confirmación
↓
Permitir imprimir

================================================== 38. REGLAS DE ARQUITECTURA
==================================================

REGLA 1:

Los componentes React NO deben importar Prisma.

REGLA 2:

Los componentes React NO deben realizar consultas directas
a PostgreSQL.

REGLA 3:

Toda entrada debe pasar por Zod.

REGLA 4:

Toda operación de negocio debe pasar por Service.

REGLA 5:

Las operaciones críticas deben utilizar transaction.

REGLA 6:

Los cálculos monetarios importantes deben realizarse
en servidor.

REGLA 7:

Las tablas grandes deben utilizar paginación.

REGLA 8:

TanStack Table debe utilizar paginación server-side
para el historial.

REGLA 9:

Utilizar componentes shadcn/ui.

REGLA 10:

Mantener TypeScript estricto.

================================================== 39. MANEJO DE ERRORES
==================================================

Crear errores de negocio:

ClienteNoEncontradoError
ProductoNoEncontradoError
VentaNoEncontradaError
StockInsuficienteError
ComprobanteDuplicadoError
VentaAnuladaError
DatosInvalidosError

El Service debe convertir errores de Prisma
en errores de negocio cuando corresponda.

================================================== 40. RESPUESTA DE SERVER ACTION
==================================================

Utilizar un formato consistente:

{
success: true,
data: {...},
message: "Venta registrada correctamente"
}

Error:

{
success: false,
error: "No se pudo registrar la venta"
}

No retornar objetos Prisma directamente
si contienen tipos no serializables.

================================================== 41. RENDIMIENTO
==================================================

Crear índices:

Cliente.numeroDocumento
Cliente.razonSocial
Venta.fecha
Venta.clienteId
Venta.tipoComprobante
Venta.estado
VentaDetalle.ventaId
VentaDetalle.productoId

Para búsquedas utilizar:

contains
startsWith

según el caso.

Nunca realizar:

findMany()

sin:

take

en consultas de tablas grandes.

================================================== 42. CHECKLIST DE IMPLEMENTACIÓN
==================================================

[ ] Crear Cliente en Prisma

[ ] Crear Venta en Prisma

[ ] Crear VentaDetalle en Prisma

[ ] Crear enums

[ ] Crear relaciones

[ ] Crear índices

[ ] Ejecutar prisma format

[ ] Ejecutar prisma validate

[ ] Crear migración

[ ] Generar Prisma Client

[ ] Crear schemas Zod

[ ] Crear validators

[ ] Crear repositories

[ ] Crear services

[ ] Crear Server Actions

[ ] Crear formulario de venta

[ ] Crear búsqueda de productos

[ ] Crear tabla TanStack

[ ] Crear búsqueda de cliente

[ ] Crear formulario cliente

[ ] Crear cálculo de subtotal

[ ] Crear cálculo de IGV

[ ] Crear cálculo de total

[ ] Crear historial

[ ] Crear filtros

[ ] Crear paginación server-side

[ ] Crear recarga de comprobante

[ ] Crear impresión

[ ] Crear anulación

[ ] Crear manejo de errores

[ ] Probar transacciones

[ ] Probar duplicidad de comprobantes

[ ] Probar cantidades

[ ] Probar IGV

[ ] Probar total

[ ] Probar cliente

[ ] Probar historial

================================================== 43. RESULTADO FINAL ESPERADO
==================================================

El módulo debe verse y funcionar como un sistema
profesional de ventas.

Debe conservar la estructura visual del diseño proporcionado:

- Cabecera superior
- Buscador de productos
- Detalle de productos
- Panel de comprobante
- Datos del cliente
- Forma de pago
- Método de pago
- Resumen económico
- Botón Guardar
- Botón Imprimir
- Modal Historial

La implementación debe ser:

- modular
- escalable
- tipada
- segura
- mantenible
- optimizada
- compatible con PostgreSQL
- compatible con Prisma
- preparada para crecimiento futuro

No crear código improvisado.

Primero revisar la estructura existente del proyecto y reutilizar:

- Prisma
- Producto
- Usuario
- Empresa
- componentes UI
- utilidades
- autenticación
- configuración existente

No duplicar funcionalidades existentes.
