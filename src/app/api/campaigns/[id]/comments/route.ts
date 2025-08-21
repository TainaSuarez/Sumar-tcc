import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Esquema de validación para crear comentario
const createCommentSchema = z.object({
  content: z.string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim(),
  parentId: z.string().optional(), // Para respuestas
});

/**
 * POST /api/campaigns/[id]/comments
 * Crear un nuevo comentario o respuesta
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para comentar' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    // Verificar que la campaña existe y está activa
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, status: true, title: true }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'No se pueden agregar comentarios a campañas inactivas' },
        { status: 400 }
      );
    }

    // Validar datos de entrada
    const body = await request.json();
    const validationResult = createCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { content, parentId } = validationResult.data;

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, campaignId: true }
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Comentario padre no encontrado' },
          { status: 404 }
        );
      }

      if (parentComment.campaignId !== campaignId) {
        return NextResponse.json(
          { error: 'El comentario padre no pertenece a esta campaña' },
          { status: 400 }
        );
      }
    }

    // Crear el comentario
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        campaignId,
        parentId: parentId || null,
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
      }
    });

    return NextResponse.json({
      message: 'Comentario creado exitosamente',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parentId: comment.parentId,
        author: comment.author,
        repliesCount: comment._count.replies,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/campaigns/[id]/comments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaigns/[id]/comments
 * Obtener comentarios de una campaña
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;
    const { searchParams } = new URL(request.url);

    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const skip = (page - 1) * limit;

    // Verificar que la campaña existe
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Obtener comentarios principales (sin padre) con sus respuestas
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          campaignId,
          parentId: null, // Solo comentarios principales
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
          replies: {
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
            take: 5, // Limitar respuestas mostradas inicialmente
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      
      prisma.comment.count({
        where: {
          campaignId,
          parentId: null,
          isPublic: true,
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author,
        replies: comment.replies.map(reply => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          author: reply.author,
          repliesCount: reply._count.replies,
        })),
        repliesCount: comment._count.replies,
        hasMoreReplies: comment._count.replies > 5,
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
    console.error('Error en GET /api/campaigns/[id]/comments:', error);
    return NextResponse.json(
      { error: 'Error al obtener comentarios' },
      { status: 500 }
    );
  }
}
