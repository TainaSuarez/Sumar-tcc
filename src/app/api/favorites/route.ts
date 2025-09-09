import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema de validación para favoritos
const favoriteSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID es requerido'),
});

// GET - Obtener favoritos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Obtener favoritos con información de la campaña
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        campaign: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                organizationName: true,
                avatar: true,
              },
            },
            category: true,
            _count: {
              select: {
                donations: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Contar total de favoritos
    const totalFavorites = await prisma.favorite.count({
      where: {
        userId: session.user.id,
      },
    });

    const totalPages = Math.ceil(totalFavorites / limit);

    return NextResponse.json({
      favorites: favorites.map(fav => fav.campaign),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalFavorites,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Agregar campaña a favoritos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = favoriteSchema.parse(body);

    // Verificar que la campaña existe
    const campaign = await prisma.campaign.findUnique({
      where: { id: validatedData.campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no sea su propia campaña
    if (campaign.creatorId === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes agregar tu propia campaña a favoritos' },
        { status: 400 }
      );
    }

    // Verificar si ya está en favoritos
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_campaignId: {
          userId: session.user.id,
          campaignId: validatedData.campaignId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'La campaña ya está en favoritos' },
        { status: 400 }
      );
    }

    // Agregar a favoritos
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        campaignId: validatedData.campaignId,
      },
    });

    return NextResponse.json(
      { message: 'Campaña agregada a favoritos', favorite },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error al agregar favorito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Quitar campaña de favoritos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el favorito existe
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_campaignId: {
          userId: session.user.id,
          campaignId: campaignId,
        },
      },
    });

    if (!existingFavorite) {
      return NextResponse.json(
        { error: 'La campaña no está en favoritos' },
        { status: 404 }
      );
    }

    // Eliminar de favoritos
    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });

    return NextResponse.json(
      { message: 'Campaña eliminada de favoritos' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}