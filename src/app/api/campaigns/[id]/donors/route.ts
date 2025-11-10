import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    // Verificar que la campaña existe
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, currency: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todas las donaciones completadas
    const allDonations = await prisma.donation.findMany({
      where: {
        campaignId: campaignId,
        status: 'COMPLETED',
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formatear donaciones para el componente
    const formattedDonations = allDonations.map((donation) => ({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt.toISOString(),
      donor: donation.donor
        ? {
            id: donation.donor.id,
            firstName: donation.donor.firstName,
            lastName: donation.donor.lastName || '',
            avatar: donation.donor.avatar || undefined,
            email: donation.donor.email,
          }
        : undefined,
    }));

    // Últimas 5 donaciones
    const recentDonors = formattedDonations.slice(0, 5);

    // Top 5 mayores donadores
    const topDonors = [...formattedDonations]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Estadísticas
    const totalDonors = allDonations.length;
    const totalAmount = allDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );

    // Lista de emails únicos de donadores (para notificaciones)
    const donorEmails = allDonations
      .filter((d) => !d.isAnonymous && d.donor?.email)
      .map((d) => ({
        email: d.donor!.email,
        name: `${d.donor!.firstName} ${d.donor!.lastName || ''}`.trim(),
      }))
      .filter(
        (donor, index, self) =>
          index === self.findIndex((d) => d.email === donor.email)
      ); // Únicos

    return NextResponse.json({
      success: true,
      data: {
        recentDonors,
        topDonors,
        totalDonors,
        totalAmount,
        currency: campaign.currency,
        donorEmails, // Para sistema de notificaciones
      },
    });
  } catch (error) {
    console.error('Error obteniendo donadores:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
