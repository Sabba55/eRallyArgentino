import { useState, useMemo } from 'react'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Edit, ShoppingCart, Calendar, Mail, Users, Clock } from 'lucide-react'
import styles from './Perfil.module.css'

function Perfil() {
  // DATOS MOCK DEL USUARIO
  // Después esto vendrá del contexto de autenticación o API
  const usuario = {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    equipo: "Racing Team Argentina",
    fotoPerfil: null, // Si es null, mostramos iniciales
    emailVerificado: true,
    createdAt: "2025-01-15T10:00:00"
  }

  // DATOS MOCK DE VEHÍCULOS DEL USUARIO
  // Después esto vendrá de la API
  const vehiculosUsuario = {
    comprados: [
      {
        id: 1,
        marca: "Toyota",
        nombre: "Yaris",
        categoria: "Rally2",
        fechaCompra: "2025-01-29T10:00:00"
      },
      {
        id: 2,
        marca: "Ford",
        nombre: "Fiesta",
        categoria: "Rally2",
        fechaCompra: "2025-07-20T10:00:00"
      }
    ],
    alquilados: [
      {
        id: 3,
        marca: "Skoda",
        nombre: "Fabia",
        categoria: "R5",
        rally: "Rally de Misiones",
        fechaAlquiler: "2026-01-20T10:00:00"
      },
      {
        id: 4,
        marca: "Subaru",
        nombre: "Impreza",
        categoria: "N4",
        rally: "Rally de Córdoba",
        fechaAlquiler: "2026-01-25T10:00:00"
      }
    ]
  }

  // Obtener iniciales del nombre
  const obtenerIniciales = () => {
    const inicialNombre = usuario.nombre ? usuario.nombre[0].toUpperCase() : ''
    const inicialApellido = usuario.apellido ? usuario.apellido[0].toUpperCase() : ''
    return `${inicialNombre}${inicialApellido}`
  }

  // Formatear fecha de miembro desde
  const formatearFechaMiembro = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' }
    return fecha.toLocaleDateString('es-AR', opciones)
  }

  // Calcular estadísticas
  const estadisticas = useMemo(() => ({
    comprados: vehiculosUsuario.comprados.length,
    alquilados: vehiculosUsuario.alquilados.length,
    total: vehiculosUsuario.comprados.length + vehiculosUsuario.alquilados.length
  }), [vehiculosUsuario])

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
                alt={`${usuario.nombre} ${usuario.apellido}`}
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
              {usuario.nombre} {usuario.apellido}
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
                {usuario.nombre} {usuario.apellido}
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

            {/* Fecha de registro */}
            <div className={styles.itemInfo}>
              <div className={styles.labelInfo}>
                <Clock size={20} className={styles.iconoInfo} />
                Miembro desde
              </div>
              <div className={styles.valorInfo}>
                {formatearFechaMiembro(usuario.createdAt)}
              </div>
            </div>

          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className={styles.seccionAccesos}>
          <h2 className={styles.tituloSeccion}>Accesos Rápidos</h2>
          
          <div className={styles.gridAccesos}>
            
            <Link to="/garage" className={styles.cardAcceso}>
              <svg 
                className={styles.iconoAcceso}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg>
              <span>Ir al Garage</span>
            </Link>

            <Link to="/tienda" className={styles.cardAcceso}>
              <ShoppingCart className={styles.iconoAcceso} />
              <span>Ir a la Tienda</span>
            </Link>

            <Link to="/fechas" className={styles.cardAcceso}>
              <Calendar className={styles.iconoAcceso} />
              <span>Ver Fechas</span>
            </Link>

          </div>
        </div>
      </Container>
    </div>
  )
}

export default Perfil