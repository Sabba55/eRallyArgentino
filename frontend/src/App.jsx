import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Navbar from './componentes/layout/Navbar'
import Footer from './componentes/layout/Footer'
import Inicio from './paginas/Inicio/Inicio'
import Login from './paginas/Auth/Login'
import Registro from './paginas/Auth/Registro'
import Tienda from './paginas/Tienda/Tienda'
import Fechas from './paginas/Fechas/Fechas'
import Garage from './paginas/Garage/Garage'
import Navegantes from './paginas/Descargas/Navegantes'


import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar siempre visible arriba */}
        <Navbar />
        
        {/* Contenedor principal para todas las páginas */}
        <main>
          <Routes>
            {/* Ruta principal - Página de inicio CON CARRUSEL */}
            <Route path="/" element={<Inicio />} />
            
            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            
            {/* Rutas de usuario logueado */}
            <Route path="/garage" element={<Garage />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/perfil" element={<PaginaPerfil />} />
            <Route path="/perfil/editar" element={<PaginaEditarPerfil />} />
            
            {/* Rutas públicas */}
            <Route path="/fechas" element={<Fechas  />} />
            
            {/* Rutas de descargas */}
            <Route path="/descargas/guia-instalacion" element={<PaginaGuiaInstalacion />} />
            <Route path="/descargas/pack-autos" element={<PaginaPackAutos />} />
            <Route path="/descargas/pack-tramos" element={<PaginaPackTramos />} />
            <Route path="/descargas/links-vehiculos" element={<PaginaLinksVehiculos />} />
            <Route path="/descargas/links-tramos" element={<PaginaLinksTramos />} />
            <Route path="/descargas/navegantes" element={<Navegantes />} />
          </Routes>
        </main>

        {/* Footer siempre visible abajo */}
        <Footer />
      </div>
    </Router>
  )
}

// ============================================
//  COMPONENTES TEMPORALES (páginas placeholder)
//  Las demás páginas siguen siendo temporales
// ============================================

function PaginaLogin() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Página de Login</h2>
      <p className="text-secondary">Acá va el formulario de inicio de sesión</p>
    </Container>
  )
}

function PaginaRegistro() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Página de Registro</h2>
      <p className="text-secondary">Acá va el formulario de registro</p>
    </Container>
  )
}

function PaginaGarage() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Mi Garage</h2>
      <p className="text-secondary">Acá van tus vehículos comprados y alquilados</p>
    </Container>
  )
}

function PaginaTienda() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Tienda</h2>
      <p className="text-secondary">Acá va el catálogo de vehículos para comprar/alquilar</p>
    </Container>
  )
}

function PaginaPerfil() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Mi Perfil</h2>
      <p className="text-secondary">Acá va la información de tu perfil</p>
    </Container>
  )
}

function PaginaEditarPerfil() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Editar Perfil</h2>
      <p className="text-secondary">Acá podés modificar tus datos</p>
    </Container>
  )
}

function PaginaFechas() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Calendario de Fechas</h2>
      <p className="text-secondary">Acá van todos los rallies del año</p>
    </Container>
  )
}

function PaginaGuiaInstalacion() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Guía de Instalación</h2>
      <p className="text-secondary">Tutorial paso a paso</p>
    </Container>
  )
}

function PaginaPackAutos() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Pack Autos</h2>
      <p className="text-secondary">Descargá el pack completo de autos</p>
    </Container>
  )
}

function PaginaPackTramos() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Pack Tramos</h2>
      <p className="text-secondary">Descargá el pack completo de tramos</p>
    </Container>
  )
}

function PaginaLinksVehiculos() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Links Vehículos</h2>
      <p className="text-secondary">Enlaces a vehículos individuales</p>
    </Container>
  )
}

function PaginaLinksTramos() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Links Tramos</h2>
      <p className="text-secondary">Enlaces a tramos individuales</p>
    </Container>
  )
}

function PaginaNavegantes() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Navegantes</h2>
      <p className="text-secondary">Información sobre navegantes/copilotos</p>
    </Container>
  )
}

export default App