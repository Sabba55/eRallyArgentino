import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env') });

// ========================================
// DATOS: CATEGORÍAS
// ========================================
const categorias = [
  { nombre: "Rally2", descripcion: "Categoría Rally2 - 4x4 de alto rendimiento", color: "#00d4ff" },
  { nombre: "R5", descripcion: "Categoría R5 - 4x4 competición", color: "#39ff14" },
  { nombre: "Rally3", descripcion: "Categoría Rally3 - 4x4 intermedio", color: "#ff6b00" },
  { nombre: "Rally4", descripcion: "Categoría Rally4 - Tracción delantera", color: "#ffd60a" },
  { nombre: "Maxi Rally", descripcion: "Categoría Maxi Rally - 4x4 turbo y aspirado", color: "#9d4edd" },
  { nombre: "N4", descripcion: "Categoría N4 - 4x4 nacional", color: "#e63946" },
  { nombre: "RC3", descripcion: "Categoría RC3 - Tracción delantera junior", color: "#ff006e" },
  { nombre: "A1", descripcion: "Categoría A1 - Tracción delantera competición", color: "#ff0037" },
  { nombre: "N1", descripcion: "Categoría N1 - Tracción delantera nacional", color: "#2a9d8f" },
  { nombre: "RC5", descripcion: "Categoría RC5 - Tracción delantera regional", color: "#0077b6" }
];

// ========================================
// DATOS: VEHÍCULOS POR CATEGORÍA
// ========================================
const vehiculosPorCategoria = {
  "Rally2": [
    { marca: "Toyota", nombre: "Yaris", foto: "/vehiculos/rally2/toyota-yaris.jpg", precioCompra: 80000, precioAlquiler: 12000 },
    { marca: "Skoda", nombre: "Fabia RS", foto: "/vehiculos/rally2/skoda-fabia-rs.jpg", precioCompra: 80000, precioAlquiler: 12000 },
    { marca: "Hyundai", nombre: "i20 N", foto: "/vehiculos/rally2/hyundai-i20-n.jpg", precioCompra: 75000, precioAlquiler: 11250 },
    { marca: "Ford", nombre: "Fiesta", foto: "/vehiculos/rally2/ford-fiesta.jpg", precioCompra: 75000, precioAlquiler: 11250 },
    { marca: "Citroen", nombre: "C3", foto: "/vehiculos/rally2/citroen-c3.jpg", precioCompra: 73000, precioAlquiler: 10950 },
    { marca: "Skoda", nombre: "Fabia Evo", foto: "/vehiculos/rally2/skoda-fabia-evo.jpg", precioCompra: 73000, precioAlquiler: 10950 }
  ],
  "R5": [
    { marca: "Skoda", nombre: "Fabia", foto: "/vehiculos/r5/skoda-fabia.jpg", precioCompra: 65000, precioAlquiler: 9750 },
    { marca: "Vw", nombre: "Polo", foto: "/vehiculos/r5/vw-polo.jpg", precioCompra: 65000, precioAlquiler: 9750 },
    { marca: "Hyundai", nombre: "i20", foto: "/vehiculos/r5/hyundai-i20.jpg", precioCompra: 61000, precioAlquiler: 9150 },
    { marca: "Ford", nombre: "Fiesta", foto: "/vehiculos/r5/ford-fiesta.jpg", precioCompra: 59000, precioAlquiler: 8850 }
  ],
  "Rally3": [
    { marca: "Ford", nombre: "Fiesta Evo", foto: "/vehiculos/rally3/ford-fiesta-evo.jpg", precioCompra: 55000, precioAlquiler: 8250 },
    { marca: "Renault", nombre: "Clio", foto: "/vehiculos/rally3/renault-clio.jpg", precioCompra: 53000, precioAlquiler: 7950 }
  ],
  "Rally4": [
    { marca: "Peugeot", nombre: "208", foto: "/vehiculos/rally4/peugeot-208.jpg", precioCompra: 39000, precioAlquiler: 5850 },
    { marca: "Renault", nombre: "Clio", foto: "/vehiculos/rally4/renault-clio.jpg", precioCompra: 38000, precioAlquiler: 5700 }
  ],
  "Maxi Rally": [
    { marca: "Maxi Rally", nombre: "Turbo", foto: "/vehiculos/maxi-rally/turbo.jpg", precioCompra: 52000, precioAlquiler: 7800 },
    { marca: "Maxi Rally", nombre: "Aspirado", foto: "/vehiculos/maxi-rally/aspirado.jpg", precioCompra: 45000, precioAlquiler: 6750 }
  ],
  "N4": [
    { marca: "Vw", nombre: "Golf Proto", foto: "/vehiculos/n4/proto.jpg", precioCompra: 43000, precioAlquiler: 6450 },
    { marca: "Mitsubishi", nombre: "Lancer Evo X", foto: "/vehiculos/n4/mitsubishi-lancer-evo-x.jpg", precioCompra: 40000, precioAlquiler: 6000 },
    { marca: "Mitsubishi", nombre: "Lancer Evo IX", foto: "/vehiculos/n4/mitsubishi-lancer-evo-ix.jpg", precioCompra: 39000, precioAlquiler: 5850 },
    { marca: "Subaru", nombre: "Impreza", foto: "/vehiculos/n4/subaru-2008.jpg", precioCompra: 39000, precioAlquiler: 5850 },
    { marca: "Subaru", nombre: "Impreza 2003", foto: "/vehiculos/n4/subaru-2003.jpg", precioCompra: 36000, precioAlquiler: 5400 },
    { marca: "Mitsubishi", nombre: "Lancer Evo VI", foto: "/vehiculos/n4/mitsubishi-lancer-evo-vi.jpg", precioCompra: 35000, precioAlquiler: 5250 },
    { marca: "Subaru", nombre: "Impreza WRX", foto: "/vehiculos/n4/subaru-1998.jpg", precioCompra: 35000, precioAlquiler: 5250 }
  ],
  "RC3": [
    { marca: "Junior", nombre: "Modelo Junior", foto: "/vehiculos/rc3/rc3.jpg", precioCompra: 37000, precioAlquiler: 5550 }
  ],
  "A1": [
    { marca: "Vw", nombre: "Gol Trend", foto: "/vehiculos/a1/vw-gol-trend.jpg", precioCompra: 37000, precioAlquiler: 5550 },
    { marca: "Vw", nombre: "Gol Power", foto: "/vehiculos/a1/gol-power.jpg", precioCompra: 35000, precioAlquiler: 5250 }
  ],
  "N1": [
    { marca: "Ford", nombre: "Fiesta", foto: "/vehiculos/n1/ford-fiesta.jpg", precioCompra: 35000, precioAlquiler: 5250 },
    { marca: "Vw", nombre: "Gol Trend", foto: "/vehiculos/n1/gol-trend.jpg", precioCompra: 33000, precioAlquiler: 4950 },
    { marca: "Vw", nombre: "Gol Power", foto: "/vehiculos/n1/gol-power.jpg", precioCompra: 30000, precioAlquiler: 4500 }
  ],
  "RC5": [
    { marca: "Peugeot", nombre: "208", foto: "/vehiculos/rc5/peugeot-208.jpg", precioCompra: 35000, precioAlquiler: 5250 },
    { marca: "Ford", nombre: "Fiesta Kinetic", foto: "/vehiculos/rc5/ford-fiesta-kinetic.jpg", precioCompra: 33000, precioAlquiler: 4950 },
    { marca: "Nissan", nombre: "March", foto: "/vehiculos/rc5/nissan-march.jpg", precioCompra: 32000, precioAlquiler: 4800 },
    { marca: "Ford", nombre: "Ka Kinetic", foto: "/vehiculos/rc5/ford-ka-kinetic.jpg", precioCompra: 32000, precioAlquiler: 4800 },
    { marca: "Vw", nombre: "Gol Trend", foto: "/vehiculos/rc5/gol-trend.jpg", precioCompra: 30000, precioAlquiler: 4500 },
    { marca: "Ford", nombre: "Ka Viral", foto: "/vehiculos/rc5/ford-ka-viral.jpg", precioCompra: 30000, precioAlquiler: 4500 }
  ]
};

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================
async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // ========================================
    // 1. LIMPIAR TABLAS (OPCIONAL)
    // ========================================
    console.log('🧹 Limpiando tablas existentes...');
    
    await client.query('TRUNCATE TABLE vehiculos_categorias CASCADE');
    await client.query('TRUNCATE TABLE vehiculos RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE categorias RESTART IDENTITY CASCADE');
    
    console.log('   ✓ Tablas limpiadas\n');

    // ========================================
    // 2. CREAR CATEGORÍAS
    // ========================================
    console.log('📁 Creando categorías...');
    
    const categoriasCreadas = {};
    
    for (const cat of categorias) {
      const result = await client.query(
        `INSERT INTO categorias (nombre, descripcion, color, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, nombre`,
        [cat.nombre, cat.descripcion, cat.color]
      );
      
      categoriasCreadas[cat.nombre] = result.rows[0].id;
      console.log(`   ✓ ${cat.nombre} (ID: ${result.rows[0].id})`);
    }
    
    console.log(`\n✅ ${categorias.length} categorías creadas\n`);

    // ========================================
    // 3. CREAR VEHÍCULOS Y ASIGNAR CATEGORÍAS
    // ========================================
    console.log('🚗 Creando vehículos...\n');
    
    let totalVehiculos = 0;
    
    for (const [nombreCategoria, vehiculos] of Object.entries(vehiculosPorCategoria)) {
      const categoriaId = categoriasCreadas[nombreCategoria];
      
      console.log(`   📂 Categoría: ${nombreCategoria}`);
      
      for (const vehiculo of vehiculos) {
        // Crear vehículo
        const result = await client.query(
          `INSERT INTO vehiculos (marca, nombre, foto, "precioCompra", "precioAlquiler", disponible, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING id`,
          [vehiculo.marca, vehiculo.nombre, vehiculo.foto, vehiculo.precioCompra, vehiculo.precioAlquiler, true]
        );
        
        const vehiculoId = result.rows[0].id;
        
        // Asignar categoría al vehículo
        await client.query(
          `INSERT INTO vehiculos_categorias ("vehiculoId", "categoriaId", "createdAt")
           VALUES ($1, $2, NOW())`,
          [vehiculoId, categoriaId]
        );
        
        console.log(`      ✓ ${vehiculo.marca} ${vehiculo.nombre} (ID: ${vehiculoId})`);
        totalVehiculos++;
      }
      
      console.log('');
    }
    
    console.log(`✅ ${totalVehiculos} vehículos creados y categorizados\n`);

    // ========================================
    // 4. RESUMEN FINAL
    // ========================================
    console.log('========================================');
    console.log('🎉 SEED COMPLETADO EXITOSAMENTE');
    console.log('========================================');
    console.log(`📁 Categorías: ${categorias.length}`);
    console.log(`🚗 Vehículos: ${totalVehiculos}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Conexión cerrada\n');
  }
}

// ========================================
// EJECUTAR SEED
// ========================================
seed()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });