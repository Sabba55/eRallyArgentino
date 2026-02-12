import { Navbar as NavbarBootstrap, Nav, NavDropdown, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Navbar.module.css'
import logo from '../../assets/imagenes/erally-logo.png'

function Navbar() {
  // ========================================
  // USAR EL CONTEXTO DE AUTENTICACIÓN REAL
  // ========================================
  const { usuario, logout, estaLogueado } = useAuth()
  const navigate = useNavigate()

  // ========================================
  // FUNCIÓN PARA CERRAR SESIÓN
  // ========================================
  const handleLogout = () => {
    logout()
    // El AuthContext ya redirige a /login automáticamente
  }

  // ========================================
  // OBTENER INICIALES DEL USUARIO
  // ========================================
  const obtenerIniciales = (nombre) => {
    if (!nombre) return '?'
    
    const palabras = nombre.trim().split(' ')
    
    if (palabras.length >= 2) {
      // Si tiene nombre y apellido: "Juan Pérez" → "JP"
      return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
    } else {
      // Si solo tiene un nombre: "Juan" → "JU"
      return nombre.substring(0, 2).toUpperCase()
    }
  }

  return (
    <NavbarBootstrap expand="lg" className={styles.navbar} variant="dark">
      <Container fluid>
        {/* Logo a la izquierda */}
        <NavbarBootstrap.Brand as={Link} to="/" className={styles.brand}>
          <img 
            src={logo} 
            alt="eRally Argentino" 
            className={styles.logo}
          />
        </NavbarBootstrap.Brand>

        {/* Botón hamburguesa para mobile */}
        <NavbarBootstrap.Toggle aria-controls="navbar-nav" />

        {/* Menú de navegación */}
        <NavbarBootstrap.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            
            {/* INICIO - Visible para todos */}
            <Nav.Link as={Link} to="/" className={styles.navLink}>
              INICIO
            </Nav.Link>

            {/* GARAGE - Solo visible para usuarios logueados */}
            {estaLogueado && (
              <Nav.Link as={Link} to="/garage" className={styles.navLink}>
                GARAGE
              </Nav.Link>
            )}

            {/* TIENDA - Solo visible para usuarios logueados */}
            {estaLogueado && (
              <Nav.Link as={Link} to="/tienda" className={styles.navLink}>
                TIENDA
              </Nav.Link>
            )}

            {/* FECHAS - Visible para todos */}
            <Nav.Link as={Link} to="/fechas" className={styles.navLink}>
              FECHAS
            </Nav.Link>

            {/* DESCARGAS - Dropdown - Visible para todos */}
            <NavDropdown 
              title="DESCARGAS" 
              id="descargas-dropdown"
              className={styles.dropdown}
            >
              <NavDropdown.Item as={Link} to="/descargas/guia-instalacion">
                Guía de Instalación
              </NavDropdown.Item>
              
              {/* Diferentes opciones según si está logueado */}
              {estaLogueado ? (
                <>
                  <NavDropdown.Item as={Link} to="/descargas/pack-autos">
                    Pack Autos
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/descargas/pack-tramos">
                    Pack Tramos
                  </NavDropdown.Item>
                </>
              ) : (
                <>
                  <NavDropdown.Item as={Link} to="/descargas/links-vehiculos">
                    Links Vehículos
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/descargas/links-tramos">
                    Links Tramos
                  </NavDropdown.Item>
                </>
              )}
              
              <NavDropdown.Item as={Link} to="/descargas/navegantes">
                Navegantes
              </NavDropdown.Item>
            </NavDropdown>

            {/* PERFIL - Solo para usuarios logueados */}
            {estaLogueado ? (
              <NavDropdown
                title={
                  <div className={styles.avatarContainer}>
                    {usuario?.fotoPerfil ? (
                      <img 
                        src={usuario.fotoPerfil} 
                        alt={usuario.nombre}
                        className={styles.avatarImg}
                      />
                    ) : (
                      <div className={styles.avatar}>
                        {obtenerIniciales(usuario?.nombre)}
                      </div>
                    )}
                  </div>
                }
                id="perfil-dropdown"
                className={styles.perfilDropdown}
                align="end"
              >
                <NavDropdown.ItemText className={styles.nombreUsuario}>
                  {usuario?.nombre || 'Usuario'}
                </NavDropdown.ItemText>
                
                {usuario?.equipo && (
                  <NavDropdown.ItemText className={styles.equipoUsuario}>
                    {usuario.equipo}
                  </NavDropdown.ItemText>
                )}
                
                <NavDropdown.Divider />
                
                <NavDropdown.Item as={Link} to="/perfil">
                  <i className="bi bi-person-circle me-2"></i>
                  Ver Perfil
                </NavDropdown.Item>
                
                <NavDropdown.Item as={Link} to="/perfil/editar">
                  <i className="bi bi-pencil-square me-2"></i>
                  Editar Perfil
                </NavDropdown.Item>
                
                <NavDropdown.Item as={Link} to="/garage">
                  <i className="bi bi-car-front-fill me-2"></i>
                  Mi Garage
                </NavDropdown.Item>
                
                <NavDropdown.Divider />
                
                <NavDropdown.Item onClick={handleLogout} className={styles.logoutItem}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              /* Botón INGRESAR para usuarios no logueados */
              <Link to="/login" className={styles.btnIngresar}>
                INGRESAR
              </Link>
            )}

          </Nav>
        </NavbarBootstrap.Collapse>
      </Container>
    </NavbarBootstrap>
  )
}

export default Navbar