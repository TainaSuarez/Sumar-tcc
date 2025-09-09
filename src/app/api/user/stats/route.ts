import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtener estadísticas del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener estadísticas de campañas creadas (cuánto ha recaudado)
    const campaignStats = await prisma.campaign.findMany({
      where: {
        creatorId: userId,
      },
      select: {
        id: true,
        title: true,
        currentAmount: true,
        goalAmount: true,
        status: true,
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    // Calcular totales de recaudación
    const totalRaised = campaignStats.reduce(
      (sum, campaign) => sum + Number(campaign.currentAmount),
      0
    );

    const totalGoal = campaignStats.reduce(
      (sum, campaign) => sum + Number(campaign.goalAmount),
      0
    );

    const totalCampaigns = campaignStats.length;
    const activeCampaigns = campaignStats.filter(
      (campaign) => campaign.status === 'ACTIVE'
    ).length;

    const completedCampaigns = campaignStats.filter(
      (campaign) => campaign.status === 'COMPLETED'
    ).length;

    const totalDonationsReceived = campaignStats.reduce(
      (sum, campaign) => sum + campaign._count.donations,
      0
    );

    // Obtener estadísticas de donaciones realizadas (cuánto ha donado)
    const donationStats = await prisma.donation.findMany({
      where: {
        donorId: userId,
        status: 'COMPLETED',
      },
      select: {
        amount: true,
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const totalDonated = donationStats.reduce(
      (sum, donation) => sum + Number(donation.amount),
      0
    );

    const totalDonationsMade = donationStats.length;
    const uniqueCampaignsSupported = new Set(
      donationStats.map((donation) => donation.campaign.id)
    ).size;

    // Obtener número de favoritos
    const favoritesCount = await prisma.favorite.count({
      where: {
        userId: userId,
      },
    });

    // Obtener campañas más exitosas del usuario
    const topCampaigns = campaignStats
      .sort((a, b) => Number(b.currentAmount) - Number(a.currentAmount))
      .slice(0, 3)
      .map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        raised: Number(campaign.currentAmount),
        goal: Number(campaign.goalAmount),
        progress: Number(campaign.currentAmount) / Number(campaign.goalAmount) * 100,
        donationsCount: campaign._count.donations,
      }));

    return NextResponse.json({
      fundraising: {
        totalRaised,
        totalGoal,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalDonationsReceived,
        topCampaigns,
      },
      donations: {
        totalDonated,
        totalDonationsMade,
        uniqueCampaignsSupported,
      },
      general: {
        favoritesCount,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}