import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { CampaignUpdateService } from '@/lib/services/campaignUpdateService';
import { handleUpdateFileUpload } from '@/lib/services/updateUploadService';

// Esquema para validar FormData en actualización
const updateFormDataSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  content: z.string().min(10).max(5000).optional(),
  isPublic: z.string().transform((val) => val === 'true').optional(),
});

/**
 * GET /api/campaigns/[id]/updates/[updateId]
 * Obtiene una actualización específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { updateId } = resolvedParams;

    const update = await CampaignUpdateService.getById(updateId);

    if (!update) {
      return NextResponse.json(
        { error: 'Actualización no encontrada' },
        { status: 404 }
      );
    }

    // Si la actualización es privada, verificar permisos
    if (!update.isPublic) {
      const session = await getServerSession(authOptions);
      const isAuthor = session?.user?.id === update.authorId;
      const isAdmin = session?.user?.role === 'ADMIN';
      
      if (!session?.user?.id || (!isAuthor && !isAdmin)) {
        return NextResponse.json(
          { error: 'No tienes permisos para ver esta actualización' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(update);

  } catch (error) {
    console.error('Error en GET /api/campaigns/[id]/updates/[updateId]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la actualización' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/campaigns/[id]/updates/[updateId]
 * Actualiza una actualización específica
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para actualizar.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { updateId } = resolvedParams;

    // Verificar que la actualización existe
    const existingUpdate = await CampaignUpdateService.getById(updateId);
    if (!existingUpdate) {
      return NextResponse.json(
        { error: 'Actualización no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos: el usuario debe ser el autor O un administrador
    const isAuthor = existingUpdate.authorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar esta actualización' },
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

    // Obtener archivos existentes que se mantienen
    const existingImages = fields.existingImages ? JSON.parse(fields.existingImages) : [];
    const existingVideos = fields.existingVideos ? JSON.parse(fields.existingVideos) : [];

    // Validar campos básicos
    const validationResult = updateFormDataSchema.safeParse({
      title: fields.title,
      content: fields.content,
      isPublic: fields.isPublic,
    });

    if (!validationResult.success) {
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

    // Validar límites de archivos (incluyendo existentes)
    const totalImages = images.length + existingImages.length;
    const totalVideos = videos.length + existingVideos.length;

    if (totalImages > 5) {
      const { cleanupUpdateFiles } = await import('@/lib/services/updateUploadService');
      await cleanupUpdateFiles(images, videos);

      return NextResponse.json(
        { error: 'No puedes tener más de 5 imágenes por actualización' },
        { status: 400 }
      );
    }

    if (totalVideos > 1) {
      const { cleanupUpdateFiles } = await import('@/lib/services/updateUploadService');
      await cleanupUpdateFiles(images, videos);

      return NextResponse.json(
        { error: 'No puedes tener más de 1 video por actualización' },
        { status: 400 }
      );
    }

    // Preparar datos de actualización
    const updateData = validationResult.data;

    // Preparar archivos procesados (nuevos y existentes)
    let processedFiles;
    const allImages = [
      ...existingImages.map(url => ({ filename: url.split('/').pop() || '', type: 'image' as const, isExisting: true })),
      ...images.map(img => ({ filename: img.filename, type: 'image' as const, isExisting: false }))
    ];
    const allVideos = [
      ...existingVideos.map(url => ({ filename: url.split('/').pop() || '', type: 'video' as const, isExisting: true })),
      ...videos.map(vid => ({ filename: vid.filename, type: 'video' as const, isExisting: false }))
    ];

    if (allImages.length > 0 || allVideos.length > 0) {
      processedFiles = {
        images: allImages,
        videos: allVideos,
      };
    }

    // Actualizar la actualización
    const updatedUpdate = await CampaignUpdateService.update(
      updateId,
      updateData,
      session.user.id,
      processedFiles
    );

    return NextResponse.json(
      {
        message: 'Actualización actualizada exitosamente',
        update: updatedUpdate,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en PUT /api/campaigns/[id]/updates/[updateId]:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaigns/[id]/updates/[updateId]
 * Elimina una actualización específica
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para eliminar.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { updateId } = resolvedParams;

    // Verificar que la actualización existe
    const existingUpdate = await CampaignUpdateService.getById(updateId);
    if (!existingUpdate) {
      return NextResponse.json(
        { error: 'Actualización no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos: el usuario debe ser el autor O un administrador
    const isAuthor = existingUpdate.authorId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta actualización' },
        { status: 403 }
      );
    }

    // Eliminar la actualización
    await CampaignUpdateService.delete(updateId, session.user.id);

    return NextResponse.json(
      { message: 'Actualización eliminada exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en DELETE /api/campaigns/[id]/updates/[updateId]:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
