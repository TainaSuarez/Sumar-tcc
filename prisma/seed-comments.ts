import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedComments() {
  try {
    // Obtener una campaña existente
    const campaign = await prisma.campaign.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!campaign) {
      console.log('No se encontraron campañas activas para agregar comentarios');
      return;
    }

    // Obtener algunos usuarios existentes
    const users = await prisma.user.findMany({
      take: 3
    });

    if (users.length === 0) {
      console.log('No se encontraron usuarios para crear comentarios');
      return;
    }

    // Crear comentarios de ejemplo
    const comment1 = await prisma.comment.create({
      data: {
        content: '¡Excelente iniciativa! Me parece una causa muy importante y necesaria. Espero que logren alcanzar su objetivo.',
        authorId: users[0].id,
        campaignId: campaign.id,
      }
    });

    const comment2 = await prisma.comment.create({
      data: {
        content: 'He donado y compartido con mis amigos. ¡Sigamos apoyando esta gran causa! 💪',
        authorId: users[1].id,
        campaignId: campaign.id,
      }
    });

    // Crear una respuesta al primer comentario
    await prisma.comment.create({
      data: {
        content: 'Totalmente de acuerdo contigo. Es inspirador ver cómo la comunidad se une por causas importantes.',
        authorId: users[2].id,
        campaignId: campaign.id,
        parentId: comment1.id,
      }
    });

    // Crear otra respuesta
    await prisma.comment.create({
      data: {
        content: '¡Gracias por tu apoyo! Cada donación nos acerca más a la meta.',
        authorId: users[0].id,
        campaignId: campaign.id,
        parentId: comment2.id,
      }
    });

    console.log('✅ Comentarios de ejemplo creados exitosamente');
    console.log(`📝 Campaña: ${campaign.title}`);
    console.log(`👥 Usuarios: ${users.map(u => u.firstName).join(', ')}`);

  } catch (error) {
    console.error('Error al crear comentarios de ejemplo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedComments();
}

export default seedComments;
