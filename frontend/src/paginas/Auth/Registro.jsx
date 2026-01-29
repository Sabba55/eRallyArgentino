import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Alert, InputGroup } from 'react-bootstrap'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Registro.module.css'
import fotoRegistro from '../../assets/imagenes/login-foto.jpg'

function Registro() {
  const navigate = useNavigate()
  
  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [equipo, setEquipo] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  
  // Estados para mostrar/ocultar contraseñas
  const [mostrarContraseña, setMostrarContraseña] = useState(false)
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false)

  // Función para manejar el submit del formulario
  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    // Validaciones
    if (!nombre || !email || !contraseña || !confirmarContraseña) {
      setError('Por favor completá todos los campos obligatorios')
      setCargando(false)
      return
    }

    if (!email.includes('@')) {
      setError('Por favor ingresá un email válido')
      setCargando(false)
      return
    }

    if (contraseña.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setCargando(false)
      return
    }

    if (contraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden')
      setCargando(false)
      return
    }

    // Simulación de registro (después conectamos con backend)
    setTimeout(() => {
      console.log('Registro exitoso:', {
        nombre,
        email,
        contraseña,
        equipo
      })
      
      // Acá iría la lógica de registro real con el backend
      // Por ahora solo redirigimos al login
      navigate('/login')
      
      setCargando(false)
    }, 1500)
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

            {/* Mensaje de error */}
            {error && (
              <Alert variant="danger" className={styles.alerta}>
                {error}
              </Alert>
            )}

            {/* Formulario */}
            <Form onSubmit={manejarSubmit} className={styles.formulario}>
              
              {/* Campo Nombre */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Nombre completo <span className={styles.obligatorio}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={styles.input}
                  disabled={cargando}
                />
              </Form.Group>

              {/* Campo Email */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Email <span className={styles.obligatorio}>*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  disabled={cargando}
                />
              </Form.Group>

              {/* Campo Contraseña con ojo */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Contraseña <span className={styles.obligatorio}>*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={mostrarContraseña ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    className={styles.input}
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className={styles.btnOjo}
                    onClick={() => setMostrarContraseña(!mostrarContraseña)}
                    disabled={cargando}
                  >
                    {mostrarContraseña ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </InputGroup>
              </Form.Group>

              {/* Campo Confirmar Contraseña con ojo */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Confirmar contraseña <span className={styles.obligatorio}>*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={mostrarConfirmarContraseña ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    value={confirmarContraseña}
                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                    className={styles.input}
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
                </InputGroup>
              </Form.Group>

              {/* Campo Equipo (opcional) */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>
                  Equipo <span className={styles.opcional}>(opcional)</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre de tu equipo"
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                  className={styles.input}
                  disabled={cargando}
                />
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

          </div>
        </div>

      </div>
    </>
  )
}

export default Registro