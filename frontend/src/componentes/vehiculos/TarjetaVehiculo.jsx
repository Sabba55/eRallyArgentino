import { Card } from 'react-bootstrap'
import styles from './TarjetaVehiculo.module.css'

function TarjetaVehiculo({ vehiculo, onComprar, onAlquilar, categoria, colorCategoria }) {
  // Generar placeholder dinámico con el nombre del vehículo
  const fotoSrc = vehiculo.foto 
    ? vehiculo.foto 
    : `https://via.placeholder.com/400x300/1a1a1a/00d4ff?text=${encodeURIComponent(vehiculo.marca + ' ' + vehiculo.nombre)}`

  // Obtener logo de la marca (optimizado con el nombre en minúsculas + .png)
  const logoMarca = `/icon/${vehiculo.marca.toLowerCase()}.png`
  
  // Formatear precio con puntos de miles
  const formatearPrecio = (precio) => {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  return (
    <Card className={styles.tarjeta}>
      
      {/* Foto del vehículo */}
      <div className={styles.contenedorFoto}>
        <Card.Img 
          variant="top" 
          src={fotoSrc} 
          alt={`${vehiculo.marca} ${vehiculo.nombre}`}
          className={styles.foto}
        />
        
        {/* Badges pegados al borde superior */}
        <div className={styles.contenedorBadges}>
          {/* Logo de marca - PRIMERO */}
          <div className={styles.logoMarca}>
            <img 
              src={logoMarca} 
              alt={`Logo ${vehiculo.marca}`}
              className={styles.imagenLogo}
              onError={(e) => {
                // Fallback si no existe el logo
                e.target.style.display = 'none'
              }}
            />
          </div>
          
          {/* Badge de categoría - SEGUNDO */}
          <span 
            className={styles.badgeCategoria}
            style={{ backgroundColor: colorCategoria }}
          >
            {categoria}
          </span>
        </div>
      </div>

      <Card.Body className={styles.cuerpo}>
        
        {/* Marca (pequeña, izquierda) */}
        <div className={styles.marca}>
          {vehiculo.marca}
        </div>

        {/* Nombre (más pequeño, centrado) */}
        <h3 className={styles.nombre}>
          {vehiculo.nombre}
        </h3>

        {/* Botones divididos - ocupan todo el ancho */}
        <div className={styles.contenedorBotones}>
          
          {/* Botón COMPRAR - Verde */}
          <button 
            className={`${styles.boton} ${styles.botonComprar}`}
            onClick={onComprar}
          >
            <div className={styles.contenidoBoton}>
              <div className={styles.textoBoton}>
                <span className={styles.tituloBoton}>Comprar</span>
                <span className={styles.precioBoton}>
                  ${formatearPrecio(vehiculo.precioCompra)}
                </span>
              </div>
            </div>
          </button>

          {/* Botón ALQUILAR - Amarillo */}
          <button 
            className={`${styles.boton} ${styles.botonAlquilar}`}
            onClick={onAlquilar}
          >
            <div className={styles.contenidoBoton}>
              <div className={styles.textoBoton}>
                <span className={styles.tituloBoton}>Alquilar</span>
                <span className={styles.precioBoton}>
                  ${formatearPrecio(vehiculo.precioAlquiler)}
                </span>
              </div>
            </div>
          </button>

        </div>

      </Card.Body>

    </Card>
  )
}

export default TarjetaVehiculo