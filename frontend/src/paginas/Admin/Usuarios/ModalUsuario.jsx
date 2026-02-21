import { useState, useEffect } from 'react'
import { Modal, Form } from 'react-bootstrap'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../config/api'
import TabCompras from './componentes/TabCompras'
import TabAlquileres from './componentes/TabAlquileres'
import TabHistorial from './componentes/TabHistorial'
import styles from './ModalUsuario.module.css'

function ModalUsuario({ show, onHide, usuario, onGuardado }) {
  // ========================================
  // ESTADOS
  // ========================================
  const [pestañaActiva, setPestañaActiva] = useState('info')

  // Info editable
  const [rolSeleccionado, setRolSeleccionado] = useState(usuario.rol)
  const [guardandoRol, setGuardandoRol] = useState(false)

  // ========================================
  // RESETEAR AL ABRIR
  // ========================================
  useEffect(() => {
    if (show && usuario) {
      setRolSeleccionado(usuario.rol)
      setPestañaActiva('info')
    }
  }, [show, usuario])

  // ========================================
  // OBTENER INICIALES
  // ========================================
  const obtenerIniciales = (nombre) => {
    if (!nombre) return '?'
    const palabras = nombre.trim().split(' ')
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
    }
    return nombre.substring(0, 2).toUpperCase()
  }

  // ========================================
  // BADGE ROL
  // ========================================
  const badgeRol = (rol) => {
    const config = {
      admin: { label: 'Admin', clase: styles.badgeAdmin },
      creador_fechas: { label: 'Creador', clase: styles.badgeCreador },
      usuario: { label: 'Usuario', clase: styles.badgeUsuario }
    }
    const c = config[rol] || config.usuario
    return <span className={c.clase}>{c.label}</span>
  }

  // ========================================
  // GUARDAR ROL
  // ========================================
  const guardarRol = async () => {
    try {
      setGuardandoRol(true)
      await api.put(`/usuarios/${usuario.id}/rol`, { rol: rolSeleccionado })
      
      toast.success('Rol actualizado')
      
      if (onGuardado) onGuardado()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Error al cambiar rol')
    } finally {
      setGuardandoRol(false)
    }
  }

  // ========================================
  // FORMATEAR FECHA
  // ========================================
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ========================================
  // CALLBACK ACTUALIZACIÓN
  // ========================================
  const handleActualizacion = () => {
    if (onGuardado) onGuardado()
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={styles.modal}
      contentClassName={styles.modalContenido}
    >
      
      {/* HEADER */}
      <div className={styles.modalHeader}>
        <div className={styles.usuarioHeader}>
          {usuario.fotoPerfil ? (
            <img
              src={usuario.fotoPerfil}
              alt={usuario.nombre}
              className={styles.fotoPerfil}
            />
          ) : (
            <div className={styles.fotoPlaceholder}>
              {obtenerIniciales(usuario.nombre)}
            </div>
          )}

          <div>
            <h3 className={styles.usuarioNombre}>{usuario.nombre}</h3>
            <p className={styles.usuarioEmail}>{usuario.email}</p>
            <div className={styles.badges}>
              {badgeRol(usuario.rol)}
              {usuario.emailVerificado && (
                <span className={styles.badgeVerificado}>✓ Verificado</span>
              )}
            </div>
          </div>
        </div>

        <button className={styles.btnCerrar} onClick={onHide}>
          <X size={24} />
        </button>
      </div>

      {/* PESTAÑAS */}
      <div className={styles.pestañas}>
        <button
          className={`${styles.pestañaBtn} ${pestañaActiva === 'info' ? styles.pestañaActiva : ''}`}
          onClick={() => setPestañaActiva('info')}
        >
          Información
        </button>
        <button
          className={`${styles.pestañaBtn} ${pestañaActiva === 'compras' ? styles.pestañaActiva : ''}`}
          onClick={() => setPestañaActiva('compras')}
        >
          Compras
        </button>
        <button
          className={`${styles.pestañaBtn} ${pestañaActiva === 'alquileres' ? styles.pestañaActiva : ''}`}
          onClick={() => setPestañaActiva('alquileres')}
        >
          Alquileres
        </button>
        <button
          className={`${styles.pestañaBtn} ${pestañaActiva === 'historial' ? styles.pestañaActiva : ''}`}
          onClick={() => setPestañaActiva('historial')}
        >
          Historial
        </button>
      </div>

      {/* BODY */}
      <Modal.Body className={styles.body}>

        {/* TAB: INFORMACIÓN */}
        {pestañaActiva === 'info' && (
          <div className={styles.infoGrid}>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nombre</span>
              <span className={styles.infoValor}>{usuario.nombre}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValor}>{usuario.email}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Equipo</span>
              <span className={styles.infoValor}>{usuario.equipo || '—'}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email Verificado</span>
              <span className={usuario.emailVerificado ? styles.verificadoSi : styles.verificadoNo}>
                {usuario.emailVerificado ? 'Sí' : 'No'}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Rol</span>
              <div className={styles.rolEditar}>
                <Form.Select
                  value={rolSeleccionado}
                  onChange={(e) => setRolSeleccionado(e.target.value)}
                  className={styles.selectRol}
                  disabled={guardandoRol}
                >
                  <option value="usuario">Usuario</option>
                  <option value="creador_fechas">Creador de Fechas</option>
                  <option value="admin">Administrador</option>
                </Form.Select>
                {rolSeleccionado !== usuario.rol && (
                  <button
                    className={styles.btnGuardarRol}
                    onClick={guardarRol}
                    disabled={guardandoRol}
                  >
                    {guardandoRol ? 'Guardando...' : 'Guardar'}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Fecha de Registro</span>
              <span className={styles.infoValor}>
                {formatearFecha(usuario.createdAt)}
              </span>
            </div>

          </div>
        )}

        {/* TAB: COMPRAS */}
        {pestañaActiva === 'compras' && (
          <TabCompras 
            usuarioId={usuario.id} 
            onActualizar={handleActualizacion}
          />
        )}

        {/* TAB: ALQUILERES */}
        {pestañaActiva === 'alquileres' && (
          <TabAlquileres 
            usuarioId={usuario.id}
            onActualizar={handleActualizacion}
          />
        )}

        {/* TAB: HISTORIAL */}
        {pestañaActiva === 'historial' && (
          <TabHistorial usuarioId={usuario.id} />
        )}

      </Modal.Body>

    </Modal>
  )
}

export default ModalUsuario