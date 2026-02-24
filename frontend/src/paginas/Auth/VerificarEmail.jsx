import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import styles from './VerificarEmail.module.css'

function VerificarEmail() {
  const { token } = useParams()
  const { verificarEmail } = useAuth()
  const yaVerificó = useRef(false)

  const [estado, setEstado] = useState('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (yaVerificó.current) return
    yaVerificó.current = true

    const verificar = async () => {
      const resultado = await verificarEmail(token)

      if (resultado.exito) {
        setEstado('exito')
        setMensaje(resultado.mensaje)
      } else {
        setEstado('error')
        setMensaje(resultado.mensaje)
      }
    }

    if (token) {
      verificar()
    } else {
      setEstado('error')
      setMensaje('Token de verificación no encontrado')
    }
  }, [token])

  return (
    <div className={styles.contenedor}>
      {estado === 'cargando' && (
        <div className={styles.tarjeta}>
          <div className={styles.spinner} />
          <h2 className={styles.titulo}>Verificando tu cuenta...</h2>
          <p className={styles.subtitulo}>Por favor esperá un momento</p>
        </div>
      )}
      {estado === 'exito' && (
        <div className={styles.tarjeta}>
          <div className={styles.iconoExito}>✓</div>
          <h2 className={`${styles.titulo} ${styles.tituloExito}`}>
            ¡Email verificado!
          </h2>
          <p className={styles.subtitulo}>{mensaje}</p>
          <p className={styles.subtitulo}>
            Ya podés acceder a todas las funciones de eRally Argentino.
          </p>
          <Link to="/login" className={styles.btnPrimario}>
            Ir al Login
          </Link>
        </div>
      )}
      {estado === 'error' && (
        <div className={styles.tarjeta}>
          <div className={styles.iconoError}>✕</div>
          <h2 className={`${styles.titulo} ${styles.tituloError}`}>
            Error al verificar
          </h2>
          <p className={styles.subtitulo}>{mensaje}</p>
          <p className={styles.subtitulo}>
            El link puede haber expirado (válido por 24hs) o ya fue usado.
          </p>
          <Link to="/registro" className={styles.btnSecundario}>
            Volver al Registro
          </Link>
        </div>
      )}
    </div>
  )
}

export default VerificarEmail