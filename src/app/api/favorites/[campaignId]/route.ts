import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    campaignId: string;
  };
}

// GET - Verificar si una campaña está en favoritos
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { campaignId } = params;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar si la campaña está en favoritos
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_campaignId: {
          userId: session.user.id,
          campaignId: campaignId,
        },
      },
    });

    return NextResponse.json({
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}