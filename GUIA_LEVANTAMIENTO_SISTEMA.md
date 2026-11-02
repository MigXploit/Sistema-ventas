# 🚀 Guía de Instalación, Configuración y Levantamiento del Sistema "Yasumi"
> **Proyecto:** Sistema Integral de Ventas, Inventario y Seguridad — *Yasumi (Florería & Regalos)*  
> **Ubicación del Documento:** Raíz del Workspace (`sistema de ventas/GUIA_LEVANTAMIENTO_SISTEMA.md`)  
> **Entorno objetivo:** Windows 10/11 (compatible con Linux y macOS)  
> **Fecha:** Octubre 2026  

---

## 📋 Tabla de Contenidos
1. [Requisitos Previos del Sistema](#1-requisitos-previos-del-sistema)
2. [Arquitectura de Puertos y Servicios](#2-arquitectura-de-puertos-y-servicios)
3. [Paso 1: Configuración de la Base de Datos (PostgreSQL)](#paso-1-configuración-de-la-base-de-datos-postgresql)
   - 3.1. Creación de la Base de Datos
   - 3.2. Restauración del Esquema y Datos Semilla con `psql` (Terminal)
   - 3.3. Alternativa visual mediante pgAdmin 4
4. [Paso 2: Instalación y Puesta en Marcha del Backend](#paso-2-instalación-y-puesta-en-marcha-del-backend)
   - 4.1. Navegación a la carpeta del Backend
   - 4.2. Configuración de Variables de Entorno (`.env`)
   - 4.3. Instalación de Dependencias Node.js
   - 4.4. Ejecución del Servidor
   - 4.5. Verificación de Salud (`/ping`)
5. [Paso 3: Instalación y Puesta en Marcha del Frontend](#paso-3-instalación-y-puesta-en-marcha-del-frontend)
   - 5.1. Navegación a la carpeta del Frontend
   - 5.2. Instalación de Dependencias
   - 5.3. Configuración de Entorno (Opcional)
   - 5.4. Ejecución del Servidor de Desarrollo (Vite)
6. [Paso 4: Credenciales de Acceso para Pruebas](#paso-4-credenciales-de-acceso-para-pruebas)
7. [Paso 5: Flujo de Verificación y Pruebas Iniciales](#paso-5-flujo-de-verificación-y-pruebas-iniciales)
8. [Paso 6: Solución de Problemas Frecuentes (Troubleshooting)](#paso-6-solución-de-problemas-frecuentes-troubleshooting)
9. [Comandos de Resumen Rápido (Cheat Sheet)](#comandos-de-resumen-rápido-cheat-sheet)

---

## 1. Requisitos Previos del Sistema

Antes de iniciar, asegúrate de contar con el siguiente software instalado en tu equipo:

1. **Node.js (LTS recomendado):** Versión 18.x, 20.x o superior.
   - Descarga oficial: [https://nodejs.org/](https://nodejs.org/)
   - Verifica en terminal:
     ```bash
     node --version
     npm --version
     ```
2. **PostgreSQL Server:** Versión 14 o superior en ejecución.
   - Descarga oficial: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - Debe recordar la contraseña del superusuario `postgres` definida durante la instalación.
3. **Cliente de Base de Datos:**
   - La herramienta de consola `psql` (incluida con el instalador de PostgreSQL) **o** una herramienta gráfica como **pgAdmin 4**, **DBeaver** o **VS Code Database Client**.
4. **Navegador Web:** Google Chrome, Microsoft Edge, Mozilla Firefox o Brave.

---

## 2. Arquitectura de Puertos y Servicios

Durante la ejecución local, el sistema empleará tres componentes en simultáneo:

| Servicio | Tecnología | Host / Puerto Local | Descripción |
|---|---|---|---|
| **Base de Datos** | PostgreSQL | `localhost:5432` | Base de datos relacional `bd_yasumi`. |
| **Backend API** | Node.js / Express 5 | `http://localhost:3002` | API REST, JWT, manejo de imágenes y lógica. |
| **Frontend Web** | React 18 / Vite 5 | `http://localhost:5173` | SPA (Single Page Application) interactiva. |

---

## Paso 1: Configuración de la Base de Datos (PostgreSQL)

El archivo de migración con las tablas, relaciones y datos de prueba se encuentra en:  
`c:\Users\Miguel\Desktop\sistema de ventas\back-seguridad-main\db\bd_yasumi_postgres.sql`

### 3.1. Creación de la Base de Datos
Abre una terminal (PowerShell o CMD) y conéctate a PostgreSQL con el usuario `postgres`:

```bash
psql -U postgres
```
*(Introduce la contraseña de tu usuario postgres cuando te lo solicite)*

Una vez dentro de la consola interactiva de PostgreSQL (`postgres=#`), ejecuta:

```sql
CREATE DATABASE bd_yasumi;
\q
```

---

### 3.2. Restauración del Esquema y Datos Semilla con `psql` (Terminal)
Desde la terminal, ubícate en la carpeta raíz del proyecto y ejecuta la restauración directamente:

#### En Windows (PowerShell / CMD):
```powershell
cd "c:\Users\Miguel\Desktop\sistema de ventas\back-seguridad-main"
psql -U postgres -d bd_yasumi -f "db/bd_yasumi_postgres.sql"
```

El script creará automáticamente las 17 tablas relacionales, secuencias, llaves foráneas y registros de prueba iniciales (categorías, productos, personas, usuarios con contraseñas encriptadas en bcrypt, horarios, delivery, pagos, etc.).

---

### 3.3. Alternativa visual mediante pgAdmin 4
Si prefieres utilizar la interfaz gráfica de **pgAdmin 4**:
1. Abre **pgAdmin 4** e inicia sesión en tu servidor local.
2. En el panel izquierdo, haz clic derecho en **Databases** ➔ **Create** ➔ **Database...**
3. En el campo **Database**, ingresa `bd_yasumi` y haz clic en **Save**.
4. Selecciona la base de datos `bd_yasumi` recién creada.
5. En el menú superior, ve a **Tools** ➔ **Query Tool**.
6. Haz clic en el ícono de carpeta (**Open File**) y selecciona el archivo:  
   `back-seguridad-main/db/bd_yasumi_postgres.sql`
7. Presiona la tecla **F5** (o el botón de *Play* ▶) para ejecutar todo el script.
8. En el panel de mensajes confirmará: `Query returned successfully... COMMIT`.

---

## Paso 2: Instalación y Puesta en Marcha del Backend

### 4.1. Navegación a la carpeta del Backend
Abre tu primera terminal y entra a la carpeta del servidor:

```bash
cd "c:\Users\Miguel\Desktop\sistema de ventas\back-seguridad-main"
```

---

### 4.2. Configuración de Variables de Entorno (`.env`)
Verifica que exista el archivo `.env` en `back-seguridad-main/.env`. Si no existe, puedes crearlo copiando el archivo de ejemplo:

```powershell
cp .env.example .env
```

Asegúrate de que los valores coincidan con las credenciales de tu PostgreSQL local. Ejemplo de archivo `.env`:

```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgresql_aqui
DB_NAME=bd_yasumi
JWT_SECRET=Layla
JWT_EXPIRES_IN=8h
FRONTEND_PUBLIC_DIR=../front-seguridad-main/public
```

> ⚠️ **Importante:**
> - Reemplaza `DB_PASSWORD` con la contraseña real que configuraste en tu instalación de PostgreSQL.
> - La variable `FRONTEND_PUBLIC_DIR` apunta a `../front-seguridad-main/public` para que las fotos que subas desde el panel de productos se guarden automáticamente en la carpeta pública del frontend.

---

### 4.3. Instalación de Dependencias Node.js
Dentro de `back-seguridad-main`, ejecuta:

```bash
npm install
```
*(Esto instalará Express, PG, Bcryptjs, JsonWebToken, Express-Validator, CORS y Dotenv).*

---

### 4.4. Ejecución del Servidor
Tienes dos modos para arrancar el backend:

#### Modo Desarrollo (con reinicio automático al guardar cambios):
```bash
npm run dev
```

#### Modo Producción / Estándar:
```bash
npm start
```

**Salida esperada en consola:**
```text
[Yasumi Backend] Servidor activo en http://localhost:3002
[Yasumi DB] Iniciando sincronización de imágenes locales...
[Yasumi DB] Todas las imágenes y rutas están sincronizadas.
```

---

### 4.5. Verificación de Salud (`/ping`)
Abre tu navegador o ejecuta en otra consola:
```text
http://localhost:3002/ping
```
El servidor debe responder con un mensaje JSON como el siguiente:
```json
{
  "mensaje": "Pong! Conexión exitosa a bd_yasumi"
}
```
Esto confirma que el backend está corriendo y conectado satisfactoriamente a PostgreSQL.

---

## Paso 3: Instalación y Puesta en Marcha del Frontend

> 💡 **Nota:** Deja la terminal del backend abierta y corriendo. Para el frontend utilizaremos una **segunda terminal**.

### 5.1. Navegación a la carpeta del Frontend
Abre una **nueva ventana o pestaña de terminal** y navega a la carpeta del frontend:

```bash
cd "c:\Users\Miguel\Desktop\sistema de ventas\front-seguridad-main"
```

---

### 5.2. Instalación de Dependencias
Ejecuta la instalación de paquetes con npm:

```bash
npm install
```
*(Esto instalará React 18, Vite, React Router DOM, Axios, Chart.js, jsPDF y jspdf-autotable).*

---

### 5.3. Configuración de Entorno (Opcional)
Por defecto, el archivo `src/api/axiosConfig.js` se conecta automáticamente a `http://localhost:3002/api`. Si decidiste cambiar el puerto del backend a otro distinto (por ejemplo, `3005`), puedes crear un archivo `.env` en la raíz de `front-seguridad-main` con:

```env
VITE_API_URL=http://localhost:3002
```

---

### 5.4. Ejecución del Servidor de Desarrollo (Vite)
Inicia la aplicación frontend ejecutando:

```bash
npm run dev
```

**Salida esperada en consola:**
```text
  VITE v5.0.0  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Abre tu navegador e ingresa a:  
👉 **[http://localhost:5173](http://localhost:5173)**

---

## Paso 4: Credenciales de Acceso para Pruebas

El script de la base de datos incluye cuentas precargadas con diferentes niveles de acceso:

| Rol | Correo Electrónico | Contraseña | Vistas y Accesos Permitidos |
|---|---|---|---|
| **Administrador** | `carlos.m@example.com` | `password` | **Acceso total:** Dashboard, Catálogo, Gestión de Productos (CRUD completo), Reportes (Gráficos + PDFs) y Gestión de Usuarios. |
| **Vendedor** | `ana.g@example.com` | `password` | Dashboard de métricas y Catálogo general. |
| **Cliente** | `juan.perez@example.com` | `password` | Exclusivamente Catálogo de productos con botón de consulta a WhatsApp. |
| **Invitado (Guest)** | *(Sin correo ni registro)* | *(Sin clave)* | Puedes hacer clic en el botón gris **"Entrar como Invitado 👥"** en la pantalla de login para navegar el catálogo sin crear cuenta. |

> 🧩 **Sobre el CAPTCHA Matemático:**  
> En la pantalla de login verás una operación matemática simple (ejemplo: `6 + 4 = ?`). Debes escribir el resultado correcto (`10`) en la casilla para poder iniciar sesión o registrar una cuenta.

---

## Paso 5: Flujo de Verificación y Pruebas Iniciales

Para asegurarte de que todo el sistema funciona al 100%:

1. **Prueba de Login:**
   - Ingresa con el usuario de Administrador: `carlos.m@example.com` / `password`.
   - Resuelve el CAPTCHA y presiona **Iniciar Sesión**.
   - Serás redirigido al **Dashboard** principal.
2. **Prueba del Catálogo y WhatsApp:**
   - Haz clic en **Catálogo** en el menú de navegación.
   - Prueba la búsqueda en tiempo real de productos.
   - Filtra por categorías (*Tortas Personalizadas*, *Bocaditos Finos*, etc.).
   - Al pulsar el botón **"Consultar"** en cualquier producto, se abrirá WhatsApp con el mensaje preformateado hacia el número del negocio.
3. **Prueba del Módulo de Productos (CRUD y Subida de Imágenes):**
   - Ve a **Productos** en el menú de navegación.
   - Presiona **+ Nuevo Producto**.
   - Arrastra una imagen desde tu computadora a la zona punteada del modal (*Drag & Drop*) o selecciónala.
   - Completa el nombre, categoría, precio, stock y descripción.
   - Guarda el producto y comprueba que se agregue a la tabla y que la imagen se guarde en `front-seguridad-main/public/productos/...`.
   - Prueba la **baja lógica** presionando *Eliminar* y luego *Restaurar*.
4. **Prueba de Reportes e Inteligencia de Negocio:**
   - Ve a **Reportes**.
   - Observa el gráfico de Dona (porcentaje por categoría) y el gráfico de Barras (precios unitarios).
   - Haz clic en **Descargar PDF (Inventario)** para descargar el reporte formal maquetado con jsPDF.
   - Revisa la tabla de **Registro de Accesos (Auditoría)** que muestra tu IP, navegador y hora de ingreso.
   - Haz clic en **Descargar PDF (Accesos)** para generar el reporte de auditoría.
5. **Prueba de Cierre de Sesión:**
   - Haz clic en el botón superior derecho **Salir ↗**.
   - El sistema registrará el evento `'SALIDA'` en la base de datos y limpiará el token JWT.

---

## Paso 6: Solución de Problemas Frecuentes (Troubleshooting)

### Problema 1: Error `Error de base de datos: connect ECONNREFUSED 127.0.0.1:5432`
- **Causa:** El servicio de PostgreSQL no está encendido o el puerto no es el 5432.
- **Solución:**
  1. En Windows, abre el administrador de servicios presionando `Win + R`, escribe `services.msc` y presiona Enter.
  2. Busca el servicio llamado **postgresql-x64-XX** (donde XX es la versión).
  3. Haz clic derecho y selecciona **Iniciar** o **Reiniciar**.

---

### Problema 2: Error `password authentication failed for user "postgres"`
- **Causa:** La contraseña en `back-seguridad-main/.env` no coincide con la contraseña maestra de PostgreSQL.
- **Solución:** Abre el archivo `back-seguridad-main/.env`, corrige la línea `DB_PASSWORD=tu_contraseña_correcta` y reinicia el backend con `npm run dev`.

---

### Problema 3: Error `EADDRINUSE: address already in use :::3002` o `:::5173`
- **Causa:** Quedó un proceso anterior de Node.js corriendo en ese puerto en segundo plano.
- **Solución en Windows (PowerShell):**
  Para encontrar y cerrar el proceso que ocupa el puerto 3002:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess | Stop-Process -Force
  ```
  O si es el puerto 5173:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
  ```

---

### Problema 4: `npm : No se puede cargar el archivo ... porque la ejecución de scripts está deshabilitada en este sistema`
- **Causa:** Política de seguridad restrictiva de PowerShell en Windows.
- **Solución:** Abre PowerShell como Administrador y ejecuta:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
  Escribe `S` y presiona Enter para confirmar.

---

### Problema 5: Al subir una imagen de producto dice error o no se ve
- **Causa:** La ruta `FRONTEND_PUBLIC_DIR` en el `.env` del backend no apunta correctamente a la carpeta `public` del frontend.
- **Solución:** Verifica que en `back-seguridad-main/.env` tengas:
  ```env
  FRONTEND_PUBLIC_DIR=../front-seguridad-main/public
  ```
  El backend creará automáticamente las subcarpetas necesarias (`productos/<categoria>`) al momento de subir la imagen.

---

## Comandos de Resumen Rápido (Cheat Sheet)

Para arrancar el sistema en el día a día una vez configurado:

```powershell
# 1. Asegúrate de tener PostgreSQL activo (Servicio postgresql)

# 2. Terminal 1 — Backend (Puerto 3002):
cd "c:\Users\Miguel\Desktop\sistema de ventas\back-seguridad-main"
npm run dev

# 3. Terminal 2 — Frontend (Puerto 5173):
cd "c:\Users\Miguel\Desktop\sistema de ventas\front-seguridad-main"
npm run dev

# 4. Abrir en Navegador:
# http://localhost:5173
```

---
*Documentación elaborada para la puesta en marcha exitosa del sistema Yasumi.*

