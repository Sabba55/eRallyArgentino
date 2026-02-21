import { useState, useEffect } from 'react'
import { Modal, Alert } from 'react-bootstrap'
import { X } from 'lucide-react'
import api from '../../config/api'
import styles from './ModalDetalleVehiculo.module.css'

function ModalDetalleVehiculo({ show, onHide, vehiculo, tipo, categoria, colorCategoria }) {

  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [rallies, setRallies] = useState([])
  const [cargandoRallies, setCargandoRallies] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [error, setError] = useState('')

  // ✅ NUEVO — reemplaza cotizacionDolar + calcularPrecioUSD
  const [precios, setPrecios] = useState(null)
  const [cargandoPrecios, setCargandoPrecios] = useState(true)

  // ========================================
  // CARGAR PRECIOS DESDE EL BACKEND
  // Incluye ARS, USD ya con comisiones PayPal calculadas
  // ========================================
  useEffect(() => {
    const cargarPrecios = async () => {
      if (!show || !vehiculo) return
      try {
        setCargandoPrecios(true)
        const response = await api.get(`/pagos/precios/${vehiculo.id}`)
        setPrecios(response.data)
      } catch (err) {
        console.error('Error al obtener precios:', err)
        // Si falla el endpoint, los botones de USD muestran '---'
        setPrecios(null)
      } finally {
        setCargandoPrecios(false)
      }
    }
    cargarPrecios()
  }, [show, vehiculo])

  // ========================================
  // CARGAR RALLIES (SOLO PARA ALQUILERES)
  // ========================================
  useEffect(() => {
    const cargarRallies = async () => {
      if (!show || tipo !== 'ALQUILAR' || !vehiculo) return
      try {
        setCargandoRallies(true)
        setError('')
        const response = await api.get('/rallies/proximos')
        const todosLosRallies = response.data.rallies || []
        const categoriasVehiculo = vehiculo?.categorias?.map(cat => cat.nombre) || []

        const ralliesFiltrados = categoriasVehiculo.length > 0
          ? todosLosRallies.filter(rally =>
              rally.categorias?.some(cat => categoriasVehiculo.includes(cat.nombre))
            )
          : todosLosRallies

        setRallies(ralliesFiltrados)
      } catch (err) {
        console.error('Error al cargar rallies:', err)
        setError('Error al cargar las fechas de rally disponibles')
        setRallies([])
      } finally {
        setCargandoRallies(false)
      }
    }
    cargarRallies()
  }, [show, tipo, vehiculo])

  // Reset al abrir
  useEffect(() => {
    if (show) {
      setFechaSeleccionada('')
      setError('')
    }
  }, [show])

  // ========================================
  // HELPERS
  // ========================================
  const formatearPrecio = (precio) =>
    precio?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') ?? '---'

  const formatearFechaRally = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const año = fecha.getFullYear()
    return `${dia}/${mes}/${año}`
  }

  // ========================================
  // PRECIOS A MOSTRAR
  // Usa los del backend; fallback al precio crudo del vehículo si el endpoint falla
  // ========================================
  const precioARS = tipo === 'COMPRAR'
    ? (precios?.compra?.ars ?? vehiculo?.precioCompra)
    : (precios?.alquiler?.ars ?? vehiculo?.precioAlquiler)

  const precioUSD = tipo === 'COMPRAR'
    ? precios?.compra?.usd
    : precios?.alquiler?.usd

  // ========================================
  // MANEJAR PAGO
  // ========================================
  const manejarPago = async (metodoPago) => {
    try {
      setProcesandoPago(true)
      setError('')

      if (tipo === 'ALQUILAR' && !fechaSeleccionada) {
        setError('Debes seleccionar una fecha de rally')
        setProcesandoPago(false)
        return
      }

      let endpoint = ''
      let body = {}

      if (tipo === 'COMPRAR') {
        endpoint = metodoPago === 'Mercado Pago'
          ? '/pagos/compras/mercadopago'
          : '/pagos/compras/paypal'
        body = { vehiculoId: vehiculo.id }
      } else {
        endpoint = metodoPago === 'Mercado Pago'
          ? '/pagos/alquileres/mercadopago'
          : '/pagos/alquileres/paypal'
        body = {
          vehiculoId: vehiculo.id,
          rallyId: parseInt(fechaSeleccionada)
        }
      }

      const response = await api.post(endpoint, body)

      const urlPago =
        response.data?.preferencia?.init_point ||
        response.data?.orden?.approveLink ||
        response.data?.urlPago

      if (urlPago) {
        window.location.href = urlPago
      } else {
        setError('No se recibió la URL de pago. Intentá de nuevo.')
      }

    } catch (err) {
      console.error('Error al procesar pago:', err)
      setError(err.response?.data?.error || 'Error al procesar el pago. Intentá de nuevo.')
    } finally {
      setProcesandoPago(false)
    }
  }

  if (!vehiculo) return null

  const hayRalliesDisponibles = rallies.length > 0

  const botonMPHabilitado = !procesandoPago &&
    (tipo === 'COMPRAR' || (tipo === 'ALQUILAR' && hayRalliesDisponibles && fechaSeleccionada !== ''))

  const botonPayPalHabilitado = botonMPHabilitado && precios?.cotizacionDisponible === true

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={styles.modalCustom}
      contentClassName={styles.modalContenido}
    >
      <div className={styles.contenedor}>

        <button
          className={styles.btnCerrar}
          onClick={onHide}
          aria-label="Cerrar"
          disabled={procesandoPago}
        >
          <X size={24} />
        </button>

        <div className={styles.contenedorFoto}>
          <img
            src={vehiculo.foto}
            alt={`${vehiculo.marca} ${vehiculo.nombre}`}
            className={styles.foto}
          />
          <span
            className={styles.badgeCategoria}
            style={{ backgroundColor: colorCategoria }}
          >
            {categoria}
          </span>
        </div>

        <h2 className={styles.nombreVehiculo}>
          {vehiculo.marca} {vehiculo.nombre}
        </h2>

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

        {tipo === 'ALQUILAR' && (
          <div className={styles.seccionFecha}>
            <label className={styles.labelFecha}>
              Seleccioná fecha del rally:
            </label>
            {cargandoRallies ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#00d4ff' }}>
                Cargando fechas disponibles...
              </div>
            ) : !hayRalliesDisponibles ? (
              <div className={styles.sinFechas}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                No hay fechas disponibles para la categoría
              </div>
            ) : (
              <select
                className={styles.selectFecha}
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                disabled={procesandoPago}
              >
                <option value="">Elegí una fecha</option>
                {rallies.map((rally) => (
                  <option key={rally.id} value={rally.id}>
                    {formatearFechaRally(rally.fecha)} | {rally.campeonato} – {rally.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className={styles.seccionPagos}>
          <p className={styles.tituloPagos}>Método de pago:</p>
          <div className={styles.contenedorBotonesPago}>

            {/* Mercado Pago — ARS */}
            <button
              className={`${styles.botonPago} ${styles.botonMP}`}
              onClick={() => manejarPago('Mercado Pago')}
              disabled={!botonMPHabilitado}
            >
              <img
                src="/logos/mercadopago.png"
                alt="Mercado Pago"
                className={styles.logoPago}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className={styles.precioPago}>
                {procesandoPago ? 'Procesando...' : `$${formatearPrecio(precioARS)}`}
              </span>
            </button>

            {/* PayPal — USD con comisiones ya calculadas en el backend */}
            <button
              className={`${styles.botonPago} ${styles.botonPayPal}`}
              onClick={() => manejarPago('PayPal')}
              disabled={!botonPayPalHabilitado}
              title={!precios?.cotizacionDisponible ? 'Cotización del dólar no disponible' : ''}
            >
              <img
                src="/logos/paypal.png"
                alt="PayPal"
                className={styles.logoPago}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className={styles.precioPago}>
                {procesandoPago
                  ? 'Procesando...'
                  : cargandoPrecios
                    ? '...'
                    : precios?.cotizacionDisponible
                      ? `USD ${precioUSD}`
                      : 'No disponible'}
              </span>
            </button>

          </div>
        </div>

        <p className={styles.textoAclarativo}>
          {tipo === 'COMPRAR'
            ? 'Vigencia: 1 año desde la compra | Podés participar en todas las fechas'
            : fechaSeleccionada
              ? 'Válido hasta la fecha del rally seleccionado'
              : hayRalliesDisponibles
                ? 'Seleccioná una fecha para continuar'
                : 'No hay fechas próximas disponibles para este vehículo'}
        </p>

      </div>
    </Modal>
  )
}

export default ModalDetalleVehiculo