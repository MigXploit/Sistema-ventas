import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { usuario: usuarioActual, registrarUsuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertaExito, setAlertaExito] = useState('');

  // Modal nuevo usuario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'vendedor' });
  const [errores, setErrores] = useState({});
  const [mensajeGuardar, setMensajeGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Modal cambio de rol (C-12: Segundo factor de autenticación 2FA y motivo auditado)
  const [modalRolAbierto, setModalRolAbierto] = useState(false);
  const [usuarioEditarRol, setUsuarioEditarRol] = useState(null);
  const [nuevoRol, setNuevoRol] = useState('vendedor');
  const [motivoRol, setMotivoRol] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');
  const [guardandoRol, setGuardandoRol] = useState(false);
  const [errorRol, setErrorRol] = useState('');

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
      setAlertaExito('Usuario creado exitosamente');
      setTimeout(() => setAlertaExito(''), 4000);
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
        setAlertaExito(res.data.message);
        setTimeout(() => setAlertaExito(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error al cambiar el estado del usuario');
    }
  };

  const abrirCambioRol = (u) => {
    setUsuarioEditarRol(u);
    setNuevoRol(u.rol || 'vendedor');
    setMotivoRol('');
    setCodigo2fa('');
    setErrorRol('');
    setModalRolAbierto(true);
  };

  const cerrarModalRol = () => {
    setModalRolAbierto(false);
    setUsuarioEditarRol(null);
    setMotivoRol('');
    setCodigo2fa('');
    setErrorRol('');
  };

  const ejecutarCambioRol = async () => {
    if (!usuarioEditarRol) return;
    setGuardandoRol(true);
    setErrorRol('');

    try {
      const res = await api.put(
        `/usuarios/${usuarioEditarRol.id}/rol`,
        { nuevoRol, codigo2fa, motivo: motivoRol },
        { headers: { 'X-2FA-Token': codigo2fa } }
      );

      if (res.data.ok) {
        setUsuarios(prev =>
          prev.map(u => u.id === usuarioEditarRol.id ? { ...u, rol: res.data.nuevoRol } : u)
        );
        cerrarModalRol();
        setAlertaExito(`Rol de ${usuarioEditarRol.nombre} actualizado a ${res.data.nuevoRol} con éxito (2FA validado y registrado en bitácora)`);
        setTimeout(() => setAlertaExito(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorRol(err.response?.data?.error || 'Error al modificar el rol del usuario');
    } finally {
      setGuardandoRol(false);
    }
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchTexto =
      u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      u.email.toLowerCase().includes(filtro.toLowerCase());
    const matchRol = filtroRol === 'todos' || u.rol === filtroRol;
    return matchTexto && matchRol;
  });

  return (
    <div className="page">
      <div className="breadcrumb-bar">
        <button className="breadcrumb-link" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <span>/</span>
        <span>Gestión de Usuarios e Identidades</span>
      </div>

      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Gestión de <span>Usuarios</span></h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginTop: 2 }}>
            Control de identidades, ciclo de vida (activa / suspendida), privilegios con 2FA y auditoría
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalAbierto(true)}>+ Nuevo Usuario</button>
      </div>

      {alertaExito && <div className="alert alert-success">{alertaExito}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Buscador y filtros por rol */}
      <div className="search-bar">
        <div className="search-wrapper" style={{ maxWidth: 400 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre o correo electrónico..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="category-pills" style={{ marginBottom: 0 }}>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'admin', label: '🛡️ Administradores' },
            { id: 'vendedor', label: '💼 Vendedores' },
            { id: 'cliente', label: '👤 Clientes' },
          ].map((r) => (
            <button
              key={r.id}
              className={`pill ${filtroRol === r.id ? 'active' : ''}`}
              onClick={() => setFiltroRol(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

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
              {usuariosFiltrados.map((u) => {
                const esMismoUsuario = usuarioActual && usuarioActual.nombre && u.nombre.includes(usuarioActual.nombre.split(' ')[0]);
                return (
                  <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.6 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="navbar-avatar" style={{ width: 34, height: 34, fontSize: '0.75rem', flexShrink: 0 }}>
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
                        fontWeight: '600'
                      }}>
                        {u.rol === 'admin' ? '🛡️ Admin' : u.rol === 'cliente' ? '👤 Cliente' : '💼 Vendedor'}
                      </span>
                    </td>
                    <td>
                      <span className={`card-badge ${u.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                        {u.activo ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>{u.fechaCreacion}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleActivo(u.id)}
                          title={u.activo ? 'Desactivar acceso al sistema' : 'Reactivar cuenta'}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => abrirCambioRol(u)}
                          title="Modificar privilegios con verificación de segundo factor (2FA)"
                          style={{ fontSize: '0.75rem', padding: '5px 8px' }}
                        >
                          🔑 Rol (2FA)
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                Contraseña robusta = 6+ caracteres combinando letras, números y símbolos
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rol inicial *</label>
              <select className="form-control" value={form.rol}
                onChange={(e) => setField('rol', e.target.value)}>
                <option value="vendedor">Vendedor (Atención al Cliente)</option>
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente</option>
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

      {/* Modal cambio de rol con 2FA (Control C-12) */}
      {modalRolAbierto && usuarioEditarRol && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModalRol()}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 className="modal-title">Modificar Privilegios (Rol)</h2>
              <button className="modal-close" onClick={cerrarModalRol}>×</button>
            </div>

            {errorRol && <div className="alert alert-error">{errorRol}</div>}

            <p style={{ fontSize: '0.84rem', color: 'var(--texto-secundario)', marginBottom: '1rem' }}>
              Modificando rol de: <strong>{usuarioEditarRol.nombre}</strong> ({usuarioEditarRol.email})
            </p>

            <div className="form-group">
              <label className="form-label">Nuevo Rol Asignado *</label>
              <select
                className="form-control"
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value)}
              >
                <option value="vendedor">Vendedor (Atención al Cliente)</option>
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo / Justificación de Auditoría</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Promoción a encargado de sucursal / Reasignación de funciones"
                value={motivoRol}
                onChange={(e) => setMotivoRol(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span>🔒 Código TOTP de Segundo Factor (2FA — RFC 6238) *</span>
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await api.get('/usuarios/2fa-totp');
                      if (res.data?.codigoTotp) {
                        setCodigo2fa(res.data.codigoTotp);
                      }
                    } catch {
                      setErrorRol('No se pudo obtener el código TOTP del autenticador.');
                    }
                  }}
                  style={{
                    background: 'var(--rosa-palido)',
                    color: 'var(--rosa-profundo)',
                    border: '1px solid var(--rosa-suave)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Generar Código TOTP (6 dígitos / 30s)
                </button>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Ingrese código TOTP de 6 dígitos (RFC 6238)"
                value={codigo2fa}
                onChange={(e) => setCodigo2fa(e.target.value)}
              />
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px' }}>
                <em>Control C-12:</em> Operación de alto riesgo protegida con TOTP dinámico de 6 dígitos (ventana de 30s, HMAC-SHA1) y trazabilidad en <code>ROL_CAMBIO</code>. Sin 2FA válido o sobre sí mismo devuelve HTTP 403.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={cerrarModalRol} disabled={guardandoRol}>Cancelar</button>
              <button className="btn btn-primary" onClick={ejecutarCambioRol} disabled={guardandoRol}>
                {guardandoRol ? 'Validando 2FA...' : 'Confirmar Cambio de Rol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
