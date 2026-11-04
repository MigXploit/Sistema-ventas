# 📋 Guía de Soluciones y Respuestas a las Observaciones del Proyecto Final (`Día miércoles tr.docx`)

> **Asignatura:** Seguridad de la Información (SEG-244)  
> **Proyecto:** Sistema de Ventas, Catálogo e Inventario — *Yasumi Venta*  
> **Propósito de este documento:** Resolver punto por punto todas las observaciones anotadas en el archivo `Día miércoles tr.docx`.  
> - **Nota:** Las observaciones de la **Parte 3 (Autorización)** y **Parte 4 (Auditoría y Trazabilidad)** que te tocaron revisar **ya fueron integradas y corregidas directamente en `main (1).tex` y `proyecto_final_yasumi_venta.tex`**.  
> - Este documento incluye además las **soluciones completas, justificaciones teóricas, tablas, código y bloques LaTeX** para las observaciones de las **Partes 1, 2, 5, 6, 7 y 8** para que tú y tus compañeros puedan defenderlas o integrarlas de inmediato.

---

## Índice

1. [Resumen de lo corregido en el `.tex` (Tus puntos: Parte 3 y Parte 4)](#1-resumen-de-lo-corregido-en-el-tex-tus-puntos-parte-3-y-parte-4)
2. [Soluciones para Observaciones — PARTE 1: Identificación y Ciclo de Vida](#2-soluciones-para-observaciones--parte-1-identificación-y-ciclo-de-vida)
3. [Soluciones para Observaciones — PARTE 2: Autenticación](#3-soluciones-para-observaciones--parte-2-autenticación)
4. [Soluciones para Observaciones — PARTE 5: Recuperación y Continuidad](#4-soluciones-para-observaciones--parte-5-recuperación-y-continuidad)
5. [Soluciones para Observaciones — PARTE 6: Matriz de Mínimo Privilegio (Filas = Roles, Columnas = Recursos)](#5-soluciones-para-observaciones--parte-6-matriz-de-mínimo-privilegio-filas--roles-columnas--recursos)
6. [Soluciones para Observaciones — PARTE 7 y 8: Justificación de Políticas, Matriz de Aplicación y Criptosistema (Hash vs. Encriptar/Desencriptar)](#6-soluciones-para-observaciones--parte-7-y-8-justificación-de-políticas-matriz-de-aplicación-y-criptosistema-hash-vs-encriptardesencriptar)

---

## 1. Resumen de lo corregido en el `.tex` (Tus puntos: Parte 3 y Parte 4)

En los archivos [`main (1).tex`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/main%20(1).tex) y [`proyecto_final_yasumi_venta.tex`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/proyecto_final_yasumi_venta.tex) ya se aplicaron las siguientes correcciones:

### ✅ En PARTE 3 — AUTORIZACIÓN:
1. **Punto `e` — El contexto relevante como relación entre dos atributos:**
   - Se explicó formalmente cómo el motor ABAC evalúa predicados relacionales $P(\text{Atributo}_{\text{sujeto}}, \text{Atributo}_{\text{objeto/subordinado}})$, tanto para titularidad directa (`reserva.id_cliente == req.user.id`) como para no-reflexividad (`req.user.id != req.params.id`).
   - **Por qué una autoridad o rol mayor puede tener información crítica sobre otros roles a su cargo (enfatizando la Matriz de Mínimo Privilegio):**
     - **Administrador $\rightarrow$ Vendedor y Cliente:** Accede a metadatos laborales, estado de cuenta, historial de ventas y bitácora forense por necesidad de supervisión operativa, control de calidad y respuesta a incidentes. Sin embargo, bajo la **Matriz de Mínimo Privilegio**, no tiene poder ilimitado: no puede ver contraseñas (solo existen hashes irreversibles), no puede borrar ni editar la bitácora (`log_auditoria` es *Append-Only*), no puede modificar su propio rol/estado, y requiere **2FA** para cambios críticos.
     - **Vendedor $\rightarrow$ Cliente:** Accede a datos críticos del cliente (teléfono, dirección física de entrega en `delivery` y comprobante en `pago`) estrictamente para preparar y despachar el pedido a su cargo (`reserva.id_usuario == req.user.id`), sin acceso a usuarios, roles, precios maestros ni logs.
   - **Uso y articulación de Políticas:** Se vinculó cada decisión con las Políticas 1 (R1.2, R1.4), Política 3 (R3.1–R3.7), Política 4 (R4.1, R4.2) y Política 5 (R5.1), añadiendo la **Tabla 6 (`tab:contexto_atributos`)**.
2. **Orden estructural ("Al final es código"):**
   - Se reordenó toda la Parte 3 para que primero vayan todas las explicaciones conceptuales y tablas, y **al final de la Parte 3** (subsección 3.5) se concentren los bloques de código (`permisos.js`, `authorize.js` y `contextoPredicados.js`).

### ✅ En PARTE 4 — AUDITORÍA Y TRAZABILIDAD:
1. **Cambios de roles dentro de usuarios (Subsección 4.3):**
   - Documenta el flujo completo de `PUT /api/usuarios/:id/rol` y el evento `ROL_CAMBIO`, registrando quién ejecutó el cambio (`id_solicitante`), a quién afectó (`id_target`), el rol anterior, el rol nuevo, la validación 2FA, IP y navegador.
2. **Trazabilidad de usos de permisos de roles superiores en información delicada de roles a su cargo (Subsección 4.4 y Tabla `tab:trazabilidad_superiores`):**
   - Aplica el principio de *vigilancia sobre el supervisor*: cada vez que el Administrador consulta la nómina (`GET /api/usuarios`), audita bitácoras (`GET /api/logs`) o desactiva personal, o cuando un Vendedor consulta la dirección y teléfono de un Cliente a su cargo, se genera el evento `SUPERVISION_ROL_CARGO` / `OPERACION_SENSIBLE`.
3. **Trazabilidad de intentos de roles inferiores a permisos denegados (Subsección 4.5):**
   - Explica cómo se intercepta y registra con `ACCESO_DENEGADO` cualquier intento de un `Invitado`, `Cliente` o `Vendedor` de invocar permisos superiores o recursos ajenos, junto con la correlación de alertas al superar 3 intentos en 10 minutos.
4. **Punto `e` — Uso de cuentas de emergencia (Subsección 4.6):**
   - Desarrolla el protocolo *break-glass* (`emergencia@yasumi.com`): activación excepcional fuera de línea con 2FA, registro obligatorio de `EMERGENCIA_INGRESO`, de **cada acción individual** como `EMERGENCIA_USO` (severidad Crítica) y `EMERGENCIA_CIERRE`, más auditoría forzosa y rotación de credenciales en 24 horas.
5. **Punto `f` — Cambios de configuración y Notas de Actualización en base a distintas amenazas al sistema (Subsección 4.7 y Tabla `tab:notas_amenazas`):**
   - Documenta el evento `CONFIG_CAMBIO` e incluye la tabla completa de **Notas de Actualización (`ACT-01` a `ACT-09`)**, asociando cada amenaza (fuerza bruta, CAPTCHA falso, timing attacks, sesiones zombies, escalada de privilegios, XSS/CSRF, Slowloris DoS, WebShells y borrado forense) con el parámetro reconfigurado y su evento de auditoría.

---

## 2. Soluciones para Observaciones — PARTE 1: Identificación y Ciclo de Vida

### 🔹 Observación 1.1: *"Crear identificaciones y relacionar el ciclo de vida con cómo son las credenciales"*
**Solución / Explicación para el informe y defensa:**
Una **identidad digital** (`persona.id_persona` + `persona.email`) no es lo mismo que una **credencial** (`usuario.password`, token JWT o secreto 2FA). Sin embargo, el ciclo de vida de la identidad gobierna directamente el ciclo de vida de sus credenciales en cada etapa:

| Fase del Ciclo de Vida de la Identidad | Estado de la Identidad | Qué ocurre exactamente con sus Credenciales (Contraseña, Tokens y 2FA) |
|---|---|---|
| **1. Provisión (Alta)** | `activa` | Se exige crear una credencial primaria robusta (contraseña derivada con Bcrypt factor $\ge 10$), se inicializa `token_version = 0` y, si es rol Administrador, se habilita el segundo factor (2FA). |
| **2. Operación normal** | `activa` | La credencial primaria permite emitir credenciales temporales de sesión (tokens JWT con tiempo de vida acotado). |
| **3. Cambio de función (Rol)** | `activa` | Al cambiar el rol (`ROL_CAMBIO`), se revocan los tokens activos incrementando `token_version` para obligar a emitir un nuevo token con los nuevos privilegios. |
| **4. Suspensión temporal** | `suspendida` (`activo = false`) | La contraseña se conserva en la BD (para cuando regrese), pero **se bloquea el login** y **se invalidan de inmediato todos los tokens JWT emitidos previamente** (código HTTP 401 en `verifyToken`). |
| **5. Reactivación** | `activa` | Si la suspensión fue por sospecha de robo de cuenta, se obliga a **rotar la contraseña** y re-enrolar el 2FA antes de permitir nuevas sesiones. |
| **6. Revocación (Baja definitiva)** | `revocada` | Se inutiliza permanentemente la credencial (se anula el hash de contraseña y secretos 2FA, se incrementa `token_version`), impidiendo cualquier futuro inicio de sesión, pero **conservando el `id_usuario`** para no romper la integridad histórica de ventas y auditoría. |

---

### 🔹 Observación 1.2: *"Si está suspendido prohibido que entre (controlar log)"*
**Solución / Explicación:**
En el sistema actual esto se controla en **dos puntos simultáneos** y ambos dejan evidencia en el log:
1. **En el intento de inicio de sesión ([`authController.js`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/back-seguridad-main/src/controllers/authController.js)):** Si el usuario tiene `activo = false` (suspendido), aunque conozca su contraseña correcta, el servidor rechaza la entrada y graba en `log_acceso` el evento **`LOGIN_BLOQUEADO_INACTIVO`** con su IP y navegador.
2. **En sesiones ya abiertas ([`authMiddleware.js`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/back-seguridad-main/src/middleware/authMiddleware.js)):** Si el usuario ya había entrado antes de ser suspendido y trata de seguir usando su token JWT, el middleware `verifyToken` consulta `SELECT activo FROM usuario WHERE id_usuario = $1` en tiempo real y le devuelve **HTTP 401 inmediato**, cerrándole el paso al instante.

---

### 🔹 Observación 1.3: *"Punto c: ¿A qué se refiere con registrar 'altas, bajas y cambios de la función'?"*
**Solución / Explicación:**
En seguridad de la información (ISO/IEC 27001 control A.5.16 / NIST SP 800-53 AC-2), no basta con guardar una tabla estática con el estado *actual* del empleado; se debe conservar la **historia cronológica de movimientos de personal** dentro del sistema:
- **Altas (`IDENTIDAD_ALTA`):** Cuándo se creó la cuenta, qué administrador la autorizó (si es personal interno) o si fue autoregistro de cliente, y con qué rol inicial nació.
- **Bajas (`IDENTIDAD_SUSPENDIDA` / `IDENTIDAD_REVOCADA`):** Cuándo se le quitó el acceso a un trabajador (por vacaciones, investigación o despido), qué administrador ejecutó la baja y por qué motivo, sin borrar sus registros pasados.
- **Cambios de función (`ROL_CAMBIO`):** Cuando una persona cambia de puesto dentro de la florería (por ejemplo, un `Cliente` contratado como `Vendedor`, o un `Vendedor` promovido a `Administrador`), registrando qué función dejaba atrás y qué nueva función asume.

---

### 🔹 Observación 1.4: *"Punto e: Gestionar los cambios de rol CON AUTORIZACIÓN y registro de auditoría (crear en un PDF el registro de los logs, roles, y operaciones realizadas, quién y por qué ha realizado el cambio de roles)"*
**Solución / Explicación:**
- **En el código del sistema:**
  - En [`Usuarios.jsx`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/front-seguridad-main/src/pages/Usuarios.jsx) se implementó el botón **`🔑 Rol (2FA)`** que exige autorización mediante token de Segundo Factor (`X-2FA-Token`), impide auto-modificación y registra el evento `ROL_CAMBIO: Asignado rol <NuevoRol> por administrador #<ID>` en la base de datos.
  - En [`Reportes.jsx`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/front-seguridad-main/src/pages/Reportes.jsx), el botón **"Exportar Reporte PDF"** utiliza `jsPDF` y `jspdf-autotable` para generar y descargar un **documento PDF formal con la bitácora de auditoría**, donde aparecen los eventos `ROL_CAMBIO`, quién ejecutó la operación, desde qué IP, navegador y fecha/hora exacta.

---

## 3. Soluciones para Observaciones — PARTE 2: Autenticación

### 🔹 Observación 2.1: *"Explicar el por qué de las Políticas (Ej: Por qué un tiempo de 15 min después de 3 o 6 intentos fallidos)"*
**Solución / Justificación técnica para el informe:**
Ningún número en una política de seguridad es arbitrario; cada parámetro responde a un equilibrio matemático entre **seguridad (frenar ataques automatizados)** y **disponibilidad/usabilidad (no bloquear injustamente a usuarios humanos legítimos)**:

1. **¿Por qué un umbral de 5 a 6 intentos fallidos consecutivos?**
   - Según las guías de usabilidad y NIST SP 800-63B, un usuario humano legítimo puede equivocarse de contraseña de 1 a 3 veces por errores de digitación (*typos*), bloqueo de mayúsculas (`Caps Lock`) o recordar una clave anterior. Bloquear al 2.° o 3.° intento genera falsos positivos constantes y satura al soporte técnico. En cambio, **5 a 6 intentos fallidos consecutivos** supera el margen de error humano accidental y es un indicador estadístico claro de adivinación o fuerza bruta.
2. **¿Por qué un bloqueo temporal de 15 minutos (`BLOQUEO_MIN = 15`)?**
   - **Frente al atacante (Efecto disuasorio matemático):** Sin bloqueo, un script puede probar 1,000 contraseñas por minuto. Con un bloqueo de 15 minutos cada 6 intentos, un atacante solo puede probar **24 contraseñas cada hora** (576 al día). A ese ritmo, probar un diccionario pequeño de 100,000 claves le tomaría **173 días continuos**, haciendo inviable el ataque en línea.
   - **Frente a la disponibilidad (Mitigación de Account Lockout DoS):** Si el bloqueo fuera permanente hasta que intervenga un administrador, un atacante podría escribir los correos de todos los vendedores y del administrador con claves falsas 6 veces para dejar a toda la tienda fuera de servicio (*Denegación de Servicio por Bloqueo de Cuentas*). Un bloqueo temporal de **15 minutos** frena en seco al bot automatizado, pero permite que el empleado legítimo recupere el acceso por sí mismo tras un breve lapso.

---

### 🔹 Observación 2.2: *"Identificar claves de seguridad y que sean seguras (Prueba de seguridad con contraseñas) y a quién se le está dando"*
**Solución / Tabla de Identificación de Claves y Pruebas de Fortaleza:**

En el sistema existen distintos tipos de claves de seguridad según **a quién se le asignan** y **qué nivel de impacto tienen**:

| Tipo de Clave / Secreto | A quién se le asigna | Nivel de Seguridad Exigido | Prueba de Seguridad Aplicada |
|---|---|---|---|
| **Contraseña de Administrador** | Personal directivo (`rol = 'Administrador'`) | **Muy Alta:** Mínimo 10–12 caracteres, mayúsculas, minúsculas, números y símbolos, fuera de diccionario + **Segundo Factor (2FA)**. | Evaluador `evaluarFortaleza(password) === 'fuerte'` + filtro `esContrasenaDiccionario` + verificación `X-2FA-Token`. |
| **Contraseña de Vendedor** | Personal de tienda (`rol = 'Atención al Cliente'`) | **Alta:** Mínimo 8–10 caracteres combinando letras, números y caracteres especiales, sin palabras comunes ni nombre del correo. | Rechazo automático en `/api/auth/registro` si `fortaleza === 'debil'` o si coincide con lista negra. |
| **Contraseña de Cliente** | Compradores registrados (`rol = 'Cliente'`) | **Media-Alta:** Mínimo 6–10 caracteres alfanuméricos, prohibiendo claves triviales (`123456`, `password`, `yasumi`). | Validación en frontend (barra visual de fortaleza) y en backend (`validatorMiddleware.js`). |
| **Credencial de Invitado** | Visitantes sin cuenta (`rol = 'invitado'`) | **Efímera (Sin contraseña):** Token temporal de solo lectura de 2 horas de duración. | Prueba de alcance: cualquier petición de escritura con este token devuelve `403 Forbidden`. |
| **Clave maestra de firma (`JWT_SECRET`)** | Servidor Backend Node.js (`.env`) | **Crítica (256 bits de entropía):** Cadena aleatoria criptográfica custodiada fuera del código fuente. | Prueba C-17: si falta `JWT_SECRET`, el servidor aborta el arranque inmediatamente. |

---

### 🔹 Observación 2.3: *"Punto b: 'función de derivación de claves' (Agregar al sistema e investigar cómo se hace y si tiene relación con la seguridad de la BD)"*
**Solución / Investigación Técnica y Relación con la Seguridad de la Base de Datos:**

1. **¿Qué es una Función de Derivación de Claves (KDF — *Key Derivation Function*) y cómo funciona?**
   - A diferencia de un hash rápido como `SHA-256` (diseñado para ejecutarse en nanosegundos, lo que permite a una tarjeta gráfica GPU calcular más de 10,000 millones de hashes por segundo), una **Función de Derivación de Claves Basada en Contraseña** (**Bcrypt**, **PBKDF2**, **scrypt** o **Argon2id**) introduce deliberadamente tres elementos:
     1. **Sal aleatoria única (*Salt* de 128 bits):** Se genera un valor aleatorio distinto para cada usuario antes de derivar la clave. Así, si dos usuarios eligen la misma contraseña, sus hashes resultantes en la base de datos son **totalmente diferentes**, destruyendo los ataques con *Tablas Arcoíris (Rainbow Tables)*.
     2. **Factor de costo o iteraciones (*Work Factor / Cost*):** En Yasumi Venta se utiliza **Bcrypt con factor de costo 10** ($2^{10} = 1,024$ rondas de expansión de clave Blowfish `Eksblowfish`), configurable a factor 12 ($2^{12} = 4,096$ rondas) o complementable con `crypto.scryptSync` / `PBKDF2` nativo de Node.js.
     3. **Dureza de memoria (*Memory-hardness* en scrypt/Argon2id):** Obliga a usar memoria RAM en cada intento, neutralizando el paralelismo de hardware especializado (ASICs/GPUs).
2. **¿Qué relación directa tiene con la seguridad de la Base de Datos?**
   - **Es la última línea de defensa cuando la base de datos es vulnerada (compromiso en reposo):** Si un atacante lograra robar un respaldo (`pg_dump`), leer el disco del servidor o explotar una credencial filtrada de PostgreSQL y obtuviera la tabla `usuario`, **no obtendría ninguna contraseña real**. Solo vería cadenas como `$2b$10$X9k...`. Gracias a la función de derivación de claves, el atacante no puede revertir matemáticamente el hash ni usar tablas precalculadas, protegiendo tanto las cuentas de Yasumi Venta como las cuentas personales de los clientes que suelen reutilizar contraseñas en otros sitios.

---

### 🔹 Observación 2.4: *"Punto e/f: 'Mensaje de error que no revelen innecesariamente si una cuenta existe' (No decir 'No puedes usar esa contraseña porque ya existe en el sistema')"*
**Solución / Explicación:**
Existen dos errores clásicos de diseño que revelan información a un atacante y que **jamás deben cometerse**:
1. **Error en el registro o cambio de contraseña:** Decirle a un usuario *"No puedes usar esa contraseña porque ya existe en el sistema (o ya la usa otro usuario)"* es una vulnerabilidad gravísima por dos motivos:
   - Primero, implica que el sistema está comparando la contraseña nueva contra las de otros usuarios (lo cual solo sería posible si no usara *sal* aleatoria única por usuario).
   - Segundo, **le revela al atacante que esa contraseña exacta es válida para algún usuario del sistema**, facilitándole el robo de una cuenta.
2. **Error en el login o recuperación:** Decir *"El correo no existe"* vs. *"La contraseña de este correo es incorrecta"* permite enumerar quiénes son clientes o administradores.
- **Cómo se resuelve en Yasumi Venta:**
  - En el login siempre se devuelve el mensaje neutro: **`"Credenciales inválidas. Por favor verifique su correo y contraseña."`** (código 401), ejecutando además una comparación contra `DUMMY_HASH` para que el tiempo de respuesta sea idéntico.
  - En las contraseñas, cada usuario tiene su propio *salt* aleatorio en Bcrypt, por lo que nunca se compara la contraseña de un usuario con la de otro; únicamente se evalúa su complejidad sintáctica y que no pertenezca al diccionario público de claves vulnerables.

---

## 4. Soluciones para Observaciones — PARTE 5: Recuperación y Continuidad

### 🔹 Observación 5.1: *"Punto a: Cuán seguro es la cuenta, 'para cada aplicación hay que darle diferente' (¿Por qué es importante?)"*
**Solución / Explicación:**
Se refiere al **Principio de Separación de Credenciales por Capa y por Aplicación (Aislamiento de Dominios de Seguridad)**:
- En una infraestructura segura, **la aplicación web (Express), el motor de base de datos (PostgreSQL), el servidor operativo (SO) y el repositorio de respaldos deben usar cuentas y credenciales completamente diferentes y con privilegios mínimos**:
  1. `yasumi_app_user` (Cuenta de BD que usa Node.js): Solo tiene `SELECT, INSERT, UPDATE` sobre tablas del negocio, solo `INSERT, SELECT` sobre `log_auditoria` (sin `DELETE`, `DROP` ni `TRUNCATE`), y nunca es superusuario `postgres`.
  2. `yasumi_backup_user` (Cuenta para respaldos `pg_dump`): Solo tiene permiso de lectura (`SELECT`) para extraer copias, sin poder modificar datos.
  3. `admin@yasumi.com` (Cuenta de aplicación web): Administra el negocio desde la interfaz React, pero no tiene acceso SSH al servidor ni a la consola de PostgreSQL.
- **¿Por qué es vital darle una cuenta diferente a cada aplicación/servicio?**
  - Para **contener el radio de explosión (*Blast Radius*)**: si un atacante compromete la cuenta de un administrador web, no puede borrar las tablas de PostgreSQL ni apagar el servidor; y si un atacante roba la credencial de lectura del servicio de respaldos, no puede alterar precios ni insertar usuarios falsos.

### 🔹 Observación 5.2: *"Punto b: Cuando no se puede asignar a algún usuario un permiso (o falta de rol)"*
**Solución / Explicación:**
Cuando ocurre una indisponibilidad del servicio de identidad/autorización o cuando un usuario carece de un rol válido (o su rol en base de datos está corrupto, nulo o no se puede verificar):
- El sistema aplica el principio de **Fallar Cerrado (*Fail-Safe Defaults / Fail Closed*)**:
  - **Nunca se le asigna un permiso "temporal" o "por defecto" (como asumir que es Vendedor).**
  - Si el servicio de identidad no puede validar qué rol o permiso le corresponde, o si el rol no existe en la matriz (`PERMISOS[rol] ?? []`), **se deniega toda operación de escritura o administración**, permitiendo únicamente las operaciones públicas de lectura del catálogo hasta que un administrador verificado restablezca la asignación formal del rol.

### 🔹 Observación 5.3: *"Punto c: Quién las ha alterado"*
**Solución / Explicación:**
Ante la alteración no autorizada de expedientes (precios de productos, estados de reservas o montos de pagos):
- El procedimiento de respuesta utiliza la **correlación forense en `log_auditoria`** cruzando cuatro datos: `id_usuario` (quién tenía la sesión abierta), `ip_address` (desde qué red se hizo el cambio), `fecha_hora` (ventana temporal exacta del incidente) y `detalle` (qué valor tenía antes y qué valor puso).
- Esto permite identificar de inmediato **quién alteró los registros** (si fue un empleado interno malintencionado o una cuenta cuya sesión fue secuestrada desde una IP externa), suspender esa identidad en segundos (`POST /api/usuarios/:id/toggle`), y revertir únicamente las filas alteradas por ese `id_usuario` en esa ventana de tiempo sin perder las ventas legítimas de los demás vendedores.

---

## 5. Soluciones para Observaciones — PARTE 6: Matriz de Mínimo Privilegio (Filas = Roles, Columnas = Recursos)

### 🔹 Observación 6.1: *"Estructura de una Matriz de Mínimo Privilegio: Tabla de doble entrada donde se cruzan las identidades con los recursos del sistema. Eje Vertical (Filas): Roles, usuarios o grupos de seguridad. Eje Horizontal (Columnas): Recursos, carpetas, aplicaciones, bases de datos o sistemas. Intersección (Celdas): El nivel exacto de acceso permitido (Ninguno, Solo Lectura, Escritura, Ejecución, Administrador)."*

En el documento actual los recursos estaban en las filas y los roles en las columnas. A continuación tienes la **Matriz de Mínimo Privilegio con la estructura exacta solicitada por la docente** (**Filas = Roles/Grupos de Seguridad**, **Columnas = Recursos/Bases de Datos/Módulos**, **Celdas = Nivel exacto de acceso**):

### 📊 Matriz en formato Markdown:

| Eje Vertical: Roles / Grupos de Seguridad \ Eje Horizontal: Recursos y Sistemas | Catálogo y Categorías (`producto`, `categoria`) | Gestión de Usuarios y Roles (`usuario`, `persona`) | Reservas y Entregas (`reserva`, `delivery`) | Pagos y Finanzas (`pago`) | Bitácora Forense y Reportes (`log_auditoria`) | Base de Datos PostgreSQL (`bd_yasumi`) | Configuración y Modo Emergencia (`.env` / API) |
|---|---|---|---|---|---|---|---|
| **Administrador** (Dirección / Seguridad) | **Lectura y Escritura** (Crear, Editar, Desactivar) | **Administrador con 2FA** (Lectura, Alta, Suspensión, Cambio de Rol a terceros con 2FA) | **Lectura y Escritura** (Supervisión global auditada) | **Lectura y Escritura con 2FA** (Verificación y anulación con 2FA) | **Solo Lectura y Ejecución de Exportación PDF** (Inmutable: prohibido editar o borrar) | **Ninguno directo** (Opera solo mediante API REST autenticada) | **Administrador con 2FA** (Ajuste de parámetros y activación de emergencia) |
| **Vendedor** (Atención al Cliente) | **Solo Lectura** (Únicamente productos activos) | **Solo Lectura Propia** (Únicamente su propio perfil; **Ninguno** sobre otros usuarios) | **Lectura y Escritura Propia** (Crear y editar solo reservas atendidas por él) | **Lectura y Escritura Inicial** (Registrar pago; **Ninguno** para anular o borrar) | **Ninguno** (Acceso denegado 403) | **Ninguno** | **Ninguno** |
| **Cliente** (Comprador Registrado) | **Solo Lectura** (Únicamente productos activos) | **Lectura y Escritura Propia** (Solo sus propios datos personales) | **Lectura y Escritura Propia** (Crear pedido y ver solo los suyos) | **Solo Lectura Propia** (Ver solo sus propios comprobantes) | **Ninguno** (Acceso denegado 403) | **Ninguno** | **Ninguno** |
| **Invitado** (Público no registrado) | **Solo Lectura** (Únicamente productos activos) | **Ninguno** | **Ninguno** (Redirección a consulta por WhatsApp) | **Ninguno** | **Ninguno** | **Ninguno** | **Ninguno** |
| **Usuario de BD de la API (`yasumi_user`)** | **Lectura y Escritura** (`SELECT, INSERT, UPDATE`) | **Lectura y Escritura** (`SELECT, INSERT, UPDATE`) | **Lectura y Escritura** (`SELECT, INSERT, UPDATE`) | **Lectura y Escritura** (`SELECT, INSERT, UPDATE`) | **Solo Lectura e Inserción** (`SELECT, INSERT`; revocados `UPDATE, DELETE, TRUNCATE`) | **Ejecución de Consultas Parametrizadas** (Sin permisos `DROP` ni `ALTER`) | **Solo Lectura de Variables de Entorno** |

### 📄 Código LaTeX listo para pegar en la Parte 6 si desean reemplazar o complementar la Tabla 13:

```latex
\begin{tabla}
\begin{longtable}{L{2.3cm}L{1.9cm}L{2.1cm}L{2.0cm}L{1.9cm}L{2.0cm}L{1.8cm}}
\caption{Matriz de mínimo privilegio de doble entrada (Filas: Roles y Grupos; Columnas: Recursos y Sistemas).}\label{tab:matriz_doble_entrada}\\
\toprule
\textbf{Rol / Grupo (Filas)} & \textbf{Catálogo y Categorías} & \textbf{Usuarios y Roles} & \textbf{Reservas y Entregas} & \textbf{Pagos y Finanzas} & \textbf{Bitácora (\cod{log\_auditoria})} & \textbf{Configuración y BD}\\
\midrule
\endfirsthead
\toprule
\textbf{Rol / Grupo (Filas)} & \textbf{Catálogo y Categorías} & \textbf{Usuarios y Roles} & \textbf{Reservas y Entregas} & \textbf{Pagos y Finanzas} & \textbf{Bitácora (\cod{log\_auditoria})} & \textbf{Configuración y BD}\\
\midrule
\endhead
\textbf{Administrador} & Lectura y Escritura & Administrador (2FA, sin auto-edición) & Lectura y Escritura (auditada) & Lectura y Escritura (2FA) & Solo Lectura y Ejecución PDF & Administrador (con 2FA)\\
\textbf{Vendedor} & Solo Lectura (activos) & Solo Lectura (perfil propio) & Lectura y Escritura (propias) & Escritura de alta y Lectura & Ninguno & Ninguno\\
\textbf{Cliente} & Solo Lectura (activos) & Lectura y Escritura (propio) & Lectura y Escritura (propias) & Solo Lectura (propios) & Ninguno & Ninguno\\
\textbf{Invitado} & Solo Lectura (activos) & Ninguno & Ninguno & Ninguno & Ninguno & Ninguno\\
\textbf{Servicio API (\cod{yasumi\_user})} & Lectura y Escritura SQL & Lectura y Escritura SQL & Lectura y Escritura SQL & Lectura y Escritura SQL & Solo Lectura e Inserción (Append-Only) & Solo Lectura de \cod{.env}\\
\bottomrule
\end{longtable}
\end{tabla}
```

---

## 6. Soluciones para Observaciones — PARTE 7 y 8: Justificación de Políticas, Matriz de Aplicación y Criptosistema (Hash vs. Encriptar/Desencriptar)

### 🔹 Observación 7.1: *"EN EL PUNTO 8 se debe hacer una matriz para ver en qué punto aplica qué política"*
**Solución:** A continuación se presenta la **Matriz de Trazabilidad cruzada entre las 8 Políticas de Seguridad y las Partes/Módulos del Sistema** donde se aplica cada una:

| Política de Seguridad | Parte 1: Ciclo de Vida de Identidades | Parte 2: Autenticación | Parte 3: Autorización | Parte 4: Auditoría y Trazabilidad | Parte 5: Recuperación y Continuidad | Parte 6: Matriz de Mínimo Privilegio | Endpoint / Componente donde aplica |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Política 1: Gestión de Identidades y Cuentas** (R1.1–R1.6) | ✅ **Aplica directo** | ✅ Valida estado | ✅ Rol vigente | ✅ Audita altas/bajas | — | ✅ Define actores | `/api/auth/registro`, `/api/usuarios/:id/toggle`, `/api/usuarios/:id/rol` |
| **Política 2: Autenticación y Credenciales** (R2.1–R2.9) | ✅ Credencial ligada al estado | ✅ **Aplica directo** | — | ✅ Audita `AUTH_FAIL` y bloqueos | ✅ Rotación de `JWT_SECRET` | ✅ Exige 2FA | `/api/auth/login`, `/api/auth/logout`, `/api/auth/captcha`, `tokenBlacklist.js` |
| **Política 3: Autorización y Mínimo Privilegio** (R3.1–R3.7) | ✅ Anti-autobloqueo | ✅ Paso 2FA | ✅ **Aplica directo** | ✅ Audita `ACCESO_DENEGADO` | ✅ Fallar cerrado | ✅ **Aplica directo** | `authMiddleware.js`, `authorize.js`, `contextoPredicados.js` |
| **Política 4: Protección de Datos y Criptografía** (R4.1–R4.10) | ✅ Unicidad de datos PII | ✅ Hash Bcrypt de claves | ✅ Minimización de columnas | ✅ Sin secretos en logs | ✅ Respaldos cifrados | ✅ Clasificación por rol | `db.js`, `sanitizeMiddleware.js`, `cryptoService.js`, `productController.js` |
| **Política 5: Registro, Monitoreo y Auditoría** (R5.1–R5.6) | ✅ Rastro de cambios | ✅ Rastro de ingresos | ✅ Rastro de supervisión | ✅ **Aplica directo** | ✅ Evidencia forense | ✅ Solo lectura para Admin | `logService.js`, `logController.js`, tabla `log_auditoria` y trigger SQL |
| **Política 6: Desarrollo Seguro y Gestión de Cambios** (R6.1–R6.7) | — | ✅ `.env` fuera de Git | ✅ Validación de entradas | ✅ Notas `ACT-01..09` | ✅ Parches post-incidente | — | `.gitignore`, `package-lock.json`, `validatorMiddleware.js` |
| **Política 7: Continuidad Operativa e Incidentes** (R7.1–R7.5) | ✅ Suspensión de emergencia | ✅ Cierre global de sesiones | ✅ Modo solo lectura | ✅ Copias externas de log | ✅ **Aplica directo** | — | Procedimientos a–e, `MODO_EMERGENCIA`, scripts `pg_dump` |
| **Política 8: Excepciones y Cuentas de Emergencia** (R8.1–R8.6) | ✅ Cuenta *break-glass* | ✅ 2FA fuera de línea | ✅ Uso excepcional | ✅ Evento `EMERGENCIA_USO` | ✅ Control de emergencia | ✅ Restricción temporal | Cuenta `emergencia@yasumi.com`, auditoría en 24 h |

---

### 🔹 Observación 7.2: *"Las políticas son las reglas que justifican cualquier norma de seguridad. Siempre preguntar ¿por qué? de una política"*
**Solución / Tabla del "¿Por qué?" de cada una de las 8 Políticas para la defensa:**

| Política | ¿Por qué existe esta política en Yasumi Venta? (Justificación de Negocio y Seguridad) |
|---|---|
| **Política 1 (Identidades)** | **¿Por qué?** Porque si se comparten cuentas entre vendedores o si un exempleado conserva su cuenta activa tras retirarse de la florería, es imposible atribuir responsabilidades individuales ante un robo o alteración de inventario (*principio de no repudio*). |
| **Política 2 (Autenticación)** | **¿Por qué?** Porque el formulario de login está expuesto a toda la red; sin derivación lenta de claves (Bcrypt), sin CAPTCHA firmado por el servidor y sin bloqueo tras intentos fallidos, cualquier atacante automatizado tomaría control de la cuenta administrativa en minutos. |
| **Política 3 (Autorización)** | **¿Por qué?** Porque autenticar *quién eres* no significa que puedas hacer *todo*: un cliente legítimo no debe poder alterar precios de ramos florales, y un vendedor no debe poder borrarse sus propios registros ni promoverse a sí mismo a administrador. |
| **Política 4 (Protección de Datos)** | **¿Por qué?** Porque Yasumi Venta almacena direcciones domiciliarias reales, teléfonos y comprobantes financieros. Si esos datos viajan o se guardan sin protección criptográfica o sin sanitización, una filtración pondría en riesgo la seguridad física y patrimonial de los clientes. |
| **Política 5 (Auditoría)** | **¿Por qué?** Porque un control preventivo puede ser puesto a prueba; sin un registro inmutable (*Append-Only*), un atacante o un empleado desleal podría cometer un fraude y luego borrar sus huellas de la tabla de logs sin dejar evidencia para investigar. |
| **Política 6 (Desarrollo Seguro)** | **¿Por qué?** Porque de nada sirve tener excelentes controles hoy si mañana un programador sube por accidente el archivo `.env` con las claves a GitHub o instala una dependencia infectada. |
| **Política 7 (Continuidad)** | **¿Por qué?** Porque las caídas de base de datos o los incidentes de seguridad ocurren; sin respaldos probados ni reglas claras de qué operaciones siguen (catálogo) y cuáles se cierran (escrituras), un incidente paralizaría por completo las ventas de la tienda. |
| **Política 8 (Emergencia)** | **¿Por qué?** Porque si el único administrador sufre el robo o bloqueo de su cuenta en medio de un ataque, el negocio necesita una llave maestra de rescate (*break-glass*) que permita recuperar el control sin dejar una puerta trasera permanente ni sin auditar. |

---

### 🔹 Observación 7.3: *"Buscar en Internet un modelo que encripte y desencripte. Solo usar hash con contraseñas. Para demás activos críticos usar el criptosistema."*

**Solución Técnica Fundamental (Diferencia entre Hash Unidireccional y Criptosistema Reversible):**

1. **¿Por qué SOLO se usa Hash (KDF como Bcrypt/Argon2id) con las contraseñas?**
   - Porque **el sistema jamás necesita saber cuál es la contraseña original en texto plano** para funcionar. Cuando el usuario inicia sesión, simplemente se vuelve a aplicar la función unidireccional sobre lo que escribió y se compara el resultado con el hash guardado:
     $$\text{Bcrypt}(\text{password\_ingresado}, \text{salt}) \stackrel{?}{=} \text{hash\_almacenado}$$
   - Al ser matemáticamente **irreversible (unidireccional)**, ni siquiera el administrador de base de datos ni un atacante con acceso al servidor pueden "desencriptar" las contraseñas.

2. **¿Por qué para los DEMÁS activos críticos (teléfono del cliente, dirección exacta de entrega en `delivery`, número de comprobante bancario en `pago`) NO se puede usar Hash y SE DEBE usar un Criptosistema Reversible (Encriptar y Desencriptar)?**
   - Porque si aplicáramos un hash irreversible a la dirección de entrega `"Av. Sánchez Lima #2210"`, se convertiría en `"8f4a9c..."` y **el repartidor de la florería jamás podría leer a qué dirección debe llevar las flores**, ni el vendedor podría leer el número de teléfono para llamar al cliente.
   - Por tanto, los activos críticos de negocio que deben protegerse en reposo en la base de datos pero **recuperarse en texto claro cuando un rol autorizado los consulta** requieren un **Criptosistema Simétrico Autenticado (AEAD)** estándar de la industria: **AES-256-GCM (*Advanced Encryption Standard* con clave de 256 bits en modo *Galois/Counter Mode*, NIST SP 800-38D)**.

3. **Cómo funciona el modelo criptográfico AES-256-GCM para encriptar y desencriptar activos críticos en Yasumi Venta:**
   - **Algoritmo:** `aes-256-gcm` (incluido nativamente en el módulo `crypto` de Node.js).
   - **Elementos matemáticos del criptosistema $(M, C, K, IV, Tag, E, D)$:**
     - $M$ (*Mensaje en claro*): Dato crítico sensible (ej. dirección `"Av. Sánchez Lima #2210"` o teléfono `"70123456"`).
     - $K$ (*Clave secreta de 256 bits / 32 bytes*): Almacenada en la variable de entorno `DATA_ENCRYPTION_KEY` fuera de la base de datos.
     - $IV$ (*Vector de Inicialización de 96 bits / 12 bytes*): Generado aleatoriamente con `crypto.randomBytes(12)` en cada operación de cifrado para que dos direcciones iguales produzcan textos cifrados distintos.
     - $E_K(M, IV) \rightarrow (C, Tag)$ (*Función de Encriptación*): Produce el texto cifrado $C$ y una etiqueta de autenticación criptográfica (*Auth Tag* de 16 bytes) que garantiza que nadie alteró el texto cifrado en la base de datos.
     - $D_K(C, IV, Tag) \rightarrow M$ (*Función de Desencriptación*): Verifica primero el *Auth Tag* y devuelve el dato original $M$ únicamente a los roles autorizados en la API.

4. **Implementación lista en Node.js (`src/utils/cryptoAssets.js`) para incluir en el proyecto o en el informe:**

```javascript
// src/utils/cryptoAssets.js
// Criptosistema simétrico autenticado AES-256-GCM para encriptar y desencriptar
// activos críticos de Yasumi Venta (direcciones de entrega, teléfonos, comprobantes).
// NOTA: Las contraseñas NUNCA usan este módulo; las contraseñas usan hash irreversible Bcrypt.

import crypto from 'crypto';

const ALGORITMO = 'aes-256-gcm';
// Clave maestra de 32 bytes (256 bits) derivada desde variable de entorno del servidor
const CLAVE_MAESTRA = crypto
  .createHash('sha256')
  .update(process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET)
  .digest(); // 32 bytes exactos

/**
 * Encripta un activo crítico antes de guardarlo en PostgreSQL
 * Formato de salida: iv_hex:authTag_hex:ciphertext_hex
 */
export const encriptarActivoCritico = (textoPlano) => {
  if (!textoPlano) return null;
  const iv = crypto.randomBytes(12); // IV único de 96 bits recomendado por NIST para GCM
  const cipher = crypto.createCipheriv(ALGORITMO, CLAVE_MAESTRA, iv);

  let cifrado = cipher.update(String(textoPlano), 'utf8', 'hex');
  cifrado += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex'); // Etiqueta de integridad de 128 bits

  return `${iv.toString('hex')}:${authTag}:${cifrado}`;
};

/**
 * Desencripta un activo crítico almacenado en PostgreSQL cuando un rol autorizado lo solicita
 */
export const desencriptarActivoCritico = (payloadCifrado) => {
  if (!payloadCifrado || !payloadCifrado.includes(':')) return payloadCifrado;
  const [ivHex, authTagHex, cifradoHex] = payloadCifrado.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITMO, CLAVE_MAESTRA, iv);
  decipher.setAuthTag(authTag); // Si alguien alteró el dato en la BD, lanza excepción inmediata

  let textoPlano = decipher.update(cifradoHex, 'hex', 'utf8');
  textoPlano += decipher.final('utf8');
  return textoPlano;
};
```

5. **Resumen comparativo claro (Hash vs. Criptosistema) para responder a la docente:**

| Característica | Hash con Derivación de Claves (**Bcrypt**) | Criptosistema Reversible (**AES-256-GCM**) |
|---|---|---|
| **Dirección matemática** | **Unidireccional (Irreversible):** No existe función de desencriptación. | **Bidireccional (Reversible):** Encripta con $E_K$ y desencripta con $D_K$. |
| **¿En qué activo se usa?** | **EXCLUSIVAMENTE en contraseñas** (`usuario.password`) y códigos de recuperación. | **Demás activos críticos sensibles:** `cliente.telefono`, `cliente.direccion`, `delivery.direccion_destino`, `pago.comprobante` y respaldos `pg_dump`. |
| **¿Por qué se elige así?** | Porque nadie (ni siquiera el sistema o el administrador) necesita volver a ver la contraseña original; solo se compara su hash. | Porque el vendedor, el repartidor y el administrador necesitan recuperar el dato original desencriptado para entregar el pedido y conciliar el pago. |
| **¿Qué pasa si roban la BD?** | El atacante solo ve hashes `$2b$10$...` imposibles de revertir. | El atacante solo ve texto cifrado `a1f9...:8c2b...:99e0...` ilegible sin la clave `DATA_ENCRYPTION_KEY` que vive en la memoria de la API. |

