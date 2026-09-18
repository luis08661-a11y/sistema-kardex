---
name: modulo-productos-kardex
version: 1.0.0
description: Skill para integrar y mantener el módulo Productos del sistema Kardex e Inventario, respetando el prototipo visual y la lógica del negocio.
---

# SKILL: MÓDULO PRODUCTOS — KARDEX E INVENTARIO

## 1. OBJETIVO

Integrar el módulo `Productos` al proyecto existente de Kardex e Inventario.

IMPORTANTE:

- NO rehacer el proyecto.
- NO crear un CRUD genérico.
- NO reemplazar el diseño existente.
- NO cambiar la arquitectura existente del proyecto.
- NO eliminar funcionalidades existentes.
- Usar el sistema creado por el SKILL general como base técnica.
- Usar el prototipo entregado por el usuario como referencia visual y funcional.
- Solo realizar mejoras necesarias y justificadas.

El módulo debe quedar preparado para alimentar:

- Base Activa.
- Producto Terminado.
- Kardex.
- PEPS.
- Stock.
- Reportes.
- Exportación Excel.
- Exportación PDF.

---

# 2. STACK EXISTENTE

Respetar el stack actual del proyecto:

- Next.js App Router
- React
- TypeScript
- pnpm
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- shadcn/ui
- Server Actions
- Servicios
- Zod
- Sistema de autenticación existente
- Sistema de permisos existente

NO introducir otra arquitectura si no es necesaria.

---

# 3. REFERENCIA VISUAL

La interfaz debe respetar el prototipo proporcionado por el usuario.

Características visuales a conservar:

- tarjetas blancas
- bordes redondeados
- bordes suaves
- sombras ligeras
- azul como color principal de acciones
- tipografía compacta
- etiquetas pequeñas y claras
- iconos
- botones compactos
- formularios limpios
- diseño responsive
- tarjetas para selección de tipo de inventario
- tabla de catálogo
- filtros superiores
- botones de exportación
- modal/formulario de edición similar al prototipo

NO sustituir esta interfaz por una tabla CRUD genérica.

---

# 4. CAMPOS DEL PRODUCTO

## 4.1 Campos generales

El producto debe contener:

1. Nombre del producto
2. Código / Abreviatura
3. Código de existencia
4. Tabla 5 (Tipo de existencia)
5. Tipo de inventario
6. Observaciones / Notas (opcional)

## 4.2 Tipo de inventario

Debe existir únicamente:

- BASE_ACTIVA
- PRODUCTO_TERMINADO

Visualmente se recomienda utilizar tarjetas tipo radio:

BASE ACTIVA
Insumo o base de proceso

PRODUCTO TERMINADO
Requiere Presentación y U.M.

No usar un selector complejo si las dos tarjetas tipo radio funcionan con el diseño existente.

---

# 5. REGLA PARA PRODUCTO TERMINADO

Cuando el usuario seleccione:

PRODUCTO TERMINADO

mostrar:

- Presentación *
- Unidad de medida *

Cuando seleccione:

BASE ACTIVA

ocultar los campos específicos de Producto Terminado.

No guardar presentación como obligatoria para Base Activa.

---

# 6. TABLA 5 — TIPO DE EXISTENCIA

El campo:

`Tabla 5 (Tipo de existencia)`

es diferente de:

`Tipo de inventario`.

NO confundirlos.

Ejemplo:

Tipo de inventario:
`PRODUCTO_TERMINADO`

Tabla 5:
`02 - PRODUCTO TERMINADO`

La Tabla 5 debe estar vinculada al catálogo/modelo `TipoExistencia`.

No inventar códigos.

Si un código de Tabla 5 no está confirmado por los archivos fuente, mantenerlo como dato configurable del catálogo.

---

# 7. CÓDIGO DE EXISTENCIA

El campo `codigoExistencia` es independiente del código interno/abreviatura.

Ejemplo Base Activa:

Código:
`TH`

Código de existencia:
`08`

Descripción:
`Trichoderma harzianum`

NO concatenar ambos valores.

NO crear automáticamente códigos como:

`PT-01`

si el código real del producto terminado es:

`01`

Los códigos de los Excel deben conservarse.

---

# 8. PRODUCTO TERMINADO

Los productos terminados pueden manejar:

- Código
- Nombre
- Código de existencia
- Tabla 5
- Presentación
- Unidad de medida

Ejemplos:

BIO INSECT PW
Código: 01
Presentación: KILOGRAMOS
Unidad: KILOGRAMOS

BIO INSECT PW
Código: 01250
Presentación: 250 GRAMOS
Unidad: GRAMOS

BIO TRIX
Código: 08250
Presentación: BOLSA 250 GRAMOS
Unidad: GRAMOS

BIO INSECT POWER
Código: 1518
Presentación: BIDON 18 LITROS
Unidad: LITROS

Conservar los códigos reales del Excel.

---

# 9. BASE ACTIVA

Para Base Activa se debe respetar la separación:

Producto -> Código -> Código de existencia -> Lotes -> Movimientos -> PEPS

Ejemplos de códigos identificados:

BB -> 02 -> Beauveria bassiana
MA -> 03 -> Metarhizium anisopliae
PL -> 03 -> Purpureocillium lilacinum
IF -> 03 -> Isaria fumosorosea
LL -> 03 -> Lecanicillium lecanii
TA -> 08 -> Trichoderma asperellum
TH -> 08 -> Trichoderma harzianum
TV -> 08 -> Trichoderma viride

NO asumir que código y código de existencia son iguales.

---

# 10. FORMULARIO

La pantalla de edición/creación debe conservar la estructura visual del prototipo.

Encabezado:

`Editar Producto`
o
`Nuevo Producto`

Subtítulo:

`Complete los datos de identificación e inventario`

Botón secundario:

`Limpiar`

Campos:

`NOMBRE DEL PRODUCTO *`

`CÓDIGO / ABREVIATURA *`

`CÓDIGO DE EXISTENCIA *`

`TABLA 5 (TIPO DE EXISTENCIA) *`

`TIPO DE INVENTARIO *`

Cuando sea Producto Terminado:

`PRESENTACIÓN *`
`UNIDAD DE MEDIDA *`

Opcional:

`OBSERVACIONES / NOTAS`

Botones:

`Guardar Producto`
`Actualizar Producto`
`Cancelar`

El texto debe adaptarse automáticamente según creación o edición.

---

# 11. CATÁLOGO REGISTRADO

Debajo del formulario debe existir el catálogo registrado.

Título:

`Catálogo Registrado`

Subtítulo:

`Gestione y visualice sus existencias registradas`

Controles:

- búsqueda
- filtro por tipo de inventario
- Exportar Excel
- Exportar PDF

Columnas mínimas:

- Código / Existencia
- Nombre
- Tabla 5 / Tipo
- Detalle (Terminado)
- Acciones

Acciones:

- Editar
- Eliminar/desactivar según las reglas de persistencia del proyecto

Preferir desactivación lógica si el proyecto ya utiliza `activo`.

---

# 12. EXPORTACIÓN

NO utilizar:

`Exportar JSON`

La interfaz debe ofrecer:

`Exportar Excel`
`Exportar PDF`

## Excel

La exportación debe generar `.xlsx`.

Debe incluir como mínimo:

- Código
- Código de existencia
- Nombre
- Tabla 5
- Tipo de inventario
- Presentación
- Unidad de medida
- Observaciones

## PDF

La exportación debe generar un documento PDF limpio y profesional.

Debe respetar el formato visual del sistema.

Para reportes de Kardex, el PDF debe utilizar además el formato oficial basado en los Excel de referencia.

---

# 13. RELACIÓN CON LOS REPORTES

El módulo Productos NO debe guardar stock manual.

Producto únicamente define los datos maestros.

El stock debe provenir de:

MOVIMIENTOS
-> CAPAS/LOTES
-> PEPS
-> KARDEX
-> STOCK

El producto debe proporcionar al reporte:

- Nombre
- Código
- Código de existencia
- Tabla 5
- Tipo de inventario
- Presentación
- Unidad de medida

---

# 14. REPORTE BASE ACTIVA

El reporte debe poder construir un encabezado similar al Excel:

REGISTRO DE INVENTARIO PERMANENTE VALORIZADO
- DETALLE DEL INVENTARIO VALORIZADO - BASE ACTIVA

PERÍODO
RUC
DENOMINACIÓN O RAZÓN SOCIAL
ESTABLECIMIENTO
CÓDIGO DE LA EXISTENCIA
TIPO (TABLA 5)
DESCRIPCIÓN
CÓDIGO DE LA UNIDAD DE MEDIDA
MÉTODO DE VALUACIÓN

El producto aporta principalmente:

- Código de existencia
- Tabla 5
- Descripción
- Unidad de medida
- Método PEPS

---

# 15. REGLA DE OBSERVACIONES Y ALMACENAMIENTO

NO confundir:

`Observaciones / Notas`

con:

`Almacenamiento`

Son datos diferentes.

Las observaciones del producto son información maestra opcional.

El almacenamiento de Base Activa corresponde al movimiento/lote cuando el negocio lo requiera.

---

# 16. VALIDACIONES

Usar Zod y las validaciones existentes.

Validar:

- nombre obligatorio
- código obligatorio
- código de existencia obligatorio
- Tabla 5 obligatoria
- tipo de inventario obligatorio
- presentación obligatoria para Producto Terminado
- unidad de medida obligatoria para Producto Terminado

El código debe respetar la regla de unicidad definida por Prisma.

No permitir duplicados de código.

No hacer validaciones arbitrarias que no estén respaldadas por el modelo o el negocio.

---

# 17. PRISMA

Usar el modelo `Producto` existente.

No crear otro modelo Producto si ya existe.

Campos conceptualmente utilizados:

- id
- tipoInventario
- codigo
- codigoExistencia
- tipoExistenciaId
- descripcion
- unidadMedidaId
- metodoValuacion
- activo

Para Producto Terminado usar la relación de presentación existente.

No modificar el schema de Prisma salvo que exista una necesidad real.

Si falta una relación requerida por el prototipo, primero revisar el schema existente antes de crear una nueva.

---

# 18. SERVICIOS Y SERVER ACTIONS

Mantener separación:

UI
-> Server Action
-> Validator
-> Service
-> Prisma

NO realizar consultas Prisma directamente desde el componente visual si el proyecto ya utiliza services.

Ejemplo conceptual:

`productos.actions.ts`

-> valida entrada

-> llama `productos.service.ts`

-> service utiliza Prisma

-> retorna resultado

---

# 19. EDICIÓN

Al editar:

- cargar todos los datos existentes
- seleccionar automáticamente Tabla 5
- seleccionar tipo de inventario
- si es Producto Terminado, mostrar Presentación y Unidad de medida
- conservar observaciones
- no borrar información existente por campos que no estén visibles

---

# 20. NO HACER

NO:

- rehacer todo el módulo
- cambiar el diseño del prototipo
- agregar campos innecesarios
- agregar categoría/marca/afectación al formulario si el usuario no lo solicita
- agregar lotes al formulario Producto
- agregar stock editable
- agregar costo al producto si no corresponde
- usar JSON como exportación principal
- inventar códigos SUNAT
- mezclar código interno con código de existencia
- mezclar observación con almacenamiento
- crear productos terminados con prefijos artificiales
- eliminar la arquitectura existente
- reemplazar Server Actions por API REST innecesariamente

---

# 21. CRITERIO DE ACEPTACIÓN

El módulo se considera correcto cuando:

1. Se puede crear un producto.
2. Se puede editar un producto.
3. Se puede buscar.
4. Se puede filtrar por tipo de inventario.
5. Tabla 5 funciona como catálogo.
6. Producto Terminado muestra Presentación y Unidad de medida.
7. Base Activa no obliga Presentación.
8. Código y código de existencia permanecen separados.
9. Los códigos reales del Excel se conservan.
10. La interfaz mantiene el diseño del prototipo.
11. Exportar Excel funciona.
12. Exportar PDF funciona.
13. El producto queda disponible para Kardex/PEPS/Stock/Reportes.
14. TypeScript compila sin errores.
15. Prisma mantiene la integridad de datos.

---

# 22. ORDEN DE IMPLEMENTACIÓN

Implementar en este orden:

FASE 1
- Revisar modelo Producto existente.
- Revisar validators.
- Revisar service.
- Revisar server actions.

FASE 2
- Corregir/crear UI Productos respetando el prototipo.
- Crear formulario.
- Crear selector tipo radio.
- Mostrar campos dinámicos de Producto Terminado.

FASE 3
- Crear catálogo registrado.
- Búsqueda.
- Filtro.

FASE 4
- Editar.
- Desactivar/eliminar según arquitectura existente.

FASE 5
- Exportar Excel.

FASE 6
- Exportar PDF.

FASE 7
- Probar integración con Base Activa.
- Probar integración con Producto Terminado.
- Probar integración con Kardex.
- Probar integración con PEPS.
- Probar reportes.

---

# 23. REGLA PRINCIPAL

ANTES DE CAMBIAR CÓDIGO:

1. Revisar lo que ya existe.
2. Reutilizar servicios y componentes existentes.
3. No duplicar modelos.
4. No duplicar lógica.
5. Comparar la UI con el prototipo.
6. Hacer únicamente los cambios necesarios.

La prioridad es:

PROTOTIPO VISUAL
+
LÓGICA DEL NEGOCIO
+
ARQUITECTURA EXISTENTE
+
PRISMA/POSTGRES

No crear una aplicación diferente.

