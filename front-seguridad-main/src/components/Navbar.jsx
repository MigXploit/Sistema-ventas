import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FlowerIcon, DashboardIcon, CatalogIcon, ProductsIcon, ReportsIcon, UsersIcon } from './Icons';

export default function Navbar() {
  const { usuario, logout, esAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FlowerIcon size={32} />
        <div>
          <span className="navbar-title">Yasumi</span>
          <span className="navbar-subtitle">Florería & Regalos</span>
        </div>
      </NavLink>

      <ul className="navbar-menu">
        {usuario && usuario.rol !== 'invitado' && usuario.rol !== 'cliente' && (
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DashboardIcon size={18} /> Dashboard
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to="/catalogo" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CatalogIcon size={18} /> Catálogo
          </NavLink>
        </li>
        {usuario && esAdmin() && (
          <>
            <li>
              <NavLink to="/productos" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ProductsIcon size={18} /> Productos
              </NavLink>
            </li>
            <li>
              <NavLink to="/reportes" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ReportsIcon size={18} /> Reportes
              </NavLink>
            </li>
            <li>
              <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UsersIcon size={18} /> Usuarios
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="navbar-user">
        {usuario && (
          <>
            <span style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              marginRight: '4px'
            }}>
              <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: '600' }}>
                {usuario.nombre.split(' ')[0]}
              </span>
              <span style={{
                fontSize: '0.62rem',
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontWeight: '500'
              }}>
                {usuario.rol}
              </span>
            </span>
            <div className="navbar-avatar">{iniciales}</div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8',
                padding: '5px 10px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                fontFamily: 'var(--fuente-cuerpo)',
                transition: 'var(--transicion)',
                marginLeft: '4px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(185,28,92,0.3)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              {usuario.rol === 'invitado' ? 'Ingresar ➔' : 'Salir ↗'}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
