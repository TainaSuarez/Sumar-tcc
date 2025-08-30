import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { UpdateType } from '@/lib/validations/campaignUpdate';
import { CampaignUpdateService } from '@/lib/services/campaignUpdateService';
import { handleUpdateFileUpload } from '@/lib/services/updateUploadService';
import { CampaignService } from '@/lib/services/campaignService';

// Esquema para validar FormData
const formDataSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(5000),
  type: z.string().optional(),
  isPublic: z.string().transform((val) => val === 'true'),
});

/**
 * POST /api/campaigns/[id]/updates
 * Crea una nueva actualización para la campaña
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
        { error: 'No autorizado. Debes iniciar sesión para crear una actualización.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    // Verificar que la campaña existe y pertenece al usuario
    const campaign = await CampaignService.getById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    if (campaign.creator.id !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear actualizaciones en esta campaña' },
        { status: 403 }
      );
    }

    // Manejar FormData y archivos
    const uploadResult = await handleUpdateFileUpload(request);

    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    const { images, videos, fields } = uploadResult;

    // Log para debug
    console.log('Fields recibidos:', fields);
    console.log('Images:', images.length);
    console.log('Videos:', videos.length);

    // Validar campos básicos
    const validationResult = formDataSchema.safeParse({
      title: fields.title,
      content: fields.content,
      type: fields.type,
      isPublic: fields.isPublic,
    });

    if (!validationResult.success) {
      console.error('Error de validación:', validationResult.error.issues);
      
      // Limpiar archivos subidos si hay error de validación
      if (images.length > 0 || videos.length > 0) {
        const { cleanupUpdateFiles } = await import('@/lib/services/updateUploadService');
        await cleanupUpdateFiles(images, videos);
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

    // Validar límites de archivos
    if (images.length > 5) {
      // Limpiar archivos subidos
      const { cleanupUpdateFiles } = await import('@/lib/services/updateUploadService');
      await cleanupUpdateFiles(images, videos);

      return NextResponse.json(
        { error: 'No puedes subir más de 5 imágenes por actualización' },
        { status: 400 }
      );
    }

    if (videos.length > 1) {
      // Limpiar archivos subidos
      const { cleanupUpdateFiles } = await import('@/lib/services/updateUploadService');
      await cleanupUpdateFiles(images, videos);

      return NextResponse.json(
        { error: 'No puedes subir más de 1 video por actualización' },
        { status: 400 }
      );
    }

    // Determinar el tipo de actualización basado en los archivos
    let updateType = UpdateType.TEXT_ONLY;
    if (videos.length > 0) {
      updateType = UpdateType.TEXT_VIDEO;
    } else if (images.length > 0) {
      updateType = UpdateType.TEXT_IMAGE;
    }

    // Preparar datos para crear la actualización
    const updateData = {
      title: validationResult.data.title,
      content: validationResult.data.content,
      type: updateType,
      isPublic: validationResult.data.isPublic,
      campaignId,
      authorId: session.user.id,
    };

    // Preparar archivos procesados
    const processedFiles = {
      images: images.map(img => ({ filename: img.filename, type: 'image' as const })),
      videos: videos.map(vid => ({ filename: vid.filename, type: 'video' as const })),
    };

    // Crear la actualización
    const update = await CampaignUpdateService.create(updateData, processedFiles);

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: 'Actualización creada exitosamente',
        update,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en POST /api/campaigns/[id]/updates:', error);

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

/**
 * GET /api/campaigns/[id]/updates
 * Obtiene las actualizaciones de una campaña
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
    const type = searchParams.get('type') as UpdateType | null;
    const search = searchParams.get('search');
    const isPublic = searchParams.get('isPublic');

    // Verificar que la campaña existe
    const campaign = await CampaignService.getById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Para actualizaciones privadas, verificar permisos
    const session = await getServerSession(authOptions);
    let includePrivate = false;

    if (session?.user?.id === campaign.creator.id) {
      includePrivate = true;
    }

    // Construir filtros
    const filters = {
      page,
      limit,
      type: type || undefined,
      search: search || undefined,
      isPublic: includePrivate ? undefined : true,
    };

    // Si se especifica isPublic y el usuario es el creador, respetarlo
    if (isPublic !== null && includePrivate) {
      filters.isPublic = isPublic === 'true';
    }

    // Obtener actualizaciones
    const result = await CampaignUpdateService.getByCampaignId(campaignId, filters);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en GET /api/campaigns/[id]/updates:', error);
    return NextResponse.json(
      { error: 'Error al obtener las actualizaciones' },
      { status: 500 }
    );
  }
}
