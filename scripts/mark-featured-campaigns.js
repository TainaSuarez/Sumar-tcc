const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function markFeaturedCampaigns() {
  try {
    console.log('🔍 Buscando campañas activas...');
    
    // Obtener las primeras 3 campañas activas
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE'
      },
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (campaigns.length === 0) {
      console.log('❌ No se encontraron campañas activas');
      return;
    }

    console.log(`✅ Encontradas ${campaigns.length} campañas activas`);
    
    // Marcar las campañas como destacadas
    const campaignIds = campaigns.map(c => c.id);
    
    const result = await prisma.campaign.updateMany({
      where: {
        id: {
          in: campaignIds
        }
      },
      data: {
        isFeatured: true
      }
    });

    console.log(`🌟 Marcadas ${result.count} campañas como destacadas:`);
    campaigns.forEach(campaign => {
      console.log(`  - ${campaign.title}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markFeaturedCampaigns();