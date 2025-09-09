import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🚀 Creando datos de prueba...');

    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user1 = await prisma.user.create({
      data: {
        email: 'test1@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        password: hashedPassword,
        userType: 'INDIVIDUAL',
        role: 'USER',
        isVerified: true,
        isActive: true,
      }
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'test2@example.com',
        firstName: 'María',
        lastName: 'González',
        password: hashedPassword,
        userType: 'INDIVIDUAL',
        role: 'USER',
        isVerified: true,
        isActive: true,
      }
    });

    const user3 = await prisma.user.create({
      data: {
        email: 'org@example.com',
        firstName: 'Fundación',
        organizationName: 'Fundación Ayuda Social',
        password: hashedPassword,
        userType: 'ORGANIZATION',
        role: 'USER',
        isVerified: true,
        isActive: true,
      }
    });

    console.log('✅ Usuarios creados');

    // Obtener una categoría existente
    const category = await prisma.category.findFirst();
    if (!category) {
      throw new Error('No se encontraron categorías');
    }

    // Crear campañas de prueba
    const campaign1 = await prisma.campaign.create({
      data: {
        title: 'Ayuda para tratamiento médico urgente',
        slug: 'ayuda-tratamiento-medico-urgente',
        description: 'Necesitamos ayuda para costear el tratamiento médico de un paciente que requiere atención urgente. Cada donación cuenta para salvar una vida.',
        shortDescription: 'Tratamiento médico urgente para paciente en estado crítico',
        goalAmount: 5000,
        currentAmount: 1250,
        currency: 'EUR',
        type: 'DONATION',
        status: 'ACTIVE',
        urgencyLevel: 5,
        images: [],
        creatorId: user1.id,
        categoryId: category.id,
        isVerified: true,
        isFeatured: false,
      }
    });

    const campaign2 = await prisma.campaign.create({
      data: {
        title: 'Proyecto educativo para niños rurales',
        slug: 'proyecto-educativo-ninos-rurales',
        description: 'Queremos llevar educación de calidad a niños de zonas rurales. Este proyecto incluye material escolar, libros y capacitación para maestros.',
        shortDescription: 'Educación de calidad para niños en zonas rurales',
        goalAmount: 3000,
        currentAmount: 800,
        currency: 'EUR',
        type: 'CROWDFUNDING',
        status: 'ACTIVE',
        urgencyLevel: 3,
        images: [],
        creatorId: user3.id,
        categoryId: category.id,
        isVerified: true,
        isFeatured: true,
      }
    });

    console.log('✅ Campañas creadas');
    console.log(`📝 Campaña 1: ${campaign1.title} (ID: ${campaign1.id})`);
    console.log(`📝 Campaña 2: ${campaign2.title} (ID: ${campaign2.id})`);
    console.log(`👥 Usuarios: ${user1.firstName}, ${user2.firstName}, ${user3.organizationName}`);

    return { users: [user1, user2, user3], campaigns: [campaign1, campaign2] };

  } catch (error) {
    console.error('Error al crear datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedTestData();
}

export default seedTestData;