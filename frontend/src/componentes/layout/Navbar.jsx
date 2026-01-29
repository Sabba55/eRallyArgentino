import { Navbar as NavbarBootstrap, Nav, NavDropdown, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import styles from './Navbar.module.css'
import logo from '../../assets/imagenes/erally-logo.png'

function Navbar() {
  // Por ahora simulamos si el usuario está logueado o no
  // Después esto va a venir del contexto de autenticación
  const [usuarioLogueado, setUsuarioLogueado] = useState(true)
  
  // Datos temporales del usuario
  const usuario = {
    nombre: 'Juan',
    apellido: 'Pérez',
    iniciales: 'JP'
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
            {usuarioLogueado && (
              <Nav.Link as={Link} to="/garage" className={styles.navLink}>
                GARAGE
              </Nav.Link>
            )}

            {/* TIENDA - Solo visible para usuarios logueados */}
            {usuarioLogueado && (
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
              {usuarioLogueado ? (
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
            {usuarioLogueado ? (
              <NavDropdown
                title={
                  <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                      {usuario.iniciales}
                    </div>
                  </div>
                }
                id="perfil-dropdown"
                className={styles.perfilDropdown}
                align="end"
              >
                <NavDropdown.ItemText className={styles.nombreUsuario}>
                  {usuario.nombre} {usuario.apellido}
                </NavDropdown.ItemText>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/perfil">
                  Ver Perfil
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/perfil/editar">
                  Editar Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => setUsuarioLogueado(false)}>
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