import styles from './Footer.module.css'
import logo from '../../assets/imagenes/erally-logo.png'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Logo a la izquierda */}
        <div className={styles.logoSection}>
          <img 
            src={logo} 
            alt="eRally Argentino" 
            className={styles.logo}
          />
        </div>

        {/* Espacio para patrocinadores a la derecha (vacío por ahora) */}
        <div className={styles.patrocinadoresSection}>
          {/* Este espacio está reservado para futuros patrocinadores */}
        </div>

      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <p>Desarrollado por Martin Sabbatini | Copyright © {new Date().getFullYear()} | Soporte: +54 9 3513977714</p>
      </div>
    </footer>
  )
}

export default Footer