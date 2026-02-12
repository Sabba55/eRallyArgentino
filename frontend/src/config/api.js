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
    
    // Mostramos en consola qué estamos enviando (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    // Si hay error antes de enviar el request
    console.error('❌ Error en request:', error)
    return Promise.reject(error)
  }
)

// Interceptor para RESPONSES (se ejecuta DESPUÉS de cada respuesta)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (status 200-299)
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    return response
  },
  (error) => {
    // Si hay error en la respuesta
    if (error.response) {
      // El servidor respondió con un status fuera del rango 200-299
      const { status, data } = error.response
      
      console.error(`❌ Error ${status}:`, data.mensaje || data.error || 'Error desconocido')
      
      // Si el token expiró o es inválido
      if (status === 401) {
        console.warn('⚠️ Token inválido o expirado. Redirigiendo a login...')
        
        // Limpiamos el token
        localStorage.removeItem('token')
        
        // Redirigimos a login (solo si no estamos ya ahí)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      
      // Si el servidor no autorizó la acción (permisos insuficientes)
      if (status === 403) {
        console.error('🚫 No tenés permisos para realizar esta acción')
      }
      
      // Si hubo error en el servidor
      if (status === 500) {
        console.error('💥 Error en el servidor. Intentá de nuevo más tarde.')
      }
      
    } else if (error.request) {
      // El request se envió pero no hubo respuesta (servidor caído o sin internet)
      console.error('🔌 No se pudo conectar con el servidor. Verificá tu conexión.')
    } else {
      // Error al configurar el request
      console.error('⚙️ Error al configurar la petición:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Exportamos la instancia configurada
export default api

// También exportamos la URL por si la necesitamos en algún lado
export { API_URL }
