import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/api'
import styles from './Admin.module.css'

function Admin() {
  // ========================================
  // ESTADOS
  // ========================================
  const { usuario } = useAuth()
  const [estadisticas, setEstadisticas] = useState({
    vehiculos: 0,
    categorias: 0,
    rallies: 0,
    compras: 0,
    alquileres: 0,
    usuarios: 0
  })
  const [cargando, setCargando] = useState(true)
  const [transaccionesPendientes, setTransaccionesPendientes] = useState(0)

  // ========================================
  // CARGAR ESTADÍSTICAS
  // ========================================
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setCargando(true)

        // Cargar contadores según el rol
        const requests = []

        if (usuario?.rol === 'admin') {
          // Admin ve todo
          requests.push(
            api.get('/vehiculos').then(res => res.data.paginacion?.total || res.data.vehiculos?.length || 0),
            api.get('/categorias').then(res => res.data.categorias?.length || 0),
            // TODO: Cuando tengas el endpoint de rallies
            api.get('/rallies').then(res => res.data.rallies?.length || 0),
            api.get('/admin/transacciones/compras').then(res => res.data.compras?.filter(c => c.estado === 'pendiente').length || 0),
            api.get('/admin/transacciones/alquileres').then(res => res.data.alquileres?.filter(a => a.estado === 'pendiente').length || 0),
            api.get('/usuarios').then(res => res.data.paginacion?.total || 0)
          )
        } else {
          // Creador de fechas solo ve rallies
          requests.push(
            Promise.resolve(0), // vehiculos
            Promise.resolve(0), // categorias
            Promise.resolve(0), // rallies TODO: api.get('/rallies')
            Promise.resolve(0)  // usuarios
          )
        }

        const [vehiculos, categorias, rallies, comprasPendientes, alquileresPendientes, usuarios] = await Promise.all(requests)

        setEstadisticas({ vehiculos, categorias, rallies, compras: comprasPendientes, alquileres: alquileresPendientes, usuarios })
        setTransaccionesPendientes(comprasPendientes + alquileresPendientes)

      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setCargando(false)
      }
    }

    if (usuario) {
      cargarEstadisticas()
    }
  }, [usuario])

  // ========================================
  // OBTENER COLOR DEL ROL
  // ========================================
  const obtenerColorRol = (rol) => {
    const colores = {
      'admin': '#ff6b6b',
      'creador_fechas': '#39ff14',
      'usuario': '#00d4ff'
    }
    return colores[rol] || '#00d4ff'
  }

  // ========================================
  // OBTENER NOMBRE DEL ROL
  // ========================================
  const obtenerNombreRol = (rol) => {
    const nombres = {
      'admin': 'Administrador',
      'creador_fechas': 'Creador de Fechas',
      'usuario': 'Usuario'
    }
    return nombres[rol] || 'Usuario'
  }

  // ========================================
  // CARDS DISPONIBLES SEGÚN ROL
  // ========================================
  const cards = [
    {
      emoji: '🚗',
      titulo: 'Vehículos',
      cantidad: estadisticas.vehiculos,
      ruta: '/admin/vehiculos',
      roles: ['admin']
    },
    {
      emoji: '📁',
      titulo: 'Categorías',
      cantidad: estadisticas.categorias,
      ruta: '/admin/categorias',
      roles: ['admin']
    },
    {
      emoji: '📅',
      titulo: 'Fechas',
      cantidad: estadisticas.rallies,
      ruta: '/admin/rallies',
      roles: ['admin', 'creador_fechas']
    },
    {
      emoji: '👥',
      titulo: 'Usuarios',
      cantidad: estadisticas.usuarios,
      ruta: '/admin/usuarios',
      roles: ['admin']
    },
    {
      emoji: '💳',
      titulo: 'Transacciones',
      cantidad: transaccionesPendientes,
      ruta: '/admin/transacciones',
      roles: ['admin']
    }
  ]

  // Filtrar cards según el rol del usuario
  const cardsVisibles = cards.filter(card => 
    card.roles.includes(usuario?.rol)
  )

  // ========================================
  // LOADING STATE
  // ========================================
  if (cargando) {
    return (
      <div className={styles.contenedorAdmin}>
        <Container>
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 0',
            color: '#00d4ff',
            fontSize: '1.5rem',
            fontFamily: 'Orbitron, Impact, sans-serif'
          }}>
            Cargando panel...
          </div>
        </Container>
      </div>
    )
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.contenedorAdmin}>
      <Container>

        {/* BANNER DE BIENVENIDA */}
        <div 
          className={styles.banner}
          style={{ borderColor: obtenerColorRol(usuario?.rol) }}
        >
          <div className={styles.bienvenida}>
            Bienvenido, <span className={styles.nombreUsuario}>{usuario?.nombre}</span>
          </div>
          <div className={styles.rol}>
            Rol: <span 
              className={styles.badgeRol}
              style={{ 
                color: obtenerColorRol(usuario?.rol),
                borderColor: obtenerColorRol(usuario?.rol)
              }}
            >
              {obtenerNombreRol(usuario?.rol)}
            </span>
          </div>
        </div>

        {/* GRID DE CARDS */}
        <div className={styles.gridCards}>
          {cardsVisibles.map((card, index) => (
            <Link 
              key={index} 
              to={card.ruta} 
              className={styles.card}
            >
              <div className={styles.emoji}>{card.emoji}</div>
              <div className={styles.titulo}>{card.titulo}</div>
              {card.cantidad !== undefined && (
                <div className={styles.cantidad}>({card.cantidad})</div>
              )}
            </Link>
          ))}
        </div>

      </Container>
    </div>
  )
}

export default Admin