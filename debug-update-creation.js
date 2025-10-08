const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUpdateCreation() {
  try {
    console.log('🔍 Diagnóstico de creación de actualizaciones\n');

    // 1. Verificar que la campaña existe
    const campaignId = 'cmg5im1pq0003u8ygxxaq2ij1';
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        creator: true,
        _count: {
          select: {
            updates: true
          }
        }
      }
    });

    if (!campaign) {
      console.log('❌ Campaña no encontrada');
      return;
    }

    console.log('✅ Campaña encontrada:');
    console.log(`   - ID: ${campaign.id}`);
    console.log(`   - Título: ${campaign.title}`);
    console.log(`   - Estado: ${campaign.status}`);
    const creatorName = `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`.trim();
    console.log(`   - Creador: ${creatorName} (${campaign.creator.email})`);
    console.log(`   - Actualizaciones existentes: ${campaign._count.updates}\n`);

    // 2. Verificar directorios de upload
    const fs = require('fs');
    const path = require('path');
    
    const imageUploadPath = path.join(process.cwd(), 'public/uploads/updates/images');
    const videoUploadPath = path.join(process.cwd(), 'public/uploads/updates/videos');
    
    console.log('📁 Verificando directorios de upload:');
    console.log(`   - Imágenes: ${fs.existsSync(imageUploadPath) ? '✅' : '❌'} ${imageUploadPath}`);
    console.log(`   - Videos: ${fs.existsSync(videoUploadPath) ? '✅' : '❌'} ${videoUploadPath}\n`);

    // 3. Crear directorios si no existen
    if (!fs.existsSync(imageUploadPath)) {
      fs.mkdirSync(imageUploadPath, { recursive: true });
      console.log('✅ Directorio de imágenes creado');
    }
    
    if (!fs.existsSync(videoUploadPath)) {
      fs.mkdirSync(videoUploadPath, { recursive: true });
      console.log('✅ Directorio de videos creado');
    }

    // 4. Verificar usuarios existentes (para autenticación)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      },
      take: 3
    });

    console.log('👥 Usuarios disponibles para pruebas:');
    users.forEach(user => {
      const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
      console.log(`   - ${fullName} (${user.email}) - ID: ${user.id}`);
    });

    console.log('\n🎯 Para probar actualizaciones necesitas:');
    console.log('1. Estar autenticado como el creador de la campaña');
    console.log(`2. El creador es: ${creatorName} (${campaign.creator.email})`);
    console.log('3. Usar el formulario web con sesión activa');
    console.log('4. Los directorios de upload están listos');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUpdateCreation();