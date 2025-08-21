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
      totalCampaigns,
      activeCampaigns,
      verifiedCampaigns,
      featuredCampaigns,
      recentCampaigns,
      completedCampaigns,
      pausedCampaigns,
      cancelledCampaigns
    ] = await Promise.all([
      // Total de campañas
      prisma.campaign.count(),
      
      // Campañas activas
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      
      // Campañas verificadas
      prisma.campaign.count({ where: { isVerified: true } }),
      
      // Campañas destacadas
      prisma.campaign.count({ where: { isFeatured: true } }),
      
      // Campañas creadas en los últimos 30 días
      prisma.campaign.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Campañas completadas
      prisma.campaign.count({ where: { status: 'COMPLETED' } }),
      
      // Campañas pausadas
      prisma.campaign.count({ where: { status: 'PAUSED' } }),
      
      // Campañas canceladas
      prisma.campaign.count({ where: { status: 'CANCELLED' } })
    ]);

    // Campañas por tipo
    const campaignsByType = await prisma.campaign.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    // Campañas por estado
    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Campañas por categoría
    const campaignsByCategory = await prisma.campaign.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 10
    });

    const categoriesWithNames = await Promise.all(
      campaignsByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true, color: true }
        });
        return {
          categoryId: item.categoryId,
          categoryName: category?.name || 'Sin categoría',
          categoryColor: category?.color,
          count: item._count.categoryId
        };
      })
    );

    // Estadísticas de crecimiento por mes (últimos 12 meses)
    const monthlyGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as count,
        SUM("goalAmount")::float as totalGoal,
        SUM("currentAmount")::float as totalRaised
      FROM campaigns 
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Top campañas por recaudación
    const topCampaignsByRaised = await prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        currentAmount: true,
        goalAmount: true,
        status: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            organizationName: true,
            userType: true
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        currentAmount: 'desc'
      },
      take: 10
    });

    // Top campañas por donaciones
    const topCampaignsByDonations = await prisma.campaign.findMany({
      select: {
        id: true,
        title: true,
        currentAmount: true,
        goalAmount: true,
        status: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            organizationName: true,
            userType: true
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            donations: true
          }
        }
      },
      orderBy: {
        donations: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Estadísticas de montos
    const amountStats = await prisma.campaign.aggregate({
      _sum: { 
        goalAmount: true,
        currentAmount: true
      },
      _avg: {
        goalAmount: true,
        currentAmount: true
      }
    });

    // Estadísticas de donaciones
    const donationStats = await prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true
    });

    // Campañas con mayor progreso
    const campaignsWithProgress = await prisma.$queryRaw`
      SELECT 
        id,
        title,
        "currentAmount",
        "goalAmount",
        ("currentAmount" / "goalAmount" * 100) as progress
      FROM campaigns 
      WHERE "goalAmount" > 0
      ORDER BY progress DESC
      LIMIT 10
    `;

    return NextResponse.json({
      overview: {
        totalCampaigns,
        activeCampaigns,
        verifiedCampaigns,
        featuredCampaigns,
        recentCampaigns,
        completedCampaigns,
        pausedCampaigns,
        cancelledCampaigns
      },
      distribution: {
        byType: campaignsByType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>),
        byStatus: campaignsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        byCategory: categoriesWithNames
      },
      growth: monthlyGrowth,
      topCampaigns: {
        byRaised: topCampaignsByRaised.map(campaign => ({
          id: campaign.id,
          title: campaign.title,
          currentAmount: campaign.currentAmount,
          goalAmount: campaign.goalAmount,
          status: campaign.status,
          creatorName: campaign.creator.organizationName || 
                      `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`.trim(),
          creatorType: campaign.creator.userType,
          categoryName: campaign.category.name,
          categoryColor: campaign.category.color,
          progress: Number(campaign.goalAmount) > 0 ? (Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100 : 0
        })),
        byDonations: topCampaignsByDonations.map(campaign => ({
          id: campaign.id,
          title: campaign.title,
          currentAmount: campaign.currentAmount,
          goalAmount: campaign.goalAmount,
          status: campaign.status,
          donationCount: campaign._count.donations,
          creatorName: campaign.creator.organizationName || 
                      `${campaign.creator.firstName} ${campaign.creator.lastName || ''}`.trim(),
          creatorType: campaign.creator.userType,
          categoryName: campaign.category.name,
          categoryColor: campaign.category.color
        })),
        withHighestProgress: campaignsWithProgress
      },
      financials: {
        totalGoalAmount: amountStats._sum.goalAmount || 0,
        totalRaisedAmount: amountStats._sum.currentAmount || 0,
        averageGoalAmount: amountStats._avg.goalAmount || 0,
        averageRaisedAmount: amountStats._avg.currentAmount || 0,
        totalDonations: donationStats._count,
        totalDonationAmount: donationStats._sum.amount || 0,
        averageDonationAmount: donationStats._avg.amount || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de campañas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
