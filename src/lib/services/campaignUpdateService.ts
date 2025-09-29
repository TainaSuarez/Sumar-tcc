import { prisma } from '@/lib/db';
import { UpdateType } from '@/lib/validations/campaignUpdate';
import { 
  getPublicUpdateImageUrl, 
  getPublicUpdateVideoUrl, 
  deleteUpdateFile,
  cleanupUpdateFiles 
} from './updateUploadService';
import type { 
  CampaignUpdate, 
  CreateCampaignUpdateBackendData,
  CampaignUpdateFilters 
} from '@/types/campaignUpdate';

// Tipo para el resultado de crear actualización
export type CreateUpdateResult = CampaignUpdate;

// Interfaz para datos de archivos procesados
interface ProcessedFiles {
  images: Array<{ filename: string; type: 'image'; isExisting?: boolean }>;
  videos: Array<{ filename: string; type: 'video'; isExisting?: boolean }>;
}

export class CampaignUpdateService {
  /**
   * Crea una nueva actualización de campaña
   */
  static async create(
    data: CreateCampaignUpdateBackendData,
    files?: ProcessedFiles
  ): Promise<CreateUpdateResult> {
    try {
      // Generar URLs de archivos si existen
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      if (files?.images) {
        imageUrls = files.images.map(img => getPublicUpdateImageUrl(img.filename));
      }

      if (files?.videos) {
        videoUrls = files.videos.map(vid => getPublicUpdateVideoUrl(vid.filename));
      }

      // Determinar el tipo basado en los archivos
      let updateType = UpdateType.TEXT_ONLY;
      if (videoUrls.length > 0) {
        updateType = UpdateType.TEXT_VIDEO;
      } else if (imageUrls.length > 0) {
        updateType = UpdateType.TEXT_IMAGE;
      }

      // Crear actualización en la base de datos
      const update = await prisma.campaignUpdate.create({
        data: {
          title: data.title,
          content: data.content,
          type: updateType,
          images: imageUrls,
          videos: videoUrls,
          isPublic: data.isPublic,
          campaignId: data.campaignId,
          authorId: data.authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organizationName: true,
              avatar: true,
            },
          },
        },
      });

      return {
        id: update.id,
        title: update.title,
        content: update.content,
        type: update.type as UpdateType,
        images: update.images.map((filename: string) => getPublicUpdateImageUrl(filename)),
        videos: update.videos.map((filename: string) => getPublicUpdateVideoUrl(filename)),
        isPublic: update.isPublic,
        createdAt: update.createdAt.toISOString(),
        updatedAt: update.updatedAt.toISOString(),
        campaignId: update.campaignId,
        authorId: update.authorId,
        author: update.author,
      };
    } catch (error) {
      console.error('Error creando actualización:', error);

      // Limpiar archivos subidos si hay error
      if (files) {
        await cleanupUpdateFiles(
          files.images.map(img => ({ ...img, path: '', size: 0, mimetype: '' })),
          files.videos.map(vid => ({ ...vid, path: '', size: 0, mimetype: '' }))
        );
      }

      throw new Error('Error al crear la actualización. Inténtalo de nuevo.');
    }
  }

  /**
   * Obtiene una actualización por ID
   */
  static async getById(id: string): Promise<CampaignUpdate | null> {
    try {
      const update = await prisma.campaignUpdate.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organizationName: true,
              avatar: true,
            },
          },
        },
      });

      if (!update) return null;

      return {
        id: update.id,
        title: update.title,
        content: update.content,
        type: update.type as UpdateType,
        images: update.images,
        videos: update.videos,
        isPublic: update.isPublic,
        createdAt: update.createdAt.toISOString(),
        updatedAt: update.updatedAt.toISOString(),
        campaignId: update.campaignId,
        authorId: update.authorId,
        author: update.author,
      };
    } catch (error) {
      console.error('Error obteniendo actualización:', error);
      return null;
    }
  }

  /**
   * Obtiene actualizaciones de una campaña
   */
  static async getByCampaignId(
    campaignId: string,
    filters: CampaignUpdateFilters = {}
  ): Promise<{
    updates: CampaignUpdate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 10, 50);
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: Record<string, unknown> = {
        campaignId,
        isPublic: filters.isPublic !== undefined ? filters.isPublic : true,
      };

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Obtener actualizaciones y total
      const [updates, total] = await Promise.all([
        prisma.campaignUpdate.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                organizationName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.campaignUpdate.count({ where }),
      ]);

      return {
        updates: updates.map(update => ({
          id: update.id,
          title: update.title,
          content: update.content,
          type: update.type as UpdateType,
          images: update.images as string[], // Ya son URLs completas
          videos: update.videos as string[], // Ya son URLs completas
          isPublic: update.isPublic,
          createdAt: update.createdAt.toISOString(),
          updatedAt: update.updatedAt.toISOString(),
          campaignId: update.campaignId,
          authorId: update.authorId,
          author: update.author,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error obteniendo actualizaciones:', error);
      return {
        updates: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  /**
   * Actualiza una actualización existente
   */
  static async update(
    id: string,
    data: Partial<CreateCampaignUpdateBackendData>,
    authorId: string,
    files?: ProcessedFiles
  ): Promise<CampaignUpdate> {
    try {
      // Verificar que la actualización existe y pertenece al autor
      const existingUpdate = await prisma.campaignUpdate.findUnique({
        where: { id },
      });

      if (!existingUpdate) {
        throw new Error('Actualización no encontrada');
      }

      if (existingUpdate.authorId !== authorId) {
        throw new Error('No tienes permisos para actualizar esta actualización');
      }

      // Preparar datos de actualización
      const updateData: Record<string, unknown> = { ...data };

      // Procesar archivos nuevos si existen
      if (files) {
        // Eliminar archivos antiguos
        const oldImages = existingUpdate.images;
        const oldVideos = existingUpdate.videos;

        for (const imageUrl of oldImages) {
          const filename = imageUrl.split('/').pop();
          if (filename) {
            await deleteUpdateFile(filename, 'image');
          }
        }

        for (const videoUrl of oldVideos) {
          const filename = videoUrl.split('/').pop();
          if (filename) {
            await deleteUpdateFile(filename, 'video');
          }
        }

        // Agregar nuevos archivos
        if (files.images) {
          updateData.images = files.images.map(img => getPublicUpdateImageUrl(img.filename));
        }

        if (files.videos) {
          updateData.videos = files.videos.map(vid => getPublicUpdateVideoUrl(vid.filename));
        }

        // Actualizar tipo basado en archivos
        if (updateData.videos && updateData.videos.length > 0) {
          updateData.type = UpdateType.TEXT_VIDEO;
        } else if (updateData.images && updateData.images.length > 0) {
          updateData.type = UpdateType.TEXT_IMAGE;
        } else {
          updateData.type = UpdateType.TEXT_ONLY;
        }
      }

      // Actualizar en la base de datos
      const updatedUpdate = await prisma.campaignUpdate.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              organizationName: true,
              avatar: true,
            },
          },
        },
      });

      return {
        id: updatedUpdate.id,
        title: updatedUpdate.title,
        content: updatedUpdate.content,
        type: updatedUpdate.type as UpdateType,
        images: updatedUpdate.images.map((filename: string) => getPublicUpdateImageUrl(filename)),
        videos: updatedUpdate.videos.map((filename: string) => getPublicUpdateVideoUrl(filename)),
        isPublic: updatedUpdate.isPublic,
        createdAt: updatedUpdate.createdAt.toISOString(),
        updatedAt: updatedUpdate.updatedAt.toISOString(),
        campaignId: updatedUpdate.campaignId,
        authorId: updatedUpdate.authorId,
        author: updatedUpdate.author,
      };
    } catch (error) {
      console.error('Error actualizando actualización:', error);

      // Limpiar archivos nuevos si hay error
      if (files) {
        await cleanupUpdateFiles(
          files.images.map(img => ({ ...img, path: '', size: 0, mimetype: '' })),
          files.videos.map(vid => ({ ...vid, path: '', size: 0, mimetype: '' }))
        );
      }

      throw error;
    }
  }

  /**
   * Elimina una actualización
   */
  static async delete(id: string, authorId: string): Promise<void> {
    try {
      // Verificar que la actualización existe y pertenece al autor
      const existingUpdate = await prisma.campaignUpdate.findUnique({
        where: { id },
      });

      if (!existingUpdate) {
        throw new Error('Actualización no encontrada');
      }

      if (existingUpdate.authorId !== authorId) {
        throw new Error('No tienes permisos para eliminar esta actualización');
      }

      // Eliminar archivos asociados
      for (const imageUrl of existingUpdate.images) {
        const filename = imageUrl.split('/').pop();
        if (filename) {
          await deleteUpdateFile(filename, 'image');
        }
      }

      for (const videoUrl of existingUpdate.videos) {
        const filename = videoUrl.split('/').pop();
        if (filename) {
          await deleteUpdateFile(filename, 'video');
        }
      }

      // Eliminar de la base de datos
      await prisma.campaignUpdate.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error eliminando actualización:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de actualizaciones de una campaña
   */
  static async getStats(campaignId: string): Promise<{
    total: number;
    byType: Record<UpdateType, number>;
    recent: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [total, byType, recent] = await Promise.all([
        prisma.campaignUpdate.count({
          where: { campaignId, isPublic: true },
        }),
        prisma.campaignUpdate.groupBy({
          by: ['type'],
          where: { campaignId, isPublic: true },
          _count: { type: true },
        }),
        prisma.campaignUpdate.count({
          where: {
            campaignId,
            isPublic: true,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
      ]);

      const typeStats: Record<UpdateType, number> = {
        [UpdateType.TEXT_ONLY]: 0,
        [UpdateType.TEXT_IMAGE]: 0,
        [UpdateType.TEXT_VIDEO]: 0,
      };

      byType.forEach(item => {
        typeStats[item.type as UpdateType] = item._count.type;
      });

      return {
        total,
        byType: typeStats,
        recent,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        byType: {
          [UpdateType.TEXT_ONLY]: 0,
          [UpdateType.TEXT_IMAGE]: 0,
          [UpdateType.TEXT_VIDEO]: 0,
        },
        recent: 0,
      };
    }
  }
}
