import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './PagoFallido.module.css'

function PagoFallido() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const statusDetail = searchParams.get('status_detail')

  const mensajeError = {
    'cc_rejected_bad_filled_card_number': 'Número de tarjeta incorrecto.',
    'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta.',
    'cc_rejected_bad_filled_other': 'Datos de la tarjeta incorrectos.',
    'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto.',
    'cc_rejected_blacklist': 'Tarjeta no disponible.',
    'cc_rejected_insufficient_amount': 'Fondos insuficientes.',
    'cc_rejected_max_attempts': 'Se alcanzó el límite de intentos.',
  }[statusDetail] || 'El pago no pudo procesarse. Podés intentarlo de nuevo.'

  return (
    <div className={styles.contenedor}>

      <div className={styles.tarjeta}>

        {/* Ícono animado */}
        <div className={styles.iconoContenedor}>
          <svg className={styles.icono} viewBox="0 0 100 100" fill="none">
            <circle className={styles.circulo} cx="50" cy="50" r="45" stroke="#ff4444" strokeWidth="3" />
            <line className={styles.lineaX1} x1="33" y1="33" x2="67" y2="67" stroke="#ff4444" strokeWidth="5" strokeLinecap="round" />
            <line className={styles.lineaX2} x1="67" y1="33" x2="33" y2="67" stroke="#ff4444" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <div className={styles.resplandor} />
        </div>

        <h1 className={styles.titulo}>Pago rechazado</h1>
        <p className={styles.subtitulo}>{mensajeError}</p>

        <div className={styles.sugerencias}>
          <p className={styles.tituloSugerencias}>¿Qué podés hacer?</p>
          <ul className={styles.listaSugerencias}>
            <li>Verificar los datos de tu tarjeta</li>
            <li>Intentar con otro método de pago</li>
            <li>Contactar a tu banco si el problema persiste</li>
          </ul>
        </div>

        <div className={styles.botones}>
          <button
            className={styles.botonReintentar}
            onClick={() => navigate('/tienda')}
          >
            Volver a la tienda
          </button>
          <button
            className={styles.botonGarage}
            onClick={() => navigate('/garage')}
          >
            Ir al Garage
          </button>
        </div>

      </div>
    </div>
  )
}

export default PagoFallido