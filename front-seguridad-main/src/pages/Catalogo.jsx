import { useState } from 'react';
import { useProductos } from '../context/ProductosContext';
import { useAuth } from '../context/AuthContext';
import { SearchIcon, FlowerIcon } from '../components/Icons';

export default function Catalogo() {
  const { getProductosActivos, categorias, loading } = useProductos();
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [orden, setOrden] = useState('defecto');

  const pillCategorias = ['Todas', ...categorias.map(c => c.nombre)];

  const productos = getProductosActivos().filter((p) => {
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = categoria === 'Todas' || p.categoria === categoria;
    return matchBusq && matchCat;
  }).sort((a, b) => {
    if (orden === 'precio-asc') return a.precio - b.precio;
    if (orden === 'precio-desc') return b.precio - a.precio;
    if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  const handleConsultar = (p) => {
    if (usuario?.rol === 'invitado') {
      alert("Debes iniciar sesión para realizar consultas o comprar productos.");
      return;
    }
    const telefono = '59169802910'; // Número de WhatsApp solicitado (+591 69802910)
    const mensaje = encodeURIComponent(
      `Hola, me gustaría consultar por el producto: ${p.nombre}`
    );
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nuestro <span>Catálogo</span></h1>
        <span style={{ color: 'var(--texto-secundario)', fontSize: '0.82rem', fontWeight: 500 }}>
          {productos.length} productos disponibles
        </span>
      </div>

      {/* Buscador */}
      <div className="search-bar">
        <div className="search-wrapper" style={{ flex: 2, display: 'flex', alignItems: 'center'}}>
          <SearchIcon size={18} style={{ color: 'var(--texto-secundario)', marginLeft: '12px', marginRight: '10px', zIndex: 1 }} />
          <input className="search-input" placeholder="Buscar flores, arreglos, regalos..."
            style={{ paddingLeft: '32px' }}
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 150 }} value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="defecto">Ordenar por...</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre A-Z</option>
        </select>
      </div>

      {/* Pills de categoría */}
      <div className="category-pills">
        {pillCategorias.map((c) => (
          <button key={c} className={`pill ${categoria === c ? 'active' : ''}`} onClick={() => setCategoria(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--texto-secundario)' }}>
          Cargando catálogo...
        </div>
      ) : productos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <SearchIcon size={48} style={{ color: 'var(--rosa-suave)' }} />
          </div>
          <div className="empty-state-text">
            {categoria !== 'Todas' ? 'No hay productos de esta categoría' : 'No se encontraron productos'}
          </div>
          <p style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>
            {categoria !== 'Todas' ? 'Prueba seleccionando otra categoría' : 'Intenta con otro término de búsqueda'}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {productos.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-img" style={{ overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--rosa-palido)' }}>
                {p.imagen_url && (p.imagen_url.startsWith('http') || p.imagen_url.startsWith('/')) ? (
                  <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FlowerIcon size={48} />
                )}
              </div>
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div className="card-title">{p.nombre}</div>
                    <span className="card-badge" style={{ background: '#F5F3FF', color: '#6D28D9', whiteSpace: 'nowrap' }}>
                      {p.categoria}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', marginBottom: '0.8rem', lineHeight: 1.5 }}>
                    {p.descripcion}
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div className="card-price" style={{ margin: 0 }}>Bs. {p.precio}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)' }}>Stock: {p.stock}</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleConsultar(p)}
                  >
                    Consultar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
