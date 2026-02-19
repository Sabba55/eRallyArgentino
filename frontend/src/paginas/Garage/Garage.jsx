import { useState, useEffect } from 'react'
import { Container, Alert } from 'react-bootstrap'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../config/api'
import styles from './Garage.module.css'

function Garage() {
  // ========================================
  // ESTADOS
  // ========================================
  const [garage, setGarage] = useState({
    compras: [],
    alquileres: [],
    total: 0
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Estados para controlar si las secciones están expandidas
  const [compradosExpandido, setCompradosExpandido] = useState(true)
  const [alquiladosExpandido, setAlquiladosExpandido] = useState(true)

  // ========================================
  // CARGAR GARAGE DEL BACKEND
  // ========================================
  useEffect(() => {
    const cargarGarage = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await api.get('/usuarios/garage/mis-vehiculos')
        
        setGarage(response.data.garage)

      } catch (error) {
        console.error('Error al cargar garage:', error)
        setError('No se pudo cargar tu garage. Intentá de nuevo.')
      } finally {
        setCargando(false)
      }
    }

    cargarGarage()
  }, [])

  // ========================================
  // FORMATEAR FECHA DD/MM/AAAA
  // ========================================
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  }

  // ========================================
  // OBTENER COLOR SEGÚN DÍAS RESTANTES
  // ========================================
  const obtenerColorUrgencia = (dias) => {
    if (dias > 30) return '#39ff14' // Verde
    if (dias >= 7) return '#ffeb3b'  // Amarillo
    return '#ff4444'                  // Rojo
  }

  // ========================================
  // FORMATEAR TEXTO DE DÍAS RESTANTES
  // ========================================
  const formatearDiasRestantes = (dias) => {
    if (dias === 0) return 'ÚLTIMO DÍA'
    if (dias === 1) return '1 día restante'
    return `${dias} días restantes`
  }

  // ========================================
  // LOADING STATE
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedorGarage}>
        <Container>
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 0',
            color: '#00d4ff',
            fontSize: '1.5rem',
            fontFamily: 'Orbitron, Impact, sans-serif'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div className={styles.spinner}></div>
            </div>
            Cargando tu garage...
          </div>
        </Container>
      </div>
    )
  }

  // ========================================
  // ERROR STATE
  // ========================================
  if (error) {
    return (
      <div className={styles.contenedorGarage}>
        <Container>
          <Alert variant="danger" style={{ 
            marginTop: '2rem',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            border: '2px solid #dc3545',
            color: '#ff6b6b',
            borderRadius: '12px'
          }}>
            <h4>Error al cargar el garage</h4>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reintentar
            </button>
          </Alert>
        </Container>
      </div>
    )
  }

  // ========================================
  // ESTADO VACÍO
  // ========================================
  if (garage.total === 0) {
    return (
      <div className={styles.contenedorGarage}>
        <Container>
          <div className={styles.estadoVacio}>
            <h2 className={styles.tituloVacio}>Tu garage está vacío</h2>
            <p className={styles.textoVacio}>
              Todavía no compraste ni alquilaste ningún vehículo
            </p>
            <Link to="/tienda" className={styles.btnIrTienda}>
              Ir a la tienda
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  // ========================================
  // RENDER - GARAGE CON VEHÍCULOS
  // ========================================
  return (
    <div className={styles.contenedorGarage}>
      
      {/* Header con título y contador */}
      <div className={styles.header}>
        <Container>
          <div className={styles.contenidoHeader}>
            
            {/* Izquierda: Título */}
            <h1 className={styles.titulo}>TUS VEHÍCULOS</h1>

            {/* Derecha: Contador */}
            <div className={styles.controles}>
              <span className={styles.contador}>
                <strong>{garage.total}</strong> {garage.total === 1 ? 'Vehículo' : 'Vehículos'}
              </span>
            </div>

          </div>
        </Container>
      </div>

      {/* Vista Listado */}
      <Container>
        <div className={styles.vistaListado}>
            
          {/* SECCIÓN COMPRADOS */}
          {garage.compras.length > 0 && (
            <div className={styles.seccion}>
              <div 
                className={styles.encabezadoSeccion}
                onClick={() => setCompradosExpandido(!compradosExpandido)}
              >
                <h2 className={styles.tituloSeccion}>
                  COMPRADOS ({garage.compras.length})
                </h2>
                <button 
                  className={styles.botonColapsar}
                  aria-label={compradosExpandido ? "Ocultar vehículos comprados" : "Mostrar vehículos comprados"}
                >
                  {compradosExpandido ? (
                    <ChevronUp size={28} />
                  ) : (
                    <ChevronDown size={28} />
                  )}
                </button>
              </div>
              
              {compradosExpandido && (
                <div className={styles.gridTarjetas}>
                  {garage.compras.map((compra) => (
                    <div key={compra.id} className={styles.tarjeta}>
                      
                      {/* Foto */}
                      <div className={styles.contenedorFotoTarjeta}>
                        <img
                          src={compra.vehiculo.foto}
                          alt={`${compra.vehiculo.marca} ${compra.vehiculo.nombre}`}
                          className={styles.fotoTarjeta}
                        />
                      </div>

                      {/* Info */}
                      <div className={styles.cuerpoTarjeta}>
                        <h3 className={styles.nombreTarjeta}>
                          {compra.vehiculo.marca} {compra.vehiculo.nombre}
                        </h3>
                        
                        <div className={styles.infoTarjeta}>
                          <p className={styles.lineaInfo}>
                            <span className={styles.labelInfo}>Comprado:</span>
                            <span className={styles.valorInfo}>{formatearFecha(compra.fechaCompra)}</span>
                          </p>
                          <p className={styles.lineaInfo}>
                            <span className={styles.labelInfo}>Vence:</span>
                            <span className={styles.valorInfo}>{formatearFecha(compra.fechaVencimiento)}</span>
                          </p>
                          
                          {/* Contador de días */}
                          <div className={styles.contenedorContador}>
                            <div 
                              className={styles.contadorDias}
                              style={{ 
                                borderColor: obtenerColorUrgencia(compra.diasRestantes),
                                backgroundColor: `${obtenerColorUrgencia(compra.diasRestantes)}15`
                              }}
                            >
                              <svg 
                                className={styles.iconoReloj} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                style={{ color: obtenerColorUrgencia(compra.diasRestantes) }}
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                              </svg>
                              <span 
                                className={styles.textoContador}
                                style={{ color: obtenerColorUrgencia(compra.diasRestantes) }}
                              >
                                {formatearDiasRestantes(compra.diasRestantes)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN ALQUILADOS */}
          {garage.alquileres.length > 0 && (
            <div className={styles.seccion}>
              <div 
                className={styles.encabezadoSeccion}
                onClick={() => setAlquiladosExpandido(!alquiladosExpandido)}
              >
                <h2 className={styles.tituloSeccion}>
                  ALQUILADOS ({garage.alquileres.length})
                </h2>
                <button 
                  className={styles.botonColapsar}
                  aria-label={alquiladosExpandido ? "Ocultar vehículos alquilados" : "Mostrar vehículos alquilados"}
                >
                  {alquiladosExpandido ? (
                    <ChevronUp size={28} />
                  ) : (
                    <ChevronDown size={28} />
                  )}
                </button>
              </div>
              
              {alquiladosExpandido && (
                <div className={styles.gridTarjetas}>
                  {garage.alquileres.map((alquiler) => (
                    <div key={alquiler.id} className={styles.tarjeta}>
                      
                      {/* Foto */}
                      <div className={styles.contenedorFotoTarjeta}>
                        <img
                          src={alquiler.vehiculo.foto}
                          alt={`${alquiler.vehiculo.marca} ${alquiler.vehiculo.nombre}`}
                          className={styles.fotoTarjeta}
                        />
                      </div>

                      {/* Info */}
                      <div className={styles.cuerpoTarjeta}>
                        <h3 className={styles.nombreTarjeta}>
                          {alquiler.vehiculo.marca} {alquiler.vehiculo.nombre}
                        </h3>
                        
                        <div className={styles.infoTarjeta}>
                          <p className={styles.lineaInfo}>
                            <span className={styles.labelInfo}>Rally:</span>
                            <span className={styles.valorInfo}>{alquiler.rally.nombre}</span>
                          </p>
                          <p className={styles.lineaInfo}>
                            <span className={styles.labelInfo}>Fecha rally:</span>
                            <span className={styles.valorInfo}>{formatearFecha(alquiler.rally.fecha)}</span>
                          </p>
                          
                          {/* Contador de días */}
                          <div className={styles.contenedorContador}>
                            <div 
                              className={styles.contadorDias}
                              style={{ 
                                borderColor: obtenerColorUrgencia(alquiler.diasRestantes),
                                backgroundColor: `${obtenerColorUrgencia(alquiler.diasRestantes)}15`
                              }}
                            >
                              <svg 
                                className={styles.iconoReloj} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                style={{ color: obtenerColorUrgencia(alquiler.diasRestantes) }}
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                              </svg>
                              <span 
                                className={styles.textoContador}
                                style={{ color: obtenerColorUrgencia(alquiler.diasRestantes) }}
                              >
                                {formatearDiasRestantes(alquiler.diasRestantes)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </Container>

    </div>
  )
}

export default Garage