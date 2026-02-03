import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Form, Alert } from 'react-bootstrap'
import { Eye, EyeOff, Save, X, Upload, User } from 'lucide-react'
import styles from './EditarPerfil.module.css'

function EditarPerfil() {
  const navigate = useNavigate()

  // DATOS MOCK DEL USUARIO (después vendrá del contexto/API)
  const usuarioOriginal = {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    equipo: "Racing Team Argentina",
    fotoPerfil: null
  }

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: usuarioOriginal.nombre,
    apellido: usuarioOriginal.apellido,
    email: usuarioOriginal.email,
    equipo: usuarioOriginal.equipo || '',
    contraseñaActual: '',
    nuevaContraseña: '',
    confirmarContraseña: ''
  })

  const [fotoPerfil, setFotoPerfil] = useState(usuarioOriginal.fotoPerfil)
  const [archivoFoto, setArchivoFoto] = useState(null)
  const [previewFoto, setPreviewFoto] = useState(null)

  // Estados para mostrar/ocultar contraseñas
  const [mostrarContraseñaActual, setMostrarContraseñaActual] = useState(false)
  const [mostrarNuevaContraseña, setMostrarNuevaContraseña] = useState(false)
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false)

  // Estados de validación y mensajes
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  // Calcular fuerza de contraseña
  const calcularFuerzaContraseña = (contraseña) => {
    if (!contraseña) return { nivel: 0, texto: '', color: '' }
    
    let fuerza = 0
    
    // Criterios de fuerza
    if (contraseña.length >= 8) fuerza++
    if (contraseña.length >= 12) fuerza++
    if (/[a-z]/.test(contraseña)) fuerza++
    if (/[A-Z]/.test(contraseña)) fuerza++
    if (/[0-9]/.test(contraseña)) fuerza++
    if (/[^a-zA-Z0-9]/.test(contraseña)) fuerza++
    
    // Determinar nivel
    if (fuerza <= 2) {
      return { nivel: 1, texto: 'Débil', color: '#ff4444' }
    } else if (fuerza <= 4) {
      return { nivel: 2, texto: 'Media', color: '#ffeb3b' }
    } else {
      return { nivel: 3, texto: 'Fuerte', color: '#39ff14' }
    }
  }

  const fuerzaContraseña = calcularFuerzaContraseña(formData.nuevaContraseña)

  // Obtener iniciales
  const obtenerIniciales = () => {
    const inicialNombre = formData.nombre ? formData.nombre[0].toUpperCase() : ''
    const inicialApellido = formData.apellido ? formData.apellido[0].toUpperCase() : ''
    return `${inicialNombre}${inicialApellido}`
  }

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar mensajes al escribir
    if (error) setError('')
    if (exito) setExito('')
  }

  // Manejar cambio de foto
  const handleFotoChange = (e) => {
    const archivo = e.target.files[0]
    
    if (archivo) {
      // Validar tipo de archivo
      if (!archivo.type.startsWith('image/')) {
        setError('Por favor seleccioná una imagen válida')
        return
      }

      // Validar tamaño (max 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar los 5MB')
        return
      }

      setArchivoFoto(archivo)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewFoto(reader.result)
      }
      reader.readAsDataURL(archivo)
      
      setError('')
    }
  }

  // Eliminar foto
  const eliminarFoto = () => {
    setArchivoFoto(null)
    setPreviewFoto(null)
    setFotoPerfil(null)
    // Limpiar el input file
    const fileInput = document.getElementById('inputFoto')
    if (fileInput) fileInput.value = ''
  }

  // Validar formulario
  const validarFormulario = () => {
    // Validar campos obligatorios
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('El nombre y apellido son obligatorios')
      return false
    }

    // Si quiere cambiar contraseña, validar
    if (formData.nuevaContraseña || formData.confirmarContraseña || formData.contraseñaActual) {
      if (!formData.contraseñaActual) {
        setError('Ingresá tu contraseña actual para cambiarla')
        return false
      }

      if (!formData.nuevaContraseña) {
        setError('Ingresá la nueva contraseña')
        return false
      }

      if (formData.nuevaContraseña.length < 8) {
        setError('La nueva contraseña debe tener al menos 8 caracteres')
        return false
      }

      if (formData.nuevaContraseña !== formData.confirmarContraseña) {
        setError('Las contraseñas no coinciden')
        return false
      }
    }

    return true
  }

  // Manejar submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    if (!validarFormulario()) {
      return
    }

    setCargando(true)

    try {
      // Simulación de guardado (después será llamada a API)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Acá irían las llamadas reales:
      // 1. Si hay foto nueva, subirla a Cloudinary
      // 2. Actualizar datos del usuario en la BD
      // 3. Si hay nueva contraseña, actualizarla

      console.log('Datos a guardar:', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        equipo: formData.equipo,
        fotoNueva: archivoFoto ? 'Sí' : 'No',
        cambioContraseña: formData.nuevaContraseña ? 'Sí' : 'No'
      })

      setExito('Perfil actualizado correctamente')
      
      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        contraseñaActual: '',
        nuevaContraseña: '',
        confirmarContraseña: ''
      }))

      // Redirigir al perfil después de 2 segundos
      setTimeout(() => {
        navigate('/perfil')
      }, 2000)

    } catch (err) {
      console.error('Error al guardar:', err)
      setError('Hubo un error al guardar los cambios. Intentá nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  // Cancelar y volver
  const handleCancelar = () => {
    navigate('/perfil')
  }

  return (
    <div className={styles.contenedorEditarPerfil}>
      <Container>

        {/* Título */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>Editar Perfil</h1>
          <p className={styles.subtitulo}>Actualizá tu información personal</p>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <Alert variant="danger" className={styles.alerta}>
            {error}
          </Alert>
        )}

        {exito && (
          <Alert variant="success" className={styles.alertaExito}>
            {exito}
          </Alert>
        )}

        {/* Formulario */}
        <Form onSubmit={handleSubmit}>

          {/* SECCIÓN: Foto de Perfil */}
          <div className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>Foto de Perfil</h2>
            
            <div className={styles.contenedorFoto}>
              
              {/* Preview del avatar */}
              <div className={styles.avatarPreview}>
                {previewFoto || fotoPerfil ? (
                  <img 
                    src={previewFoto || fotoPerfil} 
                    alt="Foto de perfil"
                    className={styles.fotoPerfil}
                  />
                ) : (
                  <div className={styles.avatarIniciales}>
                    {obtenerIniciales()}
                  </div>
                )}
              </div>

              {/* Controles de foto */}
              <div className={styles.controlesFoto}>
                <input
                  type="file"
                  id="inputFoto"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className={styles.inputFile}
                />
                <label htmlFor="inputFoto" className={styles.btnSubirFoto}>
                  <Upload size={20} />
                  {previewFoto || fotoPerfil ? 'Cambiar Foto' : 'Subir Foto'}
                </label>

                {(previewFoto || fotoPerfil) && (
                  <button
                    type="button"
                    onClick={eliminarFoto}
                    className={styles.btnEliminarFoto}
                  >
                    <X size={20} />
                    Eliminar Foto
                  </button>
                )}

                <p className={styles.textoAyuda}>
                  JPG, PNG o GIF. Máximo 5MB.
                </p>
              </div>

            </div>
          </div>

          {/* SECCIÓN: Información Básica */}
          <div className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>Información Básica</h2>

            <div className={styles.gridInputs}>
              
              {/* Nombre */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Nombre <span className={styles.obligatorio}>*</span>
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <User className={styles.iconoInput} size={20} />
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Tu nombre"
                    disabled={cargando}
                  />
                </div>
              </Form.Group>

              {/* Apellido */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Apellido <span className={styles.obligatorio}>*</span>
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <User className={styles.iconoInput} size={20} />
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Tu apellido"
                    disabled={cargando}
                  />
                </div>
              </Form.Group>

              {/* Email (no editable) */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Email
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <svg 
                    className={styles.iconoInput}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    className={`${styles.input} ${styles.inputBloqueado}`}
                    disabled
                  />
                  <span className={styles.badgeBloqueado}>No editable</span>
                </div>
                <p className={styles.textoAyuda}>
                  El email no puede modificarse por seguridad
                </p>
              </Form.Group>

              {/* Equipo */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Equipo <span className={styles.opcional}>(opcional)</span>
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <svg 
                    className={styles.iconoInput}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                  </svg>
                  <Form.Control
                    type="text"
                    name="equipo"
                    value={formData.equipo}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Nombre de tu equipo"
                    disabled={cargando}
                  />
                </div>
              </Form.Group>

            </div>
          </div>

          {/* SECCIÓN: Cambiar Contraseña (Opcional) */}
          <div className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              Cambiar Contraseña 
              <span className={styles.opcional}> (opcional)</span>
            </h2>

            <div className={styles.gridInputs}>
              
              {/* Contraseña Actual */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Contraseña Actual
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <svg 
                    className={styles.iconoInput}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                  <Form.Control
                    type={mostrarContraseñaActual ? "text" : "password"}
                    name="contraseñaActual"
                    value={formData.contraseñaActual}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Tu contraseña actual"
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className={styles.btnOjo}
                    onClick={() => setMostrarContraseñaActual(!mostrarContraseñaActual)}
                    disabled={cargando}
                  >
                    {mostrarContraseñaActual ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </Form.Group>

              {/* Nueva Contraseña */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Nueva Contraseña
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <svg 
                    className={styles.iconoInput}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                    />
                  </svg>
                  <Form.Control
                    type={mostrarNuevaContraseña ? "text" : "password"}
                    name="nuevaContraseña"
                    value={formData.nuevaContraseña}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className={styles.btnOjo}
                    onClick={() => setMostrarNuevaContraseña(!mostrarNuevaContraseña)}
                    disabled={cargando}
                  >
                    {mostrarNuevaContraseña ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {/* Indicador de fuerza */}
                {formData.nuevaContraseña && (
                  <div className={styles.indicadorFuerza}>
                    <div className={styles.barrasFuerza}>
                      <div 
                        className={`${styles.barra} ${fuerzaContraseña.nivel >= 1 ? styles.barraActiva : ''}`}
                        style={{ backgroundColor: fuerzaContraseña.nivel >= 1 ? fuerzaContraseña.color : '#3a3a3a' }}
                      ></div>
                      <div 
                        className={`${styles.barra} ${fuerzaContraseña.nivel >= 2 ? styles.barraActiva : ''}`}
                        style={{ backgroundColor: fuerzaContraseña.nivel >= 2 ? fuerzaContraseña.color : '#3a3a3a' }}
                      ></div>
                      <div 
                        className={`${styles.barra} ${fuerzaContraseña.nivel >= 3 ? styles.barraActiva : ''}`}
                        style={{ backgroundColor: fuerzaContraseña.nivel >= 3 ? fuerzaContraseña.color : '#3a3a3a' }}
                      ></div>
                    </div>
                    <span 
                      className={styles.textoFuerza}
                      style={{ color: fuerzaContraseña.color }}
                    >
                      {fuerzaContraseña.texto}
                    </span>
                  </div>
                )}
              </Form.Group>

              {/* Confirmar Nueva Contraseña */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Confirmar Nueva Contraseña
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <svg 
                    className={styles.iconoInput}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <Form.Control
                    type={mostrarConfirmarContraseña ? "text" : "password"}
                    name="confirmarContraseña"
                    value={formData.confirmarContraseña}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Repetí tu nueva contraseña"
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className={styles.btnOjo}
                    onClick={() => setMostrarConfirmarContraseña(!mostrarConfirmarContraseña)}
                    disabled={cargando}
                  >
                    {mostrarConfirmarContraseña ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </Form.Group>

            </div>

            <p className={styles.textoAyuda}>
              Dejá estos campos vacíos si no querés cambiar tu contraseña
            </p>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className={styles.contenedorBotones}>
            <button
              type="button"
              className={styles.btnCancelar}
              onClick={handleCancelar}
              disabled={cargando}
            >
              <X size={20} />
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.btnGuardar}
              disabled={cargando}
            >
              <Save size={20} />
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </Form>

      </Container>
    </div>
  )
}

export default EditarPerfil