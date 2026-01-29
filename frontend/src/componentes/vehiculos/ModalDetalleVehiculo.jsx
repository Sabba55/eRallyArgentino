import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { X } from 'lucide-react'
import styles from './ModalDetalleVehiculo.module.css'

function ModalDetalleVehiculo({ show, onHide, vehiculo, tipo, categoria, colorCategoria }) {
  // Estado para la fecha seleccionada (solo para alquileres)
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  
  // Estado para la cotización del dólar
  const [cotizacionDolar, setCotizacionDolar] = useState(null)
  const [cargandoDolar, setCargandoDolar] = useState(true)

  // Rallies mock
  const rallies = [
    {
      id: 1,
      campeonato: "eRally",
      nombre: "Rally de Misiones",
      subtitulo: "Entre tierra y selva",
      fecha: "15/03/2026",
      fechaOriginal: "15/03/2026",
      contactos: { whatsapp: "3794123456", email: "info@rallymisiones.com" },
      categoriasHabilitadas: ["Rally2", "R5", "Rally3", "N4", "Maxi Rally"]
    },
    {
      id: 2,
      campeonato: "eRally",
      nombre: "Rally de Córdoba",
      subtitulo: "Entre sierras",
      fecha: "20/04/2026",
      fechaOriginal: "20/04/2026",
      contactos: { whatsapp: "3514567890", email: "info@rallycordoba.com" },
      categoriasHabilitadas: ["Rally2", "R5", "Rally3", "Rally4", "N4", "A1", "N1"]
    },
    {
      id: 3,
      campeonato: "CARV",
      nombre: "Rally Laguna Larga",
      subtitulo: "Viento y arena",
      fecha: "10/06/2026",
      fechaOriginal: "10/06/2026",
      contactos: { whatsapp: "2234445566", email: "info@rallycosta.com" },
      categoriasHabilitadas: ["Rally2", "R5", "Rally4", "RC3"]
    },
    {
      id: 4,
      campeonato: "VRally",
      nombre: "Rally de Cuyo",
      subtitulo: "Al pie de la cordillera",
      fecha: "25/07/2026",
      fechaOriginal: "25/07/2026",
      contactos: { whatsapp: "2614445566", email: "info@rallycuyo.com" },
      categoriasHabilitadas: ["Rally2", "R5", "Rally3", "N4", "Maxi Rally", "Rally4"]
    }
  ]

  // Filtrar rallies según categoría del vehículo
  const ralliesDisponibles = rallies.filter(rally => 
    rally.categoriasHabilitadas.includes(categoria)
  )

  // Consultar API del dólar blue al montar el componente
  useEffect(() => {
    const obtenerCotizacion = async () => {
      try {
        const response = await fetch('https://dolarapi.com/v1/dolares/blue')
        const data = await response.json()
        setCotizacionDolar(data.venta)
        setCargandoDolar(false)
      } catch (error) {
        console.error('Error al obtener cotización:', error)
        // Valor por defecto si falla
        setCotizacionDolar(1400)
        setCargandoDolar(false)
      }
    }

    if (show) {
      obtenerCotizacion()
      // Resetear fecha al abrir
      setFechaSeleccionada('')
    }
  }, [show])

  // Formatear precio con puntos de miles
  const formatearPrecio = (precio) => {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

    // Calcular precio en USD con comisiones de PayPal
    const calcularPrecioUSD = (precioARS) => {
    if (!cotizacionDolar) return '---'
    
    // Convertir ARS a USD
    const precioBase = precioARS / cotizacionDolar
    
    // Aplicar comisiones de PayPal: 5.40% + $0.30 USD
    const comisionVariable = precioBase * 0.054
    const comisionFija = 0.30
    const precioFinal = precioBase + comisionVariable + comisionFija
    
    return precioFinal.toFixed(2)
    }

  if (!vehiculo) return null

    // Ahora sí, calcular estas cosas:
    const precio = tipo === 'COMPRAR' ? vehiculo.precioCompra : vehiculo.precioAlquiler

    // Determinar si los botones deben estar habilitados
    const botonesHabilitados = tipo === 'COMPRAR' || (tipo === 'ALQUILAR' && fechaSeleccionada !== '')

    // Manejar click en botones de pago
    const manejarPago = (metodoPago) => {
    console.log(`Pago con ${metodoPago}:`, {
        vehiculo: `${vehiculo.marca} ${vehiculo.nombre}`,
        tipo,
        precio,
        fecha: fechaSeleccionada || 'N/A',
        metodoPago
    })
    // Acá después irá la redirección a WhatsApp
    }

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      className={styles.modalCustom}
      contentClassName={styles.modalContenido}
    >
      <div className={styles.contenedor}>
        
        {/* Botón cerrar */}
        <button 
          className={styles.btnCerrar}
          onClick={onHide}
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        {/* Foto del vehículo */}
        <div className={styles.contenedorFoto}>
          <img 
            src={vehiculo.foto} 
            alt={`${vehiculo.marca} ${vehiculo.nombre}`}
            className={styles.foto}
          />
          
          {/* Badge de categoría */}
          <span 
            className={styles.badgeCategoria}
            style={{ backgroundColor: colorCategoria }}
          >
            {categoria}
          </span>
        </div>

        {/* Nombre del vehículo */}
        <h2 className={styles.nombreVehiculo}>
          {vehiculo.marca} {vehiculo.nombre}
        </h2>
        
        {/* Selector de fecha (solo para alquileres) */}
        {tipo === 'ALQUILAR' && (
          <div className={styles.seccionFecha}>
            <label className={styles.labelFecha}>
              Seleccioná fecha del rally:
            </label>
            <select 
              className={styles.selectFecha}
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            >
              <option value="">Elegí una fecha</option>
              {ralliesDisponibles.map(rally => (
                <option key={rally.id} value={rally.id}>
                  {rally.fecha} | {rally.campeonato} - {rally.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sección de pagos */}
        <div className={styles.seccionPagos}>
          <p className={styles.tituloPagos}>Método de pago:</p>
          
          <div className={styles.contenedorBotonesPago}>
            
            {/* Botón Mercado Pago */}
            <button 
              className={`${styles.botonPago} ${styles.botonMP}`}
              onClick={() => manejarPago('Mercado Pago')}
              disabled={!botonesHabilitados}
            >
              <img 
                src="/logos/mercadopago.png" 
                alt="Mercado Pago"
                className={styles.logoPago}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <span className={styles.precioPago}>
                ${formatearPrecio(precio)}
              </span>
            </button>

            {/* Botón PayPal */}
            <button 
              className={`${styles.botonPago} ${styles.botonPayPal}`}
              onClick={() => manejarPago('PayPal')}
              disabled={!botonesHabilitados}
            >
              <img 
                src="/logos/paypal.png" 
                alt="PayPal"
                className={styles.logoPago}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <span className={styles.precioPago}>
                {cargandoDolar ? '...' : `USD ${calcularPrecioUSD(precio)}`}
              </span>
            </button>

          </div>
        </div>

        {/* Texto aclarativo */}
        <p className={styles.textoAclarativo}>
          {tipo === 'COMPRAR' 
            ? 'Vigencia: 1 año desde la compra | Podes participar en todas las fechas'
            : fechaSeleccionada 
              ? `Válido hasta la fecha del rally seleccionado`
              : 'Válido hasta la fecha del rally'
          }
        </p>

      </div>
    </Modal>
  )
}

export default ModalDetalleVehiculo