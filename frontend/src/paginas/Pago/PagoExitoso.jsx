import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../config/api'
import styles from './PagoExitoso.module.css'

function PagoExitoso() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [contador, setContador] = useState(8)

  // MercadoPago devuelve estos params en la URL
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    const intervalo = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          clearInterval(intervalo)
          navigate('/garage')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalo)
  }, [navigate])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      api.get(`/pagos/paypal/capturar?token=${token}`)
        .then(() => console.log('✅ Pago PayPal capturado'))
        .catch(err => console.error('Error capturando pago PayPal:', err))
    }
  }, [])

  return (
    <div className={styles.contenedor}>

      {/* Partículas de fondo */}
      <div className={styles.particulas}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={styles.particula} style={{ '--i': i }} />
        ))}
      </div>

      <div className={styles.tarjeta}>

        {/* Ícono animado */}
        <div className={styles.iconoContenedor}>
          <svg className={styles.icono} viewBox="0 0 100 100" fill="none">
            <circle className={styles.circulo} cx="50" cy="50" r="45" stroke="#39ff14" strokeWidth="3" />
            <polyline
              className={styles.check}
              points="28,52 44,68 72,35"
              stroke="#39ff14"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div className={styles.resplandor} />
        </div>

        <h1 className={styles.titulo}>¡Pago aprobado!</h1>
        <p className={styles.subtitulo}>
          Tu transacción fue procesada exitosamente
        </p>

        {paymentId && (
          <div className={styles.infoTransaccion}>
            <span className={styles.labelInfo}>ID de pago</span>
            <span className={styles.valorInfo}>#{paymentId}</span>
          </div>
        )}

        <p className={styles.textoEmail}>
          Recibirás un email de confirmación en breve con los detalles de tu compra.
        </p>

        <div className={styles.separador} />

        <p className={styles.textoRedireccion}>
          Redirigiendo a tu garage en <span className={styles.contador}>{contador}s</span>
        </p>

        <div className={styles.barraProgreso}>
          <div
            className={styles.barraRelleno}
            style={{ animationDuration: '8s' }}
          />
        </div>

        <div className={styles.botones}>
          <button
            className={styles.botonGarage}
            onClick={() => navigate('/garage')}
          >
            Ir al Garage ahora
          </button>
          <button
            className={styles.botonTienda}
            onClick={() => navigate('/tienda')}
          >
            Seguir comprando
          </button>
        </div>

      </div>
    </div>
  )
}

export default PagoExitoso