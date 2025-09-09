npximport { NextRequest, NextResponse } from 'next/server';
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
    const userId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener actividad del usuario
    const [campaigns, donations, comments, updates] = await Promise.all([
      // Campañas creadas
      prisma.campaign.findMany({
        where: { creatorId: userId },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),

      // Donaciones realizadas
      prisma.donation.findMany({
        where: { donorId: userId },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          campaign: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),

      // Comentarios realizados
      prisma.comment.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          campaign: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),

      // Actualizaciones de campañas
      prisma.campaignUpdate.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true,
          campaign: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      })
    ]);

    // Combinar y ordenar todas las actividades
    const activities = [
      ...campaigns.map(item => ({
        id: item.id,
        type: 'campaign',
        action: 'created',
        title: `Creó la campaña "${item.title}"`,
        details: { status: item.status },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      ...donations.map(item => ({
        id: item.id,
        type: 'donation',
        action: 'donated',
        title: `Donó $${item.amount} UYU a "${item.campaign.title}"`,
        details: { status: item.status, campaignId: item.campaign.id },
        createdAt: item.createdAt,
        updatedAt: item.createdAt
      })),
      ...comments.map(item => ({
        id: item.id,
        type: 'comment',
        action: 'commented',
        title: `Comentó en "${item.campaign.title}"`,
        details: { content: item.content.substring(0, 100), campaignId: item.campaign.id },
        createdAt: item.createdAt,
        updatedAt: item.createdAt
      })),
      ...updates.map(item => ({
        id: item.id,
        type: 'update',
        action: 'updated',
        title: `Publicó actualización "${item.title}" en "${item.campaign.title}"`,
        details: { type: item.type, campaignId: item.campaign.id },
        createdAt: item.createdAt,
        updatedAt: item.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Obtener conteos totales para paginación
    const [campaignsCount, donationsCount, commentsCount, updatesCount] = await Promise.all([
      prisma.campaign.count({ where: { creatorId: userId } }),
      prisma.donation.count({ where: { donorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.campaignUpdate.count({ where: { authorId: userId } })
    ]);

    const totalActivities = campaignsCount + donationsCount + commentsCount + updatesCount;
    const totalPages = Math.ceil(totalActivities / limit);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName || ''}`.trim()
      },
      activities: activities.slice(0, limit),
      pagination: {
        page,
        limit,
        totalCount: totalActivities,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary: {
        campaigns: campaignsCount,
        donations: donationsCount,
        comments: commentsCount,
        updates: updatesCount
      }
    });

  } catch (error) {
    console.error('Error al obtener actividad del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

