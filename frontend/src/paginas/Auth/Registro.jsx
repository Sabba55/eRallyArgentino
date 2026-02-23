import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button, Alert } from 'react-bootstrap'
import { Eye, EyeOff, Mail, Lock, User, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Registro.module.css'
import fotoRegistro from '../../assets/imagenes/registro-foto.png'

function Registro() {
  // ========================================
  // CONTEXTO DE AUTENTICACIÓN
  // ========================================
  const { registrarse } = useAuth()
  
  // ========================================
  // ESTADOS DEL FORMULARIO
  // ========================================
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [equipo, setEquipo] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)

  // Estados para mostrar/ocultar contraseñas
  const [mostrarContraseña, setMostrarContraseña] = useState(false)
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => {
        navigate('/login')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [exito])

  // ========================================
  // FUNCIÓN PARA MANEJAR EL SUBMIT
  // ========================================
  
  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito(false)

    // Validaciones
    if (!nombre || !email || !contraseña || !confirmarContraseña) {
      setError('Por favor completá todos los campos obligatorios')
      return
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regexEmail.test(email)) {
      setError('Por favor ingresá un email válido')
      return
    }

    if (contraseña.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (contraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden')
      return
    }

    // Preparar datos para enviar al backend
    const datosRegistro = {
      nombre,
      email,
      contraseña,
      ...(equipo && { equipo }) // Solo incluir equipo si tiene valor
    }

    // Intentar registrarse con el backend
    setCargando(true)
    const resultado = await registrarse(datosRegistro)
    setCargando(false)

    if (resultado.exito) {
      setExito(true)
      // Limpiar formulario
      setNombre('')
      setEmail('')
      setContraseña('')
      setConfirmarContraseña('')
      setEquipo('')
    } else {
      setError(resultado.mensaje)
    }
  }

  return (
    <>
      {/* Contenido principal */}
      <div className={styles.contenedorRegistro}>
        
        {/* Lado izquierdo - Foto */}
        <div className={styles.ladoFoto}>
          <img 
            src={fotoRegistro} 
            alt="Rally Argentino" 
            className={styles.foto}
          />
          {/* Overlay con gradiente */}
          <div className={styles.overlayFoto}></div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className={styles.ladoFormulario}>
          <div className={styles.contenedorForm}>

            {/* Título */}
            <h1 className={styles.titulo}>Crear Cuenta</h1>
            <p className={styles.subtitulo}>Unite a la comunidad de eRally</p>

            {/* Mensaje de éxito */}
            {exito && (
              <div className={styles.alertaExito}>
                <strong>¡Registro exitoso!</strong><br />
                Te enviamos un email a <strong>{email}</strong> para verificar tu cuenta.
                Por favor revisá tu casilla (y la carpeta de spam) y hacé click en el enlace de verificación.
                <br /><br />
                <em>Redirigiendo al login en 5 segundos...</em>
              </div>
            )}
            
            {/* Mensaje de error */}
            {error && (
              <Alert variant="danger" className={styles.alerta}>
                {error}
              </Alert>
            )}

            {/* Formulario - Solo mostrar si NO hubo éxito */}
            {!exito && (
              <Form onSubmit={manejarSubmit} className={styles.formulario}>
                
                {/* Campo Nombre */}
                <Form.Group className={styles.grupoInput}>
                  <Form.Label className={styles.label}>
                    Nombre completo <span className={styles.obligatorio}>*</span>
                  </Form.Label>
                  <div className={styles.grupoInputRelativo}>
                    <User className={styles.iconoInput} size={20} />
                    <Form.Control
                      type="text"
                      placeholder="Juan Pérez"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={styles.input} // Nueva clase para dar espacio al icono
                      disabled={cargando}
                      autoComplete="name"
                    />
                  </div>
                </Form.Group>

                {/* Campo Email */}
                <Form.Group className={styles.grupoInput}>
                  <Form.Label className={styles.label}>
                    Email <span className={styles.obligatorio}>*</span>
                  </Form.Label>
                  <div className={styles.grupoInputRelativo}>
                    <Mail className={styles.iconoInput} size={20} />
                    <Form.Control
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                      disabled={cargando}
                      autoComplete="email"
                    />
                  </div>
                </Form.Group>

                {/* Campo Contraseña - Aquí combinamos Icono + Input + Ojo */}
                <Form.Group className={styles.grupoInput}>
                  <Form.Label className={styles.label}>
                    Contraseña <span className={styles.obligatorio}>*</span>
                  </Form.Label>
                  <div className={styles.grupoInputRelativo}>
                    <Lock className={styles.iconoInput} size={20} />
                    <Form.Control
                      type={mostrarContraseña ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      className={`${styles.input} ${styles.inputConIcono}`}
                      disabled={cargando}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.botonOjoRegistro}
                      onClick={() => setMostrarContraseña(!mostrarContraseña)}
                      tabIndex="-1"
                    >
                      {mostrarContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </Form.Group>

                {/* Campo Confirmar Contraseña */}
                <Form.Group className={styles.grupoInput}>
                  <Form.Label className={styles.label}>
                    Confirmar contraseña <span className={styles.obligatorio}>*</span>
                  </Form.Label>
                  <div className={styles.grupoInputRelativo}>
                    <Lock className={styles.iconoInput} size={20} />
                    <Form.Control
                      type={mostrarConfirmarContraseña ? "text" : "password"}
                      placeholder="Repetí tu contraseña"
                      value={confirmarContraseña}
                      onChange={(e) => setConfirmarContraseña(e.target.value)}
                      className={`${styles.input} ${styles.inputConIcono} ${styles.inputConOjo}`}
                      disabled={cargando}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.botonOjoRegistro}
                      onClick={() => setMostrarConfirmarContraseña(!mostrarConfirmarContraseña)}
                      tabIndex="-1"
                    >
                      {mostrarConfirmarContraseña ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </Form.Group>

                {/* Campo Equipo (opcional) */}
                <Form.Group className={styles.grupoInput}>
                  <Form.Label className={styles.label}>
                    Equipo <span className={styles.opcional}>(opcional)</span>
                  </Form.Label>
                  <div className={styles.grupoInputRelativo}>
                    <Users className={styles.iconoInput} size={20} />
                    <Form.Control
                      type="text"
                      placeholder="Nombre de tu equipo"
                      value={equipo}
                      onChange={(e) => setEquipo(e.target.value)}
                      className={`${styles.input} ${styles.inputConIcono}`}
                      disabled={cargando}
                    />
                  </div>
                </Form.Group>

                {/* Botón Registrarse */}
                <Button 
                  type="submit" 
                  className={styles.btnRegistrar}
                  disabled={cargando}
                >
                  {cargando ? 'Registrando...' : 'Registrarme'}
                </Button>

                {/* Link a Login */}
                <div className={styles.linkLogin}>
                  <span className={styles.textoGris}>¿Ya tenés cuenta? </span>
                  <Link to="/login" className={styles.link}>
                    Ingresá acá
                  </Link>
                </div>

              </Form>
            )}

          </div>
        </div>

      </div>
    </>
  )
}

export default Registro