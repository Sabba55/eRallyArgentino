import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'

// ========================================
// CONTEXTO DE AUTENTICACIÓN
// ========================================
import { AuthProvider } from './contexts/AuthContext'
import { RutaProtegida, RutaPublica } from './componentes/RutaProtegida'

// ========================================
// COMPONENTES DE LAYOUT
// ========================================
import Navbar from './componentes/layout/Navbar'
import Footer from './componentes/layout/Footer'

// ========================================
// PÁGINAS
// ========================================
import Inicio from './paginas/Inicio/Inicio'
import Login from './paginas/Auth/Login'
import Registro from './paginas/Auth/Registro'
import VerificarEmail from './paginas/Auth/VerificarEmail'
import RecuperarPassword from './paginas/Auth/RecuperarPassword'
import ResetearPassword from './paginas/Auth/ResetearPassword'
import Tienda from './paginas/Tienda/Tienda'
import Fechas from './paginas/Fechas/Fechas'
import Garage from './paginas/Garage/Garage'
import Navegantes from './paginas/Descargas/Navegantes'
import LinksTramos from './paginas/Descargas/LinksTramos'
import Perfil from './paginas/Perfil/Perfil'
import EditarPerfil from './paginas/Perfil/EditarPerfil'

// ========================================
// ADMIN
// ========================================
import Admin from './paginas/Admin/Admin'
import AdminVehiculos from './paginas/Admin/Vehiculos/AdminVehiculos.jsx'
import AdminCategorias from './paginas/Admin/Categorias/AdminCategorias'
import AdminRallies from './paginas/Admin/Rallies/AdminRallies'
import AdminUsuarios from './paginas/Admin/Usuarios/AdminUsuarios'


import './App.css'

function App() {
  return (
    <Router>
      {/* AuthProvider envuelve toda la app para que el contexto esté disponible en todos lados */}
      <AuthProvider>
        <div className="App">
          {/* Navbar siempre visible arriba */}
          <Navbar />
          
          {/* Contenedor principal para todas las páginas */}
          <main>
            <Routes>
              {/* ========================================
                  RUTAS PÚBLICAS (Acceso sin login)
                  ======================================== */}
              <Route path="/" element={<Inicio />} />
              <Route path="/fechas" element={<Fechas />} />
              
              {/* ========================================
                  RUTAS DE AUTENTICACIÓN
                  Solo para usuarios NO logueados
                  ======================================== */}
              <Route 
                path="/login" 
                element={
                  <RutaPublica>
                    <Login />
                  </RutaPublica>
                } 
              />
              <Route 
                path="/registro" 
                element={
                  <RutaPublica>
                    <Registro />
                  </RutaPublica>
                } 
              />
              
              <Route 
                path="/verificar-email/:token" 
                element={<VerificarEmail />
                } 
              />
              <Route path="/recuperar-password" element={<RecuperarPassword />} />
              <Route path="/resetear-password/:token" element={<ResetearPassword />} />
              {/* ========================================
                  RUTAS PROTEGIDAS (Requieren login)
                  ======================================== */}
              <Route 
                path="/garage" 
                element={
                  <RutaProtegida>
                    <Garage />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/tienda" 
                element={
                  <RutaProtegida>
                    <Tienda />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <RutaProtegida>
                    <Perfil />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/perfil/editar" 
                element={
                  <RutaProtegida>
                    <EditarPerfil />
                  </RutaProtegida>
                } 
              />
              {/* ========================================
                RUTAS DEL PANEL ADMIN (Privadas)
              ======================================== */}
              <Route 
                path="/admin" 
                element={
                  <RutaProtegida rolesPermitidos={['admin', 'creador_fechas']}>
                    <Admin />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/admin/vehiculos" 
                element={
                  <RutaProtegida rolesPermitidos={['admin']}>
                    <AdminVehiculos />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/admin/categorias" 
                element={
                  <RutaProtegida rolesPermitidos={['admin']}>
                    <AdminCategorias />
                  </RutaProtegida>
                } 
              />
              <Route 
                path="/admin/rallies" 
                element={
                  <RutaProtegida rolesPermitidos={['admin', 'creador_fechas']}>
                    <AdminRallies />
                  </RutaProtegida>
                } 
              />
              <Route path="/admin/usuarios" element={
                <RutaProtegida rolesPermitidos={['admin']}>
                  <AdminUsuarios />
                </RutaProtegida>
              } />
              {/* ========================================
                  RUTAS DE DESCARGAS (Públicas)
                  ======================================== */}
              <Route path="/descargas/guia-instalacion" element={<PaginaGuiaInstalacion />} />
              <Route path="/descargas/links-vehiculos" element={<PaginaLinksVehiculos />} />
              <Route path="/descargas/links-tramos" element={<LinksTramos />} />
              <Route path="/descargas/pack-tramos" element={<LinksTramos />} />
              <Route path="/descargas/navegantes" element={<Navegantes />} />
            </Routes>
          </main>

          {/* Footer siempre visible abajo */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

// ============================================
//  COMPONENTES TEMPORALES (páginas placeholder)
//  Las demás páginas siguen siendo temporales
// ============================================

function PaginaGuiaInstalacion() {
  return (
    <Container className="py-5" style={{ minHeight: '60vh' }}>
      <h2 className="text-white">Guía de Instalación</h2>
      <p className="text-secondary">Tutorial paso a paso</p>
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

export default App