import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ========================================
// COMPONENTE DE CARGA
// ========================================
const Cargando = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#00d4ff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner-border text-info mb-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Verificando sesión...</p>
      </div>
    </div>
  );
};

// ========================================
// RUTA PROTEGIDA - REQUIERE AUTENTICACIÓN
// ========================================
export const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useAuth();

  // Mientras verifica el token, mostrar pantalla de carga
  if (cargando) {
    return <Cargando />;
  }

  // Si no hay usuario logueado, redirigir al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, mostrar el componente hijo
  return children;
};

// ========================================
// RUTA PROTEGIDA - SOLO PARA ADMINS
// ========================================
export const RutaAdmin = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <Cargando />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Solo admins pueden acceder
  if (usuario.rol !== 'admin') {
    return <Navigate to="/garage" replace />;
  }

  return children;
};

// ========================================
// RUTA PROTEGIDA - SOLO PARA CREADORES DE FECHAS Y ADMINS
// ========================================
export const RutaCreadorFechas = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <Cargando />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Solo creadores de fechas y admins pueden acceder
  if (usuario.rol !== 'creador_fechas' && usuario.rol !== 'admin') {
    return <Navigate to="/garage" replace />;
  }

  return children;
};

// ========================================
// RUTA PÚBLICA - SOLO PARA NO AUTENTICADOS
// ========================================
// Útil para Login y Registro (si ya estás logueado, te manda al garage)
export const RutaPublica = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <Cargando />;
  }

  // Si ya está logueado, redirigir al garage
  if (usuario) {
    return <Navigate to="/garage" replace />;
  }

  return children;
};

// ========================================
// RUTA PARA EMAIL VERIFICADO
// ========================================
export const RutaEmailVerificado = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <Cargando />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Solo usuarios con email verificado pueden acceder
  if (!usuario.emailVerificado) {
    return <Navigate to="/verificar-email-pendiente" replace />;
  }

  return children;
};

export default RutaProtegida;