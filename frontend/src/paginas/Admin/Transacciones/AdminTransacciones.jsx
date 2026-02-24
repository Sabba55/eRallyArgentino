import { useState, useEffect, useMemo } from 'react'
import { Container, Form } from 'react-bootstrap'
import { CheckCircle, XCircle, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import api from '../../../config/api'
import toast from 'react-hot-toast'
import styles from './AdminTransacciones.module.css'

function AdminTransacciones() {
  // ========================================
  // ESTADOS
  // ========================================
  const [pestañaActiva, setPestañaActiva] = useState('compras')

  // Compras
  const [compras, setCompras] = useState([])
  const [cargandoCompras, setCargandoCompras] = useState(true)
  const [filtroCompras, setFiltroCompras] = useState('todos')

  // Alquileres
  const [alquileres, setAlquileres] = useState([])
  const [cargandoAlquileres, setCargandoAlquileres] = useState(true)
  const [filtroAlquileres, setFiltroAlquileres] = useState('todos')

  // Ordenamiento
  const [ordenarPor, setOrdenarPor] = useState(null)
  const [direccionOrden, setDireccionOrden] = useState('asc')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  // ========================================
  // CARGAR DATOS
  // ========================================
  useEffect(() => {
    cargarCompras()
    cargarAlquileres()
  }, [])

  const cargarCompras = async () => {
    try {
      setCargandoCompras(true)
      const res = await api.get('/admin/transacciones/compras')
      setCompras(res.data.compras || [])
    } catch (error) {
      console.error('Error al cargar compras:', error)
      toast.error('Error al cargar compras')
    } finally {
      setCargandoCompras(false)
    }
  }

  const cargarAlquileres = async () => {
    try {
      setCargandoAlquileres(true)
      const res = await api.get('/admin/transacciones/alquileres')
      setAlquileres(res.data.alquileres || [])
    } catch (error) {
      console.error('Error al cargar alquileres:', error)
      toast.error('Error al cargar alquileres')
    } finally {
      setCargandoAlquileres(false)
    }
  }

  // ========================================
  // APROBAR / RECHAZAR
  // ========================================
  const aprobarCompra = async (id) => {
    if (!window.confirm('¿Aprobar esta compra?')) return
    try {
      await api.patch(`/admin/transacciones/compras/${id}/aprobar`)
      toast.success('Compra aprobada')
      cargarCompras()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al aprobar compra')
    }
  }

  const rechazarCompra = async (id) => {
    if (!window.confirm('¿Rechazar esta compra?')) return
    try {
      await api.patch(`/admin/transacciones/compras/${id}/rechazar`)
      toast.success('Compra rechazada')
      cargarCompras()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al rechazar compra')
    }
  }

  const aprobarAlquiler = async (id) => {
    if (!window.confirm('¿Aprobar este alquiler?')) return
    try {
      await api.patch(`/admin/transacciones/alquileres/${id}/aprobar`)
      toast.success('Alquiler aprobado')
      cargarAlquileres()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al aprobar alquiler')
    }
  }

  const rechazarAlquiler = async (id) => {
    if (!window.confirm('¿Rechazar este alquiler?')) return
    try {
      await api.patch(`/admin/transacciones/alquileres/${id}/rechazar`)
      toast.success('Alquiler rechazado')
      cargarAlquileres()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al rechazar alquiler')
    }
  }

  // ========================================
  // FILTRADO Y ORDENAMIENTO
  // ========================================
  const manejarOrden = (columna) => {
    if (ordenarPor === columna) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenarPor(columna)
      setDireccionOrden('asc')
    }
    setPaginaActual(1)
  }

  const IconoOrden = ({ columna }) => {
    if (ordenarPor !== columna) return <Filter size={14} style={{ opacity: 0.4, marginLeft: '6px' }} />
    return direccionOrden === 'asc'
      ? <ChevronUp size={16} style={{ color: '#39ff14', marginLeft: '6px' }} />
      : <ChevronDown size={16} style={{ color: '#39ff14', marginLeft: '6px' }} />
  }

  const comprasFiltradas = useMemo(() => {
    let resultado = compras.filter(c =>
      filtroCompras === 'todos' || c.estado === filtroCompras
    )
    if (ordenarPor) {
      resultado = [...resultado].sort((a, b) => {
        let valA, valB
        if (ordenarPor === 'usuario') { valA = a.Usuario?.nombre?.toLowerCase() || ''; valB = b.Usuario?.nombre?.toLowerCase() || '' }
        else if (ordenarPor === 'vehiculo') { valA = `${a.Vehiculo?.marca} ${a.Vehiculo?.nombre}`.toLowerCase(); valB = `${b.Vehiculo?.marca} ${b.Vehiculo?.nombre}`.toLowerCase() }
        else if (ordenarPor === 'monto') { valA = parseFloat(a.monto); valB = parseFloat(b.monto) }
        else if (ordenarPor === 'fecha') { valA = new Date(a.createdAt); valB = new Date(b.createdAt) }
        else { valA = a[ordenarPor]; valB = b[ordenarPor] }
        if (valA < valB) return direccionOrden === 'asc' ? -1 : 1
        if (valA > valB) return direccionOrden === 'asc' ? 1 : -1
        return 0
      })
    }
    return resultado
  }, [compras, filtroCompras, ordenarPor, direccionOrden])

  const alquileresFiltrados = useMemo(() => {
    let resultado = alquileres.filter(a =>
      filtroAlquileres === 'todos' || a.estado === filtroAlquileres
    )
    if (ordenarPor) {
      resultado = [...resultado].sort((a, b) => {
        let valA, valB
        if (ordenarPor === 'usuario') { valA = a.Usuario?.nombre?.toLowerCase() || ''; valB = b.Usuario?.nombre?.toLowerCase() || '' }
        else if (ordenarPor === 'vehiculo') { valA = `${a.Vehiculo?.marca} ${a.Vehiculo?.nombre}`.toLowerCase(); valB = `${b.Vehiculo?.marca} ${b.Vehiculo?.nombre}`.toLowerCase() }
        else if (ordenarPor === 'monto') { valA = parseFloat(a.monto); valB = parseFloat(b.monto) }
        else if (ordenarPor === 'fecha') { valA = new Date(a.createdAt); valB = new Date(b.createdAt) }
        else { valA = a[ordenarPor]; valB = b[ordenarPor] }
        if (valA < valB) return direccionOrden === 'asc' ? -1 : 1
        if (valA > valB) return direccionOrden === 'asc' ? 1 : -1
        return 0
      })
    }
    return resultado
  }, [alquileres, filtroAlquileres, ordenarPor, direccionOrden])

  // ========================================
  // PAGINACIÓN
  // ========================================
  const datosPaginados = (datos) => {
    const ultimo = paginaActual * itemsPorPagina
    const primero = ultimo - itemsPorPagina
    return datos.slice(primero, ultimo)
  }

  const totalPaginas = (datos) => Math.ceil(datos.length / itemsPorPagina)

  // ========================================
  // HELPERS
  // ========================================
  const formatearPrecio = (precio, moneda) => {
    const num = Math.floor(parseFloat(precio)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return moneda === 'USD' ? `USD ${num}` : `$${num}`
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const BadgeEstado = ({ estado }) => {
    const config = {
      pendiente:  { label: 'Pendiente',  clase: styles.badgePendiente },
      aprobado:   { label: 'Aprobado',   clase: styles.badgeAprobado },
      rechazado:  { label: 'Rechazado',  clase: styles.badgeRechazado },
      vencido:    { label: 'Vencido',    clase: styles.badgeVencido },
      rally_cancelado: { label: 'Rally cancelado', clase: styles.badgeVencido }
    }
    const c = config[estado] || config.pendiente
    return <span className={c.clase}>{c.label}</span>
  }

  const pendientesCompras = compras.filter(c => c.estado === 'pendiente').length
  const pendientesAlquileres = alquileres.filter(a => a.estado === 'pendiente').length

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.contenedor}>
      <Container>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>TRANSACCIONES</h1>
          <div className={styles.resumen}>
            {pendientesCompras > 0 && (
              <span className={styles.alertaPendiente}>
                {pendientesCompras} compra{pendientesCompras > 1 ? 's' : ''} pendiente{pendientesCompras > 1 ? 's' : ''}
              </span>
            )}
            {pendientesAlquileres > 0 && (
              <span className={styles.alertaPendiente}>
                {pendientesAlquileres} alquiler{pendientesAlquileres > 1 ? 'es' : ''} pendiente{pendientesAlquileres > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className={styles.pestañas}>
          <button
            className={`${styles.pestañaBtn} ${pestañaActiva === 'compras' ? styles.pestañaActiva : ''}`}
            onClick={() => { setPestañaActiva('compras'); setPaginaActual(1) }}
          >
            Compras ({compras.length})
            {pendientesCompras > 0 && <span className={styles.badge}>{pendientesCompras}</span>}
          </button>
          <button
            className={`${styles.pestañaBtn} ${pestañaActiva === 'alquileres' ? styles.pestañaActiva : ''}`}
            onClick={() => { setPestañaActiva('alquileres'); setPaginaActual(1) }}
          >
            Alquileres ({alquileres.length})
            {pendientesAlquileres > 0 && <span className={styles.badge}>{pendientesAlquileres}</span>}
          </button>
        </div>

        {/* ===== TAB COMPRAS ===== */}
        {pestañaActiva === 'compras' && (
          <>
            <div className={styles.filtros}>
              <div className={styles.grupoFiltro}>
                <label className={styles.labelFiltro}>Estado</label>
                <Form.Select
                  value={filtroCompras}
                  onChange={(e) => { setFiltroCompras(e.target.value); setPaginaActual(1) }}
                  className={styles.select}
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="vencido">Vencidos</option>
                </Form.Select>
              </div>
            </div>

            {cargandoCompras ? (
              <div className={styles.loading}>Cargando compras...</div>
            ) : (
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th onClick={() => manejarOrden('usuario')} style={{ cursor: 'pointer' }}>
                        Usuario <IconoOrden columna="usuario" />
                      </th>
                      <th onClick={() => manejarOrden('vehiculo')} style={{ cursor: 'pointer' }}>
                        Vehículo <IconoOrden columna="vehiculo" />
                      </th>
                      <th onClick={() => manejarOrden('monto')} style={{ cursor: 'pointer' }}>
                        Monto <IconoOrden columna="monto" />
                      </th>
                      <th>Método</th>
                      <th onClick={() => manejarOrden('fecha')} style={{ cursor: 'pointer' }}>
                        Fecha <IconoOrden columna="fecha" />
                      </th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados(comprasFiltradas).length === 0 ? (
                      <tr><td colSpan="7" className={styles.vacio}>No hay compras con ese filtro</td></tr>
                    ) : (
                      datosPaginados(comprasFiltradas).map(compra => (
                        <tr key={compra.id}>
                          <td>
                            <div className={styles.nombreUsuario}>{compra.Usuario?.nombre}</div>
                            <div className={styles.emailUsuario}>{compra.Usuario?.email}</div>
                          </td>
                          <td>
                            <div className={styles.nombreVehiculo}>{compra.Vehiculo?.marca}</div>
                            <div className={styles.modeloVehiculo}>{compra.Vehiculo?.nombre}</div>
                          </td>
                          <td className={styles.monto}>{formatearPrecio(compra.monto, compra.moneda)}</td>
                          <td>
                            <span className={compra.metodoPago === 'PayPal' ? styles.badgePaypal : styles.badgeMp}>
                              {compra.metodoPago}
                            </span>
                          </td>
                          <td className={styles.fecha}>{formatearFecha(compra.createdAt)}</td>
                          <td><BadgeEstado estado={compra.estado} /></td>
                          <td>
                            {compra.estado === 'pendiente' && (
                              <div className={styles.acciones}>
                                <button className={styles.btnAprobar} onClick={() => aprobarCompra(compra.id)} title="Aprobar">
                                  <CheckCircle size={20} />
                                </button>
                                <button className={styles.btnRechazar} onClick={() => rechazarCompra(compra.id)} title="Rechazar">
                                  <XCircle size={20} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPaginas(comprasFiltradas) > 1 && (
              <div className={styles.paginacion}>
                <button onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1} className={styles.btnPaginacion}>←</button>
                {[...Array(totalPaginas(comprasFiltradas))].map((_, i) => (
                  <button key={i} onClick={() => setPaginaActual(i + 1)} className={`${styles.btnPaginacion} ${paginaActual === i + 1 ? styles.activo : ''}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas(comprasFiltradas)} className={styles.btnPaginacion}>→</button>
              </div>
            )}
          </>
        )}

        {/* ===== TAB ALQUILERES ===== */}
        {pestañaActiva === 'alquileres' && (
          <>
            <div className={styles.filtros}>
              <div className={styles.grupoFiltro}>
                <label className={styles.labelFiltro}>Estado</label>
                <Form.Select
                  value={filtroAlquileres}
                  onChange={(e) => { setFiltroAlquileres(e.target.value); setPaginaActual(1) }}
                  className={styles.select}
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="vencido">Vencidos</option>
                  <option value="rally_cancelado">Rally cancelado</option>
                </Form.Select>
              </div>
            </div>

            {cargandoAlquileres ? (
              <div className={styles.loading}>Cargando alquileres...</div>
            ) : (
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th onClick={() => manejarOrden('usuario')} style={{ cursor: 'pointer' }}>
                        Usuario <IconoOrden columna="usuario" />
                      </th>
                      <th onClick={() => manejarOrden('vehiculo')} style={{ cursor: 'pointer' }}>
                        Vehículo <IconoOrden columna="vehiculo" />
                      </th>
                      <th>Rally</th>
                      <th onClick={() => manejarOrden('monto')} style={{ cursor: 'pointer' }}>
                        Monto <IconoOrden columna="monto" />
                      </th>
                      <th>Método</th>
                      <th onClick={() => manejarOrden('fecha')} style={{ cursor: 'pointer' }}>
                        Fecha <IconoOrden columna="fecha" />
                      </th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados(alquileresFiltrados).length === 0 ? (
                      <tr><td colSpan="8" className={styles.vacio}>No hay alquileres con ese filtro</td></tr>
                    ) : (
                      datosPaginados(alquileresFiltrados).map(alquiler => (
                        <tr key={alquiler.id}>
                          <td>
                            <div className={styles.nombreUsuario}>{alquiler.Usuario?.nombre}</div>
                            <div className={styles.emailUsuario}>{alquiler.Usuario?.email}</div>
                          </td>
                          <td>
                            <div className={styles.nombreVehiculo}>{alquiler.Vehiculo?.marca}</div>
                            <div className={styles.modeloVehiculo}>{alquiler.Vehiculo?.nombre}</div>
                          </td>
                          <td>
                            <div className={styles.nombreRally}>{alquiler.Rally?.nombre}</div>
                            <div className={styles.campeonato}>{alquiler.Rally?.campeonato}</div>
                          </td>
                          <td className={styles.monto}>{formatearPrecio(alquiler.monto, alquiler.moneda)}</td>
                          <td>
                            <span className={alquiler.metodoPago === 'PayPal' ? styles.badgePaypal : styles.badgeMp}>
                              {alquiler.metodoPago}
                            </span>
                          </td>
                          <td className={styles.fecha}>{formatearFecha(alquiler.createdAt)}</td>
                          <td><BadgeEstado estado={alquiler.estado} /></td>
                          <td>
                            {alquiler.estado === 'pendiente' && (
                              <div className={styles.acciones}>
                                <button className={styles.btnAprobar} onClick={() => aprobarAlquiler(alquiler.id)} title="Aprobar">
                                  <CheckCircle size={20} />
                                </button>
                                <button className={styles.btnRechazar} onClick={() => rechazarAlquiler(alquiler.id)} title="Rechazar">
                                  <XCircle size={20} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPaginas(alquileresFiltrados) > 1 && (
              <div className={styles.paginacion}>
                <button onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1} className={styles.btnPaginacion}>←</button>
                {[...Array(totalPaginas(alquileresFiltrados))].map((_, i) => (
                  <button key={i} onClick={() => setPaginaActual(i + 1)} className={`${styles.btnPaginacion} ${paginaActual === i + 1 ? styles.activo : ''}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas(alquileresFiltrados)} className={styles.btnPaginacion}>→</button>
              </div>
            )}
          </>
        )}

      </Container>
    </div>
  )
}

export default AdminTransacciones