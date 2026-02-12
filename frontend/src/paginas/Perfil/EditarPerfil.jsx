import { useState, useEffect } from 'react'
import { Container, Form, Alert } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Users, Lock, Eye, EyeOff, Save, X, Image } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './EditarPerfil.module.css'

function EditarPerfil() {
  const { usuario, actualizarPerfil, cargando: cargandoAuth } = useAuth()
  const navigate = useNavigate()

  // ========================================
  // ESTADOS DEL FORMULARIO
  // ========================================
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [equipo, setEquipo] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState('')
  
  // Contraseñas
  const [contraseñaActual, setContraseñaActual] = useState('')
  const [nuevaContraseña, setNuevaContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  
  // Visibilidad contraseñas
  const [mostrarContraseñaActual, setMostrarContraseñaActual] = useState(false)
  const [mostrarNuevaContraseña, setMostrarNuevaContraseña] = useState(false)
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false)

  // Estados de UI
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  // ========================================
  // CARGAR DATOS DEL USUARIO AL MONTAR
  // ========================================
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '')
      setEmail(usuario.email || '')
      setEquipo(usuario.equipo || '')
      setFotoPerfil(usuario.fotoPerfil || '')
    }
  }, [usuario])

  // ========================================
  // OBTENER INICIALES
  // ========================================
  const obtenerIniciales = () => {
    if (!nombre) return '?'
    
    const palabras = nombre.trim().split(' ')
    
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
    } else {
      return nombre.substring(0, 2).toUpperCase()
    }
  }

  // ========================================
  // FUERZA DE CONTRASEÑA
  // ========================================
  const calcularFuerzaContraseña = (contraseña) => {
    if (!contraseña) return { nivel: 0, texto: '', color: '#3a3a3a' }
    
    let fuerza = 0
    
    // Longitud
    if (contraseña.length >= 8) fuerza++
    if (contraseña.length >= 12) fuerza++
    
    // Complejidad
    if (/[a-z]/.test(contraseña) && /[A-Z]/.test(contraseña)) fuerza++
    if (/\d/.test(contraseña)) fuerza++
    if (/[^a-zA-Z\d]/.test(contraseña)) fuerza++
    
    if (fuerza <= 2) return { nivel: 1, texto: 'Débil', color: '#ff4444' }
    if (fuerza <= 3) return { nivel: 2, texto: 'Media', color: '#ffeb3b' }
    if (fuerza <= 4) return { nivel: 3, texto: 'Buena', color: '#00d4ff' }
    return { nivel: 4, texto: 'Excelente', color: '#39ff14' }
  }

  const fuerzaContraseña = calcularFuerzaContraseña(nuevaContraseña)

  // ========================================
  // MANEJAR SUBMIT
  // ========================================
  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito(false)

    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    // Si está cambiando contraseña
    if (nuevaContraseña) {
      if (!contraseñaActual) {
        setError('Debes ingresar tu contraseña actual para cambiarla')
        return
      }

      if (nuevaContraseña.length < 8) {
        setError('La nueva contraseña debe tener al menos 8 caracteres')
        return
      }

      if (nuevaContraseña !== confirmarContraseña) {
        setError('Las contraseñas no coinciden')
        return
      }
    }

    // Preparar datos
    const datosActualizados = {
      nombre: nombre.trim(),
      ...(equipo.trim() && { equipo: equipo.trim() }),
      ...(fotoPerfil.trim() && { fotoPerfil: fotoPerfil.trim() }),
      ...(nuevaContraseña && {
        contraseñaActual,
        nuevaContraseña
      })
    }

    // Enviar al backend
    setCargando(true)
    const resultado = await actualizarPerfil(datosActualizados)
    setCargando(false)

    if (resultado.exito) {
      setExito(true)
      // Limpiar campos de contraseña
      setContraseñaActual('')
      setNuevaContraseña('')
      setConfirmarContraseña('')
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/perfil')
      }, 2000)
    } else {
      setError(resultado.mensaje)
    }
  }

  // ========================================
  // LOADING STATE
  // ========================================
  if (cargandoAuth) {
    return (
      <div className={styles.contenedorEditarPerfil}>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#00d4ff' }}>
            <h2>Cargando...</h2>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.contenedorEditarPerfil}>
      <Container>

        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>Editar Perfil</h1>
          <p className={styles.subtitulo}>
            Actualizá tu información personal
          </p>
        </div>

        {/* ALERTAS */}
        {error && (
          <Alert variant="danger" className={styles.alerta}>
            {error}
          </Alert>
        )}

        {exito && (
          <Alert variant="success" className={styles.alertaExito}>
            ¡Perfil actualizado exitosamente! Redirigiendo...
          </Alert>
        )}

        {/* FORMULARIO */}
        <Form onSubmit={manejarSubmit}>

          {/* SECCIÓN: FOTO DE PERFIL */}
          <div className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              Foto de Perfil <span className={styles.opcional}>(Opcional)</span>
            </h2>

            <div className={styles.contenedorFoto}>
              {/* Preview */}
              <div className={styles.avatarPreview}>
                {fotoPerfil ? (
                  <img 
                    src={fotoPerfil} 
                    alt="Vista previa"
                    className={styles.fotoPerfil}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : (
                  <div className={styles.avatarIniciales}>
                    {obtenerIniciales()}
                  </div>
                )}
              </div>

              {/* Controles */}
              <div className={styles.controlesFoto}>
                <Form.Group>
                  <Form.Control
                    type="url"
                    placeholder="URL de la imagen (ej: https://ejemplo.com/foto.jpg)"
                    value={fotoPerfil}
                    onChange={(e) => setFotoPerfil(e.target.value)}
                    className={styles.input}
                  />
                </Form.Group>

                {fotoPerfil && (
                  <button
                    type="button"
                    onClick={() => setFotoPerfil('')}
                    className={styles.btnEliminarFoto}
                  >
                    <X size={20} />
                    Eliminar Foto
                  </button>
                )}

                <p className={styles.textoAyuda}>
                  <Image size={16} /> Ingresá la URL de una imagen desde internet
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN: INFORMACIÓN BÁSICA */}
          <div className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              Información Básica <span className={styles.obligatorio}>*</span>
            </h2>

            <div className={styles.gridInputs}>
              {/* Nombre */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Nombre Completo <span className={styles.obligatorio}>*</span>
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <User className={styles.iconoInput} size={20} />
                  <Form.Control
                    type="text"
                    placeholder="Tu nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </Form.Group>

              {/* Email (bloqueado) */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Email
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <Mail className={styles.iconoInput} size={20} />
                  <Form.Control
                    type="email"
                    value={email}
                    className={`${styles.input} ${styles.inputBloqueado}`}
                    disabled
                  />
                  <span className={styles.badgeBloqueado}>No editable</span>
                </div>
              </Form.Group>

              {/* Equipo */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Equipo <span className={styles.opcional}>(Opcional)</span>
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <Users className={styles.iconoInput} size={20} />
                  <Form.Control
                    type="text"
                    placeholder="Nombre de tu equipo"
                    value={equipo}
                    onChange={(e) => setEquipo(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </Form.Group>
            </div>
          </div>

          {/* SECCIÓN: CAMBIAR CONTRASEÑA */}
          <div className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              Cambiar Contraseña <span className={styles.opcional}>(Opcional)</span>
            </h2>

            <div className={styles.gridInputs}>
              {/* Contraseña Actual */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Contraseña Actual
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <Lock className={styles.iconoInput} size={20} />
                  <Form.Control
                    type={mostrarContraseñaActual ? 'text' : 'password'}
                    placeholder="Tu contraseña actual"
                    value={contraseñaActual}
                    onChange={(e) => setContraseñaActual(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContraseñaActual(!mostrarContraseñaActual)}
                    className={styles.btnOjo}
                  >
                    {mostrarContraseñaActual ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </Form.Group>

              <div></div> {/* Espacio vacío para el grid */}

              {/* Nueva Contraseña */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Nueva Contraseña
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <Lock className={styles.iconoInput} size={20} />
                  <Form.Control
                    type={mostrarNuevaContraseña ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={nuevaContraseña}
                    onChange={(e) => setNuevaContraseña(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNuevaContraseña(!mostrarNuevaContraseña)}
                    className={styles.btnOjo}
                  >
                    {mostrarNuevaContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Indicador de fuerza */}
                {nuevaContraseña && (
                  <div className={styles.indicadorFuerza}>
                    <div className={styles.barrasFuerza}>
                      {[1, 2, 3, 4].map((nivel) => (
                        <div
                          key={nivel}
                          className={`${styles.barra} ${
                            nivel <= fuerzaContraseña.nivel ? styles.barraActiva : ''
                          }`}
                          style={{
                            backgroundColor:
                              nivel <= fuerzaContraseña.nivel
                                ? fuerzaContraseña.color
                                : '#3a3a3a'
                          }}
                        />
                      ))}
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

              {/* Confirmar Contraseña */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Confirmar Contraseña
                </Form.Label>
                <div className={styles.inputConIcono}>
                  <Lock className={styles.iconoInput} size={20} />
                  <Form.Control
                    type={mostrarConfirmarContraseña ? 'text' : 'password'}
                    placeholder="Repetí la nueva contraseña"
                    value={confirmarContraseña}
                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarContraseña(!mostrarConfirmarContraseña)}
                    className={styles.btnOjo}
                  >
                    {mostrarConfirmarContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </Form.Group>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className={styles.contenedorBotones}>
            <Link
              to="/perfil"
              className={styles.btnCancelar}
            >
              <X size={20} />
              Cancelar
            </Link>

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