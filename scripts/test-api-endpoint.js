const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simulamos exactamente lo que hace el endpoint /api/admin/stats
async function testStatsEndpoint() {
  console.log('🔍 Probando el endpoint /api/admin/stats paso a paso...\n');

  try {
    console.log('1. Verificando usuario admin...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'chicobento@gmail.com' }
    });
    
    if (!adminUser) {
      console.log('   ❌ Usuario admin no encontrado');
      return;
    }
    
    console.log(`   ✅ Usuario encontrado: ${adminUser.email}`);
    console.log(`   ✅ Rol: ${adminUser.role}`);
    console.log(`   ✅ Activo: ${adminUser.isActive}`);
    console.log(`   ✅ Verificado: ${adminUser.isVerified}\n`);

    if (adminUser.role !== 'ADMIN') {
      console.log('   ❌ Usuario no tiene rol ADMIN');
      return;
    }

    console.log('2. Ejecutando todas las consultas del endpoint...\n');

    // Replicamos exactamente el código del endpoint
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      activeCampaigns,
      completedCampaigns,
      pendingDonations,
      completedDonations,
      totalDonationAmount,
      recentUsers,
      recentCampaigns,
      topCategories,
      usersByType,
      campaignsByStatus,
      donationsByMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.donation.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.campaign.count({ where: { status: 'COMPLETED' } }),
      prisma.donation.count({ where: { status: 'PENDING' } }),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.campaign.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { campaigns: true }
          }
        },
        orderBy: {
          campaigns: { _count: 'desc' }
        },
        take: 5
      }),
      prisma.user.groupBy({
        by: ['userType'],
        _count: true
      }),
      prisma.campaign.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', createdAt) as month,
          COUNT(*) as count,
          SUM(amount) as total
        FROM donations 
        WHERE createdAt >= datetime('now', '-6 months')
          AND status = 'COMPLETED'
        GROUP BY strftime('%Y-%m', createdAt)
        ORDER BY month DESC
      `
    ]);

    console.log('   ✅ Todas las consultas ejecutadas exitosamente!\n');

    // Calculamos los porcentajes de crecimiento
    const usersGrowthPercentage = totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : '0.0';
    const campaignsGrowthPercentage = totalCampaigns > 0 ? ((recentCampaigns / totalCampaigns) * 100).toFixed(1) : '0.0';

    // Construimos la respuesta exacta del endpoint
    const response = {
      overview: {
        totalUsers,
        totalCampaigns,
        totalDonations,
        totalDonationAmount: totalDonationAmount._sum.amount || 0,
        activeCampaigns,
        completedCampaigns,
        pendingDonations,
        completedDonations
      },
      growth: {
        users: {
          total: totalUsers,
          recent: recentUsers,
          percentage: usersGrowthPercentage
        },
        campaigns: {
          total: totalCampaigns,
          recent: recentCampaigns,
          percentage: campaignsGrowthPercentage
        }
      },
      charts: {
        topCategories: topCategories.map(cat => ({
          name: cat.name,
          campaigns: cat._count.campaigns
        })),
        usersByType: usersByType.map(item => ({
          type: item.userType,
          count: item._count
        })),
        campaignsByStatus: campaignsByStatus.map(item => ({
          status: item.status,
          count: item._count
        })),
        donationsByMonth: donationsByMonth.map(item => ({
          month: item.month,
          donations: Number(item.count),
          amount: Number(item.total) || 0
        }))
      }
    };

    console.log('3. Respuesta generada exitosamente:');
    console.log(JSON.stringify(response, null, 2));
    console.log('\n✅ El endpoint debería funcionar correctamente!');
    console.log('💡 Si el dashboard sigue fallando, el problema está en:');
    console.log('   - La autenticación de la sesión en el navegador');
    console.log('   - El caché del navegador');
    console.log('   - La configuración de Next.js');

  } catch (error) {
    console.error('❌ Error durante la simulación del endpoint:', error);
    console.log('\n🔍 Detalles del error:');
    console.log('   - Mensaje:', error.message);
    console.log('   - Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testStatsEndpoint();