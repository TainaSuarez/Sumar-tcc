import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    // Verificar si ya existen categorías
    const existingCategories = await prisma.category.count();
    
    if (existingCategories > 0) {
      console.log('✅ Ya existen categorías en la base de datos');
      return;
    }

    // Crear categorías completas para todos los usuarios
    const categories = [
      {
        name: 'Salud',
        description: 'Campañas relacionadas con tratamientos médicos, medicamentos y atención sanitaria',
        color: '#ef4444', // rojo
        icon: '🏥',
        isActive: true
      },
      {
        name: 'Educación',
        description: 'Proyectos educativos, becas de estudio y material escolar',
        color: '#3b82f6', // azul
        icon: '📚',
        isActive: true
      },
      {
        name: 'Medio Ambiente',
        description: 'Iniciativas para proteger el medio ambiente y la naturaleza',
        color: '#22c55e', // verde
        icon: '🌱',
        isActive: true
      },
      {
        name: 'Emergencias',
        description: 'Ayuda urgente para situaciones de emergencia y desastres naturales',
        color: '#f59e0b', // amarillo/naranja
        icon: '🚨',
        isActive: true
      },
      {
        name: 'Animales',
        description: 'Protección y cuidado de animales en situación vulnerable',
        color: '#8b5cf6', // púrpura
        icon: '🐾',
        isActive: true
      },
      {
        name: 'Comunidad',
        description: 'Proyectos para mejorar la vida en comunidades locales',
        color: '#06b6d4', // cian
        icon: '🏘️',
        isActive: true
      },
      {
        name: 'Deportes',
        description: 'Apoyo a atletas y proyectos deportivos comunitarios',
        color: '#f97316', // naranja
        icon: '⚽',
        isActive: true
      },
      {
        name: 'Tecnología',
        description: 'Proyectos tecnológicos e innovación social',
        color: '#6366f1', // índigo
        icon: '💻',
        isActive: true
      },
      {
        name: 'Arte y Cultura',
        description: 'Proyectos artísticos, culturales y de patrimonio',
        color: '#ec4899', // rosa
        icon: '🎨',
        isActive: true
      },
      {
        name: 'Niños y Jóvenes',
        description: 'Apoyo a menores de edad y programas juveniles',
        color: '#10b981', // verde esmeralda
        icon: '👶',
        isActive: true
      },
      {
        name: 'Adultos Mayores',
        description: 'Cuidado y apoyo para personas de la tercera edad',
        color: '#f472b6', // rosa claro
        icon: '👴',
        isActive: true
      },
      {
        name: 'Discapacidad',
        description: 'Apoyo a personas con discapacidad e inclusión social',
        color: '#a855f7', // violeta
        icon: '♿',
        isActive: true
      },
      {
        name: 'Vivienda',
        description: 'Construcción, reparación y mejora de viviendas',
        color: '#0891b2', // azul oscuro
        icon: '🏠',
        isActive: true
      },
      {
        name: 'Alimentación',
        description: 'Combatir el hambre y la inseguridad alimentaria',
        color: '#dc2626', // rojo oscuro
        icon: '🍽️',
        isActive: true
      },
      {
        name: 'Emprendimiento',
        description: 'Apoyo a pequeños negocios y microemprendimientos',
        color: '#7c3aed', // púrpura oscuro
        icon: '💼',
        isActive: true
      },
      {
        name: 'Religión y Fe',
        description: 'Proyectos de comunidades religiosas y espirituales',
        color: '#4338ca', // índigo oscuro
        icon: '⛪',
        isActive: true
      }
    ];

    // Crear las categorías
    for (const categoryData of categories) {
      await prisma.category.create({
        data: categoryData
      });
    }

    console.log('✅ Categorías creadas exitosamente');
    console.log(`📁 Se crearon ${categories.length} categorías:`);
    categories.forEach(cat => console.log(`   ${cat.icon} ${cat.name}`));

    // Crear subcategorías para las categorías principales
    const createdCategories = await prisma.category.findMany({
      where: { isActive: true }
    });

    const subcategoriesData = [
      // Salud
      {
        categoryName: 'Salud',
        subcategories: [
          { name: 'Tratamientos Médicos', description: 'Cirugías, tratamientos especializados' },
          { name: 'Medicamentos', description: 'Compra de medicamentos costosos' },
          { name: 'Equipos Médicos', description: 'Sillas de ruedas, prótesis, etc.' },
          { name: 'Terapias', description: 'Fisioterapia, psicoterapia, rehabilitación' },
          { name: 'Emergencias Médicas', description: 'Atención médica urgente' }
        ]
      },
      // Educación
      {
        categoryName: 'Educación',
        subcategories: [
          { name: 'Becas de Estudio', description: 'Ayuda para costear estudios' },
          { name: 'Material Escolar', description: 'Libros, uniformes, útiles escolares' },
          { name: 'Infraestructura Educativa', description: 'Construcción y mejora de escuelas' },
          { name: 'Programas de Alfabetización', description: 'Enseñanza básica para adultos' },
          { name: 'Educación Técnica', description: 'Capacitación laboral y técnica' }
        ]
      },
      // Emergencias
      {
        categoryName: 'Emergencias',
        subcategories: [
          { name: 'Desastres Naturales', description: 'Terremotos, inundaciones, huracanes' },
          { name: 'Incendios', description: 'Pérdidas por incendios domiciliarios' },
          { name: 'Accidentes', description: 'Apoyo tras accidentes graves' },
          { name: 'Crisis Familiares', description: 'Situaciones económicas críticas' }
        ]
      },
      // Animales
      {
        categoryName: 'Animales',
        subcategories: [
          { name: 'Rescate Animal', description: 'Rescate de animales abandonados' },
          { name: 'Tratamientos Veterinarios', description: 'Atención médica para mascotas' },
          { name: 'Refugios', description: 'Mantenimiento de refugios de animales' },
          { name: 'Esterilización', description: 'Programas de control poblacional' }
        ]
      },
      // Vivienda
      {
        categoryName: 'Vivienda',
        subcategories: [
          { name: 'Construcción', description: 'Construcción de viviendas nuevas' },
          { name: 'Reparaciones', description: 'Arreglos y mejoras del hogar' },
          { name: 'Vivienda Social', description: 'Proyectos de vivienda comunitaria' },
          { name: 'Servicios Básicos', description: 'Agua, luz, gas para el hogar' }
        ]
      }
    ];

    for (const categoryData of subcategoriesData) {
      const category = createdCategories.find(cat => cat.name === categoryData.categoryName);
      if (category) {
        await prisma.subcategory.createMany({
          data: categoryData.subcategories.map(sub => ({
            name: sub.name,
            description: sub.description,
            categoryId: category.id,
            isActive: true
          }))
        });
      }
    }

    console.log('✅ Subcategorías de ejemplo creadas');

  } catch (error) {
    console.error('❌ Error al crear categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedCategories();
}

export default seedCategories;
