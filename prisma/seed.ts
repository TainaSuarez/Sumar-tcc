import { PrismaClient } from '@prisma/client';
import { seedCategories } from './seeds/categories';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando proceso de seeding...');
  
  try {
    // Ejecutar seed de categorías
    await seedCategories();
    
    console.log('✨ ¡Proceso de seeding completado exitosamente!');
  } catch (error) {
    console.error('💥 Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Error fatal en el proceso de seeding:', error);
    process.exit(1);
  });

