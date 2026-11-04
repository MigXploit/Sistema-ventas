import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../context/ProductosContext';
import { useAuth } from '../context/AuthContext';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const getBadgeStyle = (evento = '') => {
  const ev = evento.toUpperCase();
  if (ev.startsWith('ROL_CAMBIO')) {
    return { bg: '#FEF3C7', color: '#B45309', label: evento };
  }
  if (ev.startsWith('ACCESO_DENEGADO') || ev.startsWith('AUTH_FAIL') || ev.startsWith('AUTH_BLOQUEADO') || ev.startsWith('LOGIN_BLOQUEADO') || ev.startsWith('EMERGENCIA')) {
    return { bg: '#FEF2F2', color: '#B91C1C', label: evento };
  }
  if (ev.startsWith('SUPERVISION')) {
    return { bg: '#EFF6FF', color: '#1D4ED8', label: evento };
  }
  if (ev.startsWith('IDENTIDAD') || ev.startsWith('USUARIO_')) {
    return { bg: '#F5F3FF', color: '#6D28D9', label: evento };
  }
  if (ev.startsWith('INGRESO')) {
    return { bg: '#ECFDF5', color: '#047857', label: ev === 'INGRESO' ? 'INGRESO' : evento };
  }
  return { bg: '#F1F5F9', color: '#475569', label: ev === 'SALIDA' ? 'SALIDA' : evento };
};

export default function Reportes() {
  const navigate = useNavigate();
  const { getTodos, estadisticas, loading: prodsLoading } = useProductos();
  const { fetchLogs } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [filtroEvento, setFiltroEvento] = useState('todos');
  const [busquedaLog, setBusquedaLog] = useState('');

  const chartRefCat = useRef(null);
  const chartRefPrecio = useRef(null);
  const chartInstanceCat = useRef(null);
  const chartInstancePrecio = useRef(null);

  const stats = estadisticas();
  const todos = getTodos();

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const data = await fetchLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (prodsLoading || todos.length === 0) return;

    if (chartInstanceCat.current) chartInstanceCat.current.destroy();
    if (chartInstancePrecio.current) chartInstancePrecio.current.destroy();

    // Doughnut: Productos por categoría
    const cats = Object.entries(stats.porCategoria);
    if (chartRefCat.current) {
      chartInstanceCat.current = new Chart(chartRefCat.current, {
        type: 'doughnut',
        data: {
          labels: cats.length > 0 ? cats.map(([k]) => k) : ['Sin datos'],
          datasets: [{
            data: cats.length > 0 ? cats.map(([, v]) => v) : [0],
            backgroundColor: ['#B91C5C', '#D97706', '#059669', '#6D28D9', '#2563EB', '#DC2626'],
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 14, font: { size: 11, family: 'Inter' } } },
          },
        },
      });
    }

    // Bar: Precios
    const activos = todos.filter((p) => p.activo);
    if (chartRefPrecio.current && activos.length > 0) {
      chartInstancePrecio.current = new Chart(chartRefPrecio.current, {
        type: 'bar',
        data: {
          labels: activos.map((p) => p.nombre.length > 14 ? p.nombre.slice(0, 14) + '…' : p.nombre),
          datasets: [{
            label: 'Precio (Bs.)',
            data: activos.map((p) => p.precio),
            backgroundColor: activos.map((_, i) => `hsla(${330 + i * 18}, 70%, 50%, 0.8)`),
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#F1F5F9' } },
            x: { grid: { display: false }, ticks: { font: { size: 9, family: 'Inter' } } },
          },
        },
      });
    }

    return () => {
      if (chartInstanceCat.current) chartInstanceCat.current.destroy();
      if (chartInstancePrecio.current) chartInstancePrecio.current.destroy();
    };
  }, [todos, stats, prodsLoading]);

  const generarPDF = () => {
    const doc = new jsPDF();
    const hoy = new Date().toLocaleString('es-BO');

    // Header
    doc.setFillColor(185, 28, 92);
    doc.rect(0, 0, 210, 36, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('YASUMI', 105, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Florería & Regalos — Reporte de Inventario', 105, 23, { align: 'center' });
    doc.text(`Generado: ${hoy}`, 105, 30, { align: 'center' });

    // Resumen
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen del Inventario', 14, 48);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`• Productos activos: ${stats.activos}`, 14, 58);
    doc.text(`• Productos inactivos: ${stats.inactivos}`, 14, 66);
    doc.text(`• Valor total: Bs. ${stats.valorInventario.toLocaleString()}`, 14, 74);
    doc.text(`• Categorías: ${Object.keys(stats.porCategoria).length}`, 14, 82);

    // Tabla
    const activos = todos.filter((p) => p.activo);
    const rows = activos.map((p) => [p.nombre, p.categoria, `Bs. ${p.precio}`, p.stock, p.tipo || 'Estándar']);

    autoTable(doc, {
      startY: 92,
      head: [['Producto', 'Categoría', 'Precio', 'Stock', 'Tipo']],
      body: rows,
      headStyles: { fillColor: [185, 28, 92], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 4.5 },
    });

    const totalPags = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPags; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Yasumi Florería — Pág. ${i}/${totalPags} — ${hoy}`, 105, 288, { align: 'center' });
    }

    doc.save(`yasumi_inventario_${Date.now()}.pdf`);
  };

  const generarPDFLog = () => {
    const doc = new jsPDF();
    const hoy = new Date().toLocaleString('es-BO');

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');
    
    doc.setTextColor(249, 168, 212);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('YASUMI — Bitácora de Auditoría, Roles y Seguridad', 105, 16, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte Forense de Accesos, Cambios de Rol, Supervisión y Alertas | ${hoy}`, 105, 26, { align: 'center' });

    const rows = logsFiltrados.map((l) => [
      l.usuario,
      l.ip,
      l.evento || 'EVENTO',
      l.browser.length > 36 ? l.browser.slice(0, 36) + '…' : l.browser,
      l.fechaHora
    ]);
    
    autoTable(doc, {
      startY: 42,
      head: [['Identidad / Actor', 'IP Origen', 'Evento / Detalle de Auditoría', 'Agente / Navegador', 'Fecha y Hora']],
      body: rows,
      headStyles: { fillColor: [15, 23, 42], textColor: [249, 168, 212], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3.5 },
    });

    const totalPags = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPags; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Yasumi Auditoría Inmutable (Append-Only) — Pág. ${i}/${totalPags} — ${hoy}`, 105, 288, { align: 'center' });
    }

    doc.save(`yasumi_bitacora_auditoria_${Date.now()}.pdf`);
  };

  const logsFiltrados = logs.filter((l) => {
    const ev = (l.evento || '').toUpperCase();
    const matchBusqueda =
      !busquedaLog ||
      (l.usuario || '').toLowerCase().includes(busquedaLog.toLowerCase()) ||
      (l.evento || '').toLowerCase().includes(busquedaLog.toLowerCase()) ||
      (l.ip || '').toLowerCase().includes(busquedaLog.toLowerCase());

    if (!matchBusqueda) return false;
    if (filtroEvento === 'todos') return true;
    if (filtroEvento === 'accesos') return ev.startsWith('INGRESO') || ev.startsWith('SALIDA');
    if (filtroEvento === 'roles') return ev.startsWith('ROL_CAMBIO') || ev.startsWith('IDENTIDAD') || ev.startsWith('USUARIO_');
    if (filtroEvento === 'supervision') return ev.startsWith('SUPERVISION');
    if (filtroEvento === 'alertas') return ev.startsWith('ACCESO_DENEGADO') || ev.startsWith('AUTH_') || ev.startsWith('LOGIN_BLOQUEADO') || ev.startsWith('EMERGENCIA');
    return true;
  });

  return (
    <div className="page">
      <div className="breadcrumb-bar">
        <button className="breadcrumb-link" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
        <span>/</span>
        <span>Reportes & Bitácora Forense</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes & <span>Auditoría</span></h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginTop: 2 }}>
            Métricas de inventario y trazabilidad inmutable de eventos críticos de seguridad
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={generarPDF} disabled={prodsLoading}>📄 Exportar PDF Inventario</button>
          <button className="btn btn-secondary btn-sm" onClick={generarPDFLog} disabled={logsLoading}>🛡️ Exportar PDF Bitácora ({logsFiltrados.length})</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid anim-fade-up anim-delay-1">
        <div className="stat-card">
          <div className="stat-value">{stats.activos}</div>
          <div className="stat-label">Productos Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--dorado)', fontSize: '1.4rem' }}>
            Bs. {stats.valorInventario.toLocaleString()}
          </div>
          <div className="stat-label">Valor del Inventario</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#94A3B8' }}>{stats.inactivos}</div>
          <div className="stat-label">Inactivos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--verde-hoja)' }}>{logs.length}</div>
          <div className="stat-label">Eventos en Bitácora</div>
        </div>
      </div>

      {/* Charts */}
      <div className="anim-fade-up anim-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="chart-container">
          <div className="chart-title">Distribución por Categoría</div>
          <div style={{ position: 'relative', height: '230px', display: 'flex', justifyContent: 'center' }}>
            {prodsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--texto-secundario)' }}>Cargando...</div>
            ) : (
              <canvas ref={chartRefCat} />
            )}
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-title">Precios de Productos</div>
          <div style={{ position: 'relative', height: '230px' }}>
            {prodsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--texto-secundario)' }}>Cargando...</div>
            ) : (
              <canvas ref={chartRefPrecio} />
            )}
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="anim-fade-up anim-delay-3" style={{ marginTop: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: '0.85rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.25rem' }}>Bitácora de <span>Auditoría y Trazabilidad</span></h2>
          <button className="btn btn-secondary btn-sm" onClick={loadLogs} disabled={logsLoading}>🔄 Recargar Bitácora</button>
        </div>

        {/* Filtros de Bitácora */}
        <div className="search-bar" style={{ marginBottom: '0.75rem' }}>
          <div className="search-wrapper" style={{ maxWidth: 380 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Filtrar por usuario, evento (ej. ROL_CAMBIO) o IP..."
              value={busquedaLog}
              onChange={(e) => setBusquedaLog(e.target.value)}
            />
          </div>
          <div className="category-pills" style={{ marginBottom: 0 }}>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'accesos', label: 'Ingresos / Salidas' },
              { id: 'roles', label: 'Roles e Identidades' },
              { id: 'supervision', label: 'Supervisión' },
              { id: 'alertas', label: 'Alertas / Denegados' },
            ].map((f) => (
              <button
                key={f.id}
                className={`pill ${filtroEvento === f.id ? 'active' : ''}`}
                onClick={() => setFiltroEvento(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--texto-secundario)' }}>
            Cargando registros de auditoría...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Identidad</th>
                  <th>IP</th>
                  <th>Evento / Detalle de Auditoría</th>
                  <th>Navegador</th>
                  <th>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--texto-secundario)' }}>Sin registros para este filtro</td></tr>
                ) : logsFiltrados.map((l) => {
                  const badge = getBadgeStyle(l.evento);
                  return (
                    <tr key={l.id}>
                      <td><strong>{l.usuario}</strong></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>{l.ip}</td>
                      <td>
                        <span className="card-badge" style={{
                          background: badge.bg,
                          color: badge.color,
                          textTransform: 'none',
                          fontSize: '0.74rem'
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{
                        fontSize: '0.75rem', color: 'var(--texto-secundario)',
                        maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }} title={l.browser}>
                        {l.browser}
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>{l.fechaHora}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
