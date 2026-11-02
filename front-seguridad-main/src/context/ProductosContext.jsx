import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ProductosContext = createContext(null);

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Consultar productos del backend
      const resProds = await api.get('/productos');
      setProductos(resProds.data);

      // Consultar categorías del backend
      const resCats = await api.get('/categorias');
      setCategorias(resCats.data);
    } catch (error) {
      console.error("Error al cargar productos/categorías desde el backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const agregarProducto = async (datos) => {
    try {
      const res = await api.post('/productos', datos);
      if (res.data.mensaje && Array.isArray(res.data.mensaje)) {
        return { ok: false, error: res.data.mensaje.map(m => m.msg).join(', ') };
      }
      await cargarDatos();
      return { ok: true, message: res.data.message };
    } catch (error) {
      return { ok: false, error: error.response?.data?.error || 'Error al agregar producto' };
    }
  };

  const editarProducto = async (id, datos) => {
    try {
      const res = await api.put(`/productos/${id}`, datos);
      if (res.data.mensaje && Array.isArray(res.data.mensaje)) {
        return { ok: false, error: res.data.mensaje.map(m => m.msg).join(', ') };
      }
      await cargarDatos();
      return { ok: true, message: res.data.message };
    } catch (error) {
      return { ok: false, error: error.response?.data?.error || 'Error al editar producto' };
    }
  };

  // Eliminación lógica
  const eliminarProducto = async (id) => {
    try {
      const res = await api.delete(`/productos/${id}`);
      await cargarDatos();
      return { ok: true, message: res.data.message };
    } catch (error) {
      return { ok: false, error: error.response?.data?.error || 'Error al eliminar producto' };
    }
  };

  // Reactivar producto
  const reactivarProducto = async (id) => {
    try {
      const res = await api.post(`/productos/${id}/reactivar`);
      await cargarDatos();
      return { ok: true, message: res.data.message };
    } catch (error) {
      return { ok: false, error: error.response?.data?.error || 'Error al reactivar producto' };
    }
  };

  const getProductosActivos = () => productos.filter((p) => p.activo);
  const getTodos = () => productos;

  const estadisticas = () => {
    const activos = productos.filter((p) => p.activo);
    const inactivos = productos.filter((p) => !p.activo);
    const porCategoria = activos.reduce((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + 1;
      return acc;
    }, {});
    const valorInventario = activos.reduce((sum, p) => sum + p.precio * p.stock, 0);
    return { 
      activos: activos.length, 
      inactivos: inactivos.length, 
      porCategoria, 
      valorInventario 
    };
  };

  return (
    <ProductosContext.Provider value={{ 
      productos, 
      categorias, 
      loading,
      cargarDatos, 
      agregarProducto, 
      editarProducto, 
      eliminarProducto, 
      reactivarProducto, 
      getProductosActivos, 
      getTodos, 
      estadisticas 
    }}>
      {children}
    </ProductosContext.Provider>
  );
}

export const useProductos = () => useContext(ProductosContext);