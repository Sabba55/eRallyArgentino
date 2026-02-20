import { useState, useEffect } from 'react'
import { Modal, Alert } from 'react-bootstrap'
import { X } from 'lucide-react'
import api from '../../config/api'
import styles from './ModalDetalleVehiculo.module.css'

function ModalDetalleVehiculo({ show, onHide, vehiculo, tipo, categoria, colorCategoria }) {
  // ========================================
  // ESTADOS
  // ========================================
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [cotizacionDolar, setCotizacionDolar] = useState(null)
  const [cargandoDolar, setCargandoDolar] = useState(true)
  const [rallies, setRallies] = useState([])
  const [cargandoRallies, setCargandoRallies] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [error, setError] = useState('')

  // ========================================
  // CARGAR RALLIES (SOLO PARA ALQUILERES)
  // ========================================
  useEffect(() => {
    const cargarRallies = async () => {
      if (show && tipo === 'ALQUILAR') {
        try {
          setCargandoRallies(true)
          
          // ✅ CONECTADO AL BACKEND
          const response = await api.get('/rallies/proximos')
          
          // Filtrar rallies que admitan la categoría del vehículo
          const categoriaVehiculo = vehiculo?.categorias?.[0]?.nombre
          
          let ralliesFiltrados = response.data.rallies
          
          if (categoriaVehiculo) {
            ralliesFiltrados = response.data.rallies.filter(rally => 
              rally.categorias?.some(cat => cat.nombre === categoriaVehiculo)
            )
          }
          
          setRallies(ralliesFiltrados)
          
        } catch (error) {
          console.error('Error al cargar rallies:', error)
          setError('Error al cargar las fechas de rally disponibles')
          setRallies([])
        } finally {
          setCargandoRallies(false)
        }
      }
    }

    cargarRallies()
  }, [show, tipo, vehiculo])

  // ========================================
  // CONSULTAR COTIZACIÓN DEL DÓLAR
  // ========================================
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
      // Resetear estados al abrir
      setFechaSeleccionada('')
      setError('')
    }
  }, [show])

  // ========================================
  // FORMATEAR PRECIO CON PUNTOS DE MILES
  // ========================================
  const formatearPrecio = (precio) => {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // ========================================
  // CALCULAR PRECIO EN USD CON COMISIONES
  // ========================================
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

  // ========================================
  // FORMATEAR FECHA PARA MOSTRAR
  // ========================================
  const formatearFechaRally = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  }

  // ========================================
  // MANEJAR PAGO
  // ========================================
  const manejarPago = async (metodoPago) => {
    try {
      setProcesandoPago(true)
      setError('')

      // Validar que se haya seleccionado fecha para alquileres
      if (tipo === 'ALQUILAR' && !fechaSeleccionada) {
        setError('Debes seleccionar una fecha de rally')
        setProcesandoPago(false)
        return
      }

      // Determinar endpoint según tipo y método
      let endpoint = ''
      let body = {}

      if (tipo === 'COMPRAR') {
        if (metodoPago === 'Mercado Pago') {
          endpoint = '/pagos/compras/mercadopago'
        } else {
          endpoint = '/pagos/compras/paypal'
        }
        body = { vehiculoId: vehiculo.id }
      } else {
        // ALQUILAR
        if (metodoPago === 'Mercado Pago') {
          endpoint = '/pagos/alquileres/mercadopago'
        } else {
          endpoint = '/pagos/alquileres/paypal'
        }
        body = { 
          vehiculoId: vehiculo.id,
          rallyId: parseInt(fechaSeleccionada)
        }
      }

      // Realizar petición al backend
      const response = await api.post(endpoint, body)

      // Redirigir a la URL de pago
      if (response.data.urlPago) {
        window.location.href = response.data.urlPago
      } else {
        setError('No se recibió la URL de pago. Intentá de nuevo.')
      }

    } catch (error) {
      console.error('Error al procesar pago:', error)
      
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError('Error al procesar el pago. Intentá de nuevo.')
      }
    } finally {
      setProcesandoPago(false)
    }
  }

  if (!vehiculo) return null

  // Determinar precio según tipo
  const precio = tipo === 'COMPRAR' ? vehiculo.precioCompra : vehiculo.precioAlquiler

  // Determinar si los botones deben estar habilitados
  const botonesHabilitados = !procesandoPago && (tipo === 'COMPRAR' || (tipo === 'ALQUILAR' && fechaSeleccionada !== ''))

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
          disabled={procesandoPago}
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

        {/* Alerta de error */}
        {error && (
          <Alert 
            variant="danger" 
            className={styles.alerta}
            onClose={() => setError('')}
            dismissible
          >
            {error}
          </Alert>
        )}
        
        {/* Selector de fecha (solo para alquileres) */}
        {tipo === 'ALQUILAR' && (
          <div className={styles.seccionFecha}>
            <label className={styles.labelFecha}>
              Seleccioná fecha del rally:
            </label>
            {cargandoRallies ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#00d4ff' }}>
                Cargando rallies...
              </div>
            ) : (
              <select 
                className={styles.selectFecha}
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                disabled={procesandoPago}
              >
                <option value="">Elegí una fecha</option>
                {rallies.map(rally => (
                  <option key={rally.id} value={rally.id}>
                    {formatearFechaRally(rally.fecha)} | {rally.campeonato} - {rally.nombre}
                  </option>
                ))}
              </select>
            )}
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
                {procesandoPago ? 'Procesando...' : `$${formatearPrecio(precio)}`}
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
                {procesandoPago ? 'Procesando...' : (cargandoDolar ? '...' : `USD ${calcularPrecioUSD(precio)}`)}
              </span>
            </button>

          </div>
        </div>

        {/* Texto aclarativo */}
        <p className={styles.textoAclarativo}>
          {tipo === 'COMPRAR' 
            ? 'Vigencia: 1 año desde la compra | Podés participar en todas las fechas'
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