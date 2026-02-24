import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './ResetearPassword.module.css'
import fotoLogin from '../../assets/imagenes/login-foto.png'

function ResetearPassword() {
  const { token } = useParams()
  const { resetearContraseña } = useAuth()
  const navigate = useNavigate()

  const [nuevaContraseña, setNuevaContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  // Redirigir al login después del éxito
  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => {
        navigate('/login')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [exito])

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!nuevaContraseña || !confirmarContraseña) {
      setError('Por favor completá todos los campos')
      return
    }

    if (nuevaContraseña.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    const resultado = await resetearContraseña(token, nuevaContraseña)
    setCargando(false)

    if (resultado.exito) {
      setExito(true)
    } else {
      setError(resultado.mensaje)
    }
  }

  return (
    <div className={styles.contenedorResetear}>

      {/* Lado izquierdo - Foto */}
      <div className={styles.ladoFoto}>
        <img src={fotoLogin} alt="Rally Argentino" className={styles.foto} />
        <div className={styles.overlayFoto}></div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className={styles.ladoFormulario}>
        <div className={styles.contenedorForm}>

          <h1 className={styles.titulo}>Nueva</h1>
          <h1 className={styles.tituloCeleste}>Contraseña</h1>
          <p className={styles.subtitulo}>Ingresá tu nueva contraseña para recuperar el acceso</p>

          {/* ÉXITO */}
          {exito && (
            <div className={styles.alertaExito}>
              <strong>¡Contraseña actualizada!</strong><br />
              Tu contraseña fue cambiada exitosamente. Redirigiendo al login en 4 segundos...
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className={styles.alertaError}>
              {error}
            </div>
          )}

          {/* FORMULARIO */}
          {!exito && (
            <form onSubmit={manejarSubmit} className={styles.formulario}>

              {/* Nueva contraseña */}
              <div className={styles.grupoInput}>
                <label className={styles.label}>Nueva contraseña</label>
                <div className={styles.grupoInputRelativo}>
                  <Lock className={styles.iconoInput} size={20} />
                  <input
                    type={mostrarNueva ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={nuevaContraseña}
                    onChange={(e) => { setNuevaContraseña(e.target.value); setError('') }}
                    className={styles.input}
                    disabled={cargando}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.botonOjo}
                    onClick={() => setMostrarNueva(!mostrarNueva)}
                    tabIndex="-1"
                  >
                    {mostrarNueva ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className={styles.grupoInput}>
                <label className={styles.label}>Confirmar contraseña</label>
                <div className={styles.grupoInputRelativo}>
                  <Lock className={styles.iconoInput} size={20} />
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    placeholder="Repetí tu contraseña"
                    value={confirmarContraseña}
                    onChange={(e) => { setConfirmarContraseña(e.target.value); setError('') }}
                    className={styles.input}
                    disabled={cargando}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.botonOjo}
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    tabIndex="-1"
                  >
                    {mostrarConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.btnGuardar}
                disabled={cargando}
              >
                {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>

            </form>
          )}

          <div className={styles.links}>
            <Link to="/login" className={styles.link}>
              Volver al Login
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default ResetearPassword