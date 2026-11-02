import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    paterno: '',
    materno: '',
    email: '',
    password: '',
    rol: 'vendedor' // Rol por defecto
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    try {
      // Conexión corregida al endpoint seguro de autenticación (/api/auth/registro)
      const res = await api.post('/auth/registro', form);
      
      if (res.data.ok) {
        setExito('¡Registro completado exitosamente! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar al usuario en el sistema');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--rosa-profundo)' }}>Crear Nueva Cuenta</h2>
      
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
      {exito && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{exito}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" name="nombre" placeholder="Nombre(s)" value={form.nombre} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input type="text" name="paterno" placeholder="Apellido Paterno" value={form.paterno} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input type="text" name="materno" placeholder="Apellido Materno" value={form.materno} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input type="email" name="email" placeholder="Correo Electrónico" value={form.email} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#666' }}>Asignar Rol:</label>
          <select name="rol" value={form.rol} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', background: '#fff' }}>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <button type="submit" disabled={cargando} style={{ padding: '0.75rem', background: 'var(--rosa-profundo)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>
          {cargando ? 'Registrando...' : 'Registrar Usuario'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
        <Link to="/login" style={{ color: 'var(--rosa-profundo)', textDecoration: 'none' }}>¿Ya tienes cuenta? Inicia sesión aquí</Link>
      </div>
    </div>
  );
}

export default Register;
