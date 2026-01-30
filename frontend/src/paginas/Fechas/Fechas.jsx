import { useState, useEffect, useMemo } from 'react'
import { Container } from 'react-bootstrap'
import styles from './Fechas.module.css'
import TarjetaFecha from '../../componentes/Fechas/TarjetaFecha'

const COLORES_CATEGORIAS = {
  "Rally2": "#00d4ff",
  "R5": "#39ff14",
  "Rally3": "#ff6b00",
  "Rally4": "#ffd60a",
  "Maxi Rally": "#9d4edd",
  "N4": "#e63946",
  "RC3": "#ff006e",
  "A1": "#ff0037",
  "N1": "#2a9d8f",
  "RC5": "#0077b6"
};

function Fechas() {
  // Datos mock de rallies
  const rallies = useMemo(() => [
    {
      id: 1,
      campeonato: "CARV",
      nombre: "Rally Argentina",
      subtitulo: "Sumate a correr los caminos mas iconicos de Argentina",
      fecha: "2026-03-15T10:00:00",
      fechaOriginal: "2026-03-15T10:00:00",
      logo: "/campeonatos/carv.png", // "/logos/erally.png" cuando tengás
      fotoBanner: null, // Usará foto genérica
      categoriasHabilitadas: ["Rally2", "R5", "Rally3", "Rally4"],
      contactos: { 
        whatsapp: "3794123456", 
        instagram: "info@rallyargentina.com",
      }
    },
    {
      id: 2,
      campeonato: "eRally Argentino",
      nombre: "Rally San Luis",
      subtitulo: "",
      fecha: "2026-04-20T10:00:00",
      fechaOriginal: "2026-04-20T10:00:00",
      logo: "/campeonatos/erally.png",
      fotoBanner: null,
      categoriasHabilitadas: ["Rally2", "R5", "Maxi Rally", "RC3", "Rally4", "RC5"],
      contactos: { 
        whatsapp: "3514567890", 
        email: "info@rallycordoba.com" 
      }
    },
    {
      id: 3,
      campeonato: "eRally Cordobes",
      nombre: "Rally Laguna Larga",
      subtitulo: "Viento y guadal",
      fecha: "2026-06-10T10:00:00",
      fechaOriginal: "2026-06-10T10:00:00",
      logo: null,
      fotoBanner: null,
      categoriasHabilitadas: ["Rally2", "R5", "Maxi Rally", "N4", "A1", "N1","RC5"],
      contactos: { 
        whatsapp: "2234445566", 
      }
    },
    {
      id: 4,
      campeonato: "VRally",
      nombre: "Rally Puntano",
      subtitulo: "",
      fecha: "2026-07-25T10:00:00",
      fechaOriginal: "2026-07-25T10:00:00",
      logo: "/campeonatos/vrally.png",
      fotoBanner: null,
      categoriasHabilitadas: ["RC3", "A1", "N1", "RC5"],
      contactos: { 
        whatsapp: "2614445566", 
        email: "info@rallycuyo.com" 
      }
    }
  ], [])

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    campeonato: 'todos',
    categoria: 'todas'
  })

  // Obtener próxima fecha
  const proximaFecha = useMemo(() => {
    const ahora = new Date()
    
    // Filtrar solo rallies futuros
    const proximos = rallies.filter(rally => 
      new Date(rally.fecha) > ahora
    )
    
    // Ordenar por fecha más cercana
    proximos.sort((a, b) => 
      new Date(a.fecha) - new Date(b.fecha)
    )
    
    return proximos[0] || null
  }, [])

  // Hook personalizado para countdown
  const useCuentaRegresiva = (fechaObjetivo) => {
    const [tiempoRestante, setTiempoRestante] = useState({
      dias: 0,
      horas: 0,
      minutos: 0,
      segundos: 0
    })

    useEffect(() => {
      if (!fechaObjetivo) return

      const calcularTiempo = () => {
        const ahora = new Date().getTime()
        const objetivo = new Date(fechaObjetivo).getTime()
        const diferencia = objetivo - ahora

        if (diferencia > 0) {
          setTiempoRestante({
            dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
            horas: Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutos: Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)),
            segundos: Math.floor((diferencia % (1000 * 60)) / 1000)
          })
        } else {
          setTiempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
        }
      }

      calcularTiempo()
      const intervalo = setInterval(calcularTiempo, 1000)

      return () => clearInterval(intervalo)
    }, [fechaObjetivo])

    return tiempoRestante
  }

  const countdown = useCuentaRegresiva(proximaFecha?.fecha)

  // Formatear fecha DD/MM/AAAA
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  }

  // Obtener campeonatos únicos
  const campeonatos = ['todos', ...new Set(rallies.map(r => r.campeonato))]

  // Obtener todas las categorías únicas
  const todasCategorias = new Set()
  rallies.forEach(rally => {
    rally.categoriasHabilitadas.forEach(cat => todasCategorias.add(cat))
  })
  const categorias = ['todas', ...Array.from(todasCategorias)]

  // Filtrar rallies según los filtros seleccionados
  const ralliesFiltrados = useMemo(() => {
    return rallies.filter(rally => {
      // Filtro por campeonato
      const cumpleCampeonato = filtros.campeonato === 'todos' || rally.campeonato === filtros.campeonato
      
      // Filtro por categoría
      const cumpleCategoria = filtros.categoria === 'todas' || 
                              rally.categoriasHabilitadas.includes(filtros.categoria)
      
      return cumpleCampeonato && cumpleCategoria
    })
  }, [filtros, rallies])

  // Foto de banner por defecto (parque de servicios rally)
  const fotoBannerDefault = "https://images.unsplash.com/photo-1721826799849-a1aedf14d442?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  
  return (
    <>
      <div className={styles.contenedorFechas}>
        
        {/* Banner principal con próxima fecha */}
        <section className={styles.bannerProximaFecha}>
          {/* Foto de fondo */}
          <div 
            className={styles.fondoBanner}
            style={{ 
              backgroundImage: `url(${proximaFecha?.fotoBanner || fotoBannerDefault})` 
            }}
          />
          
          {/* Overlay oscuro */}
          <div className={styles.overlayBanner} />

          {/* Contenido del banner */}
          <Container className={styles.contenidoBanner}>
            {proximaFecha ? (
              <div className={styles.contenedorPrincipal}>
                
                {/* Lado izquierdo - Logo o nombre del campeonato */}
                <div className={styles.ladoLogo}>
                  {proximaFecha.logo ? (
                    <img 
                      src={proximaFecha.logo} 
                      alt={proximaFecha.campeonato}
                      className={styles.logoRally}
                    />
                  ) : (
                    <div className={styles.nombreCampeonato}>
                      {proximaFecha.campeonato}
                    </div>
                  )}
                </div>

                {/* Lado derecho - Info y countdown */}
                <div className={styles.ladoInfo}>
                  <p className={styles.labelProxima}>PRÓXIMA FECHA</p>
                  <h1 className={styles.nombreRally}>{proximaFecha.nombre}</h1>
                  <p className={styles.fechaRally}>{formatearFecha(proximaFecha.fecha)}</p>
                  
                  {/* Countdown */}
                  <div className={styles.countdown}>
                    <div className={styles.cuadradoTiempo}>
                      <div className={styles.numeroTiempo}>
                        {String(countdown.dias).padStart(2, '0')}
                      </div>
                      <div className={styles.labelTiempo}>días</div>
                    </div>
                    <div className={styles.cuadradoTiempo}>
                      <div className={styles.numeroTiempo}>
                        {String(countdown.horas).padStart(2, '0')}
                      </div>
                      <div className={styles.labelTiempo}>hrs</div>
                    </div>
                    <div className={styles.cuadradoTiempo}>
                      <div className={styles.numeroTiempo}>
                        {String(countdown.minutos).padStart(2, '0')}
                      </div>
                      <div className={styles.labelTiempo}>min</div>
                    </div>
                    <div className={styles.cuadradoTiempo}>
                      <div className={styles.numeroTiempo}>
                        {String(countdown.segundos).padStart(2, '0')}
                      </div>
                      <div className={styles.labelTiempo}>seg</div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              // Sin próximas fechas
              <div className={styles.sinFechas}>
                <h2 className={styles.tituloSinFechas}>No hay próximas fechas programadas</h2>
                <p className={styles.textoSinFechas}>Quedate atento a las proximas fechas</p>
              </div>
            )}
          </Container>
        </section>

        {/* Filtros */}
        <Container>
          <div className={styles.contenedorFiltros}>
            
            {/* Filtro por campeonato */}
            <div className={styles.filtro}>
              <label className={styles.labelFiltro}>Campeonato</label>
              <select 
                className={styles.selectFiltro}
                value={filtros.campeonato}
                onChange={(e) => setFiltros({ ...filtros, campeonato: e.target.value })}
              >
                {campeonatos.map(camp => (
                  <option key={camp} value={camp}>
                    {camp === 'todos' ? 'Todos los campeonatos' : camp}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por categoría */}
            <div className={styles.filtro}>
              <label className={styles.labelFiltro}>Categoría</label>
              <select 
                className={styles.selectFiltro}
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'todas' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Container>

        {/* Tarjetas de rallies */}
        <Container>
          <div className={styles.contenedorTarjetas}>
            {ralliesFiltrados.length > 0 ? (
              ralliesFiltrados.map(rally => (
                <TarjetaFecha key={rally.id} rally={rally} colores={COLORES_CATEGORIAS} />
              ))
            ) : (
              <div className={styles.sinResultados}>
                <p>No se encontraron rallies con los filtros seleccionados</p>
              </div>
            )}
          </div>
        </Container>

      </div>
    </>
  )
}

export default Fechas