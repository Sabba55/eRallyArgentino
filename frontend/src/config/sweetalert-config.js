// src/config/sweetalert-config.js
import Swal from 'sweetalert2'

// Configuración global con el estilo de eRally
const Toast = Swal.mixin({
  toast: true,
  position: 'top-right',
  iconColor: 'white',
  customClass: {
    popup: 'colored-toast'
  },
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true
})

// Función para notificaciones de éxito
export const toastExito = (mensaje) => {
  Toast.fire({
    icon: 'success',
    title: mensaje,
    background: '#2a2a2a',
    color: '#39ff14'
  })
}

// Función para notificaciones de error
export const toastError = (mensaje) => {
  Toast.fire({
    icon: 'error',
    title: mensaje,
    background: '#2a2a2a',
    color: '#ff4444'
  })
}

// Función para notificaciones de info
export const toastInfo = (mensaje) => {
  Toast.fire({
    icon: 'info',
    title: mensaje,
    background: '#2a2a2a',
    color: '#00d4ff'
  })
}

// Función para confirmaciones
export const confirmar = async (titulo, texto) => {
  const result = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#00d4ff',
    cancelButtonColor: '#ff4444',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    background: '#2a2a2a',
    color: '#ffffff',
    customClass: {
      popup: 'erally-swal'
    }
  })
  
  return result.isConfirmed
}

// CSS personalizado (agregar al index.css o App.css)
export const swalStyles = `
.colored-toast.swal2-icon-success {
  background-color: #2a2a2a !important;
  border: 2px solid #39ff14 !important;
}

.colored-toast.swal2-icon-error {
  background-color: #2a2a2a !important;
  border: 2px solid #ff4444 !important;
}

.colored-toast.swal2-icon-info {
  background-color: #2a2a2a !important;
  border: 2px solid #00d4ff !important;
}

.erally-swal {
  border: 2px solid #00d4ff !important;
  border-radius: 12px !important;
  font-family: 'Orbitron', sans-serif !important;
}

.erally-swal .swal2-title {
  color: #00d4ff !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.erally-swal .swal2-html-container {
  color: #ffffff !important;
  font-size: 1rem !important;
}

.erally-swal .swal2-confirm {
  background: linear-gradient(135deg, #00d4ff, #39ff14) !important;
  border: none !important;
  color: #1a1a1a !important;
  font-weight: 700 !important;
  padding: 0.8rem 2rem !important;
  border-radius: 8px !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.erally-swal .swal2-cancel {
  background: transparent !important;
  border: 2px solid #ff4444 !important;
  color: #ff4444 !important;
  font-weight: 700 !important;
  padding: 0.8rem 2rem !important;
  border-radius: 8px !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.erally-swal .swal2-cancel:hover {
  background: #ff4444 !important;
  color: #1a1a1a !important;
}
`