import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../../../config/api'
import styles from '../ModalUsuario.module.css'

function TabHistorial({ usuarioId }) {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)

  // ========================================
  // CARGAR HISTORIAL
  // ========================================
  useEffect(() => {
    cargarHistorial()
  }, [usuarioId])

  const cargarHistorial = async () => {
    try {
      setCargando(true)

      // Cargar compras y alquileres vencidos en paralelo
      const [comprasRes, alquileresRes] = await Promise.all([
        api.get(`/usuarios/${usuarioId}/compras`),
        api.get(`/usuarios/${usuarioId}/alquileres`)
      ])

      const comprasVencidas = (comprasRes.data.compras.vencidas || []).map(c => ({
        ...c,
        tipo: 'compra',
        fechaReferencia: c.fechaVencimiento
      }))

      const alquileresVencidos = (alquileresRes.data.alquileres.vencidos || []).map(a => ({
        ...a,
        tipo: 'alquiler',
        fechaReferencia: a.fechaReprogramada || a.fechaFinalizacion
      }))

      // Mezclar y ordenar por fecha más reciente
      const mezclado = [...comprasVencidas, ...alquileresVencidos].sort((a, b) => {
        return new Date(b.fechaReferencia) - new Date(a.fechaReferencia)
      })

      setHistorial(mezclado)
    } catch (error) {
      console.error('Error al cargar historial:', error)
      toast.error('Error al cargar historial')
    } finally {
      setCargando(false)
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
    return <div className={styles.loading}>Cargando historial...</div>
  }

  if (historial.length === 0) {
    return <div className={styles.vacio}>No hay historial</div>
  }

  return (
    <table className={styles.tablaInterna}>
      <thead>
        <tr>
          <th>Vehículo</th>
          <th>Tipo</th>
          <th>Monto</th>
          <th>Método</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {historial.map((item, index) => {
          const vehiculo = item.Vehiculo
          const categoria = vehiculo?.categorias?.[0]

          return (
            <tr key={`${item.tipo}-${item.id}-${index}`}>
              
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

              {/* Tipo */}
              <td>
                {item.tipo === 'compra' ? (
                  <span className={styles.badgeCompra}>Compra</span>
                ) : (
                  <span className={styles.badgeAlquiler}>Alquiler</span>
                )}
              </td>

              {/* Monto */}
              <td>{formatearPrecio(item.monto, item.metodoPago)}</td>

              {/* Método */}
              <td>
                <span className={styles.metodoPago}>{item.metodoPago}</span>
              </td>

              {/* Fecha */}
              <td>
                <span className={styles.fechaHistorial}>
                  {formatearFecha(item.fechaReferencia)}
                </span>
              </td>

            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default TabHistorial