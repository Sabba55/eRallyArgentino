import { useState, useMemo } from 'react'
import { Container } from 'react-bootstrap'
import TarjetaVehiculo from '../../componentes/vehiculos/TarjetaVehiculo'
import FiltrosTienda from './FiltrosTienda'
import ModalDetalleVehiculo from '../../componentes/vehiculos/ModalDetalleVehiculo'
import styles from './Tienda.module.css'


function Tienda() {
  // Datos de vehículos organizados por categoría
  const vehiculosPorCategoria = {
    "Rally2": {
      traccion: "4x4",
      color: "#00d4ff",
      vehiculos: [
        { id: 1, marca: "Toyota", nombre: "Yaris", foto: "/vehiculos/rally2/toyota-yaris.jpg", precioCompra: 80000, precioAlquiler: 12000 },
        { id: 2, marca: "Skoda", nombre: "Fabia RS", foto: "/vehiculos/rally2/skoda-fabia-rs.jpg", precioCompra: 80000, precioAlquiler: 12000 },
        { id: 3, marca: "Hyundai", nombre: "i20 N", foto: "/vehiculos/rally2/hyundai-i20-n.jpg", precioCompra: 75000, precioAlquiler: 11250 },
        { id: 4, marca: "Ford", nombre: "Fiesta", foto: "/vehiculos/rally2/ford-fiesta.jpg", precioCompra: 75000, precioAlquiler: 11250 },
        { id: 5, marca: "Citroen", nombre: "C3", foto: "/vehiculos/rally2/citroen-c3.jpg", precioCompra: 73000, precioAlquiler: 10950 },
        { id: 6, marca: "Skoda", nombre: "Fabia Evo", foto: "/vehiculos/rally2/skoda-fabia-evo.jpg", precioCompra: 73000, precioAlquiler: 10950 }
      ]
    },
    "R5": {
      traccion: "4x4",
      color: "#39ff14",
      vehiculos: [
        { id: 7, marca: "Skoda", nombre: "Fabia", foto: "/vehiculos/r5/skoda-fabia.jpg", precioCompra: 65000, precioAlquiler: 9750 },
        { id: 8, marca: "Vw", nombre: "Polo", foto: "/vehiculos/r5/vw-polo.jpg",  precioCompra: 65000, precioAlquiler: 9750 },
        { id: 9, marca: "Hyundai", nombre: "i20", foto: "/vehiculos/r5/hyundai-i20.jpg",  precioCompra: 61000, precioAlquiler: 9150 },
        { id: 10, marca: "Ford", nombre: "Fiesta", foto: "/vehiculos/r5/ford-fiesta.jpg",  precioCompra: 59000, precioAlquiler: 8850 }
      ]
    },
    "Rally3": {
      traccion: "4x4",
      color: "#ff6b00",
      vehiculos: [
        { id: 11, marca: "Ford", nombre: "Fiesta Evo", foto: "/vehiculos/rally3/ford-fiesta-evo.jpg",  precioCompra: 55000, precioAlquiler: 8250 },
        { id: 12, marca: "Renault", nombre: "Clio", foto: "/vehiculos/rally3/renault-clio.jpg",  precioCompra: 53000, precioAlquiler: 7950 }
      ]
    },
    "Rally4": {
      traccion: "FWD",
      color: "#ffd60a",
      vehiculos: [
        { id: 22, marca: "Peugeot", nombre: "208", foto: "/vehiculos/rally4/peugeot-208.jpg", precioCompra: 39000, precioAlquiler: 5850 },
        { id: 23, marca: "Renault", nombre: "Clio", foto: "/vehiculos/rally4/renault-clio.jpg", precioCompra: 38000, precioAlquiler: 5700 }
      ]
    },
    "Maxi Rally": {
      traccion: "4x4",
      color: "#9d4edd",
      vehiculos: [
        { id: 13, marca: "Maxi Rally", nombre: "Turbo", foto: "/vehiculos/maxi-rally/turbo.jpg", precioCompra: 52000, precioAlquiler: 7800 },
        { id: 14, marca: "Maxi Rally", nombre: "Aspirado", foto: "/vehiculos/maxi-rally/aspirado.jpg", precioCompra: 45000, precioAlquiler: 6750 }
      ]
    },
    "N4": {
      traccion: "4x4",
      color: "#e63946",
      vehiculos: [
        { id: 15, marca: "Vw", nombre: "Golf Proto", foto: "/vehiculos/n4/proto.jpg", precioCompra: 43000, precioAlquiler: 6450 },
        { id: 16, marca: "Mitsubishi", nombre: "Lancer Evo X", foto: "/vehiculos/n4/mitsubishi-lancer-evo-x.jpg", precioCompra: 40000, precioAlquiler: 6000 },
        { id: 17, marca: "Mitsubishi", nombre: "Lancer Evo IX", foto: "/vehiculos/n4/mitsubishi-lancer-evo-ix.jpg", precioCompra: 39000, precioAlquiler: 5850 },
        { id: 20, marca: "Mitsubishi", nombre: "Lancer Evo VI", foto: "/vehiculos/n4/mitsubishi-lancer-evo-vi.jpg", precioCompra: 35000, precioAlquiler: 5250 },
        { id: 18, marca: "Subaru", nombre: "Impreza", foto: "/vehiculos/n4/subaru-2008.jpg", precioCompra: 39000, precioAlquiler: 5850 },
        { id: 19, marca: "Subaru", nombre: "Impreza 2003", foto: "/vehiculos/n4/subaru-2003.jpg", precioCompra: 36000, precioAlquiler: 5400 },
        { id: 21, marca: "Subaru", nombre: "Impreza WRX", foto: "/vehiculos/n4/subaru-1998.jpg", precioCompra: 35000, precioAlquiler: 5250 }
      ]
    },
    "RC3": {
      traccion: "FWD",
      color: "#ff006e",
      vehiculos: [
        { id: 24, marca: "Junior", nombre: "Modelo Junior", foto: "/vehiculos/rc3/rc3.jpg", precioCompra: 37000, precioAlquiler: 5550 },
      ]
    },
    "A1": {
      traccion: "FWD",
      color: "#ff0037",
      vehiculos: [
        { id: 25, marca: "Vw", nombre: "Gol Trend", foto: "/vehiculos/a1/vw-gol-trend.jpg", precioCompra: 37000, precioAlquiler: 5550 },
        { id: 26, marca: "Vw", nombre: "Gol Power", foto: "/vehiculos/a1/gol-power.jpg", precioCompra: 35000, precioAlquiler: 5250 }
      ]
    },
    "N1": {
      traccion: "FWD",
      color: "#2a9d8f",
      vehiculos: [
        { id: 33, marca: "Ford", nombre: "Fiesta", foto: "/vehiculos/n1/ford-fiesta.jpg", precioCompra: 35000, precioAlquiler: 5250 },
        { id: 34, marca: "Vw", nombre: "Gol Trend", foto: "/vehiculos/n1/gol-trend.jpg", precioCompra: 33000, precioAlquiler: 4950 },
        { id: 35, marca: "Vw", nombre: "Gol Power", foto: "/vehiculos/n1/gol-power.jpg", precioCompra: 30000, precioAlquiler: 4500 }
      ]
    },
    "RC5": {
      traccion: "FWD",
      color: "#0077b6",
      vehiculos: [
        { id: 27, marca: "Peugeot", nombre: "208", foto: "/vehiculos/rc5/peugeot-208.jpg", precioCompra: 35000, precioAlquiler: 5250 },
        { id: 28, marca: "Ford", nombre: "Fiesta Kinetic", foto: "/vehiculos/rc5/ford-fiesta-kinetic.jpg", precioCompra: 33000, precioAlquiler: 4950 },
        { id: 29, marca: "Nissan", nombre: "March", foto: "/vehiculos/rc5/nissan-march.jpg", precioCompra: 32000, precioAlquiler: 4800 },
        { id: 30, marca: "Ford", nombre: "Ka Kinetic", foto: "/vehiculos/rc5/ford-ka-kinetic.jpg", precioCompra: 32000, precioAlquiler: 4800 },
        { id: 31, marca: "Vw", nombre: "Gol Trend", foto: "/vehiculos/rc5/gol-trend.jpg", precioCompra: 30000, precioAlquiler: 4500 },
        { id: 32, marca: "Ford", nombre: "Ka Viral", foto: "/vehiculos/rc5/ford-ka-viral.jpg", precioCompra: 30000, precioAlquiler: 4500 }
      ]
    }
  }

  const [modalAbierto, setModalAbierto] = useState(false)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null)
  const [tipoAccion, setTipoAccion] = useState('') // 'COMPRAR' o 'ALQUILAR'

  // Estado para los filtros
  const [filtrosActivos, setFiltrosActivos] = useState({
    categoria: 'todas',
    marca: 'todas',
    ordenarPor: 'default',
    busqueda: ''
  })

  // Función para aplicar filtros, búsqueda y ordenamiento
  const vehiculosFiltrados = useMemo(() => {
    let todosLosVehiculos = []

    // Convertir el objeto de categorías a un array plano de vehículos con metadata
    Object.entries(vehiculosPorCategoria).forEach(([categoria, data]) => {
      data.vehiculos.forEach(vehiculo => {
        todosLosVehiculos.push({
          ...vehiculo,
          categoria,
          traccion: data.traccion,
          colorCategoria: data.color
        })
      })
    })

    // Filtrar por categoría
    if (filtrosActivos.categoria !== 'todas') {
      todosLosVehiculos = todosLosVehiculos.filter(
        v => v.categoria === filtrosActivos.categoria
      )
    }

    // Filtrar por marca (NUEVO)
    if (filtrosActivos.marca !== 'todas') {
      todosLosVehiculos = todosLosVehiculos.filter(
        v => v.marca === filtrosActivos.marca
      )
    }

    // Filtrar por búsqueda
    if (filtrosActivos.busqueda.trim() !== '') {
      const busqueda = filtrosActivos.busqueda.toLowerCase()
      todosLosVehiculos = todosLosVehiculos.filter(v => 
        v.marca.toLowerCase().includes(busqueda) ||
        v.nombre.toLowerCase().includes(busqueda) ||
        `${v.marca} ${v.nombre}`.toLowerCase().includes(busqueda)
      )
    }

    // Ordenar (igual que antes)
    if (filtrosActivos.ordenarPor !== 'default') {
      const [campo, direccion] = filtrosActivos.ordenarPor.split('-')
      
      todosLosVehiculos.sort((a, b) => {
        let valorA, valorB

        if (campo === 'nombre') {
          valorA = `${a.marca} ${a.nombre}`.toLowerCase()
          valorB = `${b.marca} ${b.nombre}`.toLowerCase()
        } else {
          valorA = a[campo]
          valorB = b[campo]
        }

        if (direccion === 'asc') {
          return valorA > valorB ? 1 : -1
        } else {
          return valorA < valorB ? 1 : -1
        }
      })
    }

    return todosLosVehiculos
  }, [filtrosActivos])

  // Función que se ejecuta al hacer click en COMPRAR o ALQUILAR
  const manejarAccion = (vehiculo, tipo) => {
    setVehiculoSeleccionado(vehiculo)
    setTipoAccion(tipo)
    setModalAbierto(true)
  }

  return (
    <>
      <div className={styles.contenedorTienda}>
        <Container>
          
          {/* Filtros */}
          <FiltrosTienda 
            categorias={vehiculosPorCategoria}
            vehiculos={vehiculosFiltrados}
            onFiltrar={setFiltrosActivos}
            totalResultados={vehiculosFiltrados.length}
          />

          {/* Grid de vehículos o estado vacío */}
          {vehiculosFiltrados.length > 0 ? (
            <div className={styles.gridVehiculos}>
              {vehiculosFiltrados.map((vehiculo) => (
                <div key={vehiculo.id} className={styles.tarjetaAnimada}>
                  <TarjetaVehiculo
                    vehiculo={vehiculo}
                    categoria={vehiculo.categoria}
                    
                    colorCategoria={vehiculo.colorCategoria}
                    onComprar={() => manejarAccion(vehiculo, 'COMPRAR')}
                    onAlquilar={() => manejarAccion(vehiculo, 'ALQUILAR')}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.estadoVacio}>
              <svg 
                className={styles.iconoVacio} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className={styles.tituloVacio}>No se encontraron vehículos</h3>
              <p className={styles.textoVacio}>
                Intenta ajustar los filtros o realizar una búsqueda diferente
              </p>
            </div>
          )}

          <ModalDetalleVehiculo
            show={modalAbierto}
            onHide={() => setModalAbierto(false)}
            vehiculo={vehiculoSeleccionado}
            tipo={tipoAccion}
            categoria={vehiculoSeleccionado?.categoria}
            colorCategoria={vehiculoSeleccionado?.colorCategoria}
          />

        </Container>
      </div>
    </>
  )
}

export default Tienda