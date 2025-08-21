import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    // Obtener campaña con detalles completos
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationName: true,
            avatar: true,
            userType: true,
            email: true,
            phone: true,
            city: true,
            country: true,
            isVerified: true,
            createdAt: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
            icon: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        donations: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            isAnonymous: true,
            message: true,
            createdAt: true,
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                organizationName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        comments: {
          select: {
            id: true,
            content: true,
            isPublic: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                organizationName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        updates: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            images: true,
            videos: true,
            isPublic: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                organizationName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        _count: {
          select: {
            donations: true,
            comments: true,
            updates: true
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Calcular estadísticas adicionales
    const donationStats = await prisma.donation.aggregate({
      where: { 
        campaignId: campaignId,
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true
    });

    const monthlyDonations = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as count,
        SUM("amount")::float as total
      FROM donations 
      WHERE "campaignId" = ${campaignId}
        AND "status" = 'COMPLETED'
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Top donantes
    const topDonors = await prisma.donation.groupBy({
      by: ['donorId'],
      where: {
        campaignId: campaignId,
        status: 'COMPLETED',
        donorId: { not: null }
      },
      _sum: { amount: true },
      _count: { donorId: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });

    const topDonorsWithDetails = await Promise.all(
      topDonors.map(async (donor) => {
        const user = await prisma.user.findUnique({
          where: { id: donor.donorId! },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationName: true,
            avatar: true,
            userType: true
          }
        });
        return {
          ...user,
          totalDonated: donor._sum.amount || 0,
          donationCount: donor._count.donorId
        };
      })
    );

    const campaignDetails = {
      ...campaign,
      tags: campaign.tags.map(t => t.tag),
      stats: {
        donations: {
          total: campaign._count.donations,
          completed: donationStats._count,
          totalAmount: donationStats._sum.amount || 0,
          averageAmount: donationStats._avg.amount || 0
        },
        comments: campaign._count.comments,
        updates: campaign._count.updates,
        viewCount: campaign.viewCount,
        shareCount: campaign.shareCount
      },
      analytics: {
        monthlyDonations,
        topDonors: topDonorsWithDetails
      }
    };

    return NextResponse.json({ campaign: campaignDetails });

  } catch (error) {
    console.error('Error al obtener detalles de la campaña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const campaignId = resolvedParams.id;
    const updates = await request.json();

    // Validar que la campaña existe
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar campaña
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updates,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationName: true,
            avatar: true,
            userType: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            donations: true,
            comments: true,
            updates: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Campaña actualizada exitosamente',
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error('Error al actualizar campaña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
