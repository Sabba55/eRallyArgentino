import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { X } from 'lucide-react'
import api from '../../../config/api'
import styles from './ModalCategoria.module.css'

function ModalCategoria({ show, onHide, categoria, modo, onGuardado }) {
  // ========================================
  // ESTADOS
  // ========================================
  const [formData, setFormData] = useState({
    nombre: '',
    color: '#00d4ff'
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // ========================================
  // CARGAR DATOS AL ABRIR MODAL
  // ========================================
  useEffect(() => {
    if (show) {
      if (categoria && modo === 'editar') {
        setFormData({
          nombre: categoria.nombre || '',
          color: categoria.color || '#00d4ff'
        })
      } else {
        // Resetear para crear
        setFormData({
          nombre: '',
          color: '#00d4ff'
        })
      }
      setError('')
    }
  }, [show, categoria, modo])

  // ========================================
  // MANEJAR CAMBIOS
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // ========================================
  // GUARDAR
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    if (!formData.color) {
      setError('El color es obligatorio')
      return
    }

    try {
      setGuardando(true)

      if (modo === 'crear') {
        await api.post('/categorias', formData)
      } else {
        await api.put(`/categorias/${categoria.id}`, formData)
      }

      onGuardado()
    } catch (error) {
      console.error('Error al guardar:', error)
      setError(error.response?.data?.error || 'Error al guardar la categoría')
    } finally {
      setGuardando(false)
    }
  }

  // ========================================
  // TÍTULO DEL MODAL
  // ========================================
  const titulo = modo === 'crear' ? 'Crear Categoría' : 'Editar Categoría'

  // ========================================
  // RENDER
  // ========================================
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={styles.modal}
    >
      <Modal.Header className={styles.header}>
        <Modal.Title className={styles.titulo}>{titulo}</Modal.Title>
        <button onClick={onHide} className={styles.btnCerrar}>
          <X size={24} />
        </button>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <Form onSubmit={handleSubmit}>
          
          {/* Nombre */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Rally2, R5, Rally3..."
              autoFocus
            />
          </Form.Group>

          {/* Color */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Color *</Form.Label>
            <div className={styles.selectorColor}>
              <Form.Control
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={styles.inputColor}
              />
              <Form.Control
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="#00d4ff"
                className={styles.inputTextoColor}
              />
              <div 
                className={styles.previewColor}
                style={{ backgroundColor: formData.color }}
              />
            </div>
          </Form.Group>

          {/* Botones */}
          <div className={styles.botones}>
            <Button 
              variant="secondary" 
              onClick={onHide}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={guardando}
              className={styles.btnGuardar}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>

        </Form>

      </Modal.Body>
    </Modal>
  )
}

export default ModalCategoria