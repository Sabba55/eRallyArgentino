import api from './config/api'

// Probá la conexión
api.get('/vehiculos')
  .then(response => {
    console.log('✅ Conexión exitosa:', response.data)
  })
  .catch(error => {
    console.error('❌ Error de conexión:', error)
  })