// EJECUTAR ESTE SCRIPT EN NODE.JS
// Archivo: recrear-usuario-admin.js

import bcrypt from 'bcrypt';
import { Usuario } from './modelos/index.js';

async function crearUsuarioAdmin() {
  try {
    console.log('🔄 Creando usuario admin...');

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHash = await bcrypt.hash('Laraferni55', salt);

    // Crear usuario
    const usuario = await Usuario.create({
      nombre: 'Martin Sabbatini',
      email: 'martinurielsabbatini@gmail.com',
      contraseña: contraseñaHash,
      equipo: 'DLM Racing',
      rol: 'admin',
      emailVerificado: true
    });

    console.log('✅ Usuario admin creado exitosamente!');
    console.log('📧 Email:', usuario.email);
    console.log('🔑 Contraseña: Laraferni55');
    console.log('👤 Rol:', usuario.rol);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    process.exit(1);
  }
}

crearUsuarioAdmin();