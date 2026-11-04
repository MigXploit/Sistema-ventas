import { useAuth } from '../context/AuthContext';
import { useProductos } from '../context/ProductosContext';
import { useNavigate } from 'react-router-dom';
import { BouquetIcon, PlantIcon, SparkleIcon, GiftIcon, FlowerIcon, CatalogIcon, ProductsIcon, ReportsIcon, UsersIcon } from '../components/Icons';

const CATEGORIAS_DESTACADAS = [
  { nombre: 'Ramos', icon: BouquetIcon, descripcion: 'Diseños florales exclusivos', bg: '#FDF2F8' },
  { nombre: 'Plantas', icon: PlantIcon, descripcion: 'Decoración de interiores', bg: '#F0FDF4' },
  { nombre: 'Decoración', icon: SparkleIcon, descripcion: 'Eventos y celebraciones', bg: '#FEFCE8' },
  { nombre: 'Sets Especiales', icon: GiftIcon, descripcion: 'Combos y regalos', bg: '#FFF7ED' },
];

export default function Dashboard() {
  const { usuario } = useAuth();
  const { estadisticas, getProductosActivos, loading } = useProductos();
  const navigate = useNavigate();
  const stats = estadisticas();
  const productos = getProductosActivos().slice(0, 4);
  const esAdmin = usuario?.rol === 'admin';

  const accesosRapidos = [
    {
      titulo: 'Catálogo Público',
      desc: 'Explorar arreglos, filtrar por categoría y consultar por WhatsApp',
      ruta: '/catalogo',
      icon: CatalogIcon,
      bg: '#FDF2F8',
      color: '#B91C5C',
      visible: true
    },
    {
      titulo: 'Gestión de Productos',
      desc: 'Alta, edición de precios, stock y desactivación lógica',
      ruta: '/productos',
      icon: ProductsIcon,
      bg: '#F0FDF4',
      color: '#059669',
      visible: esAdmin
    },
    {
      titulo: 'Reportes y Bitácora',
      desc: 'Estadísticas visuales, auditoría de eventos y exportación PDF',
      ruta: '/reportes',
      icon: ReportsIcon,
      bg: '#FEFCE8',
      color: '#CA8A04',
      visible: esAdmin
    },
    {
      titulo: 'Identidades y Roles (2FA)',
      desc: 'Ciclo de vida de cuentas, suspensión y cambio de rol con 2FA',
      ruta: '/usuarios',
      icon: UsersIcon,
      bg: '#EFF6FF',
      color: '#2563EB',
      visible: esAdmin
    }
  ].filter(a => a.visible);

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="anim-fade-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '0.7rem',
            letterSpacing: '3px',
            color: 'var(--rosa-suave)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
            fontWeight: 600
          }}>
            Panel de Gestión & Seguridad Activa
          </div>
          <h1 className="hero-title">
            Bienvenido, <em>{usuario?.nombre?.split(' ')[0]}</em>
          </h1>
          <p className="hero-subtitle">
            Gestiona tu inventario de arreglos florales, catálogo comercial y controles de seguridad de Yasumi Venta.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/catalogo')}>
              Explorar Catálogo
            </button>
            {esAdmin && (
              <>
                <button className="btn btn-secondary"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.22)' }}
                  onClick={() => navigate('/productos')}>
                  Gestionar Productos
                </button>
                <button className="btn btn-secondary"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.22)' }}
                  onClick={() => navigate('/reportes')}>
                  Bitácora & PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page">
        {/* Stats */}
        <div className="stats-grid anim-fade-up anim-delay-1">
          <div className="stat-card" onClick={() => navigate('/catalogo')} style={{ cursor: 'pointer' }}>
            <div className="stat-value">{stats.activos}</div>
            <div className="stat-label">Productos Activos</div>
          </div>
          <div className="stat-card" onClick={() => esAdmin && navigate('/reportes')} style={{ cursor: esAdmin ? 'pointer' : 'default' }}>
            <div className="stat-value" style={{ color: 'var(--dorado)', fontSize: '1.5rem' }}>
              Bs. {stats.valorInventario.toLocaleString()}
            </div>
            <div className="stat-label">Valor del Inventario</div>
          </div>
          <div className="stat-card" onClick={() => navigate('/catalogo')} style={{ cursor: 'pointer' }}>
            <div className="stat-value" style={{ color: 'var(--verde-hoja)' }}>
              {Object.keys(stats.porCategoria).length}
            </div>
            <div className="stat-label">Categorías</div>
          </div>
          <div className="stat-card" onClick={() => esAdmin && navigate('/productos')} style={{ cursor: esAdmin ? 'pointer' : 'default' }}>
            <div className="stat-value" style={{ color: '#94A3B8' }}>{stats.inactivos}</div>
            <div className="stat-label">Inactivos (Baja Lógica)</div>
          </div>
        </div>

        {/* Accesos Rápidos de Navegación */}
        <div className="page-header anim-fade-up anim-delay-2" style={{ marginBottom: '0.85rem' }}>
          <h2 className="page-title">Navegación <span>Rápida</span></h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
            Selecciona cualquier módulo para ir directamente
          </span>
        </div>
        <div className="quick-nav-grid anim-fade-up anim-delay-2">
          {accesosRapidos.map((item) => (
            <div key={item.ruta} className="quick-nav-card" onClick={() => navigate(item.ruta)}>
              <div className="quick-nav-icon" style={{ background: item.bg, color: item.color }}>
                <item.icon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--texto)', marginBottom: 2 }}>
                  {item.titulo} →
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--texto-secundario)', lineHeight: 1.35 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Categorías */}
        <div className="page-header">
          <h2 className="page-title">Categorías</h2>
        </div>
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {CATEGORIAS_DESTACADAS.map((cat) => (
            <div key={cat.nombre}
              onClick={() => navigate('/catalogo')}
              style={{
                background: cat.bg,
                borderRadius: 'var(--radio-lg)',
                padding: '1.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'var(--transicion)',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--borde)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <cat.icon size={36} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--texto)' }}>{cat.nombre}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', marginTop: 2 }}>{cat.descripcion}</div>
            </div>
          ))}
        </div>

        {/* Productos Destacados */}
        <div className="page-header">
          <h2 className="page-title">Productos <span>Destacados</span></h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/catalogo')}>
            Ver todos →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--texto-secundario)' }}>
            Cargando productos...
          </div>
        ) : (
          <div className="grid-4">
            {productos.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-img" style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--rosa-palido)' }}>
                  {p.imagen_url && (p.imagen_url.startsWith('http') || p.imagen_url.startsWith('/')) ? (
                    <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FlowerIcon size={40} />
                  )}
                </div>
                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="card-title">{p.nombre}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', marginBottom: '0.4rem' }}>
                      {p.categoria}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-price">Bs. {p.precio}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--texto-secundario)' }}>Stock: {p.stock}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
