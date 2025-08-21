import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/campaigns/[id]/comments/[commentId]/replies
 * Obtener más respuestas de un comentario específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: campaignId, commentId } = resolvedParams;
    const { searchParams } = new URL(request.url);

    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const skip = (page - 1) * limit;

    // Verificar que el comentario existe y pertenece a la campaña
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, campaignId: true }
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      );
    }

    if (parentComment.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'El comentario no pertenece a esta campaña' },
        { status: 400 }
      );
    }

    // Obtener respuestas del comentario
    const [replies, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          parentId: commentId,
          isPublic: true,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organizationName: true,
              avatar: true,
              userType: true,
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      
      prisma.comment.count({
        where: {
          parentId: commentId,
          isPublic: true,
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      replies: replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: reply.author,
        repliesCount: reply._count.replies,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Error en GET /api/campaigns/[id]/comments/[commentId]/replies:', error);
    return NextResponse.json(
      { error: 'Error al obtener respuestas' },
      { status: 500 }
    );
  }
}
