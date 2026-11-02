import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, esEmail, evaluarFortaleza } from '../context/AuthContext';
import { FlowerIcon } from '../components/Icons';

function generarCaptchaLocal() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { pregunta: `${a} + ${b}`, respuesta: String(a + b), a, b, token: null };
}

const FUERZA_CONFIG = {
  debil:  { label: 'Débil — combina letras, números y símbolos', color: '#DC2626', width: '33%' },
  media:  { label: 'Media — mezcla mayúsculas, números y símbolos', color: '#D97706', width: '66%' },
  fuerte: { label: 'Fuerte — excelente seguridad', color: '#059669', width: '100%' },
};

function BarraFortaleza({ nivel }) {
  if (!nivel) return null;
  const cfg = FUERZA_CONFIG[nivel];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: cfg.width, background: cfg.color, borderRadius: 2, transition: 'all 0.3s ease' }} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, registrarUsuario, loginInvitado, obtenerCaptchaServidor } = useAuth();

  const [modo, setModo] = useState('login');
  const [captcha, setCaptcha] = useState(generarCaptchaLocal);
  const [form, setForm] = useState({ email: '', password: '', nombre: '', captchaInput: '' });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Solicita captcha con firma criptográfica al backend
  const renovarCaptcha = async () => {
    const data = await obtenerCaptchaServidor();
    if (data && data.ok) {
      setCaptcha({
        pregunta: data.pregunta,
        respuesta: String(data.a + data.b),
        a: data.a,
        b: data.b,
        token: data.token
      });
    } else {
      setCaptcha(generarCaptchaLocal());
    }
  };

  useEffect(() => {
    renovarCaptcha();
  }, []);

  const fortaleza = modo === 'registro' ? evaluarFortaleza(form.password) : null;

  const validar = () => {
    const e = {};

    if (modo === 'registro') {
      if (!form.nombre.trim() || form.nombre.trim().split(' ').length < 2) {
        e.nombre = 'Ingresa tu nombre y al menos un apellido';
      }
    }

    if (!form.email) {
      e.email = 'El correo es obligatorio';
    } else if (!esEmail(form.email)) {
      e.email = 'Debe ingresar un correo electrónico válido';
    }

    if (!form.password) {
      e.password = 'La contraseña es obligatoria';
    } else if (modo === 'registro' && fortaleza === 'debil') {
      e.password = 'La contraseña debe tener mínimo 6 caracteres con letras y números';
    }

    if (!form.captchaInput) {
      e.captcha = 'Resuelve el CAPTCHA para continuar';
    } else if (form.captchaInput.trim() !== captcha.respuesta) {
      e.captcha = 'Resultado del CAPTCHA incorrecto';
    }

    return e;
  };

  const handleInvitado = async () => {
    setCargando(true);
    setMensaje('');
    const res = await loginInvitado();
    if (res.ok) {
      navigate('/catalogo');
    } else {
      setMensaje(res.error);
    }
    setCargando(false);
  };

  const handleSubmit = async () => {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setCargando(true);
    setMensaje('');

    if (modo === 'login') {
      const res = await login(form.email, form.password, { 
        a: captcha.a, 
        b: captcha.b, 
        input: form.captchaInput,
        token: captcha.token 
      });

      if (res.ok) {
        if (res.usuario?.rol === 'cliente') {
          navigate('/catalogo');
        } else {
          navigate('/dashboard');
        }
      } else {
        setMensaje(res.error);
        await renovarCaptcha();
        setForm((f) => ({ ...f, captchaInput: '' }));
      }
    } else {
      const partes = form.nombre.trim().split(' ');
      const nombre = partes[0];
      const paterno = partes[1] || '';
      const materno = partes.slice(2).join(' ') || '';

      const res = await registrarUsuario({
        nombre, paterno, materno,
        email: form.email,
        password: form.password,
        rol: 'cliente'
      });

      if (res.ok) {
        setMensaje('✓ Cuenta creada correctamente. Ahora inicia sesión.');
        setModo('login');
        setForm({ email: form.email, password: '', nombre: '', captchaInput: '' });
        await renovarCaptcha();
      } else {
        setMensaje(res.error);
        await renovarCaptcha();
        setForm((f) => ({ ...f, captchaInput: '' }));
      }
    }
    setCargando(false);
  };

  const cambiarModo = (m) => {
    setModo(m); 
    setMensaje(''); 
    setErrores({});
    renovarCaptcha();
    setForm({ email: '', password: '', nombre: '', captchaInput: '' });
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <FlowerIcon size={48} />
          </div>
          <div className="login-title">Yasumi</div>
          <div className="login-subtitle">Florería & Regalos</div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: '#F1F5F9',
          borderRadius: 10,
          padding: 3,
          marginBottom: '1.5rem'
        }}>
          {['login', 'registro'].map((m) => (
            <button key={m} onClick={() => cambiarModo(m)} style={{
              flex: 1,
              padding: '9px',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'var(--fuente-cuerpo)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: modo === m ? 'white' : 'transparent',
              color: modo === m ? 'var(--rosa-profundo)' : 'var(--texto-secundario)',
              boxShadow: modo === m ? 'var(--sombra-sm)' : 'none',
              transition: 'var(--transicion)',
            }}>
              {m === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          ))}
        </div>

        {mensaje && (
          <div className={`alert ${mensaje.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>
            {mensaje}
          </div>
        )}

        {/* Nombre (solo registro) */}
        {modo === 'registro' && (
          <div className="form-group">
            <label className="form-label">Nombre y Apellidos</label>
            <input className={`form-control ${errores.nombre ? 'error' : ''}`}
              placeholder="Ej. Ana Gómez López"
              value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} />
            {errores.nombre && <div className="form-error">{errores.nombre}</div>}
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input type="email" className={`form-control ${errores.email ? 'error' : ''}`}
            placeholder="usuario@correo.com"
            value={form.email} onChange={(e) => setField('email', e.target.value)} />
          {errores.email && <div className="form-error">{errores.email}</div>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input type="password" className={`form-control ${errores.password ? 'error' : ''}`}
            placeholder="••••••••"
            value={form.password} onChange={(e) => setField('password', e.target.value)} />
          {errores.password && <div className="form-error">{errores.password}</div>}
          {modo === 'registro' && <BarraFortaleza nivel={fortaleza} />}
          {modo === 'registro' && (
            <div style={{ fontSize: '0.68rem', color: 'var(--texto-secundario)', marginTop: 6, lineHeight: 1.4 }}>
              Usa al menos 6 caracteres con letras, números y símbolos. Se almacenará de forma encriptada.
            </div>
          )}
        </div>

        {/* CAPTCHA con protección criptográfica */}
        <div className="form-group" style={{ background: '#F8FAFC', padding: '12px', borderRadius: 'var(--radio)', border: '1px solid var(--borde)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ margin: 0 }}>Verificación de Seguridad</label>
            <span style={{ fontSize: '0.65rem', color: 'var(--verde-hoja)', fontWeight: 600 }}>Anti-Bot Activo</span>
          </div>
          <div className="captcha-box">
            <div className="captcha-challenge">{captcha.pregunta} = ?</div>
            <button onClick={async () => { await renovarCaptcha(); setField('captchaInput', ''); }}
              style={{
                background: 'var(--rosa-palido)',
                border: '1px solid var(--borde)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '5px 8px',
                borderRadius: 6,
                transition: 'var(--transicion)'
              }}
              title="Solicitar nuevo CAPTCHA">🔄</button>
          </div>
          <input className={`form-control ${errores.captcha ? 'error' : ''}`}
            placeholder="Tu respuesta numérica"
            type="number"
            value={form.captchaInput} onChange={(e) => setField('captchaInput', e.target.value)} />
          {errores.captcha && <div className="form-error">{errores.captcha}</div>}
        </div>

        <button className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '0.5rem', fontSize: '0.88rem' }}
          onClick={handleSubmit} disabled={cargando}>
          {cargando ? 'Verificando credenciales...' : modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </button>

        {modo === 'login' && (
          <button className="btn btn-secondary"
            type="button"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '11px', 
              marginTop: '0.5rem', 
              fontSize: '0.82rem', 
              background: 'transparent', 
              color: 'var(--texto-secundario)', 
              borderColor: 'var(--borde)',
              borderStyle: 'solid',
              borderWidth: '1.5px',
              fontFamily: 'var(--fuente-cuerpo)',
              fontWeight: '600'
            }}
            onClick={handleInvitado} disabled={cargando}>
            Entrar como Invitado 👥
          </button>
        )}

        {modo === 'login' && (
          <div style={{
            marginTop: '1.25rem',
            background: '#F8FAFC',
            borderRadius: 'var(--radio)',
            padding: '10px 12px',
            fontSize: '0.72rem',
            color: 'var(--texto-secundario)',
            border: '1px solid var(--borde)'
          }}>
            <strong style={{ color: 'var(--texto)' }}>Usuarios de prueba:</strong><br />
            Admin: carlos.m@example.com<br />
            Vendedor: ana.g@example.com
          </div>
        )}
      </div>
    </div>
  );
}
