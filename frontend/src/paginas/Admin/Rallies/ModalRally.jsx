import { useState, useEffect, useRef } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { X, Upload } from 'lucide-react'
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
    hora: '20:00', // ✅ Hora por defecto 20:00
    categoriasIds: [],
    contactos: {
      whatsapp: '',
      email: '',
      instagram: '',
      facebook: '',
      web: ''
    }
  })

  const [archivoLogo, setArchivoLogo] = useState(null)
  const [previewLogo, setPreviewLogo] = useState('')
  const [logoExistente, setLogoExistente] = useState('')
  const [logosDisponibles, setLogosDisponibles] = useState([])
  const [diasFaltantes, setDiasFaltantes] = useState(null)
  
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarContactos, setMostrarContactos] = useState(false)
  const inputFileRef = useRef(null)

  // ========================================
  // CARGAR LOGOS EXISTENTES
  // ========================================
  useEffect(() => {
    if (show) {
      cargarLogosExistentes()
    }
  }, [show])

  const cargarLogosExistentes = async () => {
    try {
      const res = await api.get('/rallies', { params: { limite: 200 } })
      const rallies = res.data.rallies || []
      
      // Extraer logos únicos
      const logosUnicos = [...new Set(
        rallies
          .map(r => r.logo)
          .filter(logo => logo && logo.includes('cloudinary'))
      )]
      
      setLogosDisponibles(logosUnicos)
    } catch (error) {
      console.error('Error al cargar logos:', error)
    }
  }

  // ========================================
  // CALCULAR DÍAS FALTANTES
  // ========================================
  useEffect(() => {
    if (formData.fecha && formData.hora) {
      const fechaSeleccionada = new Date(`${formData.fecha}T${formData.hora}:00`)
      const ahora = new Date()
      const diff = fechaSeleccionada - ahora
      const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
      setDiasFaltantes(dias > 0 ? dias : null)
    } else {
      setDiasFaltantes(null)
    }
  }, [formData.fecha, formData.hora])

  // ========================================
  // CARGAR DATOS AL ABRIR MODAL
  // ========================================
  useEffect(() => {
    if (show) {
      if (rally && modo === 'editar') {
        const fechaObj = new Date(rally.fecha)
        const fechaStr = fechaObj.toISOString().split('T')[0]
        const horaStr = fechaObj.toTimeString().slice(0, 5)

        setFormData({
          campeonato: rally.campeonato || '',
          nombre: rally.nombre || '',
          subtitulo: rally.subtitulo || '',
          fecha: fechaStr,
          hora: horaStr,
          categoriasIds: rally.categorias?.map(c => c.id) || [],
          contactos: rally.contactos || {
            whatsapp: '', email: '', instagram: '', facebook: '', web: ''
          }
        })

        setPreviewLogo(rally.logo || '')
        setLogoExistente(rally.logo || '')
        setMostrarContactos(rally.contactos && Object.values(rally.contactos).some(v => v))
      } else {
        setFormData({
          campeonato: '',
          nombre: '',
          subtitulo: '',
          fecha: '',
          hora: '20:00',
          categoriasIds: [],
          contactos: { whatsapp: '', email: '', instagram: '', facebook: '', web: '' }
        })
        setPreviewLogo('')
        setLogoExistente('')
        setMostrarContactos(false)
      }
      setArchivoLogo(null)
      setError('')
    }
  }, [show, rally, modo])

  // ========================================
  // MANEJAR CAMBIOS
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContactoChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      contactos: { ...prev.contactos, [name]: value }
    }))
  }

  const handleCategoriaToggle = (categoriaId) => {
    setFormData(prev => ({
      ...prev,
      categoriasIds: prev.categoriasIds.includes(categoriaId)
        ? prev.categoriasIds.filter(id => id !== categoriaId)
        : [...prev.categoriasIds, categoriaId]
    }))
  }

  // ========================================
  // MANEJAR LOGO
  // ========================================
  const handleLogoChange = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!tiposPermitidos.includes(archivo.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP')
      return
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB')
      return
    }

    setArchivoLogo(archivo)
    setLogoExistente('') // Limpiar selección de logo existente
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => setPreviewLogo(e.target.result)
    reader.readAsDataURL(archivo)
  }

  const handleLogoExistenteChange = (e) => {
    const url = e.target.value
    setLogoExistente(url)
    setPreviewLogo(url)
    setArchivoLogo(null) // Limpiar archivo nuevo
  }

  // ========================================
  // GUARDAR
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.campeonato.trim()) return setError('El campeonato es obligatorio')
    if (!formData.nombre.trim()) return setError('El nombre es obligatorio')
    if (!formData.fecha) return setError('La fecha es obligatoria')
    if (!formData.hora) return setError('La hora es obligatoria')
    if (formData.categoriasIds.length === 0) return setError('Debes seleccionar al menos una categoría')

    // Combinar fecha y hora
    const fechaCompleta = `${formData.fecha}T${formData.hora}:00`

    // ✅ Validar que la fecha sea futura
    const fechaSeleccionada = new Date(fechaCompleta)
    const ahora = new Date()
    if (fechaSeleccionada <= ahora) {
      return setError('La fecha debe ser futura')
    }

    try {
      setGuardando(true)

      // Usar FormData para enviar archivo
      const data = new FormData()
      data.append('campeonato', formData.campeonato.trim())
      data.append('nombre', formData.nombre.trim())
      data.append('subtitulo', formData.subtitulo.trim() || '')
      data.append('fecha', fechaCompleta)

      // Logo
      if (archivoLogo) {
        data.append('logo', archivoLogo)
      } else if (logoExistente) {
        data.append('logoExistente', logoExistente)
      }

      // Categorías
      formData.categoriasIds.forEach(id => data.append('categoriasIds', id))

      // Contactos
      if (mostrarContactos) {
        data.append('contactos', JSON.stringify(formData.contactos))
      }

      if (modo === 'crear') {
        await api.post('/rallies', data)
      } else {
        await api.put(`/rallies/${rally.id}`, data)
      }

      onGuardado()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el rally')
    } finally {
      setGuardando(false)
    }
  }

  const titulo = modo === 'crear' ? 'Crear Rally' : 'Editar Rally'

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className={styles.modal}>
      <Modal.Header className={styles.header}>
        <Modal.Title className={styles.titulo}>{titulo}</Modal.Title>
        <button onClick={onHide} className={styles.btnCerrar}><X size={24} /></button>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {error && <div className={styles.error}>{error}</div>}

        <Form onSubmit={handleSubmit}>

          {/* Campeonato */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Campeonato *</Form.Label>
            <Form.Control
              type="text"
              name="campeonato"
              value={formData.campeonato}
              onChange={handleChange}
              placeholder="eRally Argentino 2026"
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
                min={new Date().toISOString().split('T')[0]}
              />
              {diasFaltantes && (
                <div className={styles.diasFaltantes}>
                  Faltan {diasFaltantes} día{diasFaltantes !== 1 ? 's' : ''}
                </div>
              )}
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
            <Form.Label>Logo del Campeonato</Form.Label>
            
            {previewLogo && (
              <div className={styles.previewWrapper}>
                <img src={previewLogo} alt="Preview" className={styles.previewLogo} />
                {archivoLogo && <span className={styles.previewNueva}>Nuevo logo seleccionado</span>}
              </div>
            )}

            <input
              ref={inputFileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />

            <div className={styles.opcionesLogo}>
              <button
                type="button"
                className={styles.btnSubirLogo}
                onClick={() => inputFileRef.current.click()}
              >
                <Upload size={18} />
                {previewLogo ? 'Cambiar logo' : 'Subir logo'}
              </button>

              {logosDisponibles.length > 0 && (
                <Form.Select
                  value={logoExistente}
                  onChange={handleLogoExistenteChange}
                  className={styles.selectLogo}
                >
                  <option value="">O elegir logo existente...</option>
                  {logosDisponibles.map((logo, i) => (
                    <option key={i} value={logo}>
                      {logo.split('/').slice(-2).join('/').split('.')[0]}
                    </option>
                  ))}
                </Form.Select>
              )}
            </div>
            <div className={styles.logoHint}>JPG, PNG o WEBP — máximo 5MB</div>
          </Form.Group>

          {/* Categorías Permitidas - UI MEJORADA */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Categorías Permitidas *</Form.Label>
            <div className={styles.categoriasGrid}>
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.badgeCategoria} ${
                    formData.categoriasIds.includes(cat.id) ? styles.categoriaSeleccionada : ''
                  }`}
                  style={{
                    backgroundColor: formData.categoriasIds.includes(cat.id) ? cat.color : 'transparent',
                    borderColor: cat.color,
                    color: formData.categoriasIds.includes(cat.id) ? '#1a1a1a' : cat.color
                  }}
                  onClick={() => handleCategoriaToggle(cat.id)}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </Form.Group>

          {/* Contactos */}
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
            <Button variant="secondary" onClick={onHide} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando} className={styles.btnGuardar}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>

        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default ModalRally