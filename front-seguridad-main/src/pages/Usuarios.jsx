import { useState, useEffect } from 'react';
import { useAuth, esEmail, evaluarFortaleza } from '../context/AuthContext';
import api from '../api/axiosConfig';

const FUERZA_CONFIG = {
  debil:  { label: 'Débil',  color: '#DC2626', width: '33%' },
  media:  { label: 'Media',  color: '#D97706', width: '66%' },
  fuerte: { label: 'Fuerte', color: '#059669', width: '100%' },
};

function BarraFortaleza({ nivel }) {
  if (!nivel) return null;
  const cfg = FUERZA_CONFIG[nivel];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: cfg.width, background: cfg.color, borderRadius: 2, transition: 'all 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

export default function Usuarios() {
  const { registrarUsuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'vendedor' });
  const [errores, setErrores] = useState({});
  const [mensajeGuardar, setMensajeGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const fortaleza = evaluarFortaleza(form.password);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const validar = () => {
    const e = {};

    if (!form.nombre.trim() || form.nombre.trim().split(' ').length < 2)
      e.nombre = 'Nombre completo debe incluir nombre y al menos un apellido';

    if (!form.email) {
      e.email = 'El correo es obligatorio';
    } else if (!esEmail(form.email)) {
      e.email = 'Debe ingresar un correo electrónico válido';
    }

    if (!form.password) {
      e.password = 'La contraseña es obligatoria';
    } else if (fortaleza === 'debil') {
      e.password = 'Contraseña muy débil. Usa al menos 6 caracteres con letras y números';
    }

    return e;
  };

  const guardar = async () => {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setGuardando(true);
    setMensajeGuardar('');

    const partes = form.nombre.trim().split(' ');
    const nombre = partes[0];
    const paterno = partes[1] || '';
    const materno = partes.slice(2).join(' ') || '';

    const res = await registrarUsuario({
      nombre, paterno, materno,
      email: form.email,
      password: form.password,
      rol: form.rol
    });

    if (res.ok) {
      await fetchUsuarios();
      cerrarModal();
    } else {
      setMensajeGuardar(res.error);
    }
    setGuardando(false);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ nombre: '', email: '', password: '', rol: 'vendedor' });
    setErrores({});
    setMensajeGuardar('');
  };

  const toggleActivo = async (id) => {
    try {
      const res = await api.post(`/usuarios/${id}/toggle`);
      if (res.data.ok) {
        setUsuarios(prev => 
          prev.map(u => u.id === id ? { ...u, activo: res.data.activo } : u)
        );
      }
    } catch (err) {
      console.error(err);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Gestión de <span>Usuarios</span></h1>
        <button className="btn btn-primary" onClick={() => setModalAbierto(true)}>+ Nuevo Usuario</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--texto-secundario)' }}>
          Cargando usuarios...
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.5 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: '0.72rem' }}>
                        {u.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{u.nombre}</strong>
                        {u.ultimoAcceso && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--texto-secundario)' }}>
                            Último acceso: {u.ultimoAcceso}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{u.email}</td>
                  <td>
                    <span className="card-badge" style={{
                      background: u.rol === 'admin' ? '#FEF3C7' : u.rol === 'cliente' ? '#E0F2FE' : '#F0FDF4',
                      color: u.rol === 'admin' ? '#B45309' : u.rol === 'cliente' ? '#0369A1' : '#047857',
                    }}>
                      {u.rol === 'admin' ? 'Admin' : u.rol === 'cliente' ? 'Cliente' : 'Vendedor'}
                    </span>
                  </td>
                  <td>
                    <span className={`card-badge ${u.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>{u.fechaCreacion}</td>
                  <td>
                    <button className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleActivo(u.id)}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo usuario */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Usuario</h2>
              <button className="modal-close" onClick={cerrarModal}>×</button>
            </div>

            {mensajeGuardar && <div className="alert alert-error">{mensajeGuardar}</div>}

            <div className="form-group">
              <label className="form-label">Nombre completo *</label>
              <input className={`form-control ${errores.nombre ? 'error' : ''}`}
                placeholder="Ej. Carlos Mendoza Arce"
                value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} />
              {errores.nombre && <div className="form-error">{errores.nombre}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input type="email" className={`form-control ${errores.email ? 'error' : ''}`}
                placeholder="nombre@correo.com"
                value={form.email} onChange={(e) => setField('email', e.target.value)} />
              {errores.email && <div className="form-error">{errores.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña *</label>
              <input type="password" className={`form-control ${errores.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.password} onChange={(e) => setField('password', e.target.value)} />
              {errores.password && <div className="form-error">{errores.password}</div>}
              <BarraFortaleza nivel={fortaleza} />
              <div style={{ fontSize: '0.68rem', color: 'var(--texto-secundario)', marginTop: 4, lineHeight: 1.4 }}>
                Contraseña fuerte = 12+ caracteres con mayúsculas, números y símbolos
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rol *</label>
              <select className="form-control" value={form.rol}
                onChange={(e) => setField('rol', e.target.value)}>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={cerrarModal} disabled={guardando}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}