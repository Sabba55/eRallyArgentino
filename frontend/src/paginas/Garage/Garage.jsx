import { useMemo, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ChevronDown, ChevronUp } from 'lucide-react'
import styles from './Garage.module.css'

function Garage() {
  // Estados para controlar si las secciones están expandidas
  const [compradosExpandido, setCompradosExpandido] = useState(true)
  const [alquiladosExpandido, setAlquiladosExpandido] = useState(true)

  // DATOS MOCK - Simulación de vehículos del usuario
  const vehiculosUsuario = {
    comprados: [
      {
        id: 1,
        marca: "Toyota",
        nombre: "Yaris",
        categoria: "Rally2",
        colorCategoria: "#00d4ff",
        foto: "/vehiculos/rally2/toyota-yaris.jpg",
        logo: "/icon/toyota.png",
        fechaCompra: "2025-01-29T10:00:00",
        fechaVencimiento: "2026-01-29T10:00:00",
        tipo: "compra"
      },
      {
        id: 2,
        marca: "Ford",
        nombre: "Fiesta",
        categoria: "Rally2",
        colorCategoria: "#00d4ff",
        foto: "/vehiculos/rally2/ford-fiesta.jpg",
        logo: "/icon/ford.png",
        fechaCompra: "2025-07-20T10:00:00",
        fechaVencimiento: "2026-07-20T10:00:00",
        tipo: "compra"
      }
    ],
    alquilados: [
      {
        id: 3,
        marca: "Skoda",
        nombre: "Fabia",
        categoria: "R5",
        colorCategoria: "#39ff14",
        foto: "/vehiculos/r5/skoda-fabia.jpg",
        logo: "/icon/skoda.png",
        rally: {
          nombre: "Rally de Misiones",
          fecha: "2026-03-15T10:00:00"
        },
        fechaAlquiler: "2026-01-20T10:00:00",
        fechaVencimiento: "2026-03-15T10:00:00",
        tipo: "alquiler"
      },
      {
        id: 4,
        marca: "Subaru",
        nombre: "Impreza",
        categoria: "N4",
        colorCategoria: "#e63946",
        foto: "/vehiculos/n4/subaru-2008.jpg",
        logo: "/icon/subaru.png",
        rally: {
          nombre: "Rally de Córdoba",
          fecha: "2026-04-20T10:00:00"
        },
        fechaAlquiler: "2026-01-25T10:00:00",
        fechaVencimiento: "2026-04-20T10:00:00",
        tipo: "alquiler"
      }
    ]
  }

  // Calcular días restantes para un vehículo
  const calcularDiasRestantes = (fechaVencimiento) => {
    const ahora = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = vencimiento - ahora
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    return dias
  }

  // Filtrar vehículos vencidos (días < 0)
  const vehiculosCompradosActivos = useMemo(() => {
    return vehiculosUsuario.comprados.filter(v => 
      calcularDiasRestantes(v.fechaVencimiento) >= 0
    )
  }, [])

  const vehiculosAlquiladosActivos = useMemo(() => {
    return vehiculosUsuario.alquilados.filter(v => 
      calcularDiasRestantes(v.fechaVencimiento) >= 0
    )
  }, [])

  // Calcular total de vehículos activos
  const totalVehiculos = useMemo(() => {
    return vehiculosCompradosActivos.length + vehiculosAlquiladosActivos.length
  }, [vehiculosCompradosActivos, vehiculosAlquiladosActivos])

  // Formatear fecha DD/MM/AAAA
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  }

  // Obtener color según días restantes
  const obtenerColorUrgencia = (dias) => {
    if (dias > 30) return '#39ff14' // Verde
    if (dias >= 7) return '#ffeb3b'  // Amarillo
    return '#ff4444'                  // Rojo
  }

  // Formatear el texto de días restantes
  const formatearDiasRestantes = (dias) => {
    if (dias === 0) return 'ÚLTIMO DÍA'
    if (dias === 1) return '1 día restante'
    return `${dias} días restantes`
  }

  // Si no hay vehículos, mostrar mensaje vacío
  if (totalVehiculos === 0) {
    return (
      <div className={styles.contenedorGarage}>
        <Container>
          <div className={styles.estadoVacio}>
            <h2 className={styles.tituloVacio}>Tu garage está vacío</h2>
            <a href="/tienda" className={styles.btnIrTienda}>
              Ir a la tienda
            </a>
          </div>
        </Container>
      </div>
    )
  }

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
                <strong>{totalVehiculos}</strong> {totalVehiculos === 1 ? 'Vehiculo' : 'Vehiculos'}
              </span>
            </div>

          </div>
        </Container>
      </div>

      {/* ========================================
          VISTA LISTADO
          ======================================== */}
      <Container>
        <div className={styles.vistaListado}>
            
            {/* SECCIÓN COMPRADOS */}
            {vehiculosCompradosActivos.length > 0 && (
              <div className={styles.seccion}>
                <div 
                  className={styles.encabezadoSeccion}
                  onClick={() => setCompradosExpandido(!compradosExpandido)}
                >
                  <h2 className={styles.tituloSeccion}>
                    COMPRADOS ({vehiculosCompradosActivos.length})
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
                    {vehiculosCompradosActivos.map((vehiculo) => {
                      const diasRestantes = calcularDiasRestantes(vehiculo.fechaVencimiento)
                      return (
                        <div key={vehiculo.id} className={styles.tarjeta}>
                          
                          {/* Foto */}
                          <div className={styles.contenedorFotoTarjeta}>
                            <img
                              src={vehiculo.foto}
                              alt={`${vehiculo.marca} ${vehiculo.nombre}`}
                              className={styles.fotoTarjeta}
                            />
                            
                            {/* Badges */}
                            <div className={styles.contenedorBadges}>
                              <div className={styles.logoMarca}>
                                <img
                                  src={vehiculo.logo}
                                  alt={vehiculo.marca}
                                  className={styles.imagenLogoTarjeta}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                              <span
                                className={styles.badgeCategoriaTarjeta}
                                style={{ backgroundColor: vehiculo.colorCategoria }}
                              >
                                {vehiculo.categoria}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className={styles.cuerpoTarjeta}>
                            <h3 className={styles.nombreTarjeta}>
                              {vehiculo.marca} {vehiculo.nombre}
                            </h3>
                            
                            <div className={styles.infoTarjeta}>
                              <p className={styles.lineaInfo}>
                                <span className={styles.labelInfo}>Comprado:</span>
                                <span className={styles.valorInfo}>{formatearFecha(vehiculo.fechaCompra)}</span>
                              </p>
                              <p className={styles.lineaInfo}>
                                <span className={styles.labelInfo}>Vence:</span>
                                <span className={styles.valorInfo}>{formatearFecha(vehiculo.fechaVencimiento)}</span>
                              </p>
                              
                              {/* Contador mejorado */}
                              <div className={styles.contenedorContador}>
                                <div 
                                  className={styles.contadorDias}
                                  style={{ 
                                    borderColor: obtenerColorUrgencia(diasRestantes),
                                    backgroundColor: `${obtenerColorUrgencia(diasRestantes)}15`
                                  }}
                                >
                                  <svg 
                                    className={styles.iconoReloj} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    style={{ color: obtenerColorUrgencia(diasRestantes) }}
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
                                    style={{ color: obtenerColorUrgencia(diasRestantes) }}
                                  >
                                    {formatearDiasRestantes(diasRestantes)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN ALQUILADOS */}
            {vehiculosAlquiladosActivos.length > 0 && (
              <div className={styles.seccion}>
                <div 
                  className={styles.encabezadoSeccion}
                  onClick={() => setAlquiladosExpandido(!alquiladosExpandido)}
                >
                  <h2 className={styles.tituloSeccion}>
                    ALQUILADOS ({vehiculosAlquiladosActivos.length})
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
                    {vehiculosAlquiladosActivos.map((vehiculo) => {
                      const diasRestantes = calcularDiasRestantes(vehiculo.fechaVencimiento)
                      return (
                        <div key={vehiculo.id} className={styles.tarjeta}>
                          
                          {/* Foto */}
                          <div className={styles.contenedorFotoTarjeta}>
                            <img
                              src={vehiculo.foto}
                              alt={`${vehiculo.marca} ${vehiculo.nombre}`}
                              className={styles.fotoTarjeta}
                            />
                            
                            {/* Badges */}
                            <div className={styles.contenedorBadges}>
                              <div className={styles.logoMarca}>
                                <img
                                  src={vehiculo.logo}
                                  alt={vehiculo.marca}
                                  className={styles.imagenLogoTarjeta}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                              <span
                                className={styles.badgeCategoriaTarjeta}
                                style={{ backgroundColor: vehiculo.colorCategoria }}
                              >
                                {vehiculo.categoria}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className={styles.cuerpoTarjeta}>
                            <h3 className={styles.nombreTarjeta}>
                              {vehiculo.marca} {vehiculo.nombre}
                            </h3>
                            
                            <div className={styles.infoTarjeta}>
                              <p className={styles.lineaInfo}>
                                <span className={styles.labelInfo}>Rally:</span>
                                <span className={styles.valorInfo}>{vehiculo.rally.nombre}</span>
                              </p>
                              <p className={styles.lineaInfo}>
                                <span className={styles.labelInfo}>Fecha rally:</span>
                                <span className={styles.valorInfo}>{formatearFecha(vehiculo.rally.fecha)}</span>
                              </p>
                              
                              {/* Contador mejorado */}
                              <div className={styles.contenedorContador}>
                                <div 
                                  className={styles.contadorDias}
                                  style={{ 
                                    borderColor: obtenerColorUrgencia(diasRestantes),
                                    backgroundColor: `${obtenerColorUrgencia(diasRestantes)}15`
                                  }}
                                >
                                  <svg 
                                    className={styles.iconoReloj} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    style={{ color: obtenerColorUrgencia(diasRestantes) }}
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
                                    style={{ color: obtenerColorUrgencia(diasRestantes) }}
                                  >
                                    {formatearDiasRestantes(diasRestantes)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      )
                    })}
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