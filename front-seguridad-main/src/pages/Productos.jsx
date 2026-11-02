import { useState } from 'react';
import { useProductos } from '../context/ProductosContext';
import { SearchIcon, FlowerIcon } from '../components/Icons';
import ProductoModal from '../components/ProductoModal';

export default function Productos() {
  const { getTodos, categorias, eliminarProducto, reactivarProducto, loading } = useProductos();
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const todos = getTodos();
  const filtrados = todos.filter((p) => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = filtroCategoria === 'Todos' || p.categoria === filtroCategoria;
    const matchEstado = filtroEstado === 'todos' || (filtroEstado === 'activos' ? p.activo : !p.activo);
    return matchBusqueda && matchCat && matchEstado;
  });

  const abrirNuevo = () => { 
    if (categorias.length === 0) {
      alert("No hay categorías cargadas en el sistema. Asegúrate de que tu base de datos esté activa.");
      return;
    }
    setProductoEditar(null); 
    setModalAbierto(true); 
  };
  
  const abrirEditar = (p) => { 
    setProductoEditar(p); 
    setModalAbierto(true); 
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Gestión de <span>Productos</span></h1>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Producto</button>
      </div>

      {/* Filtros */}
      <div className="search-bar">
        <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon size={18} style={{ color: 'var(--texto-secundario)', marginLeft: '12px', marginRight: '-6px', zIndex: 1 }} />
          <input className="search-input" placeholder="Buscar producto..." style={{ paddingLeft: '32px' }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: 150 }} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="Todos">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto', minWidth: 120 }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--texto-secundario)' }}>
          Cargando productos...
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--texto-secundario)' }}>
                  {filtroCategoria !== 'Todos' ? 'No hay productos de esta categoría' : 'No se encontraron productos'}
                </td></tr>
              ) : filtrados.map((p) => (
                <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', background: 'var(--rosa-palido)',
                        borderRadius: '8px', overflow: 'hidden', flexShrink: 0
                      }}>
                        {p.imagen_url && (p.imagen_url.startsWith('http') || p.imagen_url.startsWith('/')) ? (
                          <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FlowerIcon size={20} />
                        )}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.nombre}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)' }}>
                          {p.descripcion?.slice(0, 45)}{p.descripcion?.length > 45 ? '...' : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="card-badge" style={{ background: '#F5F3FF', color: '#6D28D9' }}>
                      {p.categoria}
                    </span>
                  </td>
                  <td><strong style={{ color: 'var(--rosa-profundo)' }}>Bs. {p.precio}</strong></td>
                  <td>
                    <span style={{
                      color: p.stock === 0 ? '#DC2626' : 'inherit',
                      fontWeight: p.stock === 0 ? 600 : 400
                    }}>
                      {p.stock}{p.stock === 0 && ' (Agotado)'}
                    </span>
                  </td>
                  <td>
                    <span className={`card-badge ${p.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                      {p.activo
                        ? <button className="btn btn-danger btn-sm" title="Eliminación lógica" onClick={() => eliminarProducto(p.id)}>Eliminar</button>
                        : <button className="btn btn-success btn-sm" title="Reactivar" onClick={() => reactivarProducto(p.id)}>Restaurar</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--texto-secundario)' }}>
        {filtrados.length} de {todos.length} productos — La eliminación es lógica (el registro se conserva)
      </div>

      {modalAbierto && (
        <ProductoModal
          producto={productoEditar}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
