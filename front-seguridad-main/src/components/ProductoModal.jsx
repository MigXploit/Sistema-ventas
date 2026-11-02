import { useState } from 'react';
import { useProductos } from '../context/ProductosContext';

export default function ProductoModal({ producto, onClose }) {
  const { categorias, agregarProducto, editarProducto } = useProductos();
  const esEdicion = !!producto;

  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    id_categoria: producto?.id_categoria || (categorias[0]?.id || 1),
    precio: producto?.precio || '',
    stock: producto?.stock !== undefined ? producto.stock : '',
    descripcion: producto?.descripcion || '',
    imagen_url: (producto?.imagen_url && !producto.imagen_url.startsWith('🌸') && !producto.imagen_url.startsWith('🌹')) ? producto.imagen_url : '',
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(producto?.imagen_url || '');
  const [dragActive, setDragActive] = useState(false);

  const [errores, setErrores] = useState({});
  const [guardado, setGuardado] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImagenFile(file);
        setVistaPrevia(URL.createObjectURL(file));
      } else {
        alert("Por favor, sube solo archivos de imagen (png, jpg, jpeg, webp)");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenFile(file);
      setVistaPrevia(URL.createObjectURL(file));
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim() || form.nombre.length < 4)
      e.nombre = 'El nombre debe tener al menos 4 caracteres';
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0)
      e.precio = 'Ingresa un precio válido mayor a 0';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0)
      e.stock = 'El stock debe ser 0 o mayor';
    if (!form.descripcion.trim() || form.descripcion.length < 10)
      e.descripcion = 'La descripción debe tener al menos 10 caracteres';
    return e;
  };

  const handleGuardar = async () => {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setMensajeError('');
    let base64 = null;
    let nombreArchivo = null;

    if (imagenFile) {
      try {
        base64 = await getBase64(imagenFile);
        nombreArchivo = imagenFile.name;
      } catch (err) {
        setMensajeError('Error al procesar el archivo de imagen');
        return;
      }
    }

    const datos = { 
      nombre: form.nombre,
      id_categoria: Number(form.id_categoria),
      precio: Number(form.precio), 
      stock: Number(form.stock),
      stock_minimo: 1,
      descripcion: form.descripcion,
      imagen_url: form.imagen_url,
      imagen_base64: base64,
      imagen_nombre: nombreArchivo
    };

    let res;
    if (esEdicion) {
      res = await editarProducto(producto.id, datos);
    } else {
      res = await agregarProducto(datos);
    }

    if (res.ok) {
      setGuardado(true);
      setTimeout(onClose, 800);
    } else {
      setMensajeError(res.error);
    }
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{esEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {guardado && <div className="alert alert-success">Guardado exitosamente</div>}
        {mensajeError && <div className="alert alert-error">{mensajeError}</div>}

        {/* Imagen / Subida */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Imagen del producto</label>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--borde)',
              borderRadius: 'var(--radio-md)',
              padding: '1.25rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'var(--rosa-palido)' : '#FAF8F9',
              transition: 'var(--transicion)',
              position: 'relative',
              marginBottom: '0.75rem'
            }}
          >
            {vistaPrevia ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <img 
                  src={vistaPrevia.startsWith('http') || vistaPrevia.startsWith('/') ? vistaPrevia : vistaPrevia} 
                  alt="Vista previa" 
                  style={{ maxWidth: '90px', maxHeight: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--borde)' }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagenFile(null);
                    setVistaPrevia('');
                    setField('imagen_url', '');
                  }}
                  style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                >
                  Quitar imagen
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>📷</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--texto)' }}>
                  Arrastra una imagen aquí o <span style={{ color: 'var(--rosa-profundo)', textDecoration: 'underline' }}>haz clic para buscar</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--texto-secundario)', marginTop: 2 }}>
                  Formatos soportados: PNG, JPG, JPEG, WEBP
                </div>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: vistaPrevia ? -1 : 1
              }} 
            />
          </div>

          <div style={{ textAlign: 'center', margin: '0.4rem 0', fontSize: '0.7rem', color: 'var(--texto-secundario)', fontWeight: 600 }}>
            O INGRESAR DIRECCIÓN URL
          </div>

          <input 
            type="text" 
            className="form-control"
            placeholder="Pegar URL (ej: https://...)"
            value={form.imagen_url}
            onChange={(e) => {
              setField('imagen_url', e.target.value);
              setImagenFile(null);
              setVistaPrevia(e.target.value);
            }} 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nombre del producto *</label>
          <input className={`form-control ${errores.nombre ? 'error' : ''}`}
            placeholder="Ej: Ramo de Rosas Rojas Premium"
            value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} />
          {errores.nombre && <div className="form-error">{errores.nombre}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Categoría *</label>
            <select className="form-control" value={form.id_categoria} onChange={(e) => setField('id_categoria', Number(e.target.value))}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Precio (Bs.) *</label>
            <input type="number" className={`form-control ${errores.precio ? 'error' : ''}`}
              placeholder="0.00" min="0" stroke="0.5"
              value={form.precio} onChange={(e) => setField('precio', e.target.value)} />
            {errores.precio && <div className="form-error">{errores.precio}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Stock disponible *</label>
          <input type="number" className={`form-control ${errores.stock ? 'error' : ''}`}
            placeholder="0" min="0"
            value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
          {errores.stock && <div className="form-error">{errores.stock}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <textarea className={`form-control ${errores.descripcion ? 'error' : ''}`}
            placeholder="Detalles sobre el producto..."
            rows={3} value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} />
          {errores.descripcion && <div className="form-error">{errores.descripcion}</div>}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" type="button" onClick={handleGuardar}>
            {esEdicion ? 'Actualizar' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
