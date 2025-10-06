const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Tecnología',
    description: 'Proyectos de innovación tecnológica, gadgets, software y hardware'
  },
  {
    name: 'Arte y Cultura',
    description: 'Proyectos artísticos, culturales, música, teatro y expresiones creativas'
  },
  {
    name: 'Educación',
    description: 'Proyectos educativos, becas, programas de formación y desarrollo académico'
  },
  {
    name: 'Salud y Bienestar',
    description: 'Proyectos relacionados con salud, bienestar, medicina y tratamientos'
  },
  {
    name: 'Medio Ambiente',
    description: 'Proyectos ecológicos, sostenibilidad, conservación y energías renovables'
  },
  {
    name: 'Deportes',
    description: 'Proyectos deportivos, equipos, competencias y actividades físicas'
  },
  {
    name: 'Emprendimiento',
    description: 'Startups, nuevos negocios, productos innovadores y emprendimientos'
  },
  {
    name: 'Causas Sociales',
    description: 'Proyectos de impacto social, ayuda humanitaria y causas benéficas'
  },
  {
    name: 'Viajes y Aventuras',
    description: 'Proyectos de viajes, expediciones, documentales y aventuras'
  },
  {
    name: 'Comida y Bebidas',
    description: 'Proyectos gastronómicos, restaurantes, productos alimenticios'
  },
  {
    name: 'Moda y Diseño',
    description: 'Proyectos de moda, diseño, accesorios y productos de estilo'
  },
  {
    name: 'Juegos y Entretenimiento',
    description: 'Videojuegos, juegos de mesa, entretenimiento y diversión'
  },
  {
    name: 'Libros y Publicaciones',
    description: 'Libros, revistas, publicaciones y proyectos editoriales'
  },
  {
    name: 'Cine y Video',
    description: 'Proyectos cinematográficos, documentales, videos y producciones audiovisuales'
  },
  {
    name: 'Comunidad',
    description: 'Proyectos comunitarios, desarrollo local y mejoras urbanas'
  }
];

async function createCategories() {
  try {
    console.log('🚀 Iniciando creación de categorías...');
    
    for (const category of categories) {
      const result = await prisma.category.upsert({
        where: { name: category.name },
        update: {
          description: category.description
        },
        create: {
          name: category.name,
          description: category.description
        }
      });
      
      console.log(`✅ Categoría creada/actualizada: ${result.name}`);
    }
    
    console.log(`\n🎉 ¡Proceso completado! Se han creado/actualizado ${categories.length} categorías.`);
    
    // Mostrar todas las categorías
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 Categorías disponibles:');
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error al crear categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCategories();