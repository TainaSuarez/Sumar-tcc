const { PrismaClient } = require('@prisma/client');

async function getCategories() {
  const prisma = new PrismaClient();
  
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    });
    
    console.log('Categorías disponibles:');
    categories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.id}`);
    });
    
    if (categories.length > 0) {
      console.log(`\nUsando primera categoría: ${categories[0].id}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCategories();