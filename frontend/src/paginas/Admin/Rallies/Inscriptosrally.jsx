import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, FileText, Eye, EyeOff } from 'lucide-react'
import api from '../../../config/api'
import styles from './InscriptosRally.module.css'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ========================================
// ORDEN DE CATEGORÍAS
// ========================================
const ordenarCategorias = (categorias) => {
  const rally = []
  const maxiRally = []
  const rc = []
  const resto = []

  for (const cat of categorias) {
    const nombre = cat.nombre.toLowerCase()
    if (nombre.startsWith('rally')) {
      rally.push(cat)
    } else if (nombre === 'maxi rally' || nombre === 'maxirally') {
      maxiRally.push(cat)
    } else if (nombre.startsWith('rc')) {
      rc.push(cat)
    } else {
      resto.push(cat)
    }
  }

  rally.sort((a, b) => {
    const numA = parseInt(a.nombre.replace(/\D/g, '')) || 0
    const numB = parseInt(b.nombre.replace(/\D/g, '')) || 0
    return numA - numB
  })

  rc.sort((a, b) => {
    const numA = parseInt(a.nombre.replace(/\D/g, '')) || 0
    const numB = parseInt(b.nombre.replace(/\D/g, '')) || 0
    return numA - numB
  })

  resto.sort((a, b) => a.nombre.localeCompare(b.nombre))

  return [...rally, ...maxiRally, ...rc, ...resto]
}

// ========================================
// CARGAR IMAGEN COMO BASE64
// ========================================
const cargarImagenBase64 = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function InscriptosRally() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [rally, setRally] = useState(null)
  const [inscriptos, setInscriptos] = useState([])
  const [totales, setTotales] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [generandoPdf, setGenerandoPdf] = useState(false)

  useEffect(() => {
    cargarInscriptos()
  }, [id])

  const cargarInscriptos = async () => {
    try {
      setCargando(true)
      setError('')
      const res = await api.get(`/admin/rallies/${id}/inscriptos`)
      setRally(res.data.rally)
      setInscriptos(res.data.inscriptos || [])
      setTotales(res.data.totales)
    } catch (error) {
      console.error('Error al cargar inscriptos:', error)
      setError(error.response?.data?.error || 'Error al cargar los inscriptos')
    } finally {
      setCargando(false)
    }
  }

  const toggleOcultar = async (transaccionId, tipoTransaccion) => {
    try {
      const ruta = tipoTransaccion === 'alquiler'
        ? `/admin/alquileres/${transaccionId}/ocultar`
        : `/admin/compras/${transaccionId}/ocultar`
      await api.patch(ruta)
      cargarInscriptos()
    } catch (error) {
      console.error('Error al ocultar:', error)
    }
  }

  // ========================================
  // VALIDAR ANTES DE GENERAR PDF
  // ========================================
  const validarParaPdf = () => {
    const pilotosConProblema = inscriptos.filter(piloto => {
      const activos = piloto.entradas.filter(e => !e.ocultoEnLista)
      return activos.length > 1
    })

    if (pilotosConProblema.length > 0) {
      const nombres = pilotosConProblema.map(p => `• ${p.nombre}`).join('\n')
      alert(
        `No se puede generar el PDF.\n\n` +
        `Los siguientes pilotos tienen más de un auto activo.\n` +
        `Ocultá el auto que NO usara:\n\n` +
        `${nombres}`
      )
      return false
    }
    return true
  }

  // ========================================
  // GENERAR PDF 
  // ========================================
  const generarPdf = async () => {
    if (!validarParaPdf()) return

    try {
      setGenerandoPdf(true)

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margen = 14
      const COLOR_PRINCIPAL = [0, 119, 182] 
      const anchoUtil = pageWidth - margen * 2

      // ── CABECERA Y LOGOS (Mantenido igual) ──────────────────
      doc.setFillColor(...COLOR_PRINCIPAL)
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.rect(0, 0, pageWidth, 17, 'FD')
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('LISTADO DE INSCRIPTOS', pageWidth / 2, 11, { align: 'center' })

      const yLogos = 21
      const nombreCampeonatoSlug = (rally.campeonato || '').toLowerCase().replace(/\s+/g, '-')
      const urlLogoCampeonato = `https://res.cloudinary.com/dmstm0fo0/image/upload/campeonato/${nombreCampeonatoSlug}.png`
      const logoData = await cargarImagenBase64(urlLogoCampeonato)
      if (logoData) {
        doc.addImage(logoData, 'PNG', margen, yLogos, 34, 14)
      } else {
        doc.setTextColor(20, 20, 20)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(rally.campeonato || '', margen, yLogos + 9)
      }

      const erallyData = await cargarImagenBase64('/src/assets/imagenes/erally-logo.png')
      if (erallyData) doc.addImage(erallyData, 'PNG', pageWidth - margen - 30, yLogos, 30, 12)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.text(rally.nombre, pageWidth / 2, yLogos + 7, { align: 'center' })
      doc.setFontSize(9)
      doc.text(new Date(rally.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }), pageWidth / 2, yLogos + 13, { align: 'center' })

      let yActual = yLogos + 18 + 5

      // ── PREPARAR DATOS ──────────────────────────────────────
      const pilotosPorCategoria = new Map()
      for (const piloto of inscriptos) {
        const entradaActiva = piloto.entradas.find(e => !e.ocultoEnLista)
        if (!entradaActiva) continue
        const catNombre = entradaActiva.vehiculo?.categoria?.nombre || 'Sin categoría'
        if (!pilotosPorCategoria.has(catNombre)) pilotosPorCategoria.set(catNombre, [])
        pilotosPorCategoria.get(catNombre).push([
          '', // Marcador de posición para orden (se llena luego)
          String(entradaActiva.numero || '0'), 
          piloto.nombre, 
          `${entradaActiva.vehiculo?.marca || ''} ${entradaActiva.vehiculo?.nombre || ''}`.trim()
        ])
      }

      const categoriasOrdenadas = ordenarCategorias(Array.from(pilotosPorCategoria.keys()).map(nombre => ({ nombre })))

      const filasFinales = []
      let ordenGlobal = 1

      categoriasOrdenadas.forEach(cat => {
        const lista = pilotosPorCategoria.get(cat.nombre)
        if (lista) {
          // CLAVE: El nombre de la clase se pone como primer elemento del array para que sea visible
          filasFinales.push([{ content: `Clase: ${cat.nombre}`, isSeccion: true }])
          lista.forEach(p => {
            p[0] = String(ordenGlobal++)
            filasFinales.push(p)
          })
        }
      })

      // ── TABLA UNIFICADA ──────────────────────────────────────
      autoTable(doc, {
        startY: yActual,
        head: [['Ord', 'N°', 'Piloto', 'Auto']],
        body: filasFinales,
        theme: 'grid',
        margin: { left: margen, right: margen },
        headStyles: { 
          fillColor: COLOR_PRINCIPAL, 
          textColor: [0, 0, 0], 
          fontStyle: 'bold', 
          halign: 'center', 
          lineWidth: 0.4, 
          lineColor: [0, 0, 0] 
        },
        styles: { 
          fontSize: 9, 
          textColor: [0, 0, 0], 
          lineColor: [0, 0, 0], 
          lineWidth: 0.2, 
          valign: 'middle' 
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 'auto', halign: 'center' },
          3: { cellWidth: 55, halign: 'center' },
        },
        didParseCell: (data) => {
          // Si la fila tiene la propiedad isSeccion
          if (data.row.raw[0] && data.row.raw[0].isSeccion) {
            data.cell.styles.fillColor = COLOR_PRINCIPAL
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.lineWidth = 0.4
            data.cell.styles.halign = 'center'
            data.cell.colSpan = 4 // Ocupa toda la fila
            
            // Forzamos el texto si no se asignó correctamente
            if (data.column.index === 0) {
              data.cell.text = [data.row.raw[0].content]
            }
          }
        },
        didDrawPage: (data) => {
          doc.setFontSize(8)
          doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth / 2, pageHeight - 6, { align: 'center' })
        }
      })

      // ── TEXTO FINAL ──────────────────────────────────────────
      yActual = doc.lastAutoTable.finalY
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(20, 20, 20)
      doc.text('Listado Aprobado por eRally', pageWidth - margen, yActual + 6, { align: 'right' })

      // ── GUARDAR ──────────────────────────────────────────────
      doc.save(`inscriptos-${rally.nombre.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } catch (error) {
      console.error(error)
    } finally {
      setGenerandoPdf(false)
    }
  }

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  })

  if (cargando) {
    return (
      <div className={styles.contenedor}>
        <Container>
          <div className={styles.loading}>Cargando inscriptos...</div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.contenedor}>
        <Container>
          <div className={styles.error}>{error}</div>
          <button className={styles.btnVolver} onClick={() => navigate('/admin/rallies')}>
            <ArrowLeft size={18} /> Volver
          </button>
        </Container>
      </div>
    )
  }

  // Armar filas aplanadas para la tabla con lógica de doble fila
  const filas = []
  for (const piloto of inscriptos) {
    piloto.entradas.forEach((entrada, index) => {
      filas.push({
        mostrarPiloto: index === 0,
        esContinuacion: index > 0,
        rowSpanCount: piloto.entradas.length,
        usuarioId: piloto.usuarioId,
        nombre: piloto.nombre,
        email: piloto.email,
        equipo: piloto.equipo,
        vehiculo: entrada.vehiculo,
        tipo: entrada.tipo,
        transaccionId: entrada.transaccionId,
        tipoTransaccion: entrada.tipoTransaccion,
        ocultoEnLista: entrada.ocultoEnLista,
        totalEntradas: piloto.entradas.length
      })
    })
  }

  return (
    <div className={styles.contenedor}>
      <Container>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerIzquierda}>
            <button className={styles.btnVolver} onClick={() => navigate('/admin/rallies')}>
              <ArrowLeft size={18} />
              Volver
            </button>
            <div>
              <div className={styles.campeonato}>{rally?.campeonato}</div>
              <h1 className={styles.titulo}>{rally?.nombre}</h1>
              <div className={styles.fecha}>{rally?.fecha && formatearFecha(rally.fecha)}</div>
            </div>
          </div>

          <div className={styles.headerDerecha}>
            <div className={styles.categorias}>
              {rally?.categorias?.map(cat => (
                <span
                  key={cat.id}
                  className={styles.badgeCategoria}
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.nombre}
                </span>
              ))}
            </div>

            <button
              className={styles.btnPdf}
              onClick={generarPdf}
              disabled={generandoPdf || filas.length === 0}
              title={filas.length === 0 ? 'No hay inscriptos' : 'Generar PDF'}
            >
              <FileText size={18} />
              {generandoPdf ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        {totales && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statNumero}>{totales.pilotos}</div>
              <div className={styles.statLabel}>Pilotos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumero}>{totales.alquilados}</div>
              <div className={styles.statLabel}>Alquilados</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumero}>{totales.comprados}</div>
              <div className={styles.statLabel}>Propios</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumero}>{totales.total}</div>
              <div className={styles.statLabel}>Total autos</div>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className={styles.tablaWrapper}>
          {filas.length === 0 ? (
            <div className={styles.vacio}>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <div>No hay inscriptos para esta fecha</div>
            </div>
          ) : (
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Piloto</th>
                  <th>Categoría</th>
                  <th>Vehículo</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, index) => (
                  <tr
                    key={`${fila.usuarioId}-${index}`}
                    className={`
                      ${fila.esContinuacion ? styles.filaContinuacion : ''}
                      ${fila.ocultoEnLista ? styles.filaOculta : ''}
                    `}
                  >
                    {/* Contador */}
                    <td>
                      {fila.mostrarPiloto ? (
                        <span className={styles.numeroPiloto}>
                          {filas.filter((f, i) => f.mostrarPiloto && i <= index).length}
                        </span>
                      ) : null}
                    </td>

                    {/* PILOTO */}
                    <td className={fila.esContinuacion ? styles.celdaContinuacion : ''}>
                      {fila.mostrarPiloto ? (
                        <>
                          <div className={styles.nombrePiloto}>{fila.nombre}</div>
                          <div className={styles.emailPiloto}>{fila.email}</div>
                        </>
                      ) : (
                        <div className={styles.continuacionIndicador}>↳</div>
                      )}
                    </td>

                    {/* CATEGORÍA */}
                    <td>
                      {fila.vehiculo?.categoria ? (
                        <span
                          className={styles.badgeCategoria}
                          style={{ backgroundColor: fila.vehiculo.categoria.color }}
                        >
                          {fila.vehiculo.categoria.nombre}
                        </span>
                      ) : (
                        <span className={styles.sinDato}>—</span>
                      )}
                    </td>

                    {/* VEHÍCULO */}
                    <td>
                      <div className={styles.vehiculoWrapper}>
                        <div>
                          <div className={styles.marcaVehiculo}>{fila.vehiculo?.marca}</div>
                          <div className={styles.modeloVehiculo}>{fila.vehiculo?.nombre}</div>
                        </div>
                      </div>
                    </td>

                    {/* TIPO */}
                    <td>
                      <span className={fila.tipo === 'alquilado' ? styles.badgeAlquilado : styles.badgeComprado}>
                        {fila.tipo === 'alquilado' ? 'Alquilado' : 'Propio'}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td>
                      <div className={styles.acciones}>
                        {fila.totalEntradas > 1 ? (
                          <button
                            className={`${styles.btnOcultar} ${fila.ocultoEnLista ? styles.btnOcultarActivo : ''}`}
                            onClick={() => toggleOcultar(fila.transaccionId, fila.tipoTransaccion)}
                            title={fila.ocultoEnLista ? 'Mostrar vehículo' : 'Ocultar vehículo'}
                          >
                            {fila.ocultoEnLista ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        ) : (
                          <span className={styles.sinAcciones}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </Container>
    </div>
  )
}

export default InscriptosRally