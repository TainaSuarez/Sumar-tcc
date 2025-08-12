import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { createCampaignSchema } from '@/lib/validations/campaign';
import { CampaignService } from '@/lib/services/campaignService';
import { handleFileUpload } from '@/lib/services/uploadService';

// Esquema para validar FormData
const formDataSchema = z.object({
  title: z.string().min(3).max(100),
  categoryId: z.string().min(1),
  goalAmount: z.string().transform((val) => parseFloat(val)),
  shortDescription: z.string().min(10).max(150),
  description: z.string().min(50).max(5000),
});

/**
 * POST /api/campaigns
 * Crea una nueva campaña
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para crear una campaña.' },
        { status: 401 }
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
    
    // Validar campos básicos
    const validationResult = formDataSchema.safeParse({
      title: fields.title,
      categoryId: fields.categoryId,
      goalAmount: fields.goalAmount,
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

    if (!category) {
      // Limpiar archivo subido si hay error
      if (file) {
        const { deleteUploadedFile } = await import('@/lib/services/uploadService');
        await deleteUploadedFile(file.filename);
      }
      
      return NextResponse.json(
        { error: 'La categoría seleccionada no existe' },
        { status: 400 }
      );
    }

    if (!category.isActive) {
      // Limpiar archivo subido si hay error
      if (file) {
        const { deleteUploadedFile } = await import('@/lib/services/uploadService');
        await deleteUploadedFile(file.filename);
      }
      
      return NextResponse.json(
        { error: 'La categoría seleccionada no está disponible' },
        { status: 400 }
      );
    }

    // Preparar datos para crear la campaña
    const campaignData = {
      title: fields.title,
      categoryId: fields.categoryId,
      goalAmount,
      shortDescription: fields.shortDescription,
      description: fields.description,
      creatorId: session.user.id,
      imageFilename: file?.filename,
    };

    // Validar datos con el esquema completo (omitir coverImage ya que se maneja por separado)
    const finalValidation = createCampaignSchema.omit({ coverImage: true }).safeParse({
      title: campaignData.title,
      categoryId: campaignData.categoryId,
      goalAmount: campaignData.goalAmount,
      shortDescription: campaignData.shortDescription,
      description: campaignData.description,
    });

    if (!finalValidation.success) {
      // Limpiar archivo subido si hay error
      if (file) {
        const { deleteUploadedFile } = await import('@/lib/services/uploadService');
        await deleteUploadedFile(file.filename);
      }
      
      return NextResponse.json(
        {
          error: 'Datos de campaña inválidos',
          details: finalValidation.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Crear la campaña
    const campaign = await CampaignService.create(campaignData);

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: 'Campaña creada exitosamente',
        campaign: {
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          shortDescription: campaign.shortDescription,
          goalAmount: campaign.goalAmount,
          currentAmount: campaign.currentAmount,
          currency: campaign.currency,
          status: campaign.status,
          images: campaign.images,
          category: campaign.category,
          creator: campaign.creator,
          createdAt: campaign.createdAt,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en POST /api/campaigns:', error);

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
 * GET /api/campaigns
 * Obtiene campañas con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Máx. 50 por página
  const categoryId = searchParams.get('categoryId');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const creatorId = searchParams.get('creatorId');

    const { prisma } = await import('@/lib/db');

    // Construir filtros
    const where: {
      status?: string;
      categoryId?: string;
      creatorId?: string;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        shortDescription?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    // Si no se especifica creatorId, solo mostrar campañas activas por defecto
    if (!creatorId) {
      where.status = 'ACTIVE';
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Obtener campañas
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
          _count: {
            select: {
              donations: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        shortDescription: campaign.shortDescription,
        goalAmount: campaign.goalAmount,
        currentAmount: campaign.currentAmount,
        currency: campaign.currency,
        status: campaign.status,
        images: campaign.images,
        category: campaign.category,
        creator: campaign.creator,
        donationCount: campaign._count.donations,
        isFeatured: campaign.isFeatured,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error en GET /api/campaigns:', error);
    return NextResponse.json(
      { error: 'Error al obtener las campañas' },
      { status: 500 }
    );
  }
}
