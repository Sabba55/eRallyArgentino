import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { X } from 'lucide-react'
import api from '../../../config/api'
import styles from './ModalRally.module.css'

function ModalRally({ show, onHide, rally, modo, categorias, onGuardado }) {
  // ========================================
  // ESTADOS
  // ========================================
  const [formData, setFormData] = useState({
    campeonato: '',
    nombre: '',
    subtitulo: '',
    fecha: '',
    hora: '',
    logo: '',
    categoriasIds: [],
    contactos: {
      whatsapp: '',
      email: '',
      instagram: '',
      facebook: '',
      web: ''
    }
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarContactos, setMostrarContactos] = useState(false)

  // ========================================
  // CARGAR DATOS AL ABRIR MODAL
  // ========================================
  useEffect(() => {
    if (show) {
      if (rally && modo === 'editar') {
        // Separar fecha y hora
        const fechaObj = new Date(rally.fecha)
        const fechaStr = fechaObj.toISOString().split('T')[0]
        const horaStr = fechaObj.toTimeString().slice(0, 5)

        setFormData({
          campeonato: rally.campeonato || '',
          nombre: rally.nombre || '',
          subtitulo: rally.subtitulo || '',
          fecha: fechaStr,
          hora: horaStr,
          logo: rally.logo || '',
          categoriasIds: rally.categorias?.map(c => c.id) || [],
          contactos: rally.contactos || {
            whatsapp: '',
            email: '',
            instagram: '',
            facebook: '',
            web: ''
          }
        })

        // Mostrar contactos si tiene alguno
        if (rally.contactos && Object.values(rally.contactos).some(v => v)) {
          setMostrarContactos(true)
        }
      } else {
        // Resetear para crear
        setFormData({
          campeonato: '',
          nombre: '',
          subtitulo: '',
          fecha: '',
          hora: '10:00',
          logo: '',
          categoriasIds: [],
          contactos: {
            whatsapp: '',
            email: '',
            instagram: '',
            facebook: '',
            web: ''
          }
        })
        setMostrarContactos(false)
      }
      setError('')
    }
  }, [show, rally, modo])

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

  const handleContactoChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      contactos: {
        ...prev.contactos,
        [name]: value
      }
    }))
  }

  const handleCategoriaChange = (categoriaId) => {
    setFormData(prev => ({
      ...prev,
      categoriasIds: prev.categoriasIds.includes(categoriaId)
        ? prev.categoriasIds.filter(id => id !== categoriaId)
        : [...prev.categoriasIds, categoriaId]
    }))
  }

  // ========================================
  // GUARDAR
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.campeonato.trim()) {
      setError('El campeonato es obligatorio')
      return
    }
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!formData.fecha) {
      setError('La fecha es obligatoria')
      return
    }
    if (!formData.hora) {
      setError('La hora es obligatoria')
      return
    }
    if (formData.categoriasIds.length === 0) {
      setError('Debes seleccionar al menos una categoría')
      return
    }

    // Combinar fecha y hora
    const fechaCompleta = `${formData.fecha}T${formData.hora}:00`

    // Validar que la fecha sea futura (solo para crear)
    if (modo === 'crear') {
      const fechaSeleccionada = new Date(fechaCompleta)
      const ahora = new Date()
      if (fechaSeleccionada <= ahora) {
        setError('La fecha debe ser futura')
        return
      }
    }

    // Preparar datos para enviar
    const dataToSend = {
      campeonato: formData.campeonato.trim(),
      nombre: formData.nombre.trim(),
      subtitulo: formData.subtitulo.trim() || null,
      fecha: fechaCompleta,
      logo: formData.logo.trim() || null,
      categoriasIds: formData.categoriasIds,
      contactos: mostrarContactos ? formData.contactos : null
    }

    try {
      setGuardando(true)

      if (modo === 'crear') {
        await api.post('/rallies', dataToSend)
      } else {
        await api.put(`/rallies/${rally.id}`, dataToSend)
      }

      onGuardado()
    } catch (error) {
      console.error('Error al guardar:', error)
      setError(error.response?.data?.error || 'Error al guardar el rally')
    } finally {
      setGuardando(false)
    }
  }

  // ========================================
  // TÍTULO DEL MODAL
  // ========================================
  const titulo = modo === 'crear' ? 'Crear Rally' : 'Editar Rally'

  // ========================================
  // RENDER
  // ========================================
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
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
          
          {/* Campeonato */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Campeonato *</Form.Label>
            <Form.Control
              type="text"
              name="campeonato"
              value={formData.campeonato}
              onChange={handleChange}
              placeholder="eRally Argentina 2026"
              autoFocus
            />
          </Form.Group>

          {/* Nombre */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Rally de Misiones"
            />
          </Form.Group>

          {/* Subtítulo */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Subtítulo (opcional)</Form.Label>
            <Form.Control
              type="text"
              name="subtitulo"
              value={formData.subtitulo}
              onChange={handleChange}
              placeholder="Fecha 1 - Temporada 2026"
            />
          </Form.Group>

          {/* Fecha y Hora */}
          <div className={styles.fechaHora}>
            <Form.Group className={styles.grupo}>
              <Form.Label>Fecha *</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className={styles.grupo}>
              <Form.Label>Hora *</Form.Label>
              <Form.Control
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
              />
            </Form.Group>
          </div>

          {/* Logo */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Logo (URL - opcional)</Form.Label>
            <Form.Control
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://ejemplo.com/logo.png"
            />
            {formData.logo && (
              <img 
                src={formData.logo} 
                alt="Preview"
                className={styles.previewLogo}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </Form.Group>

          {/* Categorías Permitidas */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Categorías Permitidas *</Form.Label>
            <div className={styles.categorias}>
              {categorias.map(cat => (
                <Form.Check
                  key={cat.id}
                  type="checkbox"
                  id={`cat-${cat.id}`}
                  label={cat.nombre}
                  checked={formData.categoriasIds.includes(cat.id)}
                  onChange={() => handleCategoriaChange(cat.id)}
                  style={{ 
                    borderColor: cat.color,
                    accentColor: cat.color
                  }}
                />
              ))}
            </div>
          </Form.Group>

          {/* Contactos (opcional - colapsable) */}
          <div className={styles.seccionContactos}>
            <button
              type="button"
              className={styles.btnToggleContactos}
              onClick={() => setMostrarContactos(!mostrarContactos)}
            >
              {mostrarContactos ? '▼' : '▶'} Contactos (opcional)
            </button>

            {mostrarContactos && (
              <div className={styles.contactosForm}>
                <Form.Group className={styles.grupoContacto}>
                  <Form.Label>WhatsApp</Form.Label>
                  <Form.Control
                    type="text"
                    name="whatsapp"
                    value={formData.contactos.whatsapp}
                    onChange={handleContactoChange}
                    placeholder="+54911..."
                  />
                </Form.Group>

                <Form.Group className={styles.grupoContacto}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.contactos.email}
                    onChange={handleContactoChange}
                    placeholder="contacto@rally.com"
                  />
                </Form.Group>

                <Form.Group className={styles.grupoContacto}>
                  <Form.Label>Instagram</Form.Label>
                  <Form.Control
                    type="text"
                    name="instagram"
                    value={formData.contactos.instagram}
                    onChange={handleContactoChange}
                    placeholder="@rally"
                  />
                </Form.Group>

                <Form.Group className={styles.grupoContacto}>
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control
                    type="text"
                    name="facebook"
                    value={formData.contactos.facebook}
                    onChange={handleContactoChange}
                    placeholder="rally"
                  />
                </Form.Group>

                <Form.Group className={styles.grupoContacto}>
                  <Form.Label>Web</Form.Label>
                  <Form.Control
                    type="url"
                    name="web"
                    value={formData.contactos.web}
                    onChange={handleContactoChange}
                    placeholder="https://rally.com"
                  />
                </Form.Group>
              </div>
            )}
          </div>

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

export default ModalRally