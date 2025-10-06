import { prisma } from '@/lib/db';
import { type CreateCampaignData } from '@/types/campaign';
import { getPublicImageUrl } from './uploadService';
import { CampaignType, CampaignStatus, type Campaign } from '@prisma/client';



export interface CreateCampaignResult extends Campaign {
  category: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string | null;
    organizationName: string | null;
  };
}

/**
 * Genera un slug único basado en el título
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-'); // Remover guiones duplicados
}

/**
 * Asegura que el slug sea único
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.campaign.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export class CampaignService {
  /**
   * Crea una nueva campaña
   */
  static async create(data: CreateCampaignData): Promise<CreateCampaignResult> {
    try {
      // Generar slug único
      const baseSlug = generateSlug(data.title);
      const slug = await ensureUniqueSlug(baseSlug);

      // Usar las imágenes proporcionadas o generar URL de imagen local si existe
      let imageUrls: string[] = [];
      
      if ('images' in data && data.images) {
        // Si se proporcionan URLs de imágenes directamente (múltiples imágenes)
        imageUrls = data.images;
      } else if ('imageFilename' in data && data.imageFilename) {
        // Compatibilidad hacia atrás con una sola imagen
        imageUrls = [getPublicImageUrl(data.imageFilename)];
      }

      // Crear campaña en la base de datos
      const campaign = await prisma.campaign.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          shortDescription: data.shortDescription,
          goalAmount: data.goalAmount,
                  currency: 'UYU',
        type: CampaignType.DONATION, // Por defecto es donación
        status: CampaignStatus.ACTIVE, // Por defecto está activa
          images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
          creatorId: data.creatorId,
          categoryId: data.categoryId,
          urgencyLevel: 1,
          isVerified: false,
          isFeatured: false,
        },
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

      return campaign;
    } catch (error) {
      console.error('Error creando campaña:', error);
      
      // Si hay error, intentar limpiar la imagen subida
      if ('imageFilename' in data && data.imageFilename) {
        try {
          const { deleteUploadedFile } = await import('./uploadService');
          await deleteUploadedFile(data.imageFilename);
        } catch (cleanupError) {
          console.error('Error limpiando imagen tras fallo:', cleanupError);
        }
      }

      throw new Error('Error al crear la campaña. Inténtalo de nuevo.');
    }
  }

  /**
   * Obtiene una campaña por ID
   */
  static async getById(id: string): Promise<CreateCampaignResult | null> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
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

      if (!campaign) {
        return null;
      }

      // Convertir el campo images de JSON string a array
      let images: string[] = [];
      if (campaign.images) {
        try {
          images = JSON.parse(campaign.images);
        } catch (error) {
          console.error('Error parsing images JSON:', error);
          images = [];
        }
      }

      return {
        ...campaign,
        images,
      };
    } catch (error) {
      console.error('Error obteniendo campaña:', error);
      throw new Error('Error al obtener la campaña.');
    }
  }

  /**
   * Obtiene una campaña por slug
   */
  static async getBySlug(slug: string): Promise<CreateCampaignResult | null> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { slug },
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

      if (!campaign) {
        return null;
      }

      // Convertir el campo images de JSON string a array
      let images: string[] = [];
      if (campaign.images) {
        try {
          images = JSON.parse(campaign.images);
        } catch (error) {
          console.error('Error parsing images JSON:', error);
          images = [];
        }
      }

      return {
        ...campaign,
        images,
      };
    } catch (error) {
      console.error('Error obteniendo campaña por slug:', error);
      throw new Error('Error al obtener la campaña.');
    }
  }

  /**
   * Actualiza el estado de una campaña
   */
  static async updateStatus(
    id: string,
    status: CampaignStatus,
    userId: string
  ): Promise<Campaign> {
    try {
      // Verificar que el usuario es el creador de la campaña
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: { creatorId: true },
      });

      if (!campaign) {
        throw new Error('Campaña no encontrada');
      }

      if (campaign.creatorId !== userId) {
        throw new Error('No tienes permisos para actualizar esta campaña');
      }

      // Actualizar estado
      const updatedCampaign = await prisma.campaign.update({
        where: { id },
        data: { 
          status,
          ...(status === CampaignStatus.ACTIVE && { startDate: new Date() }),
        },
      });

      return updatedCampaign;
    } catch (error) {
      console.error('Error actualizando estado de campaña:', error);
      throw error;
    }
  }

  /**
   * Obtiene campañas por creador
   */
  static async getByCreator(
    creatorId: string,
    options: {
      page?: number;
      limit?: number;
      status?: CampaignStatus;
    } = {}
  ): Promise<{ campaigns: CreateCampaignResult[]; total: number }> {
    try {
      const { page = 1, limit = 10, status } = options;
      const skip = (page - 1) * limit;

      const where = {
        creatorId,
        ...(status && { status }),
      };

      const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
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
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.campaign.count({ where }),
      ]);

      // Convertir el campo images de JSON string a array para cada campaña
      const campaignsWithParsedImages = campaigns.map(campaign => {
        let images: string[] = [];
        if (campaign.images) {
          try {
            images = JSON.parse(campaign.images);
          } catch (error) {
            console.error('Error parsing images JSON for campaign:', campaign.id, error);
            images = [];
          }
        }
        return {
          ...campaign,
          images,
        };
      });

      return { campaigns: campaignsWithParsedImages, total };
    } catch (error) {
      console.error('Error obteniendo campañas por creador:', error);
      throw new Error('Error al obtener las campañas.');
    }
  }
}
