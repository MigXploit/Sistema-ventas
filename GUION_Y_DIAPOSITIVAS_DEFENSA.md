# 🎤 Guion Completo y Estructura de Diapositivas para la Defensa (30 a 40 Minutos)

> **Archivo PowerPoint generado:** [`PRESENTACION_DEFENSA_YASUMI_VENTA.pptx`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/PRESENTACION_DEFENSA_YASUMI_VENTA.pptx) (24 diapositivas panorámicas 16:9 con tablas, tarjetas visuales y notas del orador integradas).  
> **Documento base:** [`main.tex`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/main.tex)  
> **Asignatura:** Seguridad de la Información (SEG-244) — **Docente:** Ph.D. Luisa Velásquez López  
> **Duración planificada:** **35 – 40 minutos** (30 min de defensa teórico-técnica + 5–8 min de demostración en vivo y preguntas).

---

## ⏱️ Distribución sugerida de tiempos y expositores (4 integrantes)

| Integrante | Bloques / Diapositivas asignadas | Secciones de [`main.tex`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/main.tex) | Tiempo estimado |
|---|---|---|:---:|
| **Expositor 1** | **Diapositivas 1 a 7** | Portada, Agenda, **A. Introducción**, **B. Problema**, **C/D. Objetivos**, **E. Arquitectura y Superficie API**, **F. Criticidad de la Infraestructura y Riesgos** | **8 – 9 min** |
| **Expositor 2** | **Diapositivas 8 a 11** | **Parte 1: Identificación y Ciclo de Vida** (Estados, relación con credenciales, invitado efímero, cambio de rol 2FA) y **Parte 2: Autenticación** (Bcrypt KDF vs. BD, por qué 15 min de bloqueo, CAPTCHA HMAC, revocación JWT, errores uniformes) | **8 – 9 min** |
| **Expositor 3** | **Diapositivas 12 a 15** | **Parte 3: Autorización** (Motor RBAC+ABAC, relación entre 2 atributos, por qué un rol mayor accede a datos de roles a su cargo en la Matriz de Mínimo Privilegio y políticas) y **Parte 4: Auditoría y Trazabilidad** (`ROL_CAMBIO`, `SUPERVISION_ROL_CARGO`, `ACCESO_DENEGADO`, cuenta *break-glass* y Notas `ACT-01..08`) | **9 – 10 min** |
| **Expositor 4** | **Diapositivas 16 a 24** | **Parte 5: Recuperación y Continuidad**, **Parte 6: Matriz de Doble Entrada**, **Parte 7: Políticas (Pirani Risk) y Criptosistema AES-256-GCM vs. Hash**, **Parte 8: Controles C-01 a C-23** + **Demostración en Vivo** | **9 – 11 min** |

---

## 📊 Contenido y Guion Hablado Diapositiva por Diapositiva

### Diapositiva 1 — Portada Oficial (0:00 – 1:30)
- **Contenido visual:**
  - **“YASUMIVENTAS”** — **Grupo: Detalles**
  - **Estudiantes:**
    1. Bustillos Choque Miguel Angel (C.I.: 13760600)
    2. Colque Paucara Klever Calet (C.I.: 14414631)
    3. Mamani Colmena Gerson (Representante — C.I.: 12958104)
    4. Rojas Guachalla Ranulfo Antonio (C.I.: 11076290)
  - Docente: Ph.D. Luisa Velásquez López.
- **🎙️ Qué decir en la defensa:**
  > *"Buenos días/tardes Ph.D. Luisa Velásquez López. Hoy presentamos y defendemos el Proyecto Final de Seguridad de la Información aplicado al sistema funcional **Yasumi Venta**. A lo largo de esta exposición demostraremos cómo aseguramos de extremo a extremo la infraestructura del sistema, cubriendo desde la demostración de criticidad y el ciclo de vida de las identidades hasta la autorización contextual, la auditoría inmutable, las políticas de seguridad y la verificación práctica de controles."*

---

### Diapositiva 2 — Agenda y Estructura de la Defensa (1:30 – 3:00)
- **Contenido visual:** Tabla de los 5 bloques (Secciones A–F, Partes 1–2, Partes 3–4, Partes 5–8 y Demostración en Vivo).
- **🎙️ Qué decir en la defensa:**
  > *"Hemos estructurado nuestra defensa siguiendo estrictamente el índice oficial de la materia: comenzamos con el contexto arquitectónico y la demostración de criticidad (Secciones A a F), continuamos con Identidades y Autenticación (Partes 1 y 2), luego Autorización contextual y Auditoría forense (Partes 3 y 4), después Continuidad, Matriz de Mínimo Privilegio, Políticas bajo el marco de Pirani Risk e ISO 27001 y Controles Verificables (Partes 5 a 8), y cerramos con la demostración en vivo."*

---

### Diapositiva 3 — A, B, C y D: Introducción, Problema (4 Subproblemas) y Objetivos (4 Objetivos) (3:00 – 4:30)
- **Puntos clave en diapositiva (Alineado a la Guía Oficial de Planteamiento de Proyectos SI):**
  - **A. Qué es Yasumi Venta:** Sistema web para gestionar catálogo floral, inventario, clientes, reservas, entregas a domicilio (`delivery`), pagos y auditoría.
  - **B. Problema (4 Subproblemas Específicos):**
    1. *Debilidad en mecanismos de acceso y suplantación de identidad* (fuerza bruta, sesiones no revocadas, ausencia de 2FA).
    2. *Ausencia de control de acceso granular y abuso de privilegios* (escalamiento horizontal y vertical entre roles).
    3. *Almacenamiento e intercambio inseguro de información sensible* (necesidad de hash unidireccional y cifrado bidireccional).
    4. *Falta de mecanismos de integridad, confidencialidad y disponibilidad* (auditoría *Append-Only* y continuidad operativa).
  - **C y D. Objetivo General y 4 Objetivos Específicos:**
    1. *Fundamentos y Criticidad* (Activos, riesgos CIA y Políticas).
    2. *Identificación y Autenticación* (Ciclo de vida de identidades, Bcrypt, CAPTCHA HMAC, bloqueo y 2FA TOTP).
    3. *Autorización y Criptografía* (Matriz de Mínimo Privilegio RBAC+ABAC, Hash Unidireccional Bcrypt y Cifrado Bidireccional Vigenère con alfabeto ASCII).
    4. *Auditoría, Continuidad y Evaluación de Seguridad* (Bitácora inmutable y 23 controles verificables).
- **🎙️ Qué decir en la defensa:**
  > *"Yasumi Venta gestiona operaciones comerciales reales donde convergen cuatro actores: Administrador, Vendedor, Cliente e Invitado. El problema central que resolvemos es que una aplicación comercial tradicional suele confiar en validaciones del navegador, carece de revocación inmediata de tokens y no protege su bitácora contra borrado. Nuestro objetivo fue blindar cada capa del sistema con controles técnicos comprobables."*

---

### Diapositiva 4 — E.1 a E.3: Arquitectura en 3 Capas y Modelo de Datos (4:30 – 6:30)
- **Puntos clave en diapositiva:**
  - **Capa 1 (Frontend SPA):** React 18 + Vite. Solo orienta la experiencia de usuario; **nunca toma decisiones finales de seguridad**.
  - **Capa 2 (Backend API REST):** Node.js + Express (`:3002`) con cadena de 8 middlewares (`securityHeaders`, `globalLimiter`, `cors`, `csrfProtection`, `sanitizePayload`, `emergencyModeMiddleware`, `verifyToken`, `isAdmin`).
  - **Capa 3 (Base de Datos):** PostgreSQL 18 (`bd_yasumi`) con 14 tablas normalizadas + vista inmutable `log_auditoria`.
- **🎙️ Qué decir en la defensa:**
  > *"Nuestra arquitectura desacopla el frontend en React del backend en Express y de la base de datos en PostgreSQL 18. El principio rector es que el frontend jamás decide quién tiene permiso: toda petición pasa por una cadena de 8 middlewares en el servidor antes de ejecutar consultas 100% parametrizadas sobre las 14 tablas del modelo."*

---

### Diapositiva 5 — E.4: Superficie de Ataque (Puntos de Entrada de la API) (6:30 – 8:00)
- **Puntos clave en diapositiva:** Tabla completa de endpoints (`/api/auth/captcha`, `/api/auth/login`, `/api/auth/registro`, `/api/auth/logout`, `/api/productos`, `/api/usuarios`, `/api/usuarios/:id/toggle`, `/api/usuarios/:id/rol`, `/api/logs`).
- **🎙️ Qué decir en la defensa:**
  > *"Analizamos cada punto de entrada de la API REST como superficie de ataque. Las rutas públicas están protegidas contra bots y fuerza bruta; las rutas de negocio validan el estado activo del usuario en tiempo real; y las operaciones críticas como el cambio de rol en `PUT /api/usuarios/:id/rol` exigen un segundo factor de autenticación (2FA)."*

---

### Diapositiva 6 — F.1 y F.2: Condición Fundamental — Criticidad e Impacto CIA (8:00 – 10:00)
- **Puntos clave en diapositiva:**
  - Clasificación de activos: **Restringida** (`usuario.password`, `JWT_SECRET`, `log_auditoria`), **Confidencial** (PII en `persona`/`cliente`/`delivery`, finanzas en `reserva`/`pago`), **Interna/Pública** (`producto`, `categoria`).
  - Impacto sobre **Confidencialidad** (Alto), **Integridad** (Crítico) y **Disponibilidad** (Alto).
- **🎙️ Qué decir en la defensa:**
  > *"Para demostrar la criticidad de la infraestructura clasificamos todos los activos en cuatro niveles. El impacto en Confidencialidad es alto porque resguardamos direcciones domiciliarias reales; en Integridad es crítico porque alterar precios, pagos o borrar la bitácora causa fraude directo; y en Disponibilidad es alto porque el servicio de identidad es el punto único de entrada para las ventas."*

---

### Diapositiva 7 — F.3 a F.5: Matriz de Riesgos y Escenario de Impacto (10:00 – 11:30)
- **Puntos clave en diapositiva:** Amenazas `A1` a `A6` (fuerza bruta, tokens zombies, escalada de rol, borrado de logs, SQLi/XSS, fuga de `.env`) y comparativa del escenario de ataque antes vs. después del endurecimiento.
- **🎙️ Qué decir en la defensa:**
  > *"Si un atacante intentara hoy ejecutar una cadena de intrusión —automatizar el login, reutilizar un token cerrado, escalar su rol y borrar sus huellas en la bitácora—, chocaría con cuatro muros independientes: el CAPTCHA firmado por servidor (C-08), el bloqueo de 15 minutos (C-07), la lista de revocación en vivo (C-05/C-06) y el trigger SQL que prohíbe `DELETE` o `UPDATE` en los logs (C-13)."*

---

### Diapositiva 8 — PARTE 1 (Puntos a, b, c): Identificación, Estados y Credenciales (11:30 – 13:30)
- **Puntos clave en diapositiva (Responde Observaciones 1.1 y 1.3):**
  - **Relación Ciclo de Vida de la Identidad $\leftrightarrow$ Credenciales:**
    - *Alta (`activa`)* $\rightarrow$ Se crea hash Bcrypt (factor 10) y graba `IDENTIDAD_ALTA`.
    - *Cambio de función (`activa`)* $\rightarrow$ Exige 2FA y graba `ROL_CAMBIO`.
    - *Suspensión (`suspendida`)* $\rightarrow$ Conserva el hash pero bloquea el login y revoca sesiones abiertas al instante (`IDENTIDAD_SUSPENDIDA`).
    - *Reactivación (`activa`)* $\rightarrow$ Restablece acceso (`IDENTIDAD_REACTIVADA`).
    - *Revocación (`revocada`)* $\rightarrow$ Baja definitiva; inutiliza credenciales pero conserva `id_usuario` para no romper el historial de ventas.
  - **Invitado Efímero (R1.6 / C-22):** Sin cuenta compartida ni clave en BD; usa un token JWT efímero de 2 horas de solo lectura.
- **🎙️ Qué decir en la defensa:**
  > *"En la Parte 1 diferenciamos claramente la identidad (`persona`) de sus credenciales (`password`, JWT y 2FA), demostrando cómo cada cambio de estado de la identidad gobierna automáticamente la validez de sus credenciales y deja un rastro histórico de altas, bajas y cambios de función en la bitácora."*

---

### Diapositiva 9 — PARTE 1 (Puntos d, e): Bloqueo de Suspendidos y Cambio de Rol con 2FA (13:30 – 15:30)
- **Puntos clave en diapositiva (Responde Observaciones 1.2 y 1.4):**
  - **Si está suspendido, prohibido que entre (Doble Barrera — C-05):**
    1. En Login: rechaza el acceso y graba `LOGIN_BLOQUEADO_INACTIVO` en el log.
    2. En Sesiones Abiertas: `verifyToken` consulta `SELECT activo, rol FROM usuario WHERE id_usuario = $1` en cada petición y devuelve `401` inmediato.
  - **Cambio de rol con autorización y PDF (`PUT /api/usuarios/:id/rol` — C-12):**
    - Exige token 2FA (`X-2FA-Token`), impide auto-edición (`idSolicitante !== idTarget`), protege al último Admin activo, exige motivo escrito y se exporta en el **Reporte PDF de Bitácora**.

---

### Diapositiva 10 — PARTE 2 (Puntos a, b): Autenticación, KDF Bcrypt y Seguridad de la BD (15:30 – 17:30)
- **Puntos clave en diapositiva (Responde Observaciones 2.2 y 2.3):**
  - **¿Qué es una Función de Derivación de Claves (KDF) y qué relación tiene con la seguridad de la BD?**
    - A diferencia de un hash rápido como SHA-256, **Bcrypt (factor 10 = $2^{10}$ rondas)** agrega una **sal aleatoria única de 128 bits** por usuario y lentitud deliberada de CPU.
    - **Relación con la BD:** Es la última línea de defensa en reposo; si un atacante robara un respaldo `pg_dump` de PostgreSQL, solo vería cadenas `$2b$10$...` irreversibles y no podría usar *Rainbow Tables*.
  - **Tabla de identificación de claves de seguridad** según a quién se le asigna (Administrador, Vendedor, Cliente, Invitado, `JWT_SECRET`).

---

### Diapositiva 11 — PARTE 2 (Puntos c, d, e, f): Bloqueo de 15 Min, Revocación y Mensajes Uniformes (17:30 – 19:30)
- **Puntos clave en diapositiva (Responde Observaciones 2.1 y 2.4):**
  - **¿Por qué bloquear 15 minutos después de 6 intentos fallidos? (C-07):**
    - *¿Por qué 6 intentos?* De 1 a 3 fallos pueden ser un error humano de digitación (*typos* o `Caps Lock`); 6 fallos consecutivos confirman un intento de fuerza bruta.
    - *¿Por qué 15 minutos?* Reduce la velocidad de un atacante de 1,000 claves/min a solo 24 claves/hora (un diccionario de 100,000 claves tomaría 173 días), pero al ser temporal evita que un atacante bloquee permanentemente a todos los empleados (*Account Lockout DoS*).
  - **Mensajes uniformes que no revelan cuentas ni contraseñas ajenas (C-01):**
    - En login siempre devuelve `401 "Credenciales inválidas..."` usando `DUMMY_HASH`.
    - En registro jamás dice *"No puedes usar esa contraseña porque ya la usa otro usuario"*, porque eso revelaría que otro usuario tiene esa clave y delataría falta de *salt*.

---

### Diapositiva 12 — PARTE 3 (Puntos a, b, c, d): Autorización en el Servidor (19:30 – 21:30)
- **Puntos clave en diapositiva:**
  - Evaluación de los 5 elementos en el backend: **(a)** Identidad autenticada y activa en BD, **(b)** Operación solicitada, **(c)** Recurso afectado, **(d)** Permisos vigentes en lista blanca (`PERMISOS[rol] ?? []`) y **(e)** Contexto relevante.
  - Fallo cerrado (*Fail-Safe Defaults* — **C-18**) ante cualquier rol inexistente o manipulado.

---

### Diapositiva 13 — PARTE 3 (Punto e): Contexto entre Dos Atributos, Jerarquía de Roles y Políticas (21:30 – 24:00)
- **Puntos clave en diapositiva (Responde Observaciones de Parte 3):**
  - **Relación entre dos atributos:** El motor evalúa predicados $P(\text{Atributo}_{\text{sujeto}}, \text{Atributo}_{\text{objeto}})$, como titularidad (`reserva.id_cliente == req.user.id`) o no-reflexividad (`req.user.id != req.params.id`).
  - **¿Por qué un rol mayor puede tener información crítica sobre otros roles a su cargo? (Énfasis en la Matriz de Mínimo Privilegio):**
    - **Administrador $\rightarrow$ Vendedor y Cliente:** Accede a estado laboral, historial de ventas y bitácora por necesidad de supervisión operativa y auditoría. **Límite en la Matriz:** No ve contraseñas, no puede editar ni borrar `log_auditoria` (**C-13**), no puede auto-modificarse su rol/estado (**R3.7**) y requiere **2FA** (**C-12**).
    - **Vendedor $\rightarrow$ Cliente:** Accede a teléfono, dirección de entrega (`delivery`) y comprobante (`pago`) únicamente para preparar y despachar el pedido a su cargo (`reserva.id_usuario == req.user.id`).
  - **Uso de Políticas:** Articulado directamente con Política 1 (R1.3, R1.4), Política 3 (R3.1–R3.7), Política 4 (R4.1, R4.2) y Política 5 (R5.1, R5.3).

---

### Diapositiva 14 — PARTE 4 (Puntos a, b, c, d): Auditoría, Supervisión, Denegaciones e Inmutabilidad (24:00 – 26:30)
- **Puntos clave en diapositiva (Responde Observaciones de Parte 4):**
  - **Cambios de rol (`ROL_CAMBIO`):** Registra quién hizo el cambio, a qué usuario, rol anterior, rol nuevo, validación 2FA y motivo.
  - **Trazabilidad de roles superiores (`SUPERVISION_ROL_CARGO`):** Vigila al supervisor cada vez que consulta información delicada de subordinados (`GET /api/usuarios`).
  - **Intentos de roles inferiores denegados (`ACCESO_DENEGADO` — C-11):** Registra cualquier intento 403 con el rol e IP del infractor.
  - **Inmutabilidad en BD (C-13):** Trigger `trg_proteger_log_acceso` que bloquea `UPDATE` y `DELETE` con `permission denied`.

---

### Diapositiva 15 — PARTE 4 (Puntos e, f): Cuentas de Emergencia y Notas de Actualización por Amenaza (26:30 – 28:30)
- **Puntos clave en diapositiva:**
  - **Punto e — Uso de cuentas de emergencia (`emergencia@yasumi.com` — C-21):** Custodia fuera de línea (*break-glass*), registro inmediato de `EMERGENCIA_USO` en login y en cada petición HTTP, más auditoría y rotación obligatoria en 24 horas.
  - **Punto f — Notas de actualización en base a amenazas (`ACT-01` a `ACT-08`):** Tabla que vincula cada amenaza (fuerza bruta, bots en CAPTCHA, *timing attacks*, sesiones zombies, escalada de privilegios, XSS/CSRF, Slowloris DoS y borrado forense) con el cambio de configuración aplicado (`CONFIG_CAMBIO`).

---

### Diapositiva 16 — PARTE 5: Recuperación y Continuidad Operativa (28:30 – 30:30)
- **Puntos clave en diapositiva (Responde Observaciones de Parte 5):**
  - **a) ¿Por qué dar una cuenta diferente a cada aplicación/capa?** Para contener el radio de explosión (*Blast Radius*): `yasumi_app_user` (API), `yasumi_backup_user` (respaldos de solo lectura) y `admin@yasumi.com` (interfaz web) están aislados entre sí.
  - **b) Cuando no se puede verificar o asignar un permiso:** El sistema aplica **Fallo Cerrado (*Fail-Closed*)** y activa `MODO_EMERGENCIA=lectura` (**C-19**), manteniendo visible el catálogo y bloqueando escrituras con `503`.
  - **c) Quién alteró los expedientes:** Correlación forense en `log_auditoria` (`id_usuario` + `ip_address` + ventana temporal) y restauración con objetivos **RTO = 4h** y **RPO = 24h**.

---

### Diapositiva 17 — PARTE 6: Matriz de Mínimo Privilegio (Doble Entrada) (30:30 – 32:30)
- **Puntos clave en diapositiva (Responde Observación de Parte 6):**
  - Tabla de doble entrada donde **las Filas (Eje Vertical)** son los **Roles y Grupos de Seguridad** (`Administrador`, `Vendedor`, `Cliente`, `Invitado`, `Cuenta de Emergencia`, `Servicio API yasumi_app_user`), **las Columnas (Eje Horizontal)** son los **Recursos y Sistemas**, y **las Celdas** definen el nivel exacto de acceso (`Ninguno`, `Solo Lectura`, `Lectura y Escritura Propia`, `Administrador con 2FA`, `Append-Only`).

---

### Diapositiva 18 y 19 — PARTE 7 y Criptografía: Políticas de Seguridad (Pirani Risk), Hash Unidireccional y Vigenère Bidireccional con ASCII (32:30 – 37:00)
- **Puntos clave en diapositivas:**
  - **Estructura Pirani Risk / ISO 27001:** Objetivo General, Alcance, Roles y Responsabilidades, Excepciones y Sanciones, más el **"¿Por qué?"** que justifica cada una de las 8 políticas.
  - **Criptosistemas Unidireccional y Bidireccional en el Backend:**
    1. **Criptosistema Unidireccional (Función Hash Criptográfica `bcrypt` para contraseñas):**
       - **¿Dónde se usa?** Exclusivamente en las contraseñas (`usuario.password` en [`authController.js`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/back-seguridad-main/src/controllers/authController.js)), que son datos que **no necesitan ni deben desencriptarse para nadie**.
       - **¿Cómo funciona?** Genera un resumen irreversible con sal aleatoria y factor de trabajo 10 (`$2b$10$...`). Al iniciar sesión, el backend compara el hash calculado (`bcrypt.compare`) sin desencriptar jamás la contraseña.
    2. **Criptosistema Bidireccional (Cifrado de Vigenère adaptado al alfabeto ASCII en [`cryptoAssets.js`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/back-seguridad-main/src/utils/cryptoAssets.js)):**
       - **¿Dónde se usa?** En los datos que **SÍ se muestran** y requieren recuperarse en texto claro (como el título `nombre` y `descripcion` en [`productController.js`](file:///c:/Users/Miguel/Desktop/sistema%20de%20ventas/back-seguridad-main/src/controllers/productController.js)).
       - **¿Cómo funciona al guardar (Cifrar con Vigenère ASCII)?** En lugar del alfabeto de 27 letras, usa el alfabeto ASCII ($N=191$). Para cada carácter calcula `valor_texto = alfabeto.indexOf(letra)`, `valor_clave = alfabeto.indexOf(clave[indice_clave % clave.length])` y obtiene `nuevo_valor = (valor_texto + valor_clave) % N`.
       - **¿Cómo funciona al mostrar (Descifrar en el Backend)?** Antes de enviar el catálogo al frontend, el backend invierte la operación modular con `nuevo_valor = (valor_texto - valor_clave + N) % N`, devolviendo el texto original exacto.

---

### Diapositiva 20 y 21 — PARTE 8: Matriz de Aplicación de Políticas, Controles (C-01 a C-23) y Ciberdefensa (37:00 – 38:30)
- **Puntos clave en diapositivas:**
  - Matriz cruzada que indica en qué Parte y módulo aplica cada Política y cómo se verifica con los controles **C-01 a C-23**.
  - Resumen de resistencia frente a ataques del catálogo (SQLi, XSS, CSRF, Brute Force, Bot CAPTCHA Bypass, Timing Attacks, Zombie Tokens, Privilege Escalation, Slowloris DoS y Log Tampering).

---

### Diapositiva 22, 23 y 24 — Demostración en Vivo, Preguntas del Tribunal y Conclusiones (38:30 – 40:00)
- **Ruta de 5 pasos para la Demo en Vivo:**
  1. **Login (`/login`):** Mostrar CAPTCHA firmado (`Anti-Bot Activo`) e ingresar como **Invitado** (token efímero de 2h).
  2. **Catálogo (`/catalogo`):** Mostrar las animaciones, filtros e intento bloqueado de compra para invitado.
  3. **Dashboard (`/dashboard`):** Entrar como **Administrador** y usar las tarjetas de **Navegación Rápida**.
  4. **Usuarios (`/usuarios`):** Abrir el modal **`🔑 Rol (2FA)`**, escribir un motivo de auditoría, generar el código TOTP dinámico de 6 dígitos (RFC 6238 / 30s) y confirmar el cambio de rol (**C-12**).
  5. **Reportes y Auditoría (`/reportes`):** Filtrar la bitácora por **"Roles e Identidades"** o **"Supervisión"**, ver en vivo los eventos `ROL_CAMBIO` y `SUPERVISION_ROL_CARGO`, y descargar el **PDF de Bitácora Forense**.

