import { useState, useEffect } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { Trash2, Edit, Calendar } from 'lucide-react'
import api from '../../../config/api'
import ModalRally from './ModalRally'
import styles from './AdminRallies.module.css'

function AdminRallies() {
  // ========================================
  // ESTADOS
  // ========================================
  const [rallies, setRallies] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Usuario actual
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
  const [modoModal, setModoModal] = useState('crear') // 'crear' o 'editar'

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

      // Cargar rallies, categorías y usuario actual en paralelo
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

  // ========================================
  // FILTRAR RALLIES
  // ========================================
  const ralliesFiltrados = rallies.filter(rally => {
    // Búsqueda por nombre
    const cumpleBusqueda = busqueda === '' || 
      rally.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      rally.campeonato.toLowerCase().includes(busqueda.toLowerCase())

    // Filtro de campeonato
    const cumpleCampeonato = filtroCampeonato === 'todos' ||
      rally.campeonato === filtroCampeonato

    return cumpleBusqueda && cumpleCampeonato
  })

  // ========================================
  // PAGINACIÓN
  // ========================================
  const indiceUltimo = paginaActual * ralliesPorPagina
  const indicePrimero = indiceUltimo - ralliesPorPagina
  const ralliesPaginados = ralliesFiltrados.slice(indicePrimero, indiceUltimo)
  const totalPaginas = Math.ceil(ralliesFiltrados.length / ralliesPorPagina)

  // ========================================
  // EXTRAER CAMPEONATOS ÚNICOS
  // ========================================
  const campeonatos = ['todos', ...new Set(rallies.map(r => r.campeonato).sort())]

  // ========================================
  // FORMATEAR FECHA
  // ========================================
  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ========================================
  // VERIFICAR PERMISOS
  // ========================================
  const puedeEditar = (rally) => {
    if (!usuarioActual) return false
    if (usuarioActual.rol === 'admin') return true
    if (usuarioActual.rol === 'creador_fechas' && rally.creadoPorId === usuarioActual.id) return true
    return false
  }

  const puedeEliminar = (rally) => {
    return puedeEditar(rally)
  }

  // ========================================
  // ELIMINAR RALLY
  // ========================================
  const eliminarRally = async (rallyId, nombreRally) => {
    if (!window.confirm(`¿Eliminar "${nombreRally}"? Esta acción notificará a todos los usuarios con alquileres.`)) return

    try {
      await api.delete(`/rallies/${rallyId}`)
      
      // Actualizar lista
      setRallies(rallies.filter(r => r.id !== rallyId))
      
      alert('Rally eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert(error.response?.data?.error || 'Error al eliminar rally')
    }
  }

  // ========================================
  // ABRIR MODALES
  // ========================================
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

  // ========================================
  // DESPUÉS DE GUARDAR
  // ========================================
  const despuesDeGuardar = () => {
    setModalAbierto(false)
    cargarDatos()
  }

  // ========================================
  // LOADING
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedor}>
        <Container>
          <div className={styles.loading}>Cargando rallies...</div>
        </Container>
      </div>
    )
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.contenedor}>
      <Container>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>
            RALLIES ({ralliesFiltrados.length})
          </h1>
          <button 
            className={styles.btnCrear}
            onClick={abrirModalCrear}
          >
            <Calendar size={20} />
            Crear Rally
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {/* FILTROS */}
        <div className={styles.filtros}>
          
          {/* Buscador */}
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>
              Búsqueda
            </label>
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

          {/* Campeonato */}
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>
              Campeonato
            </label>
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

        {/* TABLA */}
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Campeonato</th>
                <th>Categorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ralliesPaginados.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.vacio}>
                    No se encontraron rallies
                  </td>
                </tr>
              ) : (
                ralliesPaginados.map(rally => (
                  <tr key={rally.id}>
                    
                    {/* Nombre */}
                    <td>
                      <div className={styles.nombre}>{rally.nombre}</div>
                      {rally.subtitulo && (
                        <div className={styles.subtitulo}>{rally.subtitulo}</div>
                      )}
                      {rally.fueReprogramado && (
                        <span className={styles.badgeReprogramado}>Reprogramado</span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td>
                      <div className={styles.fecha}>{formatearFecha(rally.fecha)}</div>
                      {rally.yaPaso && (
                        <span className={styles.badgePasado}>Finalizado</span>
                      )}
                    </td>

                    {/* Campeonato */}
                    <td>
                      <div className={styles.campeonato}>{rally.campeonato}</div>
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