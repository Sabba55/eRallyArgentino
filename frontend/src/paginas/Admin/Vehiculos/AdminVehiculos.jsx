import { useState, useEffect, useMemo } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { Trash2, Edit, Eye, Plus, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import api from '../../../config/api'
import ModalVehiculo from './ModalVehiculo'
import styles from './AdminVehiculos.module.css'

function AdminVehiculos() {
  // ========================================
  // ESTADOS
  // ========================================
  const [vehiculos, setVehiculos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Filtros de barra superior
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroMarca, setFiltroMarca] = useState('todas')
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todas')

  // Estado de Ordenamiento por Columnas
  const [ordenarPor, setOrdenarPor] = useState(null) 
  const [direccionOrden, setDireccionOrden] = useState('asc') // 'asc' o 'desc'

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const vehiculosPorPagina = 10

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [vehiculoEditando, setVehiculoEditando] = useState(null)
  const [modoModal, setModoModal] = useState('crear') 

  // ========================================
  // CARGAR DATOS
  // ========================================
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError('')
      const [resVehiculos, resCategorias] = await Promise.all([
        api.get('/vehiculos', { params: { limite: 200 } }),
        api.get('/categorias')
      ])
      setVehiculos(resVehiculos.data.vehiculos || [])
      setCategorias(resCategorias.data.categorias || [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar los vehículos')
    } finally {
      setCargando(false)
    }
  }

  // ========================================
  // LÓGICA DE FILTRADO Y ORDENAMIENTO (PROCESADO)
  // ========================================
  const vehiculosProcesados = useMemo(() => {
    // 1. Filtrado
    let resultado = vehiculos.filter(vehiculo => {
      const cumpleBusqueda = busqueda === '' || 
        vehiculo.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        vehiculo.nombre.toLowerCase().includes(busqueda.toLowerCase())

      const cumpleCategoria = filtroCategoria === 'todas' ||
        vehiculo.categorias?.some(cat => cat.nombre === filtroCategoria)

      const cumpleMarca = filtroMarca === 'todas' ||
        vehiculo.marca === filtroMarca

      const cumpleDisponibilidad = filtroDisponibilidad === 'todas' ||
        (filtroDisponibilidad === 'disponible' && vehiculo.disponible) ||
        (filtroDisponibilidad === 'no_disponible' && !vehiculo.disponible)

      return cumpleBusqueda && cumpleCategoria && cumpleMarca && cumpleDisponibilidad
    })

    // 2. Ordenamiento
    if (ordenarPor) {
      resultado.sort((a, b) => {
        let valA, valB

        if (ordenarPor === 'vehiculo') {
          valA = `${a.marca} ${a.nombre}`.toLowerCase()
          valB = `${b.marca} ${b.nombre}`.toLowerCase()
        } else if (ordenarPor === 'categoria') {
          valA = a.categorias?.[0]?.nombre?.toLowerCase() || ''
          valB = b.categorias?.[0]?.nombre?.toLowerCase() || ''
        } else {
          valA = a[ordenarPor]
          valB = b[ordenarPor]
        }

        if (valA < valB) return direccionOrden === 'asc' ? -1 : 1
        if (valA > valB) return direccionOrden === 'asc' ? 1 : -1
        return 0
      })
    }
    return resultado
  }, [vehiculos, busqueda, filtroCategoria, filtroMarca, filtroDisponibilidad, ordenarPor, direccionOrden])

  // ========================================
  // MANEJADORES DE INTERFAZ
  // ========================================
  const manejarOrden = (columna) => {
    if (ordenarPor === columna) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenarPor(columna)
      setDireccionOrden('asc')
    }
  }

  const RenderIconoOrden = ({ columna }) => {
    if (ordenarPor !== columna) return <Filter size={14} style={{ opacity: 0.4, marginLeft: '8px' }} />
    return direccionOrden === 'asc' 
      ? <ChevronUp size={16} style={{ color: '#39ff14', marginLeft: '8px' }} /> 
      : <ChevronDown size={16} style={{ color: '#39ff14', marginLeft: '8px' }} />
  }

  // Paginación sobre los datos procesados
  const indiceUltimo = paginaActual * vehiculosPorPagina
  const indicePrimero = indiceUltimo - vehiculosPorPagina
  const vehiculosPaginados = vehiculosProcesados.slice(indicePrimero, indiceUltimo)
  const totalPaginas = Math.ceil(vehiculosProcesados.length / vehiculosPorPagina)

  const marcas = ['todas', ...new Set(vehiculos.map(v => v.marca).sort())]

  const formatearPrecio = (precio) => {
    return Math.floor(precio).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const cambiarDisponibilidad = async (vehiculoId, nuevoEstado) => {
    try {
      await api.patch(`/vehiculos/${vehiculoId}/disponibilidad`, { disponible: nuevoEstado })
      setVehiculos(vehiculos.map(v => v.id === vehiculoId ? { ...v, disponible: nuevoEstado } : v))
    } catch (error) {
      console.error('Error:', error); alert('Error al cambiar disponibilidad')
    }
  }

  const eliminarVehiculo = async (vehiculoId, nombreVehiculo) => {
    if (!window.confirm(`¿Eliminar ${nombreVehiculo}?`)) return
    try {
      await api.delete(`/vehiculos/${vehiculoId}`)
      setVehiculos(vehiculos.filter(v => v.id !== vehiculoId))
      alert('Vehículo eliminado exitosamente')
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar vehículo')
    }
  }

  const abrirModalCrear = () => { setVehiculoEditando(null); setModoModal('crear'); setModalAbierto(true) }
  const abrirModalEditar = (vehiculo) => { setVehiculoEditando(vehiculo); setModoModal('editar'); setModalAbierto(true) }
  const abrirModalVer = (vehiculo) => { setVehiculoEditando(vehiculo); setModoModal('ver'); setModalAbierto(true) }

  if (cargando) return (
    <div className={styles.contenedor}>
      <Container><div className={styles.loading}>Cargando vehículos...</div></Container>
    </div>
  )

  return (
    <div className={styles.contenedor}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.titulo}>VEHÍCULOS ({vehiculosProcesados.length})</h1>
          <button className={styles.btnCrear} onClick={abrirModalCrear}>
            <Plus size={20} />
            Crear Vehículo
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.filtros}>
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Búsqueda</label>
            <Form.Control
              type="text"
              placeholder="Marca o modelo..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1) }}
              className={styles.inputBuscar}
            />
          </div>
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Categoría</label>
            <Form.Select
              value={filtroCategoria}
              onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaActual(1) }}
              className={styles.select}
            >
              <option value="todas">Todas</option>
              {categorias.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
            </Form.Select>
          </div>
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Marca</label>
            <Form.Select
              value={filtroMarca}
              onChange={(e) => { setFiltroMarca(e.target.value); setPaginaActual(1) }}
              className={styles.select}
            >
              {marcas.map(m => <option key={m} value={m}>{m === 'todas' ? 'Todas' : m}</option>)}
            </Form.Select>
          </div>
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Estado</label>
            <Form.Select
              value={filtroDisponibilidad}
              onChange={(e) => { setFiltroDisponibilidad(e.target.value); setPaginaActual(1) }}
              className={styles.select}
            >
              <option value="todas">Todas</option>
              <option value="disponible">Disponibles</option>
              <option value="no_disponible">No disponibles</option>
            </Form.Select>
          </div>
        </div>

        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Foto</th>
                <th onClick={() => manejarOrden('vehiculo')} style={{ cursor: 'pointer' }}>
                  Vehículo <RenderIconoOrden columna="vehiculo" />
                </th>
                <th onClick={() => manejarOrden('categoria')} style={{ cursor: 'pointer' }}>
                  Categoría <RenderIconoOrden columna="categoria" />
                </th>
                <th onClick={() => manejarOrden('precioCompra')} style={{ cursor: 'pointer' }}>
                  Compra <RenderIconoOrden columna="precioCompra" />
                </th>
                <th onClick={() => manejarOrden('precioAlquiler')} style={{ cursor: 'pointer' }}>
                  Alquiler <RenderIconoOrden columna="precioAlquiler" />
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosPaginados.length === 0 ? (
                <tr><td colSpan="6" className={styles.vacio}>No se encontraron vehículos</td></tr>
              ) : (
                vehiculosPaginados.map(vehiculo => (
                  <tr key={vehiculo.id}>
                    <td>
                      <img src={vehiculo.foto} alt={vehiculo.nombre} className={styles.foto} />
                    </td>
                    <td>
                      <div className={styles.marca}>{vehiculo.marca}</div>
                      <div className={styles.modelo}>{vehiculo.nombre}</div>
                    </td>
                    <td>
                      {vehiculo.categorias?.map(cat => (
                        <span key={cat.id} className={styles.badgeCategoria} style={{ backgroundColor: cat.color }}>
                          {cat.nombre}
                        </span>
                      ))}
                    </td>
                    <td className={styles.precio}>${formatearPrecio(vehiculo.precioCompra)}</td>
                    <td className={styles.precio}>${formatearPrecio(vehiculo.precioAlquiler)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <div className={styles.botones}>
                          <button className={styles.btnAccion} onClick={() => abrirModalEditar(vehiculo)} title="Editar"><Edit size={18} /></button>
                          <button className={styles.btnAccion} onClick={() => eliminarVehiculo(vehiculo.id, vehiculo.nombre)} title="Eliminar"><Trash2 size={18} /></button>
                          <button className={styles.btnAccion} onClick={() => abrirModalVer(vehiculo)} title="Ver detalles"><Eye size={18} /></button>
                        </div>
                        <Form.Check
                          type="switch"
                          label={vehiculo.disponible ? 'Disponible' : 'No disponible'}
                          checked={vehiculo.disponible}
                          onChange={(e) => cambiarDisponibilidad(vehiculo.id, e.target.checked)}
                          className={styles.switchDisponibilidad}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className={styles.paginacion}>
            <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} className={styles.btnPaginacion}>←</button>
            {[...Array(totalPaginas)].map((_, i) => (
              <button key={i} onClick={() => setPaginaActual(i + 1)} className={`${styles.btnPaginacion} ${paginaActual === i + 1 ? styles.activo : ''}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} className={styles.btnPaginacion}>→</button>
          </div>
        )}
      </Container>

      <ModalVehiculo
        show={modalAbierto}
        onHide={() => setModalAbierto(false)}
        vehiculo={vehiculoEditando}
        modo={modoModal}
        categorias={categorias}
        onGuardado={() => { setModalAbierto(false); cargarDatos(); }}
      />
    </div>
  )
}

export default AdminVehiculos