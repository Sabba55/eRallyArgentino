import { useState, useEffect, useMemo } from 'react'
import { Container } from 'react-bootstrap'
import api from '../../config/api'
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
  // ========================================
  // ESTADOS
  // ========================================
  const [rallies, setRallies] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    campeonato: 'todos',
    categoria: 'todas'
  })

  // ========================================
  // CARGAR RALLIES DESDE EL BACKEND
  // ========================================
  useEffect(() => {
    cargarRallies()
  }, [])

  const cargarRallies = async () => {
    try {
      setCargando(true)
      setError('')

      // Obtener rallies próximos del backend
      const response = await api.get('/rallies', {
        params: {
          estado: 'proximos', // Solo próximos
          limite: 200
        }
      })

      // Adaptar formato del backend al formato que espera el componente
      const ralliesAdaptados = response.data.rallies.map(rally => ({
        id: rally.id,
        campeonato: rally.campeonato,
        nombre: rally.nombre,
        subtitulo: rally.subtitulo || '',
        fecha: rally.fecha,
        fechaOriginal: rally.fechaOriginal,
        logo: rally.logo,
        fotoBanner: null, // El backend no tiene este campo por ahora
        categoriasHabilitadas: rally.categorias?.map(cat => cat.nombre) || [],
        contactos: rally.contactos || {}
      }))

      setRallies(ralliesAdaptados)
    } catch (err) {
      console.error('Error al cargar rallies:', err)
      setError('Error al cargar las fechas. Intenta de nuevo más tarde.')
    } finally {
      setCargando(false)
    }
  }

  // ========================================
  // OBTENER PRÓXIMA FECHA
  // ========================================
  const proximaFecha = useMemo(() => {
    if (rallies.length === 0) return null
    
    const ahora = new Date()
    
    // Filtrar solo rallies futuros y ordenar por fecha más cercana
    const proximos = rallies
      .filter(rally => new Date(rally.fecha) > ahora)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    
    return proximos[0] || null
  }, [rallies])

  // ========================================
  // COUNTDOWN HOOK
  // ========================================
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

  // ========================================
  // FORMATEAR FECHA Y HORA
  // ========================================
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  }

  const formatearHora = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const horas = String(fecha.getHours()).padStart(2, '0')
    const minutos = String(fecha.getMinutes()).padStart(2, '0')
    return `${horas}:${minutos}`
  }

  // ========================================
  // OBTENER OPCIONES DE FILTROS
  // ========================================
  const campeonatos = useMemo(() => {
    return ['todos', ...new Set(rallies.map(r => r.campeonato))]
  }, [rallies])

  const categorias = useMemo(() => {
    const todasCategorias = new Set()
    rallies.forEach(rally => {
      rally.categoriasHabilitadas.forEach(cat => todasCategorias.add(cat))
    })
    return ['todas', ...Array.from(todasCategorias)]
  }, [rallies])

  // ========================================
  // FILTRAR RALLIES
  // ========================================
  const ralliesFiltrados = useMemo(() => {
    return rallies.filter(rally => {
      const cumpleCampeonato = filtros.campeonato === 'todos' || rally.campeonato === filtros.campeonato
      const cumpleCategoria = filtros.categoria === 'todas' || 
                              rally.categoriasHabilitadas.includes(filtros.categoria)
      return cumpleCampeonato && cumpleCategoria
    })
  }, [filtros, rallies])

  // Foto de banner por defecto
  const fotoBannerDefault = "https://images.unsplash.com/photo-1721826799849-a1aedf14d442?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  
  // ========================================
  // RENDER - CARGANDO
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedorFechas}>
        <Container>
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem', 
            color: '#00d4ff',
            fontSize: '1.2rem'
          }}>
            Cargando fechas...
          </div>
        </Container>
      </div>
    )
  }

  // ========================================
  // RENDER - ERROR
  // ========================================
  if (error) {
    return (
      <div className={styles.contenedorFechas}>
        <Container>
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem', 
            color: '#ff6b6b',
            fontSize: '1.1rem',
            background: 'rgba(220, 53, 69, 0.1)',
            borderRadius: '10px',
            border: '2px solid #dc3545'
          }}>
            {error}
          </div>
        </Container>
      </div>
    )
  }

  // ========================================
  // RENDER - CONTENIDO
  // ========================================
  return (
    <div className={styles.contenedorFechas}>
      
      {/* Banner principal con próxima fecha */}
      <section className={styles.bannerProximaFecha}>
        <div 
          className={styles.fondoBanner}
          style={{ 
            backgroundImage: `url(${proximaFecha?.fotoBanner || fotoBannerDefault})` 
          }}
        />
        
        <div className={styles.overlayBanner} />

        <Container className={styles.contenidoBanner}>
          {proximaFecha ? (
            <div className={styles.contenedorPrincipal}>
              
              {/* Lado izquierdo - Logo o nombre */}
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
                <p className={styles.fechaRally}>
                  {formatearHora(proximaFecha.fecha)} | {formatearFecha(proximaFecha.fecha)}
                </p>         
                       
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
            <div className={styles.sinFechas}>
              <h2 className={styles.tituloSinFechas}>No hay próximas fechas programadas</h2>
              <p className={styles.textoSinFechas}>Quedate atento a las próximas fechas</p>
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
  )
}

export default Fechas