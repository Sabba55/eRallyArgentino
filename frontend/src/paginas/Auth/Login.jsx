import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Alert } from 'react-bootstrap'
import styles from './Login.module.css'
import fotoLogin from '../../assets/imagenes/login-foto.jpg'

function Login() {
  const navigate = useNavigate()
  
  // Estados del formulario
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Función para manejar el submit del formulario
  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    // Validaciones básicas
    if (!email || !contraseña) {
      setError('Por favor completá todos los campos')
      setCargando(false)
      return
    }

    if (!email.includes('@')) {
      setError('Por favor ingresá un email válido')
      setCargando(false)
      return
    }

    // Simulación de login (después conectamos con backend)
    setTimeout(() => {
      // Por ahora cualquier email/contraseña funciona
      console.log('Login exitoso:', { email, contraseña })
      
      // Acá iría la lógica de autenticación real
      // Por ahora solo redirigimos
      navigate('/')
      
      setCargando(false)
    }, 1000)
  }

  return (
    <>
      {/* Contenido principal */}
      <div className={styles.contenedorLogin}>
        
        {/* Lado izquierdo - Foto */}
        <div className={styles.ladoFoto}>
          <img 
            src={fotoLogin} 
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
            <h1 className={styles.titulo}>Bienvenido</h1>
            <p className={styles.subtitulo}>Ingresá a tu cuenta</p>

            {/* Mensaje de error */}
            {error && (
              <Alert variant="danger" className={styles.alerta}>
                {error}
              </Alert>
            )}

            {/* Formulario */}
            <Form onSubmit={manejarSubmit} className={styles.formulario}>
              
              {/* Campo Email */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  disabled={cargando}
                />
              </Form.Group>

              {/* Campo Contraseña */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  className={styles.input}
                  disabled={cargando}
                />
              </Form.Group>

              {/* Link olvidaste contraseña */}
              <div className={styles.linkOlvido}>
                <Link to="/recuperar-contraseña" className={styles.link}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón Ingresar */}
              <Button 
                type="submit" 
                className={styles.btnIngresar}
                disabled={cargando}
              >
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </Button>

              {/* Link a Registro */}
              <div className={styles.linkRegistro}>
                <span className={styles.textoGris}>¿No tenés cuenta? </span>
                <Link to="/registro" className={styles.link}>
                  Registrate acá
                </Link>
              </div>

            </Form>

          </div>
        </div>

      </div>
    </>
  )
}

export default Login