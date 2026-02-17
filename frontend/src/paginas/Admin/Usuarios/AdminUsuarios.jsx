import { useState, useEffect } from 'react'
import { Container, Form } from 'react-bootstrap'
import { Eye, Trash2 } from 'lucide-react'
import api from '../../../config/api'
import ModalUsuario from './ModalUsuario'
import styles from './AdminUsuarios.module.css'

function AdminUsuarios() {
  // ========================================
  // ESTADOS
  // ========================================
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [filtroVerificado, setFiltroVerificado] = useState('todos')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const usuariosPorPagina = 15

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)

  // ========================================
  // CARGAR DATOS
  // ========================================
  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setCargando(true)
      setError('')
      const res = await api.get('/usuarios')
      setUsuarios(res.data.usuarios || [])
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError('Error al cargar los usuarios')
    } finally {
      setCargando(false)
    }
  }

  // ========================================
  // FILTRAR
  // ========================================
  const usuariosFiltrados = usuarios.filter(u => {
    const cumpleBusqueda = busqueda === '' ||
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.equipo?.toLowerCase().includes(busqueda.toLowerCase())

    const cumpleRol = filtroRol === 'todos' || u.rol === filtroRol

    const cumpleVerificado =
      filtroVerificado === 'todos' ||
      (filtroVerificado === 'si' && u.emailVerificado) ||
      (filtroVerificado === 'no' && !u.emailVerificado)

    return cumpleBusqueda && cumpleRol && cumpleVerificado
  })

  // ========================================
  // PAGINACIÓN
  // ========================================
  const indiceUltimo = paginaActual * usuariosPorPagina
  const indicePrimero = indiceUltimo - usuariosPorPagina
  const usuariosPaginados = usuariosFiltrados.slice(indicePrimero, indiceUltimo)
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina)

  // ========================================
  // ELIMINAR USUARIO
  // ========================================
  const eliminarUsuario = async (usuarioId, nombreUsuario) => {
    if (!window.confirm(`¿Eliminar al usuario "${nombreUsuario}"? Esta acción no se puede deshacer.`)) return

    try {
      await api.delete(`/usuarios/${usuarioId}`)
      setUsuarios(usuarios.filter(u => u.id !== usuarioId))
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar usuario')
    }
  }

  // ========================================
  // ABRIR MODAL
  // ========================================
  const abrirModal = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setModalAbierto(true)
  }

  // ========================================
  // DESPUÉS DE GUARDAR DESDE MODAL
  // ========================================
  const despuesDeGuardar = () => {
    setModalAbierto(false)
    cargarUsuarios()
  }

  // ========================================
  // BADGE ROL
  // ========================================
  const badgeRol = (rol) => {
    const config = {
      admin: { label: 'Admin', clase: styles.badgeAdmin },
      creador_fechas: { label: 'Creador', clase: styles.badgeCreador },
      usuario: { label: 'Usuario', clase: styles.badgeUsuario }
    }
    const c = config[rol] || config.usuario
    return <span className={c.clase}>{c.label}</span>
  }

  // ========================================
  // LOADING
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedor}>
        <Container>
          <div className={styles.loading}>Cargando usuarios...</div>
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
            USUARIOS ({usuariosFiltrados.length})
          </h1>
        </div>

        {/* ERROR */}
        {error && <div className={styles.error}>{error}</div>}

        {/* FILTROS */}
        <div className={styles.filtros}>

          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Búsqueda</label>
            <Form.Control
              type="text"
              placeholder="Nombre, email o equipo..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1) }}
              className={styles.input}
            />
          </div>

          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Rol</label>
            <Form.Select
              value={filtroRol}
              onChange={(e) => { setFiltroRol(e.target.value); setPaginaActual(1) }}
              className={styles.input}
            >
              <option value="todos">Todos</option>
              <option value="usuario">Usuario</option>
              <option value="creador_fechas">Creador</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </div>

          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>Email Verificado</label>
            <Form.Select
              value={filtroVerificado}
              onChange={(e) => { setFiltroVerificado(e.target.value); setPaginaActual(1) }}
              className={styles.input}
            >
              <option value="todos">Todos</option>
              <option value="si">Verificado</option>
              <option value="no">Sin verificar</option>
            </Form.Select>
          </div>

        </div>

        {/* TABLA */}
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Equipo</th>
                <th className={styles.centrado}>Rol</th>
                <th className={styles.centrado}>Verificado</th>
                <th className={styles.centrado}>Registro</th>
                <th className={styles.centrado}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.vacio}>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map(usuario => (
                  <tr key={usuario.id}>

                    {/* Foto + Nombre */}
                    <td>
                      <div className={styles.usuarioCell}>
                        {usuario.fotoPerfil ? (
                          <img
                            src={usuario.fotoPerfil}
                            alt={usuario.nombre}
                            className={styles.foto}
                          />
                        ) : (
                          <div className={styles.fotoPlaceholder}>
                            {usuario.nombre?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className={styles.nombre}>{usuario.nombre}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <span className={styles.email}>{usuario.email}</span>
                    </td>

                    {/* Equipo */}
                    <td>
                      <span className={styles.equipo}>{usuario.equipo || '—'}</span>
                    </td>

                    {/* Rol */}
                    <td className={styles.centrado}>
                      {badgeRol(usuario.rol)}
                    </td>

                    {/* Verificado */}
                    <td className={styles.centrado}>
                      {usuario.emailVerificado
                        ? <span className={styles.verificadoSi}>Sí</span>
                        : <span className={styles.verificadoNo}>No</span>
                      }
                    </td>

                    {/* Fecha Registro */}
                    <td className={styles.centrado}>
                      <span className={styles.fecha}>
                        {new Date(usuario.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit', month: '2-digit', year: '2-digit'
                        })}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className={styles.centrado}>
                      <div className={styles.acciones}>
                        <button
                          className={styles.btnVer}
                          onClick={() => abrirModal(usuario)}
                          title="Ver detalles"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => eliminarUsuario(usuario.id, usuario.nombre)}
                          title="Eliminar usuario"
                        >
                          <Trash2 size={17} />
                        </button>
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
              onClick={() => setPaginaActual(p => p - 1)}
              disabled={paginaActual === 1}
              className={styles.btnPaginacion}
            >
              Anterior
            </button>
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPaginaActual(i + 1)}
                className={`${styles.btnPaginacion} ${paginaActual === i + 1 ? styles.activo : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPaginaActual(p => p + 1)}
              disabled={paginaActual === totalPaginas}
              className={styles.btnPaginacion}
            >
              Siguiente
            </button>
          </div>
        )}

      </Container>

      {/* MODAL */}
      {modalAbierto && usuarioSeleccionado && (
        <ModalUsuario
          show={modalAbierto}
          onHide={() => setModalAbierto(false)}
          usuario={usuarioSeleccionado}
          onGuardado={despuesDeGuardar}
        />
      )}

    </div>
  )
}

export default AdminUsuarios