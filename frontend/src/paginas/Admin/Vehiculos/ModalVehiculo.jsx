import { useState, useEffect, useRef } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { X, Upload } from 'lucide-react'
import api from '../../../config/api'
import styles from './ModalVehiculo.module.css'

function ModalVehiculo({ show, onHide, vehiculo, modo, categorias, onGuardado }) {
  const [formData, setFormData] = useState({
    marca: '',
    nombre: '',
    precioCompra: '',
    precioAlquiler: '',
    disponible: true,
    categoriasIds: []
  })

  const [archivoFoto, setArchivoFoto] = useState(null)       // Archivo nuevo a subir
  const [previewFoto, setPreviewFoto] = useState('')          // URL para preview
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const inputFileRef = useRef(null)

  // ========================================
  // CARGAR DATOS AL ABRIR
  // ========================================
  useEffect(() => {
    if (show) {
      if (vehiculo && (modo === 'editar' || modo === 'ver')) {
        setFormData({
          marca: vehiculo.marca || '',
          nombre: vehiculo.nombre || '',
          precioCompra: Math.floor(vehiculo.precioCompra) || '',
          precioAlquiler: Math.floor(vehiculo.precioAlquiler) || '',
          disponible: vehiculo.disponible !== undefined ? vehiculo.disponible : true,
          categoriasIds: vehiculo.categorias?.map(c => c.id) || []
        })
        setPreviewFoto(vehiculo.foto || '')
      } else {
        setFormData({
          marca: '',
          nombre: '',
          precioCompra: '',
          precioAlquiler: '',
          disponible: true,
          categoriasIds: []
        })
        setPreviewFoto('')
      }
      setArchivoFoto(null)
      setError('')
    }
  }, [show, vehiculo, modo])

  // ========================================
  // MANEJAR CAMBIOS DE CAMPOS
  // ========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let finalValue = type === 'checkbox' ? checked : value
    if (name === 'precioCompra' || name === 'precioAlquiler') {
      finalValue = value ? Math.floor(value) : ''
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }))
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
  // MANEJAR SELECCIÓN DE FOTO
  // ========================================
  const handleFotoChange = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!tiposPermitidos.includes(archivo.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP')
      return
    }

    // Validar tamaño (5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB')
      return
    }

    setArchivoFoto(archivo)
    setError('')

    // Generar preview local
    const reader = new FileReader()
    reader.onload = (e) => setPreviewFoto(e.target.result)
    reader.readAsDataURL(archivo)
  }

  // ========================================
  // GUARDAR
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.marca.trim()) return setError('La marca es obligatoria')
    if (!formData.nombre.trim()) return setError('El modelo es obligatorio')
    if (modo === 'crear' && !archivoFoto) return setError('La foto es obligatoria')
    if (!formData.precioCompra || formData.precioCompra <= 0) return setError('El precio de compra debe ser mayor a 0')
    if (!formData.precioAlquiler || formData.precioAlquiler <= 0) return setError('El precio de alquiler debe ser mayor a 0')
    if (formData.categoriasIds.length === 0) return setError('Debes seleccionar al menos una categoría')

    try {
      setGuardando(true)

      // Usar FormData para enviar archivo + datos juntos
      const data = new FormData()
      data.append('marca', formData.marca.trim())
      data.append('nombre', formData.nombre.trim())
      data.append('precioCompra', Math.floor(formData.precioCompra))
      data.append('precioAlquiler', Math.floor(formData.precioAlquiler))
      data.append('disponible', formData.disponible)

      // Categorías como JSON string (multer no maneja arrays nativamente)
      formData.categoriasIds.forEach(id => data.append('categoriasIds', id))

      // Solo agregar foto si se seleccionó una nueva
      if (archivoFoto) {
        data.append('foto', archivoFoto)
      }

      if (modo === 'crear') {
        await api.post('/vehiculos', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.put(`/vehiculos/${vehiculo.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      onGuardado()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el vehículo')
    } finally {
      setGuardando(false)
    }
  }

  const titulo = { crear: 'Crear Vehículo', editar: 'Editar Vehículo', ver: 'Ver Vehículo' }[modo]
  const soloLectura = modo === 'ver'

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className={styles.modal}>
      <Modal.Header className={styles.header}>
        <Modal.Title className={styles.titulo}>{titulo}</Modal.Title>
        <button onClick={onHide} className={styles.btnCerrar}><X size={24} /></button>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {error && <div className={styles.error}>{error}</div>}

        <Form onSubmit={handleSubmit}>

          {/* FOTO */}
          <Form.Group className={styles.grupo}>
            <Form.Label>
              Foto del Vehículo {modo === 'crear' ? '*' : '(opcional — dejá vacío para mantener la actual)'}
            </Form.Label>

            {/* Preview */}
            {previewFoto && (
              <div className={styles.previewWrapper}>
                <img src={previewFoto} alt="Preview" className={styles.preview} />
                {archivoFoto && (
                  <span className={styles.previewNueva}>Nueva foto seleccionada</span>
                )}
              </div>
            )}

            {/* Botón de carga */}
            {!soloLectura && (
              <>
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFotoChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className={styles.btnSubirFoto}
                  onClick={() => inputFileRef.current.click()}
                >
                  <Upload size={18} />
                  {previewFoto ? 'Cambiar foto' : 'Seleccionar foto'}
                </button>
                <div className={styles.fotoHint}>JPG, PNG o WEBP — máximo 5MB</div>
              </>
            )}
          </Form.Group>

          {/* MARCA */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Marca *</Form.Label>
            <Form.Control
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              disabled={soloLectura}
              placeholder="Ford, Volkswagen, Citroën..."
            />
          </Form.Group>

          {/* MODELO */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Modelo *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={soloLectura}
              placeholder="Fiesta R5, Polo GTI..."
            />
          </Form.Group>

          {/* CATEGORÍAS */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Categorías *</Form.Label>
            <div className={styles.categorias}>
              {categorias.map(cat => (
                <Form.Check
                  key={cat.id}
                  type="checkbox"
                  id={`cat-${cat.id}`}
                  label={cat.nombre}
                  checked={formData.categoriasIds.includes(cat.id)}
                  onChange={() => handleCategoriaChange(cat.id)}
                  disabled={soloLectura}
                  style={{ accentColor: cat.color }}
                />
              ))}
            </div>
          </Form.Group>

          {/* PRECIOS */}
          <div className={styles.precios}>
            <Form.Group className={styles.grupo}>
              <Form.Label>Precio Compra (ARS) *</Form.Label>
              <Form.Control
                type="number"
                step="1"
                min="1"
                name="precioCompra"
                value={formData.precioCompra}
                onChange={handleChange}
                disabled={soloLectura}
                placeholder="120000"
              />
            </Form.Group>

            <Form.Group className={styles.grupo}>
              <Form.Label>Precio Alquiler (ARS) *</Form.Label>
              <Form.Control
                type="number"
                step="1"
                min="1"
                name="precioAlquiler"
                value={formData.precioAlquiler}
                onChange={handleChange}
                disabled={soloLectura}
                placeholder="85000"
              />
            </Form.Group>
          </div>

          {/* DISPONIBLE */}
          <Form.Group className={styles.grupo}>
            <Form.Check
              type="checkbox"
              name="disponible"
              label="Disponible para el sistema"
              checked={formData.disponible}
              onChange={handleChange}
              disabled={soloLectura}
            />
          </Form.Group>

          {/* BOTONES */}
          {!soloLectura && (
            <div className={styles.botones}>
              <Button variant="secondary" onClick={onHide} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando} className={styles.btnGuardar}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}

        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default ModalVehiculo