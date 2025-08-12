import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Salud y Medicina',
    description: 'Campañas para tratamientos médicos, cirugías, medicamentos y apoyo a pacientes.',
    isActive: true,
    color: '#ef4444', // red-500
    icon: 'heart-pulse'
  },
  {
    name: 'Educación',
    description: 'Proyectos educativos, becas de estudio, material escolar y programas de formación.',
    isActive: true,
    color: '#3b82f6', // blue-500
    icon: 'graduation-cap'
  },
  {
    name: 'Emergencias y Desastres',
    description: 'Ayuda urgente para víctimas de desastres naturales, incendios, inundaciones.',
    isActive: true,
    color: '#f59e0b', // amber-500
    icon: 'alert-triangle'
  },
  {
    name: 'Animales y Mascotas',
    description: 'Rescate animal, tratamientos veterinarios, refugios y protectoras.',
    isActive: true,
    color: '#10b981', // emerald-500
    icon: 'heart'
  },
  {
    name: 'Deportes y Recreación',
    description: 'Equipos deportivos, competiciones, instalaciones deportivas y actividades recreativas.',
    isActive: true,
    color: '#8b5cf6', // violet-500
    icon: 'trophy'
  },
  {
    name: 'Arte y Cultura',
    description: 'Proyectos artísticos, eventos culturales, museos, teatro y expresiones creativas.',
    isActive: true,
    color: '#ec4899', // pink-500
    icon: 'palette'
  },
  {
    name: 'Tecnología e Innovación',
    description: 'Startups, proyectos tecnológicos, investigación e innovación.',
    isActive: true,
    color: '#06b6d4', // cyan-500
    icon: 'cpu'
  },
  {
    name: 'Medio Ambiente',
    description: 'Conservación, reforestación, energías renovables y sostenibilidad.',
    isActive: true,
    color: '#22c55e', // green-500
    icon: 'leaf'
  },
  {
    name: 'Comunidad y Sociedad',
    description: 'Proyectos comunitarios, infraestructura local, centros comunitarios.',
    isActive: true,
    color: '#f97316', // orange-500
    icon: 'users'
  },
  {
    name: 'Emprendimiento',
    description: 'Nuevos negocios, microemprendimientos, proyectos comerciales.',
    isActive: true,
    color: '#84cc16', // lime-500
    icon: 'rocket'
  },
  {
    name: 'Religión y Fe',
    description: 'Proyectos religiosos, construcción de templos, misiones y actividades espirituales.',
    isActive: true,
    color: '#6366f1', // indigo-500
    icon: 'church'
  },
  {
    name: 'Viajes y Aventuras',
    description: 'Expediciones, viajes solidarios, intercambios culturales.',
    isActive: true,
    color: '#14b8a6', // teal-500
    icon: 'map-pin'
  },
  {
    name: 'Familia e Infancia',
    description: 'Apoyo a familias necesitadas, orfanatos, cuidado infantil.',
    isActive: true,
    color: '#f472b6', // pink-400
    icon: 'baby'
  },
  {
    name: 'Personas Mayores',
    description: 'Cuidado de ancianos, residencias, programas para la tercera edad.',
    isActive: true,
    color: '#a855f7', // purple-500
    icon: 'user-check'
  },
  {
    name: 'Discapacidad e Inclusión',
    description: 'Apoyo a personas con discapacidad, accesibilidad, integración social.',
    isActive: true,
    color: '#0ea5e9', // sky-500
    icon: 'accessibility'
  }
];

async function seedCategories() {
  console.log('🌱 Iniciando seed de categorías...');

  try {
    // Limpiar categorías existentes (opcional)
    console.log('🗑️ Limpiando categorías existentes...');
    await prisma.category.deleteMany();

    // Crear nuevas categorías
    console.log('📂 Creando nuevas categorías...');
    
    for (const category of categories) {
      const createdCategory = await prisma.category.create({
        data: category
      });
      console.log(`✅ Creada categoría: ${createdCategory.name} (ID: ${createdCategory.id})`);
    }

    console.log(`🎉 ¡Seed completado! Se crearon ${categories.length} categorías.`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedCategories()
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { seedCategories };
