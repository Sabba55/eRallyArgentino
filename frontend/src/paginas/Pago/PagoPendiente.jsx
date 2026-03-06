import { useNavigate } from 'react-router-dom'
import styles from './PagoPendiente.module.css'

function PagoPendiente() {
  const navigate = useNavigate()

  return (
    <div className={styles.contenedor}>

      <div className={styles.tarjeta}>

        {/* Ícono animado */}
        <div className={styles.iconoContenedor}>
          <svg className={styles.icono} viewBox="0 0 100 100" fill="none">
            <circle className={styles.circulo} cx="50" cy="50" r="45" stroke="#ffd60a" strokeWidth="3" />
            <line x1="50" y1="28" x2="50" y2="54" stroke="#ffd60a" strokeWidth="5" strokeLinecap="round"
              className={styles.linea} />
            <circle cx="50" cy="67" r="3.5" fill="#ffd60a" className={styles.punto} />
          </svg>
          <div className={styles.resplandor} />
        </div>

        <h1 className={styles.titulo}>Pago pendiente</h1>
        <p className={styles.subtitulo}>
          Tu pago está siendo procesado. Esto puede tardar unos minutos.
        </p>

        <div className={styles.infoBox}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcono}>📧</span>
            <span className={styles.infoTexto}>
              Recibirás un email cuando el pago sea confirmado
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcono}>🔄</span>
            <span className={styles.infoTexto}>
              Tu vehículo aparecerá en el Garage una vez aprobado
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcono}>⏱️</span>
            <span className={styles.infoTexto}>
              Los pagos en efectivo pueden demorar hasta 2 días hábiles
            </span>
          </div>
        </div>

        <div className={styles.botones}>
          <button
            className={styles.botonGarage}
            onClick={() => navigate('/garage')}
          >
            Ver mi Garage
          </button>
          <button
            className={styles.botonTienda}
            onClick={() => navigate('/tienda')}
          >
            Volver a la tienda
          </button>
        </div>

      </div>
    </div>
  )
}

export default PagoPendiente