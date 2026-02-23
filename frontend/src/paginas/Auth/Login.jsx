import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Button} from 'react-bootstrap'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Login.module.css'
import fotoLogin from '../../assets/imagenes/login-foto.png'

function Login() {
  // ========================================
  // CONTEXTO DE AUTENTICACIÓN
  // ========================================
  const { login } = useAuth()
  
  // ========================================
  // ESTADOS DEL FORMULARIO
  // ========================================
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)

  // ========================================
  // FUNCIÓN PARA MANEJAR EL SUBMIT
  // ========================================
  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !contraseña) {
      setError('Por favor completá todos los campos')
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

    setCargando(true)
    const resultado = await login(email, contraseña)
    setCargando(false)

    if (!resultado.exito) {
      setError(resultado.mensaje)
    }
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
              <div className={styles.alerta}>
                {error}
              </div>
            )}

            {/* Formulario */}
            <Form onSubmit={manejarSubmit} className={styles.formulario}>
              
              {/* Campo Email */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Email</Form.Label>
                  <div className={styles.grupoInputRelativo}> {/* Nuevo contenedor */}
                    <Mail className={styles.iconoInput} size={20} />
                    <Form.Control
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                      disabled={cargando}
                      autoComplete="email"
                    />
                  </div>
              </Form.Group>

              {/* Campo Contraseña */}
              <Form.Group className={styles.grupoInput}>
                <Form.Label className={styles.label}>Contraseña</Form.Label>
                <div className={styles.grupoInputRelativo}>
                  <Lock className={styles.iconoInput} size={20} />
                  
                  <Form.Control
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    className={styles.input}
                    disabled={cargando}
                    autoComplete="current-password"
                  />

                  {/* Botón para alternar visibilidad */}
                  <button
                    type="button"
                    className={styles.botonOjo}
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    tabIndex="-1" // Para que el tab del teclado no se trabe acá
                  >
                    {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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