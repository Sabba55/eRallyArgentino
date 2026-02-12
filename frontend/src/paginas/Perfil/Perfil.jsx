import { useMemo } from 'react'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Edit, ShoppingCart, Calendar, Mail, Users, Clock, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Perfil.module.css'

function Perfil() {
  // ========================================
  // OBTENER USUARIO DEL CONTEXTO
  // ========================================
  const { usuario, cargando } = useAuth()

  // ========================================
  // OBTENER INICIALES DEL NOMBRE
  // ========================================
  const obtenerIniciales = () => {
    if (!usuario?.nombre) return '?'
    
    const palabras = usuario.nombre.trim().split(' ')
    
    if (palabras.length >= 2) {
      // Si tiene nombre y apellido: "Juan Pérez" → "JP"
      return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
    } else {
      // Si solo tiene un nombre: "Juan" → "JU"
      return usuario.nombre.substring(0, 2).toUpperCase()
    }
  }

  // ========================================
  // FORMATEAR FECHA DE MIEMBRO DESDE
  // ========================================
  const formatearFechaMiembro = (fechaISO) => {
    if (!fechaISO) return 'Fecha no disponible'
    
    const fecha = new Date(fechaISO)
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' }
    return fecha.toLocaleDateString('es-AR', opciones)
  }

  // ========================================
  // OBTENER NOMBRE DEL ROL
  // ========================================
  const obtenerNombreRol = (rol) => {
    const roles = {
      'usuario': 'Usuario',
      'creador_fechas': 'Creador de Fechas',
      'admin': 'Administrador'
    }
    return roles[rol] || 'Usuario'
  }

  // ========================================
  // OBTENER COLOR DEL ROL
  // ========================================
  const obtenerColorRol = (rol) => {
    const colores = {
      'usuario': '#00d4ff',
      'creador_fechas': '#39ff14',
      'admin': '#ff6b6b'
    }
    return colores[rol] || '#00d4ff'
  }

  // ========================================
  // CALCULAR ESTADÍSTICAS
  // ========================================
  // TODO: Cuando tengamos el endpoint del backend para vehículos del usuario
  const estadisticas = useMemo(() => ({
    comprados: 0, // TODO: Obtener del backend
    alquilados: 0, // TODO: Obtener del backend
    total: 0
  }), [])

  // ========================================
  // LOADING STATE
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedorPerfil}>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#00d4ff' }}>
            <h2>Cargando perfil...</h2>
          </div>
        </Container>
      </div>
    )
  }

  // ========================================
  // SI NO HAY USUARIO (NO DEBERÍA PASAR)
  // ========================================
  if (!usuario) {
    return (
      <div className={styles.contenedorPerfil}>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#ff6b6b' }}>
            <h2>No se pudo cargar el perfil</h2>
            <Link to="/login" className={styles.btnEditarPerfil}>
              Iniciar Sesión
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.contenedorPerfil}>
      <Container>

        {/* HEADER - Avatar y nombre */}
        <div className={styles.header}>
          
          {/* Avatar */}
          <div className={styles.contenedorAvatar}>
            {usuario.fotoPerfil ? (
              <img 
                src={usuario.fotoPerfil} 
                alt={usuario.nombre}
                className={styles.fotoPerfil}
              />
            ) : (
              <div className={styles.avatarIniciales}>
                {obtenerIniciales()}
              </div>
            )}
          </div>

          {/* Info del usuario */}
          <div className={styles.infoHeader}>
            <h1 className={styles.nombreUsuario}>
              {usuario.nombre}
            </h1>
            
            <div className={styles.metadataUsuario}>
              <div className={styles.itemMetadata}>
                <Mail className={styles.iconoMetadata} size={18} />
                <span>{usuario.email}</span>
                {usuario.emailVerificado && (
                  <span className={styles.badgeVerificado}>✓ Verificado</span>
                )}
              </div>
              
              <div className={styles.itemMetadata}>
                <Clock className={styles.iconoMetadata} size={18} />
                <span>Miembro desde {formatearFechaMiembro(usuario.createdAt)}</span>
              </div>

              {usuario.equipo && (
                <div className={styles.itemMetadata}>
                  <Users className={styles.iconoMetadata} size={18} />
                  <span>{usuario.equipo}</span>
                </div>
              )}

              {/* Badge de Rol */}
              <div className={styles.itemMetadata}>
                <Shield className={styles.iconoMetadata} size={18} />
                <span 
                  className={styles.badgeRol}
                  style={{ 
                    borderColor: obtenerColorRol(usuario.rol),
                    color: obtenerColorRol(usuario.rol)
                  }}
                >
                  {obtenerNombreRol(usuario.rol)}
                </span>
              </div>
            </div>

            {/* Botón Editar Perfil */}
            <Link to="/perfil/editar" className={styles.btnEditarPerfil}>
              <Edit size={20} />
              Editar Perfil
            </Link>
          </div>

        </div>

        {/* ESTADÍSTICAS */}
        <div className={styles.seccionEstadisticas}>
          
          {/* Card: Vehículos Comprados */}
          <div className={styles.cardEstadistica}>
            <div className={styles.iconoEstadistica}>
              <ShoppingCart size={40} />
            </div>
            <div className={styles.numeroEstadistica}>
              {estadisticas.comprados}
            </div>
            <div className={styles.labelEstadistica}>
              {estadisticas.comprados === 1 ? 'Vehículo Comprado' : 'Vehículos Comprados'}
            </div>
          </div>

          {/* Card: Vehículos Alquilados */}
          <div className={styles.cardEstadistica}>
            <div className={styles.iconoEstadistica}>
              <Calendar size={40} />
            </div>
            <div className={styles.numeroEstadistica}>
              {estadisticas.alquilados}
            </div>
            <div className={styles.labelEstadistica}>
              {estadisticas.alquilados === 1 ? 'Vehículo Alquilado' : 'Vehículos Alquilados'}
            </div>
          </div>

          {/* Card: Total */}
          <div className={styles.cardEstadistica}>
            <div className={styles.iconoEstadistica}>
              <svg 
                className={styles.iconoSVG}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
            </div>
            <div className={styles.numeroEstadistica}>
              {estadisticas.total}
            </div>
            <div className={styles.labelEstadistica}>
              Total de Vehículos
            </div>
          </div>

        </div>

        {/* INFORMACIÓN PERSONAL */}
        <div className={styles.seccionInfo}>
          <h2 className={styles.tituloSeccion}>Información Personal</h2>
          
          <div className={styles.gridInfo}>
            
            {/* Email */}
            <div className={styles.itemInfo}>
              <div className={styles.labelInfo}>
                <Mail size={20} className={styles.iconoInfo} />
                Email
              </div>
              <div className={styles.valorInfo}>
                {usuario.email}
                {usuario.emailVerificado ? (
                  <span className={styles.badgeVerificadoInline}>Verificado</span>
                ) : (
                  <span className={styles.badgeNoVerificado}>No verificado</span>
                )}
              </div>
            </div>

            {/* Nombre Completo */}
            <div className={styles.itemInfo}>
              <div className={styles.labelInfo}>
                <svg 
                  className={styles.iconoInfo}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
                Nombre Completo
              </div>
              <div className={styles.valorInfo}>
                {usuario.nombre}
              </div>
            </div>

            {/* Equipo */}
            <div className={styles.itemInfo}>
              <div className={styles.labelInfo}>
                <Users size={20} className={styles.iconoInfo} />
                Equipo
              </div>
              <div className={styles.valorInfo}>
                {usuario.equipo || (
                  <span className={styles.textoSinDatos}>No especificado</span>
                )}
              </div>
            </div>

            {/* Rol */}
            <div className={styles.itemInfo}>
              <div className={styles.labelInfo}>
                <Shield size={20} className={styles.iconoInfo} />
                Rol
              </div>
              <div className={styles.valorInfo}>
                <span 
                  className={styles.badgeRol}
                  style={{ 
                    borderColor: obtenerColorRol(usuario.rol),
                    color: obtenerColorRol(usuario.rol)
                  }}
                >
                  {obtenerNombreRol(usuario.rol)}
                </span>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </div>
  )
}

export default Perfil