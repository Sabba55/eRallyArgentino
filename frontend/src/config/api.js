// Aca se haran todas las llamadas HTTP
// AXIOS SE CONFIGURO YA

import axios from 'axios'

// Obtenemos la URL del backend desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Creamos una instancia de Axios configurada
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos máximo por request
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para REQUESTS (se ejecuta ANTES de cada llamada)
api.interceptors.request.use(
  (config) => {
    // Si hay un token guardado, lo agregamos al header
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // ✅ Si el data es FormData, eliminar Content-Type para que
    // el browser lo setee automáticamente con el boundary correcto
    // (multipart/form-data; boundary=----WebKitFormBoundaryXXXX)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    // Mostramos en consola qué estamos enviando (solo en desarrollo)
    if (import.meta.env.DEV) {
      if (config.data instanceof FormData) {
        console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, '[FormData]')
      } else {
        console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, config.data)
      }
    }

    return config
  },
  (error) => {
    console.error('❌ Error en request:', error)
    return Promise.reject(error)
  }
)

// Interceptor para RESPONSES (se ejecuta DESPUÉS de cada respuesta)
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      console.error(`❌ Error ${status}:`, data.mensaje || data.error || 'Error desconocido')

      if (status === 401) {
        // Rutas que usan 401 para validación, NO para token vencido
        const rutasExcluidas = ['/usuarios/verificar-password', '/usuarios/cambiar-password']
        const esRutaExcluida = rutasExcluidas.some(ruta => error.response.config.url.includes(ruta))

        if (!esRutaExcluida) {
          console.warn('⚠️ Token inválido o expirado. Redirigiendo a login...')
          localStorage.removeItem('token')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      }

      if (status === 403) {
        console.error('🚫 No tenés permisos para realizar esta acción')
      }

      if (status === 500) {
        console.error('💥 Error en el servidor. Intentá de nuevo más tarde.')
      }

    } else if (error.request) {
      console.error('🔌 No se pudo conectar con el servidor. Verificá tu conexión.')
    } else {
      console.error('⚙️ Error al configurar la petición:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api
export { API_URL }