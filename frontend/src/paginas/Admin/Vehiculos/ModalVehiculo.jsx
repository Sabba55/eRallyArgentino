import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { X } from 'lucide-react'
import api from '../../../config/api'
import styles from './ModalVehiculo.module.css'

function ModalVehiculo({ show, onHide, vehiculo, modo, categorias, onGuardado }) {
  const [formData, setFormData] = useState({
    marca: '',
    nombre: '',
    foto: '',
    precioCompra: '',
    precioAlquiler: '',
    disponible: true,
    categoriasIds: []
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (show) {
      if (vehiculo && (modo === 'editar' || modo === 'ver')) {
        setFormData({
          marca: vehiculo.marca || '',
          nombre: vehiculo.nombre || '',
          foto: vehiculo.foto || '',
          // Forzamos a que los precios sean enteros al cargar
          precioCompra: Math.floor(vehiculo.precioCompra) || '',
          precioAlquiler: Math.floor(vehiculo.precioAlquiler) || '',
          disponible: vehiculo.disponible !== undefined ? vehiculo.disponible : true,
          categoriasIds: vehiculo.categorias?.map(c => c.id) || []
        })
      } else {
        setFormData({
          marca: '',
          nombre: '',
          foto: '',
          precioCompra: '',
          precioAlquiler: '',
          disponible: true,
          categoriasIds: []
        })
      }
      setError('')
    }
  }, [show, vehiculo, modo])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Si es un campo de precio, eliminamos decimales inmediatamente
    let finalValue = type === 'checkbox' ? checked : value
    if (name === 'precioCompra' || name === 'precioAlquiler') {
      finalValue = value ? Math.floor(value) : ''
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.marca.trim()) return setError('La marca es obligatoria')
    if (!formData.nombre.trim()) return setError('El modelo es obligatorio')
    if (!formData.foto.trim()) return setError('La ruta de la foto es obligatoria')
    
    // Validación de precios como enteros
    if (!formData.precioCompra || formData.precioCompra <= 0) {
      return setError('El precio de compra debe ser un número entero mayor a 0')
    }
    if (!formData.precioAlquiler || formData.precioAlquiler <= 0) {
      return setError('El precio de alquiler debe ser un número entero mayor a 0')
    }
    
    if (formData.categoriasIds.length === 0) return setError('Debes seleccionar al menos una categoría')

    try {
      setGuardando(true)
      // Aseguramos el envío de datos limpios
      const dataAEnviar = {
        ...formData,
        precioCompra: Math.floor(formData.precioCompra),
        precioAlquiler: Math.floor(formData.precioAlquiler)
      }

      if (modo === 'crear') {
        await api.post('/vehiculos', dataAEnviar)
      } else {
        await api.put(`/vehiculos/${vehiculo.id}`, dataAEnviar)
      }

      onGuardado()
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar el vehículo')
    } finally {
      setGuardando(false)
    }
  }

  const titulo = { 'crear': 'Crear Vehículo', 'editar': 'Editar Vehículo', 'ver': 'Ver Vehículo' }[modo]
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
          {/* Foto: Cambiado de type="url" a type="text" para permitir rutas locales */}
          <Form.Group className={styles.grupo}>
            <Form.Label>Ruta de Foto *</Form.Label>
            <Form.Control
              type="text" 
              name="foto"
              value={formData.foto}
              onChange={handleChange}
              placeholder="/vehiculos/marca/modelo.jpg"
              disabled={soloLectura}
            />
            {formData.foto && (
              <img src={formData.foto} alt="Preview" className={styles.preview} />
            )}
          </Form.Group>

          <Form.Group className={styles.grupo}>
            <Form.Label>Marca *</Form.Label>
            <Form.Control
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              disabled={soloLectura}
            />
          </Form.Group>

          <Form.Group className={styles.grupo}>
            <Form.Label>Modelo *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={soloLectura}
            />
          </Form.Group>

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

          <div className={styles.precios}>
            <Form.Group className={styles.grupo}>
              <Form.Label>Precio Compra *</Form.Label>
              <Form.Control
                type="number"
                step="1" 
                name="precioCompra"
                value={formData.precioCompra}
                onChange={handleChange}
                disabled={soloLectura}
              />
            </Form.Group>

            <Form.Group className={styles.grupo}>
              <Form.Label>Precio Alquiler *</Form.Label>
              <Form.Control
                type="number"
                step="1"
                name="precioAlquiler"
                value={formData.precioAlquiler}
                onChange={handleChange}
                disabled={soloLectura}
              />
            </Form.Group>
          </div>

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

          {!soloLectura && (
            <div className={styles.botones}>
              <Button variant="secondary" onClick={onHide} disabled={guardando}>Cancelar</Button>
              <Button type="submit" disabled={guardando} className={styles.btnGuardar}>
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default ModalVehiculo