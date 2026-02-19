import { useState, useEffect } from 'react'
import { Modal, Form } from 'react-bootstrap'
import { X, Trash2, Calendar } from 'lucide-react'
import api from '../../../config/api'
import styles from './ModalUsuario.module.css'

function ModalUsuario({ show, onHide, usuario, onGuardado }) {
  // ========================================
  // ESTADOS
  // ========================================
  const [pestañaActiva, setPestañaActiva] = useState('info')
  const [compras, setCompras] = useState([])
  const [alquileres, setAlquileres] = useState([])
  const [historial, setHistorial] = useState([])
  const [ralliesDisponibles, setRalliesDisponibles] = useState([])
  const [cargando, setCargando] = useState(true)

  // Info editable
  const [rolSeleccionado, setRolSeleccionado] = useState(usuario.rol)
  const [guardandoRol, setGuardandoRol] = useState(false)

  // Modal cambio de rally
  const [alquilerCambiando, setAlquilerCambiando] = useState(null)
  const [nuevoRallyId, setNuevoRallyId] = useState('')
  const [guardandoRally, setGuardandoRally] = useState(false)

  // ========================================
  // CARGAR DATOS AL ABRIR
  // ========================================
  useEffect(() => {
    if (show && usuario) {
      cargarDatos()
      setRolSeleccionado(usuario.rol)
      setPestañaActiva('info')
    }
  }, [show, usuario])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const [resCompras, resAlquileres, resRallies] = await Promise.all([
        api.get(`/admin/usuarios/${usuario.id}/compras`),
        api.get(`/admin/usuarios/${usuario.id}/alquileres`),
        api.get('/rallies/proximos')
      ])

      const todasCompras = resCompras.data.compras || []
      const todosAlquileres = resAlquileres.data.alquileres || []
      const ahora = new Date()

      // Compras activas (aprobadas y no vencidas)
      setCompras(todasCompras.filter(c =>
        c.estado === 'aprobado' && new Date(c.fechaVencimiento) > ahora
      ))

      // Alquileres activos (aprobados y no vencidos)
      setAlquileres(todosAlquileres.filter(a => {
        const fechaFin = a.fechaReprogramada || a.fechaFinalizacion
        return a.estado === 'aprobado' && new Date(fechaFin) > ahora
      }))

      // Historial: compras vencidas + alquileres vencidos, mezclados y ordenados
      const comprasVencidas = todasCompras
        .filter(c => c.estado === 'vencido' || (c.estado === 'aprobado' && new Date(c.fechaVencimiento) <= ahora))
        .map(c => ({ ...c, tipo: 'compra' }))

      const alquileresVencidos = todosAlquileres
        .filter(a => {
          const fechaFin = a.fechaReprogramada || a.fechaFinalizacion
          return a.estado === 'vencido' || a.estado === 'rally_cancelado' ||
            (a.estado === 'aprobado' && new Date(fechaFin) <= ahora)
        })
        .map(a => ({ ...a, tipo: 'alquiler' }))

      const mezclado = [...comprasVencidas, ...alquileresVencidos]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

      setHistorial(mezclado)
      setRalliesDisponibles(resRallies.data.rallies || [])
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err)
    } finally {
      setCargando(false)
    }
  }

  // ========================================
  // GUARDAR ROL
  // ========================================
  const guardarRol = async () => {
    if (rolSeleccionado === usuario.rol) return
    try {
      setGuardandoRol(true)
      await api.put(`/usuarios/${usuario.id}/rol`, { rol: rolSeleccionado })
      onGuardado()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar el rol')
    } finally {
      setGuardandoRol(false)
    }
  }

  // ========================================
  // ELIMINAR COMPRA
  // ========================================
  const eliminarCompra = async (compraId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta compra?')) return
    try {
      await api.delete(`/admin/compras/${compraId}`)
      setCompras(compras.filter(c => c.id !== compraId))
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar la compra')
    }
  }

  // ========================================
  // ELIMINAR ALQUILER
  // ========================================
  const eliminarAlquiler = async (alquilerId) => {
    if (!window.confirm('¿Estás seguro de eliminar este alquiler?')) return
    try {
      await api.delete(`/admin/alquileres/${alquilerId}`)
      setAlquileres(alquileres.filter(a => a.id !== alquilerId))
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el alquiler')
    }
  }

  // ========================================
  // CAMBIAR RALLY DE ALQUILER
  // ========================================
  const abrirCambioRally = (alquiler) => {
    setAlquilerCambiando(alquiler)
    setNuevoRallyId(alquiler.rallyId)
  }

  const guardarCambioRally = async () => {
    if (!nuevoRallyId || nuevoRallyId === alquilerCambiando.rallyId) {
      setAlquilerCambiando(null)
      return
    }
    try {
      setGuardandoRally(true)
      await api.patch(`/admin/alquileres/${alquilerCambiando.id}/rally`, { rallyId: nuevoRallyId })
      // Recargar alquileres
      const res = await api.get(`/admin/usuarios/${usuario.id}/alquileres`)
      const ahora = new Date()
      const activos = (res.data.alquileres || []).filter(a => {
        const fechaFin = a.fechaReprogramada || a.fechaFinalizacion
        return a.estado === 'aprobado' && new Date(fechaFin) > ahora
      })
      setAlquileres(activos)
      setAlquilerCambiando(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar el rally')
    } finally {
      setGuardandoRally(false)
    }
  }

  // ========================================
  // HELPERS
  // ========================================
  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatMonto = (monto, moneda) => {
    const num = Math.floor(Number(monto))
    const formateado = num.toLocaleString('es-AR')
    return moneda === 'USD' ? `USD ${formateado}` : `$${formateado}`
  }

  const badgeRol = (rol) => {
    const config = {
      admin: styles.badgeAdmin,
      creador_fechas: styles.badgeCreador,
      usuario: styles.badgeUsuario
    }
    const labels = { admin: 'Admin', creador_fechas: 'Creador', usuario: 'Usuario' }
    return <span className={config[rol] || styles.badgeUsuario}>{labels[rol] || rol}</span>
  }

  // ========================================
  // RENDER PESTAÑAS
  // ========================================

  // Pestaña Info General
  const renderInfo = () => (
    <div className={styles.infoGrid}>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Nombre</span>
        <span className={styles.infoValor}>{usuario.nombre}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Email</span>
        <span className={styles.infoValor}>{usuario.email}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Equipo</span>
        <span className={styles.infoValor}>{usuario.equipo || '—'}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Email verificado</span>
        <span className={usuario.emailVerificado ? styles.verificadoSi : styles.verificadoNo}>
          {usuario.emailVerificado ? 'Sí' : 'No'}
        </span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Miembro desde</span>
        <span className={styles.infoValor}>
          {new Date(usuario.createdAt).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          })}
        </span>
      </div>

      {/* Cambio de Rol */}
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Rol actual</span>
        <div className={styles.rolEditar}>
          <Form.Select
            value={rolSeleccionado}
            onChange={(e) => setRolSeleccionado(e.target.value)}
            className={styles.selectRol}
          >
            <option value="usuario">Usuario</option>
            <option value="creador_fechas">Creador</option>
            <option value="admin">Admin</option>
          </Form.Select>
          <button
            className={styles.btnGuardarRol}
            onClick={guardarRol}
            disabled={guardandoRol || rolSeleccionado === usuario.rol}
          >
            {guardandoRol ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )

  // Pestaña Compras
  const renderCompras = () => (
    <div>
      {compras.length === 0 ? (
        <div className={styles.vacio}>Sin compras activas</div>
      ) : (
        <table className={styles.tablaInterna}>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Vencimiento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {compras.map(compra => (
              <tr key={compra.id}>
                <td>
                  <div className={styles.vehiculoCell}>
                    {compra.vehiculo?.foto && (
                      <img src={compra.vehiculo.foto} alt="" className={styles.vehiculoFoto} />
                    )}
                    <div>
                      <div className={styles.vehiculoNombre}>
                        {compra.vehiculo?.marca} {compra.vehiculo?.modelo}
                      </div>
                      {compra.vehiculo?.categoria && (
                        <span
                          className={styles.badgeCategoria}
                          style={{ backgroundColor: compra.vehiculo.categoria.color }}
                        >
                          {compra.vehiculo.categoria.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>{formatMonto(compra.monto, compra.moneda)}</td>
                <td><span className={styles.metodoPago}>{compra.metodoPago}</span></td>
                <td>{formatFecha(compra.fechaVencimiento)}</td>
                <td>
                  <button
                    className={styles.btnAccionTabla}
                    onClick={() => eliminarCompra(compra.id)}
                    title="Eliminar compra"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  // Pestaña Alquileres
  const renderAlquileres = () => (
    <div>
      {alquileres.length === 0 ? (
        <div className={styles.vacio}>Sin alquileres activos</div>
      ) : (
        <table className={styles.tablaInterna}>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Rally</th>
              <th>Método</th>
              <th>Monto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {alquileres.map(alquiler => (
              <tr key={alquiler.id}>
                <td>
                  <div className={styles.vehiculoCell}>
                    {alquiler.vehiculo?.foto && (
                      <img src={alquiler.vehiculo.foto} alt="" className={styles.vehiculoFoto} />
                    )}
                    <div>
                      <div className={styles.vehiculoNombre}>
                        {alquiler.vehiculo?.marca} {alquiler.vehiculo?.modelo}
                      </div>
                      {alquiler.vehiculo?.categoria && (
                        <span
                          className={styles.badgeCategoria}
                          style={{ backgroundColor: alquiler.vehiculo.categoria.color }}
                        >
                          {alquiler.vehiculo.categoria.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.rallyCell}>
                    <div className={styles.rallyNombre}>{alquiler.rally?.nombre}</div>
                    <div className={styles.rallyFecha}>
                      {formatFecha(alquiler.fechaReprogramada || alquiler.fechaFinalizacion)}
                    </div>
                    {alquiler.fechaReprogramada && (
                      <span className={styles.badgeReprogramado}>Reprogramado</span>
                    )}
                  </div>
                </td>
                <td><span className={styles.metodoPago}>{alquiler.metodoPago}</span></td>
                <td>{formatMonto(alquiler.monto, alquiler.moneda)}</td>
                <td>
                  <div className={styles.accionesTabla}>
                    <button
                      className={styles.btnAccionTabla}
                      onClick={() => abrirCambioRally(alquiler)}
                      title="Cambiar rally"
                    >
                      <Calendar size={16} />
                    </button>
                    <button
                      className={styles.btnAccionTabla}
                      onClick={() => eliminarAlquiler(alquiler.id)}
                      title="Eliminar alquiler"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Mini modal cambio de rally */}
      {alquilerCambiando && (
        <div className={styles.miniModal}>
          <div className={styles.miniModalContenido}>
            <p className={styles.miniModalTitulo}>Cambiar Rally</p>
            <p className={styles.miniModalSub}>
              Alquiler actual: <strong>{alquilerCambiando.rally?.nombre}</strong>
            </p>
            <Form.Select
              value={nuevoRallyId}
              onChange={(e) => setNuevoRallyId(Number(e.target.value))}
              className={styles.selectRally}
            >
              {ralliesDisponibles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre} — {new Date(r.fecha).toLocaleDateString('es-AR')}
                </option>
              ))}
            </Form.Select>
            <div className={styles.miniModalBotones}>
              <button
                className={styles.btnCancelarMini}
                onClick={() => setAlquilerCambiando(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnGuardarMini}
                onClick={guardarCambioRally}
                disabled={guardandoRally}
              >
                {guardandoRally ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Pestaña Historial
  const renderHistorial = () => (
    <div>
      {historial.length === 0 ? (
        <div className={styles.vacio}>Sin historial</div>
      ) : (
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
            {historial.map(item => (
              <tr key={`${item.tipo}-${item.id}`}>
                <td>
                  <div className={styles.vehiculoCell}>
                    {item.vehiculo?.foto && (
                      <img src={item.vehiculo.foto} alt="" className={styles.vehiculoFoto} />
                    )}
                    <div>
                      <div className={styles.vehiculoNombre}>
                        {item.vehiculo?.marca} {item.vehiculo?.modelo}
                      </div>
                      {item.vehiculo?.categoria && (
                        <span
                          className={styles.badgeCategoria}
                          style={{ backgroundColor: item.vehiculo.categoria.color }}
                        >
                          {item.vehiculo.categoria.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={item.tipo === 'compra' ? styles.badgeCompra : styles.badgeAlquiler}>
                    {item.tipo === 'compra' ? 'Compra' : 'Alquiler'}
                  </span>
                </td>
                <td>{formatMonto(item.monto, item.moneda)}</td>
                <td><span className={styles.metodoPago}>{item.metodoPago}</span></td>
                <td className={styles.fechaHistorial}>
                  {item.tipo === 'compra'
                    ? formatFecha(item.fechaVencimiento)
                    : formatFecha(item.fechaReprogramada || item.fechaFinalizacion)
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className={styles.modal}
    >
      {/* HEADER CON INFO DEL USUARIO */}
      <div className={styles.modalHeader}>
        <div className={styles.usuarioHeader}>
          {usuario.fotoPerfil ? (
            <img src={usuario.fotoPerfil} alt={usuario.nombre} className={styles.fotoPerfil} />
          ) : (
            <div className={styles.fotoPlaceholder}>
              {usuario.nombre?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className={styles.usuarioNombre}>{usuario.nombre}</div>
            <div className={styles.usuarioEmail}>{usuario.email}</div>
            <div className={styles.badges}>
              {badgeRol(usuario.rol)}
              {usuario.emailVerificado && (
                <span className={styles.badgeVerificado}>Verificado</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onHide} className={styles.btnCerrar}>
          <X size={24} />
        </button>
      </div>

      {/* PESTAÑAS */}
      <div className={styles.pestañas}>
        {[
          { id: 'info', label: 'Info General' },
          { id: 'compras', label: `Compras (${compras.length})` },
          { id: 'alquileres', label: `Alquileres (${alquileres.length})` },
          { id: 'historial', label: `Historial (${historial.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            className={`${styles.pestañaBtn} ${pestañaActiva === tab.id ? styles.pestañaActiva : ''}`}
            onClick={() => setPestañaActiva(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <Modal.Body className={styles.body}>
        {cargando ? (
          <div className={styles.loading}>Cargando...</div>
        ) : (
          <>
            {pestañaActiva === 'info' && renderInfo()}
            {pestañaActiva === 'compras' && renderCompras()}
            {pestañaActiva === 'alquileres' && renderAlquileres()}
            {pestañaActiva === 'historial' && renderHistorial()}
          </>
        )}
      </Modal.Body>

    </Modal>
  )
}

export default ModalUsuario