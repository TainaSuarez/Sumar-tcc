const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAdminStats() {
  console.log('🔍 Simulando la carga de estadísticas del dashboard...\n');

  try {
    console.log('1. Probando conexión a la base de datos...');
    await prisma.$connect();
    console.log('   ✅ Conexión exitosa\n');

    console.log('2. Ejecutando todas las consultas del endpoint /api/admin/stats...\n');

    // Consultas básicas
    console.log('   📊 Conteos básicos...');
    const totalUsers = await prisma.user.count();
    const totalCampaigns = await prisma.campaign.count();
    const totalDonations = await prisma.donation.count();
    const totalCategories = await prisma.category.count();
    console.log(`      - Usuarios: ${totalUsers}`);
    console.log(`      - Campañas: ${totalCampaigns}`);
    console.log(`      - Donaciones: ${totalDonations}`);
    console.log(`      - Categorías: ${totalCategories}\n`);

    // Estados específicos
    console.log('   📈 Estados específicos...');
    const activeCampaigns = await prisma.campaign.count({
      where: { status: 'ACTIVE' }
    });
    const completedCampaigns = await prisma.campaign.count({
      where: { status: 'COMPLETED' }
    });
    const pendingDonations = await prisma.donation.count({
      where: { status: 'PENDING' }
    });
    const completedDonations = await prisma.donation.count({
      where: { status: 'COMPLETED' }
    });
    console.log(`      - Campañas activas: ${activeCampaigns}`);
    console.log(`      - Campañas completadas: ${completedCampaigns}`);
    console.log(`      - Donaciones pendientes: ${pendingDonations}`);
    console.log(`      - Donaciones completadas: ${completedDonations}\n`);

    // Agregaciones
    console.log('   💰 Agregaciones...');
    const totalDonationAmount = await prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' }
    });
    console.log(`      - Monto total donaciones: ${totalDonationAmount._sum.amount || 0}\n`);

    // Usuarios recientes
    console.log('   👥 Usuarios recientes...');
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`      - Usuarios últimos 7 días: ${recentUsers}\n`);

    // Top categorías
    console.log('   🏷️ Top categorías...');
    const topCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { campaigns: true }
        }
      },
      orderBy: {
        campaigns: { _count: 'desc' }
      },
      take: 5
    });
    console.log(`      - Top categorías encontradas: ${topCategories.length}`);
    topCategories.forEach((cat, i) => {
      console.log(`         ${i + 1}. ${cat.name}: ${cat._count.campaigns} campañas`);
    });
    console.log('');

    // Usuarios por tipo
    console.log('   👤 Usuarios por tipo...');
    const usersByType = await prisma.user.groupBy({
      by: ['userType'],
      _count: true
    });
    console.log(`      - Agrupaciones: ${JSON.stringify(usersByType)}\n`);

    // Campañas por estado
    console.log('   📋 Campañas por estado...');
    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ['status'],
      _count: true
    });
    console.log(`      - Agrupaciones: ${JSON.stringify(campaignsByStatus)}\n`);

    // Query SQL cruda (la más problemática)
    console.log('   📅 Donaciones por mes (consulta SQL)...');
    const donationsByMonth = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count,
        SUM(amount) as total
      FROM donations 
      WHERE createdAt >= datetime('now', '-6 months')
        AND status = 'COMPLETED'
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
    `;
    console.log(`      - Donaciones por mes: ${donationsByMonth.length} registros`);
    console.log(`      - Datos: ${JSON.stringify(donationsByMonth, null, 2)}\n`);

    console.log('✅ Todas las consultas ejecutadas exitosamente!');
    console.log('🎯 El problema NO está en las consultas de base de datos.');
    console.log('💡 El problema podría estar en:');
    console.log('   - Autenticación/autorización en el endpoint');
    console.log('   - Configuración de Next.js');
    console.log('   - Caché del navegador');
    console.log('   - Estado de la sesión del usuario');

  } catch (error) {
    console.error('❌ Error durante la ejecución:', error);
    console.log('\n🔍 Detalles del error:');
    console.log('   - Mensaje:', error.message);
    console.log('   - Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminStats();