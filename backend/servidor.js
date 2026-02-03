import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testearConexion, sincronizarModelos } from './config/baseDatos.js';

// Configurar variables de entorno
dotenv.config();

// Crear instancia de Express
const app = express();

// ========================================
// MIDDLEWARES GLOBALES
// ========================================

// CORS - Permitir peticiones desde el frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Parser de JSON
app.use(express.json());

// Parser de URL-encoded
app.use(express.urlencoded({ extended: true }));

// Middleware para logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ========================================
// RUTAS
// ========================================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    mensaje: '🏁 Bienvenido a eRally Argentino API',
    version: '1.0.0',
    estado: 'Activo',
    timestamp: new Date().toISOString()
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    estado: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// TODO: Importar y usar las rutas acá
// import authRutas from './rutas/authRutas.js';
// import vehiculosRutas from './rutas/vehiculosRutas.js';
// import usuariosRutas from './rutas/usuariosRutas.js';
// import ralliesRutas from './rutas/ralliesRutas.js';
// import pagosRutas from './rutas/pagosRutas.js';
// import historialesRutas from './rutas/historialesRutas.js';
//
// app.use('/api/auth', authRutas);
// app.use('/api/vehiculos', vehiculosRutas);
// app.use('/api/usuarios', usuariosRutas);
// app.use('/api/rallies', ralliesRutas);
// app.use('/api/pagos', pagosRutas);
// app.use('/api/historiales', historialesRutas);

// ========================================
// MANEJO DE ERRORES
// ========================================

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    // Conectar a la base de datos
    await testearConexion();

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sincronizarModelos();
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`\n✅ Todo listo para trabajar!\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
iniciarServidor();

export default app;