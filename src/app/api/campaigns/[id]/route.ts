import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CampaignService } from '@/lib/services/campaignService';
import { handleFileUpload } from '@/lib/services/uploadService';
import { createCampaignSchema } from '@/lib/validations/campaign';

/**
 * GET /api/campaigns/[id]
 * Obtiene una campaña específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: campaignId } = resolvedParams;
    
    const campaign = await CampaignService.getById(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);

  } catch (error) {
    console.error('Error en GET /api/campaigns/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la campaña' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/campaigns/[id]
 * Actualiza una campaña completa
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id: campaignId } = resolvedParams;

    // Verificar que la campaña existe y pertenece al usuario
    const existingCampaign = await CampaignService.getById(campaignId);
    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos: el usuario debe ser el creador O un administrador
    const isCreator = existingCampaign.creatorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar esta campaña' },
        { status: 403 }
      );
    }

    // Manejar FormData y archivo con multer
    const uploadResult = await handleFileUpload(request);
    
    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    const { file, fields } = uploadResult;
    
    // Validar campos básicos (omitir coverImage ya que es opcional en actualización)
    const validationResult = createCampaignSchema.omit({ coverImage: true }).safeParse({
      title: fields.title,
      categoryId: fields.categoryId,
      goalAmount: parseFloat(fields.goalAmount),
      shortDescription: fields.shortDescription,
      description: fields.description,
    });

    if (!validationResult.success) {
      // Limpiar archivo subido si hay error de validación
      if (file) {
        const { deleteUploadedFile } = await import('@/lib/services/uploadService');
        await deleteUploadedFile(file.filename);
      }
      
      return NextResponse.json(
        {
          error: 'Datos de entrada inválidos',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { goalAmount } = validationResult.data;

    // Verificar que la categoría existe
    const { prisma } = await import('@/lib/db');
    const category = await prisma.category.findUnique({
      where: { id: fields.categoryId },
    });

    if (!category || !category.isActive) {
      // Limpiar archivo subido si hay error
      if (file) {
        const { deleteUploadedFile } = await import('@/lib/services/uploadService');
        await deleteUploadedFile(file.filename);
      }
      
      return NextResponse.json(
        { error: 'La categoría seleccionada no existe o no está disponible' },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: Record<string, unknown> = {
      title: fields.title,
      categoryId: fields.categoryId,
      goalAmount,
      shortDescription: fields.shortDescription,
      description: fields.description,
    };

    // Si hay nueva imagen, agregar al update
    if (file) {
      const { getPublicImageUrl } = await import('@/lib/services/uploadService');
      const imageUrl = getPublicImageUrl(file.filename);
      updateData.images = [imageUrl];
    }

    // Actualizar la campaña
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Campaña actualizada exitosamente',
      campaign: updatedCampaign,
    });

  } catch (error) {
    console.error('Error en PUT /api/campaigns/[id]:', error);

    // Error específico de validación o negocio
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}

