import { Container } from 'react-bootstrap'
import styles from './Navegantes.module.css'
import imagenNavegantes from '../../assets/imagenes/navegantes.png'

function Navegantes() {
  // Link de descarga al Drive
  const linkDescarga = "https://drive.google.com/file/d/1BAR_DWlhaboBQa1xeoI-LIOjdLbxxbBo/view" 

  return (
    <div className={styles.contenedorNavegantes}>
      <Container>
        
        {/* Contenedor principal dividido en dos */}
        <div className={styles.contenedorPrincipal}>
          
          {/* DIV IZQUIERDA - Imagen y botón de descarga */}
          <div className={styles.divIzquierda}>
            
            {/* Foto del navegante */}
            <div className={styles.contenedorImagen}>
              <img 
                src={imagenNavegantes} 
                alt="Mod Codriver - Navegante Virtual"
                className={styles.imagen}
              />
            </div>

            {/* Botón de descarga */}
            <div className={styles.contenedorBoton}>
              <a 
                href={linkDescarga}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.botonDescarga}
              >
                <svg 
                  className={styles.iconoDescarga} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
                  />
                </svg>
                Descargar Copilotos
              </a>
            </div>

          </div>

          {/* DIV DERECHA - Guía de instalación */}
          <div className={styles.divDerecha}>
            
            {/* Título */}
            <h2 className={styles.titulo}>¿Cómo Instalar?</h2>

            {/* Lista de pasos */}
            <ol className={styles.listaInstrucciones}>
              
              <li className={styles.paso}>
                <span className={styles.numeroPaso}>1</span>
                <p className={styles.textoPaso}>
                  Descargá el archivo Mod Codriver
                </p>
              </li>

              <li className={styles.paso}>
                <span className={styles.numeroPaso}>2</span>
                <p className={styles.textoPaso}>
                  Descomprimí el archivo descargado.
                </p>
              </li>

              <li className={styles.paso}>
                <span className={styles.numeroPaso}>3</span>
                <p className={styles.textoPaso}>
                  Ejecutá el archivo "Setup" y seguí las instrucciones de instalación.
                </p>
              </li>

              <li className={styles.paso}>
                <span className={styles.numeroPaso}>4</span>
                <p className={styles.textoPaso}>
                  Asegurate de instalar Codriver en la raíz del directorio de Assetto Corsa. 
                  Si no estás seguro de dónde está ubicado el directorio, podés verificar la 
                  ruta de instalación en las propiedades del juego.
                </p>
              </li>

              <li className={styles.paso}>
                <span className={styles.numeroPaso}>5</span>
                <p className={styles.textoPaso}>
                  Abrí Content Manager.
                </p>
              </li>

              <li className={styles.paso}>
                <span className={styles.numeroPaso}>6</span>
                <p className={styles.textoPaso}>
                  Andá a Opciones → Apps.
                </p>
              </li>

              <li className={styles.paso}>
                <span className={styles.numeroPaso}>7</span>
                <p className={styles.textoPaso}>
                  Marcá las casillas de verificación junto a "Codriver".
                </p>
              </li>

            </ol>

            {/* Mensaje final */}
            <div className={styles.mensajeFinal}>
              <p className={styles.textoFinal}>
                ¡Ya estás listo! Codriver debería estar instalado y funcionando correctamente.
              </p>
              <p className={styles.textoDestacado}>
                Disfrutá de la experiencia de rally con las notas de tu copiloto virtual.
              </p>
            </div>

          </div>

        </div>

      </Container>
    </div>
  )
}

export default Navegantes