import { useEffect, useRef, useState } from 'react';
import { useProductos } from '../context/ProductosContext';
import { useAuth } from '../context/AuthContext';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reportes() {
  const { getTodos, estadisticas, loading: prodsLoading } = useProductos();
  const { fetchLogs } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

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
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('YASUMI — Registro de Accesos', 105, 18, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte de auditoría | ${hoy}`, 105, 28, { align: 'center' });

    const rows = logs.map((l) => [
      l.usuario,
      l.ip,
      l.evento === 'INGRESO' ? 'Ingreso' : 'Salida',
      l.browser.length > 40 ? l.browser.slice(0, 40) + '…' : l.browser,
      l.fechaHora
    ]);
    
    autoTable(doc, {
      startY: 44,
      head: [['Usuario', 'IP', 'Evento', 'Navegador', 'Fecha/Hora']],
      body: rows,
      headStyles: { fillColor: [15, 23, 42], textColor: [249, 168, 212], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 4 },
    });

    const totalPags = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPags; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Yasumi Auditoría — Pág. ${i}/${totalPags} — ${hoy}`, 105, 288, { align: 'center' });
    }

    doc.save(`yasumi_log_accesos_${Date.now()}.pdf`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Reportes & <span>Estadísticas</span></h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-primary btn-sm" onClick={generarPDF} disabled={prodsLoading}>PDF Inventario</button>
          <button className="btn btn-secondary btn-sm" onClick={generarPDFLog} disabled={logsLoading}>PDF Logs</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
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
          <div className="stat-value" style={{ color: 'var(--verde-hoja)' }}>{Object.keys(stats.porCategoria).length}</div>
          <div className="stat-label">Categorías</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
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
      <div style={{ marginTop: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.25rem' }}>Auditoría de <span>Accesos</span></h2>
          <button className="btn btn-secondary btn-sm" onClick={loadLogs} disabled={logsLoading}>Recargar</button>
        </div>

        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--texto-secundario)' }}>
            Cargando registros de acceso...
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>IP</th>
                  <th>Evento</th>
                  <th>Navegador</th>
                  <th>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--texto-secundario)' }}>Sin registros</td></tr>
                ) : logs.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.usuario}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>{l.ip}</td>
                    <td>
                      <span className={`card-badge ${l.evento === 'INGRESO' ? 'badge-activo' : 'badge-inactivo'}`}>
                        {l.evento === 'INGRESO' ? 'Ingreso' : 'Salida'}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
