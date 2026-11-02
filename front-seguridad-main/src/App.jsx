import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductosProvider } from './context/ProductosContext';
import Navbar from './components/Navbar';
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';

// Protección: Si NO está logueado → va al login
function RutaPrivada({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" replace />;
}

// Protección: Si NO es admin → va al dashboard
function RutaAdmin({ children }) {
  const { usuario, esAdmin } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppContent() {
  const { usuario } = useAuth();

  // Si no está logueado, SOLO puede ver el Login
  if (!usuario) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Si es Invitado o Cliente, SOLO puede ver el Catálogo
  if (usuario.rol === 'invitado' || usuario.rol === 'cliente') {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="*" element={<Navigate to="/catalogo" replace />} />
        </Routes>
      </>
    );
  }

  // Si está logueado normalmente, ve la app con navbar
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catalogo" element={<Catalogo />} />

        {/* Rutas exclusivas de admin */}
        <Route path="/productos" element={
          <RutaAdmin><Productos /></RutaAdmin>
        } />
        <Route path="/reportes" element={
          <RutaAdmin><Reportes /></RutaAdmin>
        } />
        <Route path="/usuarios" element={
          <RutaAdmin><Usuarios /></RutaAdmin>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductosProvider>
          <AppContent />
        </ProductosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;