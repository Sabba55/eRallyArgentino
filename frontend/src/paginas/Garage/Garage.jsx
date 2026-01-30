import { useMemo } from 'react'
import { Container } from 'react-bootstrap'
import styles from './Garage.module.css'

function Garage() {

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
        fechaCompra: "2025-01-15T10:00:00",
        fechaVencimiento: "2026-01-15T10:00:00",
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

  // Calcular total de vehículos
  const totalVehiculos = useMemo(() => {
    return vehiculosUsuario.comprados.length + vehiculosUsuario.alquilados.length
  }, [])

  // Calcular días restantes para un vehículo
  const calcularDiasRestantes = (fechaVencimiento) => {
    const ahora = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = vencimiento - ahora
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    return dias > 0 ? dias : 0
  }

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

  // Si no hay vehículos, mostrar mensaje vacío
  if (totalVehiculos === 0) {
    return (
      <div className={styles.contenedorGarage}>
        <Container>
          <div className={styles.estadoVacio}>
            <div className={styles.iconoVacio}>🏎️</div>
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
            {vehiculosUsuario.comprados.length > 0 && (
              <div className={styles.seccion}>
                <h2 className={styles.tituloSeccion}>
                  COMPRADOS ({vehiculosUsuario.comprados.length})
                </h2>
                <div className={styles.gridTarjetas}>
                  {vehiculosUsuario.comprados.map((vehiculo) => {
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
                            <div
                              className={styles.diasRestantesTarjeta}
                              style={{ color: obtenerColorUrgencia(diasRestantes) }}
                            >
                              ⏱️ {diasRestantes} días restantes
                            </div>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SECCIÓN ALQUILADOS */}
            {vehiculosUsuario.alquilados.length > 0 && (
              <div className={styles.seccion}>
                <h2 className={styles.tituloSeccion}>
                  ALQUILADOS ({vehiculosUsuario.alquilados.length})
                </h2>
                <div className={styles.gridTarjetas}>
                  {vehiculosUsuario.alquilados.map((vehiculo) => {
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
                            <div
                              className={styles.diasRestantesTarjeta}
                              style={{ color: obtenerColorUrgencia(diasRestantes) }}
                            >
                              ⏱️ {diasRestantes} días restantes
                            </div>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </Container>

    </div>
  )
}

export default Garage