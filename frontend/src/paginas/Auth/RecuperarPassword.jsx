import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './RecuperarPassword.module.css'
import fotoLogin from '../../assets/imagenes/registro-foto.png'

function RecuperarPassword() {
  const { solicitarRecuperacion } = useAuth()

  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Por favor ingresá tu email')
      return
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regexEmail.test(email)) {
      setError('Por favor ingresá un email válido')
      return
    }

    setCargando(true)
    const resultado = await solicitarRecuperacion(email)
    setCargando(false)

    if (resultado.exito) {
      setEnviado(true)
    } else {
      setError(resultado.mensaje)
    }
  }

  return (
    <div className={styles.contenedorRecuperar}>

      {/* Lado izquierdo - Foto */}
      <div className={styles.ladoFoto}>
        <img src={fotoLogin} alt="Rally Argentino" className={styles.foto} />
        <div className={styles.overlayFoto}></div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className={styles.ladoFormulario}>
        <div className={styles.contenedorForm}>

          <h1 className={styles.titulo}>Recuperar</h1>
          <p className={styles.subtitulo}>Ingresá tu email y te enviamos un link para restablecer tu contraseña</p>

          {/* ÉXITO */}
          {enviado && (
            <div className={styles.alertaExito}>
              <strong>¡Email enviado!</strong><br />
              Si el email <strong>{email}</strong> está registrado, vas a recibir un link para restablecer tu contraseña. Revisá también la carpeta de spam.
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className={styles.alertaError}>
              {error}
            </div>
          )}

          {/* FORMULARIO - solo si no fue enviado */}
          {!enviado && (
            <form onSubmit={manejarSubmit} className={styles.formulario}>

              <div className={styles.grupoInput}>
                <label className={styles.label}>Email</label>
                <div className={styles.grupoInputRelativo}>
                  <Mail className={styles.iconoInput} size={20} />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    className={styles.input}
                    disabled={cargando}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={styles.btnEnviar}
                disabled={cargando}
              >
                {cargando ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>

            </form>
          )}

          {/* Links de navegación */}
          <div className={styles.links}>
            <Link to="/login" className={styles.link}>
              Volver al Login
            </Link>
            <span className={styles.separador}>·</span>
            <Link to="/registro" className={styles.link}>
              Crear cuenta
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default RecuperarPassword