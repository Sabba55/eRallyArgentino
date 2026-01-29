import { Carousel, Container, Row, Col } from 'react-bootstrap'
import styles from './Inicio.module.css'

// Importamos las 5 imágenes del carrusel
import carrusel0 from '../../assets/imagenes/carrusel/carrusel0.jpg'
import carrusel1 from '../../assets/imagenes/carrusel/carrusel1.jpg'
import carrusel2 from '../../assets/imagenes/carrusel/carrusel2.jpg'
import carrusel3 from '../../assets/imagenes/carrusel/carrusel3.jpg'
import carrusel4 from '../../assets/imagenes/carrusel/carrusel4.jpg'

function Inicio() {
  // Array con todas las imágenes del carrusel
  const imagenesCarrusel = [
    { src: carrusel0, alt: 'Rally Argentino 1' },
    { src: carrusel1, alt: 'Rally Argentino 2' },
    { src: carrusel2, alt: 'Rally Argentino 3' },
    { src: carrusel3, alt: 'Rally Argentino 4' },
    { src: carrusel4, alt: 'Rally Argentino 5' }
  ]

  return (
    <div className={styles.paginaInicio}>
      
      {/* Sección del Carrusel con título superpuesto */}
      <section className={styles.seccionCarrusel}>
        
        {/* Título superpuesto */}
        <div className={styles.tituloSuperpuesto}>
          <h1 className={styles.titulo}>¿Qué es eRally?</h1>
        </div>

        {/* Carrusel de imágenes */}
        <Carousel 
          fade 
          interval={5000} 
          className={styles.carrusel}
          controls={true}
          indicators={true}
        >
          {imagenesCarrusel.map((imagen, index) => (
            <Carousel.Item key={index}>
              <img
                className={styles.imagenCarrusel}
                src={imagen.src}
                alt={imagen.alt}
              />
              {/* Overlay oscuro para mejor contraste con el título */}
              <div className={styles.overlayOscuro}></div>
            </Carousel.Item>
          ))}
        </Carousel>

      </section>

      {/* Sección de información */}
      <section className={styles.seccionInfo}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={12}>
              
              {/* Descripción principal */}
              <div className={styles.descripcion}>
                <h2 className={styles.subtitulo}>
                  Sumérgete en la emoción del rally virtual
                </h2>
                <p className={styles.texto}>
                  Con eRally Argentino, podrás acceder a una amplia colección de mods 
                  de rally para juegos como Assetto Corsa. Experimentá la adrenalina y 
                  la emoción del rally argentino desde la comodidad de tu hogar.
                </p>
                <p className={styles.texto}>
                  Añadí nuevos autos, tramos y desafíos a tu juego favorito con nuestra 
                  selección de mods de alta calidad.
                </p>
              </div>

              {/* Características principales */}
              <Row className={styles.caracteristicas}>
                <Col md={4} className={styles.caracteristica}>
                  <div className={styles.icono}>🚘</div>
                  <h3>70+ Vehículos</h3>
                  <p>Amplio catálogo de autos de rally argentinos</p>
                </Col>
                <Col md={4} className={styles.caracteristica}>
                  <div className={styles.icono}>🗺️</div>
                  <h3>Tramos Reales</h3>
                  <p>Recorridos basados en el campeonato oficial</p>
                </Col>
                <Col md={4} className={styles.caracteristica}>
                  <div className={styles.icono}>🏆</div>
                  <h3>Competición</h3>
                  <p>Participá en el campeonato virtual</p>
                </Col>
              </Row>

              {/* Call to Action */}
              <div className={styles.cta}>
                <a href="/tienda" className={styles.btnPrincipal}>
                  Empezá a correr hoy
                </a>
                <a href="/fechas" className={styles.btnSecundario}>
                  Ver calendario
                </a>
              </div>

            </Col>
          </Row>
        </Container>
      </section>

    </div>
  )
}

export default Inicio