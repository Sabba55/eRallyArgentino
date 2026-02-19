import { useState, useEffect, useRef } from 'react'
import { Container, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Eye, EyeOff, User, Briefcase, Lock, Save } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/api'
import styles from './EditarPerfil.module.css'

function EditarPerfil() {
  const { usuario, actualizarPerfil } = useAuth()
  const navigate = useNavigate()
  const inputFileRef = useRef(null)

  // ========================================
  // ESTADOS
  // ========================================
  const [formData, setFormData] = useState({
    nombre: '',
    equipo: ''
  })

  const [fotoData, setFotoData] = useState({
    archivo: null,
    url: '',
    preview: '',
    modoSubida: 'archivo'
  })

  const [passwordData, setPasswordData] = useState({
    contraseñaActual: '',
    nuevaContraseña: '',
    confirmarContraseña: ''
  })

  const [mostrarPasswords, setMostrarPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  })

  const [errorPassword, setErrorPassword] = useState('')
  const [guardando, setGuardando] = useState(false)

  // ========================================
  // CARGAR DATOS
  // ========================================
  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        equipo: usuario.equipo || ''
      })
      setFotoData(prev => ({
        ...prev,
        preview: usuario.fotoPerfil || ''
      }))
    }
  }, [usuario])

  // ========================================
  // OBTENER INICIALES
  // ========================================
  const obtenerIniciales = (nombre) => {
    if (!nombre) return '?'
    const palabras = nombre.trim().split(' ')
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
    }
    return nombre.substring(0, 2).toUpperCase()
  }

  // ========================================
  // MANEJO DE CAMBIOS
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    setErrorPassword('')
  }

  // ========================================
  // VALIDAR URL DE IMAGEN
  // ========================================
  const esUrlValida = (url) => {
    if (!url) return false
    try {
      const urlObj = new URL(url)
      const extension = urlObj.pathname.split('.').pop().toLowerCase()
      return ['jpg', 'jpeg', 'png', 'webp'].includes(extension)
    } catch {
      return false
    }
  }

  // ========================================
  // MANEJO DE FOTO - ARCHIVO
  // ========================================
  const handleFotoChange = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!tiposPermitidos.includes(archivo.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WEBP')
      return
    }

    // Validar tamaño (5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setFotoData({
        archivo,
        url: '',
        preview: e.target.result,
        modoSubida: 'archivo'
      })
    }
    reader.readAsDataURL(archivo)
  }

  // ========================================
  // MANEJO DE FOTO - URL
  // ========================================
  const handleUrlChange = (e) => {
    const url = e.target.value
    setFotoData(prev => ({
      ...prev,
      url,
      archivo: null,
      preview: url,
      modoSubida: 'url'
    }))
  }

  // ========================================
  // ELIMINAR FOTO CON CONFIRMACIÓN
  // ========================================
  const eliminarFoto = () => {
    const confirmado = window.confirm('¿Eliminar foto de perfil del formulario?')

    if (confirmado) {
      setFotoData({
        archivo: null,
        url: '',
        preview: '',
        modoSubida: 'archivo'
      })
      if (inputFileRef.current) {
        inputFileRef.current.value = ''
      }
    }
  }

  // ========================================
  // CALCULAR FUERZA DE CONTRASEÑA
  // ========================================
  const calcularFuerzaPassword = (password) => {
    if (!password) return { nivel: 0, texto: '', color: '#3a3a3a' }

    let fuerza = 0
    if (password.length >= 8) fuerza++
    if (password.length >= 12) fuerza++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) fuerza++
    if (/\d/.test(password)) fuerza++
    if (/[^a-zA-Z0-9]/.test(password)) fuerza++

    if (fuerza <= 2) return { nivel: 1, texto: 'Débil', color: '#ff4444' }
    if (fuerza === 3) return { nivel: 2, texto: 'Media', color: '#ffd60a' }
    if (fuerza === 4) return { nivel: 3, texto: 'Buena', color: '#39ff14' }
    return { nivel: 4, texto: 'Excelente', color: '#00d4ff' }
  }

  const fuerzaPassword = calcularFuerzaPassword(passwordData.nuevaContraseña)

  // ========================================
  // VALIDAR INFORMACIÓN PERSONAL
  // ========================================
  const validarInformacionPersonal = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return false
    }

    if (formData.nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres')
      return false
    }

    if (formData.nombre.trim().length > 100) {
      toast.error('El nombre no puede tener más de 100 caracteres')
      return false
    }

    if (formData.equipo && formData.equipo.length > 100) {
      toast.error('El equipo no puede tener más de 100 caracteres')
      return false
    }

    return true
  }

  // ========================================
  // VALIDAR FOTO
  // ========================================
  const validarFoto = () => {
    if (fotoData.modoSubida === 'url' && fotoData.url) {
      if (!esUrlValida(fotoData.url)) {
        toast.error('La URL de la imagen no es válida. Debe terminar en .jpg, .png o .webp')
        return false
      }
    }
    return true
  }

  // ========================================
  // VALIDAR CONTRASEÑA - CRÍTICO
  // ========================================
  const validarContraseña = () => {
    setErrorPassword('')

    // Si no completó ningún campo de contraseña, no validar
    if (!passwordData.contraseñaActual && !passwordData.nuevaContraseña && !passwordData.confirmarContraseña) {
      return 'skip' // Indica que se saltee el cambio de contraseña
    }

    // Si completó algún campo, todos son obligatorios
    if (!passwordData.contraseñaActual) {
      setErrorPassword('Ingresa tu contraseña actual')
      toast.error('Ingresa tu contraseña actual')
      return false
    }

    if (!passwordData.nuevaContraseña) {
      setErrorPassword('Ingresa una nueva contraseña')
      toast.error('Ingresa una nueva contraseña')
      return false
    }

    if (!passwordData.confirmarContraseña) {
      setErrorPassword('Confirma tu nueva contraseña')
      toast.error('Confirma tu nueva contraseña')
      return false
    }

    // Validar longitud mínima
    if (passwordData.nuevaContraseña.length < 8) {
      setErrorPassword('La nueva contraseña debe tener al menos 8 caracteres')
      toast.error('La nueva contraseña debe tener al menos 8 caracteres')
      return false
    }

    // Validar que sea diferente a la actual
    if (passwordData.nuevaContraseña === passwordData.contraseñaActual) {
      setErrorPassword('La nueva contraseña debe ser diferente a la actual')
      toast.error('La nueva contraseña debe ser diferente a la actual')
      return false
    }

    // Validar que coincidan
    if (passwordData.nuevaContraseña !== passwordData.confirmarContraseña) {
      setErrorPassword('Las contraseñas no coinciden')
      toast.error('Las contraseñas no coinciden')
      return false
    }

    return true
  }

  // ========================================
  // GUARDAR INFORMACIÓN PERSONAL
  // ========================================
  const guardarInformacionPersonal = async () => {
    if (!validarInformacionPersonal()) return false

    try {
      setGuardando(true)

      const response = await api.put('/usuarios/perfil', {
        nombre: formData.nombre.trim(),
        equipo: formData.equipo.trim()
      })

      await actualizarPerfil(response.data.usuario)
      return true
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Error al actualizar información')
      return false
    } finally {
      setGuardando(false)
    }
  }

  // ========================================
  // GUARDAR FOTO DE PERFIL
  // ========================================
  const guardarFotoPerfil = async () => {
    if (!validarFoto()) return false

    try {
      setGuardando(true)

      if (fotoData.modoSubida === 'archivo' && fotoData.archivo) {
        const data = new FormData()
        data.append('foto', fotoData.archivo)

        const response = await api.put('/usuarios/foto-perfil', data)
        
        await actualizarPerfil({
          ...usuario,
          fotoPerfil: response.data.fotoPerfil
        })

        setFotoData(prev => ({
          ...prev,
          preview: response.data.fotoPerfil
        }))

        return true
      } else if (fotoData.modoSubida === 'url' && fotoData.url) {
        const response = await api.put('/usuarios/perfil', {
          fotoPerfil: fotoData.url
        })

        await actualizarPerfil(response.data.usuario)
        return true
      }

      return false
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Error al actualizar foto')
      return false
    } finally {
      setGuardando(false)
    }
  }

  // ========================================
  // CAMBIAR CONTRASEÑA - CRÍTICO
  // ========================================
  const cambiarContraseña = async () => {
    try {
      setGuardando(true)

      await api.put('/usuarios/cambiar-password', {
        contraseñaActual: passwordData.contraseñaActual,
        nuevaContraseña: passwordData.nuevaContraseña,
        confirmarContraseña: passwordData.confirmarContraseña
      })

      // Limpiar campos solo si fue exitoso
      setPasswordData({
        contraseñaActual: '',
        nuevaContraseña: '',
        confirmarContraseña: ''
      })

      setErrorPassword('')
      return true
    } catch (error) {
      console.error('Error:', error)
      
      // Manejo específico de errores
      if (error.response?.status === 401) {
        setErrorPassword('La contraseña actual es incorrecta')
        toast.error('La contraseña actual es incorrecta')
      } else {
        const mensajeError = error.response?.data?.error || 'Error al cambiar contraseña'
        setErrorPassword(mensajeError)
        toast.error(mensajeError)
      }
      
      return false
    } finally {
      setGuardando(false)
    }
  }

  // ========================================
  // GUARDAR TODO - CRÍTICO CORREGIDO
  // ========================================
  const handleGuardarTodo = async (e) => {
    e.preventDefault()
    
    let cambiosRealizados = []

    // 1. Guardar información personal
    const infoGuardada = await guardarInformacionPersonal()
    if (infoGuardada) cambiosRealizados.push('información personal')
    
    // 2. Guardar foto si hay cambios
    if (fotoData.archivo || (fotoData.url && fotoData.url !== usuario?.fotoPerfil)) {
      const fotoGuardada = await guardarFotoPerfil()
      if (fotoGuardada) cambiosRealizados.push('foto de perfil')
    }

    // 3. CAMBIAR CONTRASEÑA - VALIDAR PRIMERO
    const validacionPassword = validarContraseña()
    
    if (validacionPassword === true) {
      // Validación OK → intentar cambiar
      const passwordCambiada = await cambiarContraseña()
      if (passwordCambiada) cambiosRealizados.push('contraseña')
    } else if (validacionPassword === 'skip') {
      // No completó campos de contraseña → skip sin error
      // No hacer nada
    } else {
      // Validación falló → ya se mostró el error en validarContraseña()
      // No continuar con el cambio de contraseña
    }

    // 4. Mostrar resultado final
    if (cambiosRealizados.length > 0) {
      toast.success(`✅ Actualizado: ${cambiosRealizados.join(', ')}`)
    } else if (validacionPassword === false) {
      // Ya se mostró el error específico de contraseña
    } else {
      toast.error('No hay cambios para guardar')
    }
  }

  return (
    <div className={styles.contenedorEditarPerfil}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2a2a2a',
            color: '#ffffff',
            border: '2px solid #00d4ff',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#39ff14',
              secondary: '#1a1a1a'
            }
          },
          error: {
            iconTheme: {
              primary: '#ff4444',
              secondary: '#1a1a1a'
            }
          }
        }}
      />

      <Container>
        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>EDITAR PERFIL</h1>
          <p className={styles.subtitulo}>Actualiza tu información personal</p>
        </div>

        <Form onSubmit={handleGuardarTodo}>

          {/* SECCIÓN: FOTO DE PERFIL */}
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              Foto de Perfil <span className={styles.opcional}>(opcional)</span>
            </h2>

            <div className={styles.contenedorFoto}>
              <div className={styles.avatarPreview}>
                {fotoData.preview ? (
                  <img
                    src={fotoData.preview}
                    alt="Foto de perfil"
                    className={styles.fotoPerfil}
                  />
                ) : (
                  <div className={styles.avatarIniciales}>
                    {obtenerIniciales(formData.nombre)}
                  </div>
                )}
              </div>

              <div className={styles.controlesFoto}>
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFotoChange}
                  className={styles.inputFile}
                />

                <button
                  type="button"
                  className={styles.btnSubirFoto}
                  onClick={() => inputFileRef.current.click()}
                  disabled={guardando}
                >
                  <Upload size={20} />
                  Subir Foto
                </button>

                <Form.Control
                  type="url"
                  placeholder="O pega una URL de imagen..."
                  value={fotoData.url}
                  onChange={handleUrlChange}
                  disabled={guardando}
                />

                {fotoData.preview && (
                  <button
                    type="button"
                    className={styles.btnEliminarFoto}
                    onClick={eliminarFoto}
                    disabled={guardando}
                  >
                    <X size={20} />
                    Eliminar Foto
                  </button>
                )}

                <p className={styles.textoAyuda}>
                  JPG, PNG o WEBP — máximo 5MB
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN: INFORMACIÓN PERSONAL */}
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              Información Personal <span className={styles.obligatorio}>*</span>
            </h2>

            <div className={styles.gridInputs}>
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Nombre</Form.Label>
                <div className={styles.inputConIcono}>
                  <User size={18} className={styles.iconoInput} />
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Juan Pérez"
                    required
                    disabled={guardando}
                  />
                </div>
              </Form.Group>

              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Email</Form.Label>
                <div className={styles.inputConIcono}>
                  <User size={18} className={styles.iconoInput} />
                  <Form.Control
                    type="email"
                    value={usuario?.email || ''}
                    className={`${styles.input} ${styles.inputBloqueado}`}
                    disabled
                  />
                  <span className={styles.badgeBloqueado}>Bloqueado</span>
                </div>
              </Form.Group>

              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Equipo (opcional)</Form.Label>
                <div className={styles.inputConIcono}>
                  <Briefcase size={18} className={styles.iconoInput} />
                  <Form.Control
                    type="text"
                    name="equipo"
                    value={formData.equipo}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Team Racing"
                    disabled={guardando}
                  />
                </div>
              </Form.Group>
            </div>
          </section>

          {/* SECCIÓN: CAMBIAR CONTRASEÑA */}
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              Cambiar Contraseña <span className={styles.opcional}>(opcional)</span>
            </h2>

            {errorPassword && (
              <Alert variant="danger" className={styles.alerta}>
                {errorPassword}
              </Alert>
            )}

            <div className={styles.gridInputs}>
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Contraseña Actual</Form.Label>
                <div className={styles.inputConIcono}>
                  <Lock size={18} className={styles.iconoInput} />
                  <Form.Control
                    type={mostrarPasswords.actual ? 'text' : 'password'}
                    name="contraseñaActual"
                    value={passwordData.contraseñaActual}
                    onChange={handlePasswordChange}
                    className={styles.input}
                    placeholder="••••••••"
                    disabled={guardando}
                  />
                  <button
                    type="button"
                    className={styles.btnOjo}
                    onClick={() => setMostrarPasswords(prev => ({ ...prev, actual: !prev.actual }))}
                    disabled={guardando}
                  >
                    {mostrarPasswords.actual ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Form.Group>

              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Nueva Contraseña</Form.Label>
                <div className={styles.inputConIcono}>
                  <Lock size={18} className={styles.iconoInput} />
                  <Form.Control
                    type={mostrarPasswords.nueva ? 'text' : 'password'}
                    name="nuevaContraseña"
                    value={passwordData.nuevaContraseña}
                    onChange={handlePasswordChange}
                    className={styles.input}
                    placeholder="••••••••"
                    disabled={guardando}
                  />
                  <button
                    type="button"
                    className={styles.btnOjo}
                    onClick={() => setMostrarPasswords(prev => ({ ...prev, nueva: !prev.nueva }))}
                    disabled={guardando}
                  >
                    {mostrarPasswords.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {passwordData.nuevaContraseña && (
                  <div className={styles.indicadorFuerza}>
                    <div className={styles.barrasFuerza}>
                      {[1, 2, 3, 4].map(nivel => (
                        <div
                          key={nivel}
                          className={`${styles.barra} ${
                            nivel <= fuerzaPassword.nivel ? styles.barraActiva : ''
                          }`}
                          style={{
                            backgroundColor: nivel <= fuerzaPassword.nivel ? fuerzaPassword.color : '#3a3a3a'
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className={styles.textoFuerza}
                      style={{ color: fuerzaPassword.color }}
                    >
                      {fuerzaPassword.texto}
                    </span>
                  </div>
                )}
              </Form.Group>

              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Confirmar Contraseña</Form.Label>
                <div className={styles.inputConIcono}>
                  <Lock size={18} className={styles.iconoInput} />
                  <Form.Control
                    type={mostrarPasswords.confirmar ? 'text' : 'password'}
                    name="confirmarContraseña"
                    value={passwordData.confirmarContraseña}
                    onChange={handlePasswordChange}
                    className={styles.input}
                    placeholder="••••••••"
                    disabled={guardando}
                  />
                  <button
                    type="button"
                    className={styles.btnOjo}
                    onClick={() => setMostrarPasswords(prev => ({ ...prev, confirmar: !prev.confirmar }))}
                    disabled={guardando}
                  >
                    {mostrarPasswords.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Form.Group>
            </div>
          </section>

          {/* BOTONES */}
          <div className={styles.contenedorBotones}>
            <button
              type="button"
              className={styles.btnCancelar}
              onClick={() => navigate('/perfil')}
              disabled={guardando}
            >
              <X size={20} />
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.btnGuardar}
              disabled={guardando}
            >
              <Save size={20} />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </Form>
      </Container>
    </div>
  )
}

export default EditarPerfil