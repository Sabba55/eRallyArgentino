import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testearConexion, sincronizarModelos } from './config/baseDatos.js';

// Importar rutas
import authRutas from './rutas/authRutas.js';
import usuariosRutas from './rutas/usuariosRutas.js';
import vehiculosRutas from './rutas/vehiculosRutas.js';
import ralliesRutas from './rutas/ralliesRutas.js';
import categoriasRutas from './rutas/categoriasRutas.js';
import pagosRutas from './rutas/pagosRutas.js';
import historialesRutas from './rutas/historialesRutas.js';

// Importar tareas programadas
import { iniciarTareasProgramadas } from './tareas/limpiarVencimientos.js';

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
    const timestamp = new Date().toLocaleTimeString('es-AR');
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// ========================================
// RUTAS PRINCIPALES
// ========================================

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: '🏁 Bienvenido a eRally Argentino API',
    version: '1.0.0',
    estado: 'Activo',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      vehiculos: '/api/vehiculos',
      rallies: '/api/rallies',
      categorias: '/api/categorias',
      pagos: '/api/pagos',
      historiales: '/api/historiales (admin)'
    },
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

// ========================================
// MONTAR RUTAS DE LA API
// ========================================

app.use('/api/auth', authRutas);
app.use('/api/usuarios', usuariosRutas);
app.use('/api/vehiculos', vehiculosRutas);
app.use('/api/rallies', ralliesRutas);
app.use('/api/categorias', categoriasRutas);
app.use('/api/pagos', pagosRutas);
app.use('/api/historiales', historialesRutas);

// ========================================
// MANEJO DE ERRORES
// ========================================

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    mensaje: 'La ruta solicitada no existe en esta API'
  });
});

// Error de Multer (archivos)
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'Error al subir archivo',
      detalle: err.message
    });
  }
  next(err);
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: err.errors.map(e => ({
        campo: e.path,
        mensaje: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'El registro ya existe',
      detalle: err.errors[0]?.message || 'Valor duplicado'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'No se puede eliminar porque tiene registros relacionados',
      detalle: 'Eliminá primero las relaciones asociadas'
    });
  }

  // Error genérico
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
    console.log('\n========================================');
    console.log('🚀 Iniciando servidor eRally Argentino...');
    console.log('========================================\n');

    // 1. Conectar a la base de datos
    console.log('📊 Conectando a PostgreSQL...');
    await testearConexion();

    // 2. Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Sincronizando modelos...');
      await sincronizarModelos();
    }

    // 3. Iniciar tareas programadas (cron)
    console.log('⏰ Iniciando tareas programadas...');
    iniciarTareasProgramadas();

    // 4. Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('✅ Servidor iniciado correctamente');
      console.log('========================================');
      console.log(`\n🌐 URL: http://localhost:${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌍 Frontend: ${process.env.FRONTEND_URL}`);
      console.log(`🕒 Hora: ${new Date().toLocaleString('es-AR')}\n`);
      console.log('📋 Rutas disponibles:');
      console.log('   - GET  /');
      console.log('   - GET  /health');
      console.log('   - POST /api/auth/registro');
      console.log('   - POST /api/auth/login');
      console.log('   - GET  /api/vehiculos');
      console.log('   - GET  /api/rallies/proximos');
      console.log('   - GET  /api/categorias');
      console.log('   - ... y muchas más!\n');
      console.log('Presioná Ctrl+C para detener el servidor\n');
    });
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ Error al iniciar el servidor');
    console.error('========================================\n');
    console.error(error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n\n========================================');
  console.log('🛑 Cerrando servidor...');
  console.log('========================================\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n========================================');
  console.log('🛑 Cerrando servidor...');
  console.log('========================================\n');
  process.exit(0);
});

// Iniciar el servidor
iniciarServidor();

export default app;