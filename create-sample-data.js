const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('🚀 Creando datos de muestra...');

    // Crear una categoría básica
    const category = await prisma.category.upsert({
      where: { name: 'Salud' },
      update: {},
      create: {
        name: 'Salud',
        description: 'Campañas relacionadas con tratamientos médicos',
        color: '#ef4444',
        icon: '🏥',
        isActive: true
      }
    });

    console.log('✅ Categoría creada:', category.name);

    // Crear un usuario de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        firstName: 'Usuario',
        lastName: 'Prueba',
        password: hashedPassword,
        userType: 'INDIVIDUAL',
        role: 'USER',
        isVerified: true,
        isActive: true,
      }
    });

    console.log('✅ Usuario creado:', user.firstName);

    // Crear campañas de muestra
    const campaign1 = await prisma.campaign.upsert({
      where: { slug: 'ayuda-medica-urgente' },
      update: {},
      create: {
        title: 'Ayuda médica urgente',
        slug: 'ayuda-medica-urgente',
        description: 'Necesitamos ayuda para costear el tratamiento médico de un paciente que requiere atención urgente. Cada donación cuenta para salvar una vida.',
        shortDescription: 'Tratamiento médico urgente para paciente en estado crítico',
        goalAmount: 5000,
        currentAmount: 1250,
        currency: 'UYU',
        type: 'DONATION',
        status: 'ACTIVE',
        urgencyLevel: 5,
        images: [],
        creatorId: user.id,
        categoryId: category.id,
        isVerified: true,
        isFeatured: true,
      }
    });

    const campaign2 = await prisma.campaign.upsert({
      where: { slug: 'proyecto-educativo' },
      update: {},
      create: {
        title: 'Proyecto educativo para niños',
        slug: 'proyecto-educativo',
        description: 'Queremos llevar educación de calidad a niños de zonas rurales. Este proyecto incluye material escolar, libros y capacitación para maestros.',
        shortDescription: 'Educación de calidad para niños en zonas rurales',
        goalAmount: 3000,
        currentAmount: 800,
        currency: 'UYU',
        type: 'CROWDFUNDING',
        status: 'ACTIVE',
        urgencyLevel: 3,
        images: [],
        creatorId: user.id,
        categoryId: category.id,
        isVerified: true,
        isFeatured: true,
      }
    });

    const campaign3 = await prisma.campaign.upsert({
      where: { slug: 'ayuda-emergencia' },
      update: {},
      create: {
        title: 'Ayuda de emergencia familiar',
        slug: 'ayuda-emergencia',
        description: 'Una familia necesita ayuda urgente después de perder su hogar en un incendio. Necesitan fondos para alojamiento temporal y artículos básicos.',
        shortDescription: 'Familia necesita ayuda después de incendio',
        goalAmount: 2500,
        currentAmount: 450,
        currency: 'UYU',
        type: 'DONATION',
        status: 'ACTIVE',
        urgencyLevel: 4,
        images: [],
        creatorId: user.id,
        categoryId: category.id,
        isVerified: true,
        isFeatured: true,
      }
    });

    console.log('✅ Campañas creadas:');
    console.log(`  - ${campaign1.title} (${campaign1.slug})`);
    console.log(`  - ${campaign2.title} (${campaign2.slug})`);
    console.log(`  - ${campaign3.title} (${campaign3.slug})`);

    console.log('🎉 ¡Datos de muestra creados exitosamente!');

  } catch (error) {
    console.error('❌ Error al crear datos de muestra:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();