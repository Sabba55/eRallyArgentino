import { useState, useEffect } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { Trash2, Edit, Calendar } from 'lucide-react'
import api from '../../../config/api'
import ModalRally from './ModalRally'
import styles from './AdminRallies.module.css'

function AdminRallies() {
  const [rallies, setRallies] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [usuarioActual, setUsuarioActual] = useState(null)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroCampeonato, setFiltroCampeonato] = useState('todos')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const ralliesPorPagina = 10

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [rallyEditando, setRallyEditando] = useState(null)
  const [modoModal, setModoModal] = useState('crear')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError('')

      const [resRallies, resCategorias, resUsuario] = await Promise.all([
        api.get('/rallies', { params: { limite: 200 } }),
        api.get('/categorias'),
        api.get('/auth/me')
      ])

      setRallies(resRallies.data.rallies || [])
      setCategorias(resCategorias.data.categorias || [])
      setUsuarioActual(resUsuario.data.usuario)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar los rallies')
    } finally {
      setCargando(false)
    }
  }

  const ralliesFiltrados = rallies.filter(rally => {
    const cumpleBusqueda = busqueda === '' || 
      rally.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      rally.campeonato.toLowerCase().includes(busqueda.toLowerCase())

    const cumpleCampeonato = filtroCampeonato === 'todos' ||
      rally.campeonato === filtroCampeonato

    return cumpleBusqueda && cumpleCampeonato
  })

  const indiceUltimo = paginaActual * ralliesPorPagina
  const indicePrimero = indiceUltimo - ralliesPorPagina
  const ralliesPaginados = ralliesFiltrados.slice(indicePrimero, indiceUltimo)
  const totalPaginas = Math.ceil(ralliesFiltrados.length / ralliesPorPagina)

  const campeonatos = ['todos', ...new Set(rallies.map(r => r.campeonato).sort())]

  // ✅ Formatear fecha (DD/MM/AAAA)
  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })
  }

  // ✅ Formatear hora (HH:MM)
  const formatearHora = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }

  const puedeEditar = (rally) => {
    if (!usuarioActual) return false
    if (usuarioActual.rol === 'admin') return true
    if (usuarioActual.rol === 'creador_fechas' && rally.creadoPorId === usuarioActual.id) return true
    return false
  }

  const puedeEliminar = (rally) => {
    return puedeEditar(rally)
  }

  // ✅ ELIMINAR CON CONFIRMACIÓN MEJORADA
  const eliminarRally = async (rallyId, nombreRally) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar "${nombreRally}"?\n\n` +
      `Esta acción:\n` +
      `• Notificará a todos los usuarios con alquileres\n` +
      `• Marcará los alquileres como "rally cancelado"\n` +
      `• NO se puede deshacer\n\n` +
      `¿Continuar?`
    )
    
    if (!confirmar) return

    try {
      await api.delete(`/rallies/${rallyId}`)
      setRallies(rallies.filter(r => r.id !== rallyId))
      alert('Rally eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert(error.response?.data?.error || 'Error al eliminar rally')
    }
  }

  const abrirModalCrear = () => {
    setRallyEditando(null)
    setModoModal('crear')
    setModalAbierto(true)
  }

  const abrirModalEditar = (rally) => {
    setRallyEditando(rally)
    setModoModal('editar')
    setModalAbierto(true)
  }

  const despuesDeGuardar = () => {
    setModalAbierto(false)
    cargarDatos()
  }

  if (cargando) {
    return (
      <div className={styles.contenedor}>
        <Container>
          <div className={styles.loading}>Cargando rallies...</div>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.contenedor}>
      <Container>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>
            Fechas ({ralliesFiltrados.length})
          </h1>
          <button className={styles.btnCrear} onClick={abrirModalCrear}>
            <Calendar size={20} />
            Crear Rally
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* FILTROS */}
        <div className={styles.filtros}>
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Búsqueda</label>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre o campeonato..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPaginaActual(1)
              }}
              className={styles.inputBuscar}
            />
          </div>

          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Campeonato</label>
            <Form.Select
              value={filtroCampeonato}
              onChange={(e) => {
                setFiltroCampeonato(e.target.value)
                setPaginaActual(1)
              }}
              className={styles.select}
            >
              {campeonatos.map(camp => (
                <option key={camp} value={camp}>
                  {camp === 'todos' ? 'Todos' : camp}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>

        {/* TABLA ACTUALIZADA */}
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Campeonato</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Categorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ralliesPaginados.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.vacio}>
                    No se encontraron rallies
                  </td>
                </tr>
              ) : (
                ralliesPaginados.map(rally => (
                  <tr key={rally.id}>
                    
                    {/* Logo */}
                    <td>
                      {rally.logo ? (
                        <img 
                          src={rally.logo} 
                          alt={rally.campeonato}
                          className={styles.logo}
                          onError={(e) => e.target.src = '/placeholder-logo.png'}
                        />
                      ) : (
                        <div className={styles.sinLogo}>
                          {rally.campeonato.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>

                    {/* Campeonato */}
                    <td>
                      <div className={styles.campeonato}>{rally.campeonato}</div>
                    </td>

                    {/* Nombre */}
                    <td>
                      <div className={styles.nombre}>{rally.nombre}</div>
                      {rally.subtitulo && (
                        <div className={styles.subtitulo}>{rally.subtitulo}</div>
                      )}
                      {rally.fueReprogramado && (
                        <span className={styles.badgeReprogramado}>Reprogramado</span>
                      )}
                      {rally.yaPaso && (
                        <span className={styles.badgePasado}>Finalizado</span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td>
                      <div className={styles.fecha}>{formatearFecha(rally.fecha)}</div>
                    </td>

                    {/* Hora */}
                    <td>
                      <div className={styles.hora}>{formatearHora(rally.fecha)}</div>
                    </td>

                    {/* Categorías */}
                    <td>
                      <div className={styles.categorias}>
                        {rally.categorias?.length > 0 ? (
                          rally.categorias.map(cat => (
                            <span 
                              key={cat.id}
                              className={styles.badgeCategoria}
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.nombre}
                            </span>
                          ))
                        ) : (
                          <span className={styles.sinCategorias}>Sin categorías</span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td>
                      <div className={styles.acciones}>
                        {puedeEditar(rally) && (
                          <button
                            className={styles.btnAccion}
                            onClick={() => abrirModalEditar(rally)}
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                        )}

                        {puedeEliminar(rally) && (
                          <button
                            className={styles.btnAccion}
                            onClick={() => eliminarRally(rally.id, rally.nombre)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}

                        {!puedeEditar(rally) && (
                          <span className={styles.sinPermisos}>Sin permisos</span>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className={styles.paginacion}>
            <button
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={styles.btnPaginacion}
            >
              Anterior
            </button>

            {[...Array(totalPaginas)].map((_, index) => (
              <button
                key={index}
                onClick={() => setPaginaActual(index + 1)}
                className={`${styles.btnPaginacion} ${paginaActual === index + 1 ? styles.activo : ''}`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className={styles.btnPaginacion}
            >
              Siguiente
            </button>
          </div>
        )}

      </Container>

      {/* MODAL */}
      <ModalRally
        show={modalAbierto}
        onHide={() => setModalAbierto(false)}
        rally={rallyEditando}
        modo={modoModal}
        categorias={categorias}
        onGuardado={despuesDeGuardar}
      />

    </div>
  )
}

export default AdminRallies