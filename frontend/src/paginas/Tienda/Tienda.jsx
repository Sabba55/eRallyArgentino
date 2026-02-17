import { useState, useMemo, useEffect } from 'react'
import { Container, Alert } from 'react-bootstrap'
import TarjetaVehiculo from '../../componentes/vehiculos/TarjetaVehiculo'
import FiltrosTienda from './FiltrosTienda'
import ModalDetalleVehiculo from '../../componentes/vehiculos/ModalDetalleVehiculo'
import api from '../../config/api'
import styles from './Tienda.module.css'

function Tienda() {
  // ========================================
  // ESTADOS
  // ========================================
  const [vehiculos, setVehiculos] = useState([])
  const [categorias, setCategorias] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

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

  // ========================================
  // CARGAR VEHÍCULOS DEL BACKEND
  // ========================================
  useEffect(() => {
    const cargarVehiculos = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await api.get('/vehiculos', {
          params: {
            disponible: true, // Solo vehículos disponibles
            limite: 200 // Cargar todos
          }
        })

        setVehiculos(response.data.vehiculos)
        
        // Organizar categorías (para el filtro)
        const categoriasMap = {}
        response.data.vehiculos.forEach(vehiculo => {
          if (vehiculo.categorias && vehiculo.categorias.length > 0) {
            vehiculo.categorias.forEach(cat => {
              if (!categoriasMap[cat.nombre]) {
                categoriasMap[cat.nombre] = {
                  color: cat.color,
                  descripcion: cat.descripcion
                }
              }
            })
          }
        })
        setCategorias(categoriasMap)

      } catch (error) {
        console.error('Error al cargar vehículos:', error)
        setError('No se pudieron cargar los vehículos. Intentá de nuevo.')
      } finally {
        setCargando(false)
      }
    }

    cargarVehiculos()
  }, [])

  // ========================================
  // FUNCIÓN PARA APLICAR FILTROS
  // ========================================
  const vehiculosFiltrados = useMemo(() => {
    let resultado = [...vehiculos]

    // Filtrar por categoría
    if (filtrosActivos.categoria !== 'todas') {
      resultado = resultado.filter(v => 
        v.categorias?.some(cat => cat.nombre === filtrosActivos.categoria)
      )
    }

    // Filtrar por marca
    if (filtrosActivos.marca !== 'todas') {
      resultado = resultado.filter(v => v.marca === filtrosActivos.marca)
    }

    // Filtrar por búsqueda
    if (filtrosActivos.busqueda.trim() !== '') {
      const busqueda = filtrosActivos.busqueda.toLowerCase()
      resultado = resultado.filter(v => 
        v.marca.toLowerCase().includes(busqueda) ||
        v.nombre.toLowerCase().includes(busqueda) ||
        `${v.marca} ${v.nombre}`.toLowerCase().includes(busqueda)
      )
    }

    // Ordenar
    if (filtrosActivos.ordenarPor !== 'default') {
      const [campo, direccion] = filtrosActivos.ordenarPor.split('-')
      
      resultado.sort((a, b) => {
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

    return resultado
  }, [vehiculos, filtrosActivos])

  // ========================================
  // FUNCIÓN AL HACER CLICK EN COMPRAR/ALQUILAR
  // ========================================
  const manejarAccion = (vehiculo, tipo) => {
    setVehiculoSeleccionado(vehiculo)
    setTipoAccion(tipo)
    setModalAbierto(true)
  }

  // ========================================
  // RENDER - LOADING
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedorTienda}>
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
            Cargando vehículos...
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
      <div className={styles.contenedorTienda}>
        <Container>
          <Alert variant="danger" style={{ 
            marginTop: '2rem',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            border: '2px solid #dc3545',
            color: '#ff6b6b',
            borderRadius: '12px'
          }}>
            <h4>Error al cargar la tienda</h4>
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
  // RENDER - TIENDA
  // ========================================
  return (
    <>
      <div className={styles.contenedorTienda}>
        <Container>
          
          {/* Filtros */}
          <FiltrosTienda 
            categorias={categorias}
            vehiculos={vehiculosFiltrados}
            onFiltrar={setFiltrosActivos}
            totalResultados={vehiculosFiltrados.length}
          />

          {/* Grid de vehículos o estado vacío */}
          {vehiculosFiltrados.length > 0 ? (
            <div className={styles.gridVehiculos}>
              {vehiculosFiltrados.map((vehiculo) => {
                // Obtener primera categoría para mostrar
                const categoria = vehiculo.categorias?.[0]
                
                return (
                  <div key={vehiculo.id} className={styles.tarjetaAnimada}>
                    <TarjetaVehiculo
                      vehiculo={vehiculo}
                      categoria={categoria?.nombre || 'Sin categoría'}
                      colorCategoria={categoria?.color || '#666'}
                      onComprar={() => manejarAccion(vehiculo, 'COMPRAR')}
                      onAlquilar={() => manejarAccion(vehiculo, 'ALQUILAR')}
                    />
                  </div>
                )
              })}
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

          {/* Modal de detalle */}
          <ModalDetalleVehiculo
            show={modalAbierto}
            onHide={() => setModalAbierto(false)}
            vehiculo={vehiculoSeleccionado}
            tipo={tipoAccion}
            categoria={vehiculoSeleccionado?.categorias?.[0]?.nombre}
            colorCategoria={vehiculoSeleccionado?.categorias?.[0]?.color}
          />

        </Container>
      </div>
    </>
  )
}

export default Tienda