import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

// ========================================
// CREAR CONTEXTO
// ========================================
const AuthContext = createContext();

// ========================================
// PROVIDER DEL CONTEXTO
// ========================================
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // ========================================
  // VERIFICAR TOKEN AL CARGAR LA APP
  // ========================================
  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setCargando(false);
        return;
      }

      try {
        // Consultar datos del usuario con el token
        const response = await api.get('/auth/me');
        setUsuario(response.data.usuario);
      } catch (error) {
        console.error('Error al verificar token:', error);
        // Si el token no es válido, limpiarlo
        localStorage.removeItem('token');
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    verificarToken();
  }, []);

  // ========================================
  // FUNCIÓN: REGISTRARSE
  // ========================================
  const registrarse = async (datos) => {
    try {
      setCargando(true);
      
      // El backend argentino espera 'contraseña' y 'confirmarContraseña'
      const datosBackend = {
        nombre: datos.nombre,
        email: datos.email,
        contraseña: datos.contraseña,
        confirmarContraseña: datos.contraseña, // ← AGREGAR ESTO
        ...(datos.equipo && { equipo: datos.equipo })
      };
      
      const response = await api.post('/auth/registro', datosBackend);

      // El backend devuelve un mensaje de verificación por email
      return {
        exito: true,
        mensaje: response.data.mensaje || response.data.aviso,
        requiereVerificacion: true
      };
    } catch (error) {
      console.error('Error al registrarse:', error);
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al registrarse'
      };
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // FUNCIÓN: LOGIN
  // ========================================
  const login = async (email, contraseña) => {
    try {
      setCargando(true);
      
      // El backend argentino espera 'contraseña' (no 'password')
      const response = await api.post('/auth/login', { email, contraseña });

      const { token, usuario: usuarioData } = response.data;

      // Guardar token en localStorage
      localStorage.setItem('token', token);

      // Actualizar estado del usuario
      setUsuario(usuarioData);

      // Redirigir al garage
      navigate('/garage');

      return {
        exito: true,
        mensaje: '¡Bienvenido de vuelta!'
      };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al iniciar sesión'
      };
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // FUNCIÓN: LOGOUT
  // ========================================
  const logout = () => {
    // Limpiar token del localStorage
    localStorage.removeItem('token');

    // Limpiar estado del usuario
    setUsuario(null);

    // Redirigir al login
    navigate('/login');
  };

  // ========================================
  // FUNCIÓN: ACTUALIZAR PERFIL
  // ========================================
  const actualizarPerfil = async (nuevosDatos) => {
    try {
      setCargando(true);
      const response = await api.put('/usuarios/perfil', nuevosDatos);

      // Actualizar estado del usuario
      setUsuario(response.data.usuario);

      return {
        exito: true,
        mensaje: 'Perfil actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al actualizar perfil'
      };
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // FUNCIÓN: VERIFICAR EMAIL
  // ========================================
  const verificarEmail = async (token) => {
    try {
      setCargando(true);
      const response = await api.post('/auth/verificar-email', { token });

      return {
        exito: true,
        mensaje: response.data.mensaje
      };
    } catch (error) {
      console.error('Error al verificar email:', error);
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al verificar email'
      };
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // FUNCIÓN: SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  // ========================================
  const solicitarRecuperacion = async (email) => {
    try {
      setCargando(true);
      const response = await api.post('/auth/solicitar-recuperacion', { email });

      return {
        exito: true,
        mensaje: response.data.mensaje
      };
    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al solicitar recuperación'
      };
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // FUNCIÓN: RESETEAR CONTRASEÑA
  // ========================================
  const resetearContraseña = async (token, nuevaContraseña) => {
    try {
      setCargando(true);
      const response = await api.post('/auth/resetear-password', {
        token,
        nuevaContraseña // Backend argentino espera 'nuevaContraseña'
      });

      return {
        exito: true,
        mensaje: response.data.mensaje
      };
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al resetear contraseña'
      };
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // FUNCIÓN: REENVIAR VERIFICACIÓN
  // ========================================
  const reenviarVerificacion = async (email) => {
    try {
      setCargando(true);
      const response = await api.post('/auth/reenviar-verificacion', { email });

      return {
        exito: true,
        mensaje: response.data.mensaje
      };
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      return {
        exito: false,
        mensaje: error.response?.data?.error || 'Error al reenviar verificación'
      };
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // VALOR DEL CONTEXTO
  // ========================================
  const valor = {
    usuario,
    cargando,
    registrarse,
    login,
    logout,
    actualizarPerfil,
    verificarEmail,
    solicitarRecuperacion,
    resetearContraseña,
    reenviarVerificacion,
    // Helper para verificar si está logueado
    estaLogueado: !!usuario,
    // Helper para verificar si es admin
    esAdmin: usuario?.rol === 'admin',
    // Helper para verificar si puede crear fechas
    puedeCrearFechas: usuario?.rol === 'creador_fechas' || usuario?.rol === 'admin'
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};

// ========================================
// HOOK PERSONALIZADO PARA USAR EL CONTEXTO
// ========================================
export const useAuth = () => {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return contexto;
};

export default AuthContext;