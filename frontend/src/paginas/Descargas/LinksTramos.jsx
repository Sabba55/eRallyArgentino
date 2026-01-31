import { useState, useEffect, useMemo } from 'react'
import { Container } from 'react-bootstrap'
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './LinksTramos.module.css'

function LinksTramos() {
  const [tramos, setTramos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const tramosPorPagina = 10

  // URL del CSV público
  const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRh52BP31kCSDZbAqStzbq9wETEQacSGHkbL8m5SDx2CQ1SkcZOxUV8DYdAqAo72JfLnuKYsOYY0dIw/pub?gid=0&single=true&output=csv"
  
  // URL del Google Sheets editable
  const urlSheets = "https://docs.google.com/spreadsheets/d/1exu6YBBAk4TALohi14mChQr6C8xWDcVsjsKfzrkVcho/edit?usp=sharing"

  useEffect(() => {
    const cargarTramos = async () => {
      try {
        setCargando(true)
        const response = await fetch(urlCSV)
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos')
        }

        const csvText = await response.text()
        
        // Parsear CSV manualmente
        const lineas = csvText.split('\n')
        const datos = []

        // Función para parsear una línea CSV respetando comillas
        const parsearLineaCSV = (linea) => {
          const resultado = []
          let dentroComillas = false
          let campoActual = ''
          
          for (let i = 0; i < linea.length; i++) {
            const char = linea[i]
            
            if (char === '"') {
              dentroComillas = !dentroComillas
            } else if (char === ',' && !dentroComillas) {
              resultado.push(campoActual.trim())
              campoActual = ''
            } else {
              campoActual += char
            }
          }
          
          // Agregar el último campo
          resultado.push(campoActual.trim())
          
          return resultado
        }

        // Saltar la primera línea (encabezados)
        for (let i = 1; i < lineas.length; i++) {
          const linea = lineas[i].trim()
          if (linea) {
            const valores = parsearLineaCSV(linea)
            
            // Asegurarse de que hay suficientes valores
            if (valores.length >= 4) {
              datos.push({
                fecha: valores[0] || '',
                nombre: valores[1] || '',
                link: valores[2] || '',
                clave: valores[3] || '' // La clave es el 5to campo (índice 4)
              })
            }
          }
        }

        // Invertir el orden para que el último cargado aparezca primero
        setTramos(datos.reverse())
        setError(null)
      } catch (err) {
        console.error('Error al cargar tramos:', err)
        setError('No se pudieron cargar los tramos. Intentá nuevamente más tarde.')
      } finally {
        setCargando(false)
      }
    }

    cargarTramos()
  }, [])

  // Filtrar tramos según búsqueda
  const tramosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return tramos

    const busquedaLower = busqueda.toLowerCase()
    return tramos.filter(tramo =>
      tramo.nombre.toLowerCase().includes(busquedaLower)
    )
  }, [tramos, busqueda])

  // Calcular paginación
  const totalPaginas = Math.ceil(tramosFiltrados.length / tramosPorPagina)
  const indiceInicio = (paginaActual - 1) * tramosPorPagina
  const indiceFin = indiceInicio + tramosPorPagina
  const tramosPaginados = tramosFiltrados.slice(indiceInicio, indiceFin)

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda])

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setBusqueda('')
  }

  // Cambiar de página
  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina)
    // Scroll suave hacia arriba de la tabla
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.contenedorLinksTramos}>
      <Container>
        
        {/* DIV ARRIBA - Título y Botón */}
        <div className={styles.divArriba}>
          
          {/* Título */}
          <div className={styles.contenedorTitulo}>
            <h1 className={styles.titulo}>Pack de Tramos</h1>
          </div>

          {/* Botón de enlace al Sheets */}
          <div className={styles.contenedorBoton}>
            <a 
              href={urlSheets}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.botonSheets}
            >
              <ExternalLink className={styles.iconoExternal} />
              Descargar en Google Sheets
            </a>
          </div>

        </div>

        {/* DIV ABAJO - Buscador, Tabla y Paginación */}
        <div className={styles.divAbajo}>
          
          {cargando ? (
            <div className={styles.estadoCarga}>
              <div className={styles.spinner}></div>
              <p className={styles.textoCarga}>Cargando tramos...</p>
            </div>
          ) : error ? (
            <div className={styles.estadoError}>
              <svg 
                className={styles.iconoError} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className={styles.textoError}>{error}</p>
            </div>
          ) : tramos.length === 0 ? (
            <div className={styles.estadoVacio}>
              <p className={styles.textoVacio}>No hay tramos disponibles en este momento</p>
            </div>
          ) : (
            <>
              {/* Barra de búsqueda y contador */}
              <div className={styles.barraBusqueda}>
                
                {/* Buscador */}
                <div className={styles.contenedorBuscador}>
                  <svg 
                    className={styles.iconoBuscar} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className={styles.inputBuscar}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  {busqueda && (
                    <button 
                      className={styles.botonLimpiar}
                      onClick={limpiarBusqueda}
                      aria-label="Limpiar búsqueda"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Contador de resultados */}
                <div className={styles.contadorResultados}>
                  <span className={styles.numeroResultados}>{tramosFiltrados.length}</span>
                  {tramosFiltrados.length === 1 ? ' Tramo' : ' Tramos'}
                </div>

              </div>

              {/* Tabla */}
              {tramosFiltrados.length === 0 ? (
                <div className={styles.sinResultados}>
                  <p>No se encontraron tramos que coincidan con "{busqueda}"</p>
                </div>
              ) : (
                <>
                  <div className={styles.contenedorTabla}>
                    <table className={styles.tabla}>
                      <thead>
                        <tr>
                          <th className={styles.columnaAño}>Año</th>
                          <th className={styles.columnaNombre}>Nombre</th>
                          <th className={styles.columnaLink}>Link</th>
                          <th className={styles.columnaClave}>Clave</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tramosPaginados.map((tramo, index) => (
                          <tr key={index} className={styles.fila}>
                            <td className={styles.celdaAño}>
                              {tramo.fecha || ''}
                            </td>
                            <td className={styles.celdaNombre}>
                              {tramo.nombre || ''}
                            </td>
                            <td className={styles.celdaLink}>
                              {tramo.link ? (
                                <a 
                                  href={tramo.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.botonLink}
                                >
                                  <svg 
                                    className={styles.iconoLink} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth={2} 
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
                                    />
                                  </svg>
                                  Descargar
                                </a>
                              ) : (
                                ''
                              )}
                            </td>
                            <td className={styles.celdaClave}>
                              {tramo.clave || ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {totalPaginas > 1 && (
                    <div className={styles.paginacion}>
                      
                      {/* Botón Anterior */}
                      <button
                        className={`${styles.botonPagina} ${paginaActual === 1 ? styles.deshabilitado : ''}`}
                        onClick={() => irAPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                      >
                        <ChevronLeft size={20} />
                        Anterior
                      </button>

                      {/* Números de página */}
                      <div className={styles.numerosPagina}>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                          <button
                            key={numero}
                            className={`${styles.numeroPagina} ${paginaActual === numero ? styles.activo : ''}`}
                            onClick={() => irAPagina(numero)}
                          >
                            {numero}
                          </button>
                        ))}
                      </div>

                      {/* Botón Siguiente */}
                      <button
                        className={`${styles.botonPagina} ${paginaActual === totalPaginas ? styles.deshabilitado : ''}`}
                        onClick={() => irAPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                      >
                        Siguiente
                        <ChevronRight size={20} />
                      </button>

                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>

      </Container>
    </div>
  )
}

export default LinksTramos