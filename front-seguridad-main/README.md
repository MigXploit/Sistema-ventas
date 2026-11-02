# 🌸 Yasumi — Florería & Regalos (Versión Vite)

## 🚀 Pasos para ejecutar

### 1. Instalar Node.js
Descarga desde https://nodejs.org/ (versión LTS)

Verifica en la terminal:
```bash
node --version
npm --version
```

### 2. Instalar dependencias
Abre la terminal **dentro de la carpeta yasumi-vite** y ejecuta:
```bash
npm install
```

### 3. Correr el proyecto ✅
```bash
npm run dev
```
Se abrirá en: **http://localhost:5173**

### 4. Construir para producción
```bash
npm run build
```

---

## 🔐 Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | carlos.m@example.com | password |
| Vendedor | ana.g@example.com | password |

---

## 📁 Estructura

```
yasumi-vite/
├── index.html               ← HTML raíz (Vite lo pone aquí, no en /public)
├── vite.config.js           ← Configuración de Vite
├── package.json             ← Dependencias
└── src/
    ├── main.jsx             ← Punto de entrada
    ├── App.jsx              ← Rutas y providers
    ├── index.css            ← Estilos globales
    ├── context/
    │   ├── AuthContext.jsx        ← Login, log, roles
    │   └── ProductosContext.jsx   ← CRUD productos
    ├── components/
    │   ├── Navbar.jsx             ← Menú de navegación
    │   └── ProductoModal.jsx      ← Modal agregar/editar
    └── pages/
        ├── Login.jsx              ← Login + CAPTCHA
        ├── Dashboard.jsx          ← Inicio
        ├── Catalogo.jsx           ← Catálogo público
        ├── Productos.jsx          ← CRUD admin
        ├── Reportes.jsx           ← Gráficos + PDF
        └── Usuarios.jsx           ← Gestión usuarios
```

---

## ⚠️ Diferencia con Create React App

| | Create React App | **Vite (este proyecto)** |
|--|--|--|
| Comando | `npm start` | `npm run dev` ✅ |
| Puerto | 3000 | **5173** |
| Velocidad | Lenta | Muy rápida |
| `index.html` | En `/public/` | En la raíz `/` |
| Entrada | `src/index.js` | `src/main.jsx` |

---

*Desarrollado con 🌸 para el proyecto de Programación Web*
