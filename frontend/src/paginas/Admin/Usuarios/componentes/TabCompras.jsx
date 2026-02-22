import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../../config/api'
import styles from '../ModalUsuario.module.css'

function TabCompras({ usuarioId, onActualizar }) {
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)

  // ========================================
  // CARGAR COMPRAS
  // ========================================
  useEffect(() => {
    cargarCompras()
  }, [usuarioId])

  const cargarCompras = async () => {
    try {
      setCargando(true)
      const response = await api.get(`/usuarios/${usuarioId}/compras`)
      setCompras(response.data.compras.activas || [])
    } catch (error) {
      console.error('Error al cargar compras:', error)
      toast.error('Error al cargar compras')
    } finally {
      setCargando(false)
    }
  }

  // ========================================
  // ELIMINAR COMPRA
  // ========================================
  const eliminarCompra = async (compraId, vehiculoNombre) => {
    if (!window.confirm(`¿Eliminar la compra de "${vehiculoNombre}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setEliminando(compraId)
      await api.delete(`/usuarios/compras/${compraId}`)
      
      toast.success('Compra eliminada')
      
      // Actualizar lista
      setCompras(compras.filter(c => c.id !== compraId))
      
      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error(error.response?.data?.error || 'Error al eliminar compra')
    } finally {
      setEliminando(null)
    }
  }

  // ========================================
  // FORMATEAR FECHA
  // ========================================
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  // ========================================
  // FORMATEAR PRECIO
  // ========================================
  const formatearPrecio = (monto, metodo) => {
    if (metodo === 'PayPal') {
      return `USD ${monto.toFixed(2)}`
    }
    return `$${monto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
  }

  // ========================================
  // RENDER
  // ========================================
  if (cargando) {
    return <div className={styles.loading}>Cargando compras...</div>
  }

  if (compras.length === 0) {
    return <div className={styles.vacio}>No hay compras activas</div>
  }

  return (
    <table className={styles.tablaInterna}>
      <thead>
        <tr>
          <th>Vehículo</th>
          <th>Monto</th>
          <th>Método</th>
          <th>Vencimiento</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {compras.map(compra => {
          const vehiculo = compra.Vehiculo
          const categoria = vehiculo?.categorias?.[0]

          return (
            <tr key={compra.id}>
              
              {/* Vehículo */}
              <td>
                <div className={styles.vehiculoCell}>
                  <img
                    src={vehiculo.foto}
                    alt={`${vehiculo.marca} ${vehiculo.nombre}`}
                    className={styles.vehiculoFoto}
                  />
                  <div>
                    <div className={styles.vehiculoNombre}>
                      {vehiculo.marca} {vehiculo.nombre}
                    </div>
                    {categoria && (
                      <span
                        className={styles.badgeCategoria}
                        style={{ backgroundColor: categoria.color }}
                      >
                        {categoria.nombre}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Monto */}
              <td>{formatearPrecio(compra.monto, compra.metodoPago)}</td>

              {/* Método */}
              <td>
                <span className={styles.metodoPago}>{compra.metodoPago}</span>
              </td>

              {/* Vencimiento */}
              <td>{formatearFecha(compra.fechaVencimiento)}</td>

              {/* Acción */}
              <td>
                <div className={styles.accionesTabla}>
                  <button
                    className={styles.btnAccionTabla}
                    onClick={() => eliminarCompra(compra.id, `${vehiculo.marca} ${vehiculo.nombre}`)}
                    disabled={eliminando === compra.id}
                    title="Eliminar compra"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>

            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default TabCompras