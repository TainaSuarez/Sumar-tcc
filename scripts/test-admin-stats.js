const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminStats() {
  try {
    console.log('🔍 Probando consultas de estadísticas de admin...\n');

    // Test 1: Conteos básicos
    console.log('1. Probando conteos básicos...');
    const totalUsers = await prisma.user.count();
    console.log(`   ✅ Total usuarios: ${totalUsers}`);
    
    const totalCampaigns = await prisma.campaign.count();
    console.log(`   ✅ Total campañas: ${totalCampaigns}`);
    
    const totalDonations = await prisma.donation.count();
    console.log(`   ✅ Total donaciones: ${totalDonations}`);
    
    const totalCategories = await prisma.category.count();
    console.log(`   ✅ Total categorías: ${totalCategories}\n`);

    // Test 2: Estados específicos
    console.log('2. Probando estados específicos...');
    const activeCampaigns = await prisma.campaign.count({ where: { status: 'ACTIVE' } });
    console.log(`   ✅ Campañas activas: ${activeCampaigns}`);
    
    const completedCampaigns = await prisma.campaign.count({ where: { status: 'COMPLETED' } });
    console.log(`   ✅ Campañas completadas: ${completedCampaigns}`);
    
    const pendingDonations = await prisma.donation.count({ where: { status: 'PENDING' } });
    console.log(`   ✅ Donaciones pendientes: ${pendingDonations}`);
    
    const completedDonations = await prisma.donation.count({ where: { status: 'COMPLETED' } });
    console.log(`   ✅ Donaciones completadas: ${completedDonations}\n`);

    // Test 3: Agregaciones
    console.log('3. Probando agregaciones...');
    const totalDonationAmount = await prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    });
    console.log(`   ✅ Monto total donaciones: ${totalDonationAmount._sum.amount || 0}\n`);

    // Test 4: Usuarios recientes
    console.log('4. Probando usuarios recientes...');
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`   ✅ Usuarios recientes (7 días): ${recentUsers}\n`);

    // Test 5: Top categorías
    console.log('5. Probando top categorías...');
    const topCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { campaigns: true }
        }
      },
      orderBy: {
        campaigns: {
          _count: 'desc'
        }
      },
      take: 5
    });
    console.log(`   ✅ Top categorías encontradas: ${topCategories.length}`);
    topCategories.forEach((cat, index) => {
      console.log(`      ${index + 1}. ${cat.name}: ${cat._count.campaigns} campañas`);
    });
    console.log('');

    // Test 6: Agrupaciones
    console.log('6. Probando agrupaciones...');
    const usersByType = await prisma.user.groupBy({
      by: ['userType'],
      _count: true
    });
    console.log(`   ✅ Usuarios por tipo:`, usersByType);
    
    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ['status'],
      _count: true
    });
    console.log(`   ✅ Campañas por estado:`, campaignsByStatus);
    console.log('');

    // Test 7: Query SQL cruda (la más propensa a errores)
    console.log('7. Probando query SQL cruda...');
    try {
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
      console.log(`   ✅ Donaciones por mes encontradas: ${donationsByMonth.length}`);
      console.log('   Datos:', donationsByMonth);
    } catch (error) {
      console.log(`   ❌ Error en query SQL cruda:`, error.message);
      console.log('   Este podría ser el problema principal!');
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminStats();