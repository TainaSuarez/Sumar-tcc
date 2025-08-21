import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    // Obtener estadísticas generales
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalCategories,
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
      // Conteos básicos
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.donation.count(),
      prisma.category.count(),
      
      // Estados específicos
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.campaign.count({ where: { status: 'COMPLETED' } }),
      prisma.donation.count({ where: { status: 'PENDING' } }),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      
      // Suma total de donaciones
      prisma.donation.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      
      // Usuarios recientes (últimos 7 días)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Campañas recientes (últimos 7 días)
      prisma.campaign.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Top categorías
      prisma.category.findMany({
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
      }),
      
      // Usuarios por tipo
      prisma.user.groupBy({
        by: ['userType'],
        _count: true
      }),
      
      // Campañas por estado
      prisma.campaign.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Donaciones por mes (últimos 6 meses)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*)::integer as count,
          SUM("amount")::float as total
        FROM "donations" 
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          AND "status" = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `
    ]);

    // Calcular porcentajes de crecimiento (ejemplo simplificado)
    const userGrowthPercentage = recentUsers > 0 ? 
      ((recentUsers / Math.max(totalUsers - recentUsers, 1)) * 100).toFixed(1) : '0';
    
    const campaignGrowthPercentage = recentCampaigns > 0 ? 
      ((recentCampaigns / Math.max(totalCampaigns - recentCampaigns, 1)) * 100).toFixed(1) : '0';

    const stats = {
      overview: {
        totalUsers,
        totalCampaigns,
        totalDonations,
        totalCategories,
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
          percentage: userGrowthPercentage
        },
        campaigns: {
          total: totalCampaigns,
          recent: recentCampaigns,
          percentage: campaignGrowthPercentage
        }
      },
      charts: {
        usersByType: usersByType.map(item => ({
          type: item.userType,
          count: item._count
        })),
        campaignsByStatus: campaignsByStatus.map(item => ({
          status: item.status,
          count: item._count
        })),
        donationsByMonth: donationsByMonth as Array<{ month: string; count: number; total: number }>,
        topCategories: topCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          campaignCount: cat._count.campaigns,
          color: cat.color
        }))
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error al obtener estadísticas de admin:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
