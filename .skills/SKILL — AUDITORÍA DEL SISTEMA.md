# SKILL: AUDITORÍA DEL SISTEMA

## 1. OBJETIVO

Crear el módulo:

🔐 AUDITORÍA

Su finalidad es mostrar el historial de acciones realizadas
dentro del sistema.

Debe permitir identificar:

- cuándo ocurrió
- qué usuario lo realizó
- qué acción realizó
- en qué módulo
- sobre qué registro
- qué información fue afectada

El módulo es exclusivamente de consulta.

NO modificar datos desde Auditoría.
NO eliminar registros de auditoría.
NO editar registros de auditoría.
NO crear movimientos desde Auditoría.

---

# 2. MÓDULOS QUE NO DEBEN MODIFICARSE

NO modificar:

- Configuración
- Catálogos
- Productos
- Lotes
- Base Activa
- Kardex Base Activa
- Resumen Base Activa
- Reporte General Base Activa
- Registrar Movimiento BA
- Producto Terminado
- Kardex Producto Terminado
- Resumen Producto Terminado
- Reporte General Producto Terminado
- Registrar Movimiento PT
- Usuarios

Crear solamente:

🔐 Auditoría

---

# 3. RUTA

Crear:

src/app/dashboard/auditoria/

Estructura sugerida:

src/app/dashboard/auditoria/
├── page.tsx
└── auditoria-module.tsx

Respetar la arquitectura existente del proyecto.

---

# 4. MENÚ

El menú debe quedar:

👥 USUARIOS

🔐 AUDITORÍA

No crear un menú adicional llamado:

- Logs
- Historial
- Seguridad
- Reportes de Auditoría

---

# 5. FUENTE DE DATOS

Utilizar el modelo existente:

AuditLog

NO crear otra tabla para auditoría.

No duplicar:

AuditLog
AuditHistory
SystemLog
ActivityLog

---

# 6. DATOS QUE DEBE MOSTRAR

La tabla principal debe mostrar:

FECHA / HORA
USUARIO
ACCIÓN
MÓDULO
REGISTRO
DETALLE

Estos son los datos principales de auditoría.

---

# 7. FECHA / HORA

Mostrar la fecha y hora real registrada en:

AuditLog

Utilizar el timestamp de creación del registro.

No utilizar la hora actual para registros históricos.

Formato visual:

DD/MM/YYYY HH:mm:ss

---

# 8. USUARIO

Mostrar el usuario que realizó la acción.

Utilizar la relación real con:

User

Mostrar preferentemente:

nombre
o
username

según el campo existente en el proyecto.

No mostrar contraseñas.

No mostrar hashes.

No mostrar tokens.

---

# 9. ACCIÓN

Mostrar la acción registrada.

Ejemplos:

CREAR
ACTUALIZAR
ELIMINAR
ACTIVAR
DESACTIVAR
REGISTRAR_MOVIMIENTO
CONSULTAR

Utilizar únicamente las acciones realmente registradas.

NO crear acciones ficticias.

---

# 10. MÓDULO

Mostrar el módulo afectado.

Ejemplos:

CONFIGURACIÓN
CATÁLOGOS
PRODUCTOS
LOTES
BASE ACTIVA
PRODUCTO TERMINADO
USUARIOS

La información debe proceder del AuditLog.

No crear valores manualmente.

---

# 11. REGISTRO

Mostrar el identificador o referencia del registro afectado.

Ejemplos:

Producto
Movimiento Base Activa
Movimiento Producto Terminado
Usuario
Catálogo

Utilizar el valor real registrado.

No modificar identificadores.

---

# 12. DETALLE

Mostrar el detalle disponible en AuditLog.

El detalle debe permitir conocer qué ocurrió.

Ejemplo:

Producto creado:
BIO INSECT PW

Otro ejemplo:

Movimiento PT registrado:
Salida por venta

No inventar información que no exista en AuditLog.

---

# 13. FILTROS

La pantalla debe incluir filtros adecuados:

Fecha desde
Fecha hasta
Usuario
Módulo
Acción

Diseño:

┌────────────────────────────────────────────────────────────┐
│ Fecha desde     Fecha hasta       Usuario                  │
│ [ DD/MM/YYYY ]  [ DD/MM/YYYY ]   [ Todos ]                │
│                                                            │
│ Módulo          Acción                                     │
│ [ Todos ]       [ Todas ]                                  │
│                                                            │
│ [ Consultar ] [ Limpiar ]                                 │
└────────────────────────────────────────────────────────────┘

---

# 14. FILTRO FECHA

Permitir consultar un rango:

Fecha desde
Fecha hasta

Aplicar sobre el timestamp real de AuditLog.

---

# 15. FILTRO USUARIO

Cargar los usuarios existentes.

No escribir usuarios manualmente.

Mostrar:

Todos los usuarios

y los usuarios reales registrados.

---

# 16. FILTRO MÓDULO

Utilizar los módulos realmente existentes en AuditLog.

No crear módulos ficticios.

---

# 17. FILTRO ACCIÓN

Utilizar las acciones existentes.

Permitir:

Todas

o una acción específica.

---

# 18. CONSULTAR

El botón:

Consultar

debe ejecutar una consulta al backend.

No realizar el filtrado solamente en el navegador
si el volumen de auditoría puede crecer.

---

# 19. LIMPIAR

El botón:

Limpiar

debe restablecer los filtros.

No debe borrar registros.

No debe modificar AuditLog.

---

# 20. ORDEN

Ordenar por:

createdAt DESC

Mostrar primero:

la actividad más reciente.

---

# 21. PAGINACIÓN

Implementar paginación.

No cargar indefinidamente todos los registros.

Mostrar, por ejemplo:

25
50
100

registros por página.

Utilizar la configuración existente del proyecto si ya existe.

---

# 22. DETALLE DEL REGISTRO

Al seleccionar un registro de auditoría,
permitir abrir un detalle.

Ejemplo:

┌─────────────────────────────────────────────┐
│ DETALLE DE AUDITORÍA                        │
│                                             │
│ Fecha:       02/09/2026 15:20:35           │
│ Usuario:     usuario                        │
│ Acción:      CREAR                          │
│ Módulo:      PRODUCTOS                      │
│ Registro:    123                            │
│                                             │
│ Detalle:                                    │
│ Producto creado                             │
│                                             │
│                         [Cerrar]             │
└─────────────────────────────────────────────┘

No permitir edición.

---

# 23. AUDITORÍA DE BASE ACTIVA

Cuando existan registros reales, debe ser posible identificar:

Usuario
Fecha/Hora
Acción
Módulo
Registro
Detalle

para acciones relacionadas con:

- lotes
- movimientos
- entradas
- salidas
- formulación

No agregar datos que no estén registrados.

---

# 24. AUDITORÍA DE PRODUCTO TERMINADO

Cuando existan registros reales, debe ser posible identificar:

Usuario
Fecha/Hora
Acción
Módulo
Registro
Detalle

para acciones relacionadas con:

- movimientos PT
- entradas
- salidas
- producción
- venta
- ensayo

No agregar datos ficticios.

---

# 25. AUDITORÍA DE PRODUCTOS

Registrar/mostrar cuando corresponda:

CREAR
ACTUALIZAR
ACTIVAR
DESACTIVAR

No mostrar contraseñas ni información sensible.

---

# 26. AUDITORÍA DE CATÁLOGOS

Cuando exista auditoría para catálogos:

mostrar:

- unidad de medida
- tipo de existencia
- categoría
- marca
- tipo de afectación
- tipo de operación
- almacenamiento

solamente cuando realmente exista un AuditLog correspondiente.

---

# 27. AUDITORÍA DE USUARIOS

Mostrar las acciones realizadas sobre usuarios cuando estén registradas.

Ejemplos:

CREAR
ACTUALIZAR
ACTIVAR
DESACTIVAR

No mostrar:

- contraseña
- passwordHash
- tokens
- sesiones
- credenciales

---

# 28. NO AUDITAR CONSULTAS AUTOMÁTICAS

No generar auditoría simplemente porque el usuario:

- abre Dashboard
- abre Kardex
- cambia de pestaña
- abre Resumen
- cambia un filtro local

salvo que el sistema ya haya definido explícitamente
esas acciones como auditables.

La auditoría debe centrarse en acciones relevantes.

---

# 29. NO MODIFICAR AUDITLOG

Auditoría debe ser de solo lectura.

No implementar:

Editar
Eliminar
Actualizar

sobre registros de AuditLog.

---

# 30. NO BORRAR AUDITORÍA

No agregar botón:

Eliminar historial

No agregar:

Vaciar auditoría

No agregar:

Eliminar seleccionados

Los registros deben conservarse.

---

# 31. PERMISOS

Utilizar el sistema de permisos existente.

El acceso debe estar protegido mediante el permiso
correspondiente de Auditoría.

Si ya existe:

AUDITORIA.CONSULTAR

utilizar ese permiso.

No crear otro permiso equivalente.

---

# 32. SEGURIDAD

El usuario sin permiso no debe poder acceder directamente
a la ruta:

/dashboard/auditoria

aunque escriba la URL manualmente.

Validar permiso en servidor.

No depender únicamente de ocultar el menú.

---

# 33. SERVICIO

Utilizar el servicio existente de usuarios/auditoría
si ya contiene funciones relacionadas.

Preferentemente:

src/lib/services/usuarios.service.ts

o crear:

src/lib/services/auditoria.service.ts

solo si la arquitectura actual requiere separar el módulo.

No duplicar consultas existentes.

---

# 34. SERVER ACTIONS

Las consultas deben ejecutarse mediante la arquitectura
existente del proyecto.

Si ya existe:

usuarios.actions.ts

no crear acciones duplicadas innecesariamente.

Si corresponde separar:

auditoria.actions.ts

---

# 35. VALIDADORES

Crear o reutilizar:

auditoria.schema.ts

para validar:

- fecha desde
- fecha hasta
- usuario
- módulo
- acción
- página
- tamaño de página

---

# 36. PRISMA

NO crear modelos nuevos.

Utilizar:

AuditLog
User

y las relaciones existentes.

---

# 37. DATOS SENSIBLES

Nunca mostrar:

password
passwordHash
token
refreshToken
sessionToken
secret
credenciales

aunque accidentalmente aparezcan dentro de un detalle.

Sanitizar la información si el detalle contiene campos
que no deben exponerse.

---

# 38. DISEÑO

Mantener el patrón visual del sistema.

Utilizar:

- fondo claro
- tarjetas
- encabezados oscuros/verdes según el diseño existente
- tabla compacta
- filtros en tarjeta
- badges para acciones
- modal/drawer para detalle

No convertirlo en una pantalla CRUD genérica.

---

# 39. ACCIONES VISUALES

Usar badges para diferenciar acciones.

Ejemplo:

CREAR
ACTUALIZAR
ELIMINAR
ACTIVAR
DESACTIVAR

El estilo debe ser consistente con el sistema.

No cambiar el comportamiento del AuditLog.

---

# 40. ESTADO VACÍO

Cuando no existan resultados:

mostrar:

No se encontraron registros de auditoría
para los filtros seleccionados.

No crear datos demo.

---

# 41. ERROR

Si ocurre un error:

mostrar un mensaje claro.

No mostrar:

stack trace
SQL
credenciales
información interna del servidor

---

# 42. EXPORTACIÓN

NO agregar exportación Excel/PDF inicialmente.

Auditoría es principalmente una pantalla de consulta.

Si posteriormente se solicita exportación,
crear un módulo específico sin alterar la estructura actual.

---

# 43. NO CONFUNDIR CON REPORTES

Auditoría NO es:

- Reporte General Base Activa
- Reporte General Producto Terminado
- Resumen Base Activa
- Resumen Producto Terminado
- Kardex

Auditoría muestra:

QUIÉN
CUÁNDO
QUÉ HIZO
DÓNDE
SOBRE QUÉ REGISTRO
QUÉ DETALLE

---

# 44. EJEMPLO DE AUDITORÍA

Ejemplo conceptual:

Fecha/Hora
02/09/2026 14:35:20

Usuario
Yober Garcia

Acción
CREAR

Módulo
PRODUCTOS

Registro
123

Detalle
Producto creado

Estos valores son solamente ilustrativos.

NO introducirlos como datos iniciales.

---

# 45. EJEMPLO MOVIMIENTO BASE ACTIVA

Cuando exista un registro real:

Fecha/Hora
[REAL]

Usuario
[REAL]

Acción
[REAL]

Módulo
BASE ACTIVA

Registro
[REAL]

Detalle
[REAL]

No reconstruir el movimiento manualmente.

Utilizar la información almacenada en AuditLog.

---

# 46. EJEMPLO MOVIMIENTO PT

Cuando exista un registro real:

Fecha/Hora
[REAL]

Usuario
[REAL]

Acción
[REAL]

Módulo
PRODUCTO TERMINADO

Registro
[REAL]

Detalle
[REAL]

No inventar:

producto
cantidad
documento
responsable

si esos datos no están registrados en AuditLog.

---

# 47. INTEGRACIÓN

Toda acción importante de escritura del sistema debe utilizar
el mecanismo de auditoría existente.

Especialmente:

Productos
Lotes
Base Activa
Producto Terminado
Usuarios
Configuración
Catálogos

No modificar estos módulos dentro de este skill.

La integración de nuevos eventos se hará únicamente donde
sea necesario y sin cambiar su funcionamiento visual.

---

# 48. AUDITORÍA NO DEBE CAMBIAR STOCK

Consultar Auditoría nunca debe ejecutar:

- entrada
- salida
- PEPS
- actualización de stock
- creación de lote

Es una consulta de solo lectura.

---

# 49. AUDITORÍA NO DEBE CAMBIAR PEPS

No ejecutar:

CapaPEPSBase
AplicacionPEPSBase
CapaPEPSPT
AplicacionPEPSPT

desde Auditoría.

---

# 50. RENDIMIENTO

La consulta debe utilizar índices existentes.

Si el modelo AuditLog ya posee:

createdAt
userId
module
action

utilizar esos campos para filtrar.

No traer registros innecesarios.

---

# 51. PAGINACIÓN SERVER-SIDE

La paginación debe ejecutarse en servidor.

No cargar miles de registros para paginar en React.

Utilizar:

skip/take

o el mecanismo equivalente de Prisma.

---

# 52. CONTADORES

Opcionalmente mostrar:

Total de registros encontrados

No mostrar estadísticas inventadas.

Si se muestran:

deben corresponder a la consulta actual.

---

# 53. ESTRUCTURA VISUAL

┌───────────────────────────────────────────────────────────────┐
│ AUDITORÍA                                                     │
│ Historial de acciones realizadas en el sistema               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Fecha desde    Fecha hasta    Usuario                         │
│ [__________]   [__________]   [Todos]                         │
│                                                               │
│ Módulo         Acción                                          │
│ [Todos]        [Todas]                                         │
│                                                               │
│ [Consultar] [Limpiar]                                         │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ FECHA/HORA │ USUARIO │ ACCIÓN │ MÓDULO │ REGISTRO │ DETALLE │
├────────────┼─────────┼────────┼────────┼──────────┼─────────┤
│ ...        │ ...     │ ...    │ ...    │ ...      │ ...     │
│ ...        │ ...     │ ...    │ ...    │ ...      │ ...     │
└───────────────────────────────────────────────────────────────┘

                    [1] [2] [3] ... [Siguiente]

---

# 54. DETALLE

Al hacer clic sobre una fila:

mostrar un modal de solo lectura.

Campos:

Fecha/Hora
Usuario
Acción
Módulo
Registro
Detalle

No mostrar botones de edición.

---

# 55. RESPONSABILIDAD

AuditLog representa una evidencia de las acciones
realizadas en el sistema.

No utilizarlo como tabla temporal.

No modificar registros existentes.

---

# 56. NO CREAR DATOS DEMO

El módulo debe mostrar:

AuditLog real.

Si AuditLog está vacío:

mostrar estado vacío.

No insertar automáticamente:

usuarios
acciones
movimientos

solo para llenar la pantalla.

---

# 57. PRUEBAS

Probar:

1. Abrir Auditoría con permiso.
2. Acceder sin permiso.
3. Consultar sin filtros.
4. Filtrar por usuario.
5. Filtrar por módulo.
6. Filtrar por acción.
7. Filtrar por fecha.
8. Combinar filtros.
9. Rango de fechas inválido.
10. Sin resultados.
11. Paginación.
12. Abrir detalle.
13. Verificar usuario.
14. Verificar fecha.
15. Verificar acción.
16. Verificar módulo.
17. Verificar registro.
18. Verificar detalle.
19. Confirmar que no existe edición.
20. Confirmar que no existe eliminación.
21. Confirmar que no modifica stock.
22. Confirmar que no modifica PEPS.
23. Confirmar que no expone contraseñas.

---

# 58. VALIDACIÓN FINAL

[ ] Ruta correcta.

[ ] Menú AUDITORÍA correcto.

[ ] Solo lectura.

[ ] AuditLog existente reutilizado.

[ ] No se creó una tabla de auditoría duplicada.

[ ] Fecha/Hora correcta.

[ ] Usuario correcto.

[ ] Acción correcta.

[ ] Módulo correcto.

[ ] Registro correcto.

[ ] Detalle correcto.

[ ] Filtro por fecha.

[ ] Filtro por usuario.

[ ] Filtro por módulo.

[ ] Filtro por acción.

[ ] Paginación.

[ ] Orden descendente.

[ ] Detalle en modal.

[ ] Permiso correcto.

[ ] Acceso servidor protegido.

[ ] No muestra contraseñas.

[ ] No elimina auditoría.

[ ] No modifica auditoría.

[ ] No modifica inventario.

[ ] No modifica PEPS.

[ ] No genera movimientos.

[ ] No crea datos demo.

[ ] Diseño consistente.

[ ] No modifica módulos existentes innecesariamente.