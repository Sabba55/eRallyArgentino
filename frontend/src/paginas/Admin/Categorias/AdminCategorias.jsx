import { useState, useEffect } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { Trash2, Edit, Plus } from 'lucide-react'
import api from '../../../config/api'
import ModalCategoria from './ModalCategoria'
import styles from './AdminCategorias.module.css'

function AdminCategorias() {
  // ========================================
  // ESTADOS
  // ========================================
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Filtro
  const [busqueda, setBusqueda] = useState('')

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [modoModal, setModoModal] = useState('crear') // 'crear' o 'editar'

  // ========================================
  // CARGAR CATEGORÍAS
  // ========================================
  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    try {
      setCargando(true)
      setError('')

      const response = await api.get('/categorias')
      setCategorias(response.data.categorias || [])

    } catch (error) {
      console.error('Error al cargar categorías:', error)
      setError('Error al cargar las categorías')
    } finally {
      setCargando(false)
    }
  }

  // ========================================
  // FILTRAR CATEGORÍAS
  // ========================================
  const categoriasFiltradas = categorias.filter(categoria => {
    return busqueda === '' || 
      categoria.nombre.toLowerCase().includes(busqueda.toLowerCase())
  })

  // ========================================
  // ELIMINAR CATEGORÍA
  // ========================================
  const eliminarCategoria = async (categoriaId, nombreCategoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombreCategoria}"?`)) return

    try {
      await api.delete(`/categorias/${categoriaId}`)
      
      // Actualizar lista
      setCategorias(categorias.filter(c => c.id !== categoriaId))
      
      alert('Categoría eliminada exitosamente')
    } catch (error) {
      console.error('Error al eliminar:', error)
      
      // Si hay vehículos asociados
      if (error.response?.status === 400) {
        alert('No se puede eliminar esta categoría porque tiene vehículos asociados')
      } else {
        alert(error.response?.data?.error || 'Error al eliminar categoría')
      }
    }
  }

  // ========================================
  // ABRIR MODALES
  // ========================================
  const abrirModalCrear = () => {
    setCategoriaEditando(null)
    setModoModal('crear')
    setModalAbierto(true)
  }

  const abrirModalEditar = (categoria) => {
    setCategoriaEditando(categoria)
    setModoModal('editar')
    setModalAbierto(true)
  }

  // ========================================
  // DESPUÉS DE GUARDAR
  // ========================================
  const despuesDeGuardar = () => {
    setModalAbierto(false)
    cargarCategorias()
  }

  // ========================================
  // LOADING
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedor}>
        <Container>
          <div className={styles.loading}>Cargando categorías...</div>
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
            CATEGORÍAS ({categoriasFiltradas.length})
          </h1>
          <button 
            className={styles.btnCrear}
            onClick={abrirModalCrear}
          >
            <Plus size={20} />
            Crear Categoría
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {/* FILTRO */}
        <div className={styles.filtros}>
          <div className={styles.grupoFiltro}>
            <label className={styles.labelFiltro}>
              Nombre
            </label>
            <div className={styles.inputConEmoji}>
              <Form.Control
                type="text"
                placeholder="Buscar categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.inputBuscar}
              />
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Color</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="3" className={styles.vacio}>
                    No se encontraron categorías
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map(categoria => (
                  <tr key={categoria.id}>
                    
                    {/* Color */}
                    <td>
                      <div className={styles.contenedorColor}>
                        <div 
                          className={styles.cuadroColor}
                          style={{ backgroundColor: categoria.color }}
                        ></div>
                        <span className={styles.codigoColor}>
                          {categoria.color}
                        </span>
                      </div>
                    </td>

                    {/* Nombre */}
                    <td>
                      <div className={styles.nombre}>{categoria.nombre}</div>
                    </td>

                    {/* Acciones */}
                    <td>
                      <div className={styles.acciones}>
                        <button
                          className={styles.btnAccion}
                          onClick={() => abrirModalEditar(categoria)}
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          className={styles.btnAccion}
                          onClick={() => eliminarCategoria(categoria.id, categoria.nombre)}
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </Container>

      {/* MODAL */}
      <ModalCategoria
        show={modalAbierto}
        onHide={() => setModalAbierto(false)}
        categoria={categoriaEditando}
        modo={modoModal}
        onGuardado={despuesDeGuardar}
      />

    </div>
  )
}

export default AdminCategorias