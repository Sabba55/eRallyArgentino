import { useState } from 'react'
import styles from './FiltrosTienda.module.css'

function FiltrosTienda({ categorias, onFiltrar, totalResultados, vehiculos }) {
  const [filtros, setFiltros] = useState({
    categoria: 'todas',
    marca: 'todas',
    ordenarPor: 'default',
    busqueda: ''
  })

  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor }
    setFiltros(nuevosFiltros)
    onFiltrar(nuevosFiltros)
  }

  const limpiarFiltros = () => {
    const filtrosLimpios = {
      categoria: 'todas',
      marca: 'todas',
      ordenarPor: 'default',
      busqueda: ''
    }
    setFiltros(filtrosLimpios)
    onFiltrar(filtrosLimpios)
  }

  // Extraer marcas únicas de todos los vehículos
  const marcas = ['todas', ...new Set(
    vehiculos.map(v => v.marca).sort()
  )]

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtros.categoria !== 'todas' || 
                            filtros.marca !== 'todas' || 
                            filtros.ordenarPor !== 'default' ||
                            filtros.busqueda !== ''

  return (
    <div className={styles.contenedorPrincipal}>
      
      {/* Contenedor unificado */}
      <div className={styles.contenedorUnificado}>

        {/* Sección superior: Filtros */}
        <div className={styles.seccionFiltros}>
          
          {/* Filtro por categoría */}
          <div className={styles.filtro}>
            <label className={styles.label}>Categoría</label>
            <select 
              className={styles.select}
              value={filtros.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              {Object.keys(categorias).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtro por marca */}
          <div className={styles.filtro}>
            <label className={styles.label}>Marca</label>
            <select 
              className={styles.select}
              value={filtros.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
            >
              {marcas.map(marca => (
                <option key={marca} value={marca}>
                  {marca === 'todas' ? 'Todas las marcas' : marca}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div className={styles.filtro}>
            <label className={styles.label}>Ordenar por</label>
            <select 
              className={styles.select}
              value={filtros.ordenarPor}
              onChange={(e) => handleChange('ordenarPor', e.target.value)}
            >
              <option value="default">Por defecto</option>
              <option value="precioCompra-asc">Precio compra (menor a mayor)</option>
              <option value="precioCompra-desc">Precio compra (mayor a menor)</option>
              <option value="precioAlquiler-asc">Precio alquiler (menor a mayor)</option>
              <option value="precioAlquiler-desc">Precio alquiler (mayor a menor)</option>
              <option value="nombre-asc">Nombre (A-Z)</option>
              <option value="nombre-desc">Nombre (Z-A)</option>
            </select>
          </div>

        </div>

        {/* Sección inferior: Buscador + Contador + Limpiar */}
        <div className={styles.seccionBusqueda}>
          
          {/* Buscador */}
          <div className={styles.buscador}>
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
              placeholder="Buscar por marca o modelo..."
              className={styles.inputBuscar}
              value={filtros.busqueda}
              onChange={(e) => handleChange('busqueda', e.target.value)}
            />
            {filtros.busqueda && (
              <button 
                className={styles.botonLimpiarBusqueda}
                onClick={() => handleChange('busqueda', '')}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          {/* Contador de resultados */}
          <div className={styles.contadorResultados}>
            <span className={styles.numeroResultados}>{totalResultados}</span> {totalResultados === 1 ? 'Vehículo' : 'Vehículos'}
          </div>

          {/* Botón limpiar filtros */}
          {hayFiltrosActivos && (
            <button 
              className={styles.botonLimpiar}
              onClick={limpiarFiltros}
            >
              <svg 
                className={styles.iconoLimpiar} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Limpiar filtros
            </button>
          )}

        </div>

      </div>

    </div>
  )
}

export default FiltrosTienda