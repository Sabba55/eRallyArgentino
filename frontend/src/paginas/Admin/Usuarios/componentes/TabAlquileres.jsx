import { useState, useEffect } from 'react'
import { Trash2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../../config/api'
import styles from '../ModalUsuario.module.css'

function TabAlquileres({ usuarioId, onActualizar }) {
  const [alquileres, setAlquileres] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)

  // Mini modal cambio de rally
  const [miniModalAbierto, setMiniModalAbierto] = useState(false)
  const [alquilerEditando, setAlquilerEditando] = useState(null)
  const [ralliesDisponibles, setRalliesDisponibles] = useState([])
  const [nuevoRallyId, setNuevoRallyId] = useState('')
  const [guardandoCambio, setGuardandoCambio] = useState(false)

  // ========================================
  // CARGAR ALQUILERES
  // ========================================
  useEffect(() => {
    cargarAlquileres()
  }, [usuarioId])

  const cargarAlquileres = async () => {
    try {
      setCargando(true)
      const response = await api.get(`/usuarios/${usuarioId}/alquileres`)
      setAlquileres(response.data.alquileres.activos || [])
    } catch (error) {
      console.error('Error al cargar alquileres:', error)
      toast.error('Error al cargar alquileres')
    } finally {
      setCargando(false)
    }
  }

  // ========================================
  // ELIMINAR ALQUILER
  // ========================================
  const eliminarAlquiler = async (alquilerId, vehiculoNombre) => {
    if (!window.confirm(`¿Eliminar el alquiler de "${vehiculoNombre}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setEliminando(alquilerId)
      await api.delete(`/usuarios/alquileres/${alquilerId}`)
      
      toast.success('Alquiler eliminado')
      
      // Actualizar lista
      setAlquileres(alquileres.filter(a => a.id !== alquilerId))
      
      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error(error.response?.data?.error || 'Error al eliminar alquiler')
    } finally {
      setEliminando(null)
    }
  }

  // ========================================
  // ABRIR MINI MODAL CAMBIO RALLY
  // ========================================
  const abrirMiniModal = async (alquiler) => {
    try {
      setAlquilerEditando(alquiler)
      
      // Cargar rallies disponibles
      const response = await api.get('/rallies/proximos')
      setRalliesDisponibles(response.data.rallies || [])
      
      setNuevoRallyId(alquiler.Rally.id)
      setMiniModalAbierto(true)
    } catch (error) {
      console.error('Error al cargar rallies:', error)
      toast.error('Error al cargar rallies disponibles')
    }
  }

  // ========================================
  // GUARDAR CAMBIO DE RALLY
  // ========================================
  const guardarCambioRally = async () => {
    if (!nuevoRallyId) {
      toast.error('Selecciona un rally')
      return
    }

    try {
      setGuardandoCambio(true)
      
      await api.put(`/usuarios/alquileres/${alquilerEditando.id}/cambiar-rally`, {
        rallyId: parseInt(nuevoRallyId)
      })

      toast.success('Rally cambiado exitosamente')
      
      // Recargar alquileres
      await cargarAlquileres()
      
      // Cerrar mini modal
      setMiniModalAbierto(false)
      setAlquilerEditando(null)
      
      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al cambiar rally:', error)
      toast.error(error.response?.data?.error || 'Error al cambiar rally')
    } finally {
      setGuardandoCambio(false)
    }
  }

  // ========================================
  // FORMATEAR FECHA
  // ========================================
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearFechaRally = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = String(fecha.getFullYear()).slice(-2)
    return `${dia}/${mes}/${año}`
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
    return <div className={styles.loading}>Cargando alquileres...</div>
  }

  if (alquileres.length === 0) {
    return <div className={styles.vacio}>No hay alquileres activos</div>
  }

  return (
    <>
      <table className={styles.tablaInterna}>
        <thead>
          <tr>
            <th>Vehículo</th>
            <th>Rally</th>
            <th>Método</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alquileres.map(alquiler => {
            const vehiculo = alquiler.Vehiculo
            const categoria = vehiculo?.categorias?.[0]
            const rally = alquiler.Rally

            return (
              <tr key={alquiler.id}>
                
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

                {/* Rally */}
                <td>
                  <div className={styles.rallyCell}>
                    <div className={styles.rallyNombre}>{rally.nombre}</div>
                    <div className={styles.rallyFecha}>
                      {formatearFecha(rally.fecha)}
                    </div>
                    {rally.fueReprogramado && (
                      <span className={styles.badgeReprogramado}>Reprogramado</span>
                    )}
                  </div>
                </td>

                {/* Método */}
                <td>
                  <span className={styles.metodoPago}>{alquiler.metodoPago}</span>
                </td>

                {/* Monto */}
                <td>{formatearPrecio(alquiler.monto, alquiler.metodoPago)}</td>

                {/* Acciones */}
                <td>
                  <div className={styles.accionesTabla}>
                    <button
                      className={styles.btnAccionTabla}
                      onClick={() => eliminarAlquiler(alquiler.id, `${vehiculo.marca} ${vehiculo.nombre}`)}
                      disabled={eliminando === alquiler.id}
                      title="Eliminar alquiler"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className={styles.btnAccionTabla}
                      onClick={() => abrirMiniModal(alquiler)}
                      title="Cambiar rally"
                    >
                      <Calendar size={16} />
                    </button>
                  </div>
                </td>

              </tr>
            )
          })}
        </tbody>
      </table>

      {/* MINI MODAL CAMBIO RALLY */}
      {miniModalAbierto && alquilerEditando && (
        <div className={styles.miniModal} onClick={() => setMiniModalAbierto(false)}>
          <div className={styles.miniModalContenido} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.miniModalTitulo}>Cambiar Rally</h3>
            <p className={styles.miniModalSub}>
              Vehículo: <strong>{alquilerEditando.Vehiculo.marca} {alquilerEditando.Vehiculo.nombre}</strong>
            </p>

            <select
              className={styles.selectRally}
              value={nuevoRallyId}
              onChange={(e) => setNuevoRallyId(e.target.value)}
            >
              <option value="">Selecciona un rally</option>
              {ralliesDisponibles.map(rally => (
                <option key={rally.id} value={rally.id}>
                  {formatearFechaRally(rally.fecha)} | {rally.campeonato} - {rally.nombre}
                </option>
              ))}
            </select>

            <div className={styles.miniModalBotones}>
              <button
                className={styles.btnCancelarMini}
                onClick={() => setMiniModalAbierto(false)}
                disabled={guardandoCambio}
              >
                Cancelar
              </button>
              <button
                className={styles.btnGuardarMini}
                onClick={guardarCambioRally}
                disabled={guardandoCambio || !nuevoRallyId}
              >
                {guardandoCambio ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TabAlquileres